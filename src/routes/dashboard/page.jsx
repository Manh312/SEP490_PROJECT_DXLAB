import { CreditCard, DollarSign, Package, TrendingUp } from "lucide-react";
import { useTheme } from "../../hooks/use-theme";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchStudentGroupStats,
  fetchJobsByYearAndMonth,
  fetchJobsByYear,
  fetchDepreciationsByYearAndMonth,
  fetchDepreciationsByYear,
  resetStats,
} from "../../redux/slices/Statistics";
import { fetchRooms } from "../../redux/slices/Room";
import { FaSpinner } from "react-icons/fa";
import RevenueStatistics from "./statistics/RevenueStatistics";
import CostStatistics from "./statistics/CostStatistics";
import DepreciationStatistics from "./statistics/DepreciationStatistics";
import PerformanceStatistics from "./statistics/PerformanceStatistics";
import { toast } from "react-toastify";

const Page = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const {
    jobs,
    jobsByYear,
    depreciations,
    depreciationsByYear,
    loading,
    error,
  } = useSelector((state) => state.statistics);

  const [period, setPeriod] = useState("năm");
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("");
  const [showCharts, setShowCharts] = useState(false);
  const [activeTab, setActiveTab] = useState("revenue");
  const [yearlyStats, setYearlyStats] = useState(null);
  const [detailedStats, setDetailedStats] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [avgUtilizationRate, setAvgUtilizationRate] = useState(0); // State cho hiệu suất sử dụng

  const years = Array.from({ length: 10 }, (_, i) => (2025 - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  const vietnameseMonths = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
  ];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  // Fetch rooms khi component mount
  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  // Fetch yearly student group stats để hiển thị dữ liệu mặc định
  useEffect(() => {
    dispatch(
      fetchStudentGroupStats({
        period: "năm",
        year: year,
        month: null,
      })
    ).then((response) => {
      if (response.payload && response.payload.data) {
        const { details } = response.payload.data;
        setYearlyData(details);
      } else {
        setYearlyData([]);
      }
    });
  }, [dispatch, year]);

  const generateYTicks = (maxValue, minValue = 0) => {
    if (maxValue === 0) return [0, 20, 40, 60, 80, 100];
    const roundedMax = Math.ceil(maxValue / 20) * 20;
    const roundedMin = Math.floor(minValue / 20) * 20;
    const step = (roundedMax - roundedMin) / 5;
    return Array.from({ length: 6 }, (_, i) => Math.round(roundedMin + i * step));
  };

  // Hàm xử lý khi chọn phòng từ PerformanceStatistics
  const handleRoomSelect = (utilizationRate) => {
    setAvgUtilizationRate(utilizationRate);
  };

  const handleSearch = async () => {
    dispatch(resetStats());
    setYearlyStats(null);
    setDetailedStats([]);
    setShowCharts(false);
    setAvgUtilizationRate(0); // Reset hiệu suất khi tìm kiếm mới

    try {
      if (period === "năm") {
        const [studentStatsResponse] = await Promise.all([
          dispatch(fetchStudentGroupStats({ period: "năm", year: year, month: null })),
          dispatch(fetchJobsByYear({ year })),
          dispatch(fetchDepreciationsByYear({ year })),
        ]);

        if (studentStatsResponse.payload && studentStatsResponse.payload.data) {
          const { details } = studentStatsResponse.payload.data;
          const totalRevenue = details.reduce(
            (sum, item) => sum + (item.revenue.totalRevenue || 0),
            0
          );
          const monthlyData = Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const item =
              details.find((d) => d.periodNumber === month) || {
                revenue: { totalRevenue: 0, studentRevenue: 0 },
              };
            return {
              name: vietnameseMonths[i],
              totalRevenue: item.revenue.totalRevenue || 0,
              studentRevenue: item.revenue.studentRevenue || 0,
            };
          });
          setYearlyStats({
            totalRevenue,
          });
          setDetailedStats(monthlyData);
        } else {
          const monthlyData = Array.from({ length: 12 }, (_, i) => ({
            name: vietnameseMonths[i],
            totalRevenue: 0,
            studentRevenue: 0,
          }));
          setYearlyStats({ totalRevenue: 0 });
          setDetailedStats(monthlyData);
        }

        setShowCharts(true);
      } else if (period === "tháng") {
        if (!month || !year) {
          toast.error("Vui lòng chọn tháng và năm!");
          return;
        }

        const [studentStatsResponse] = await Promise.all([
          dispatch(fetchStudentGroupStats({ period: "tháng", year: year, month: month })),
          dispatch(fetchJobsByYearAndMonth({ year, month })),
          dispatch(fetchDepreciationsByYearAndMonth({ year, month })),
        ]);

        if (studentStatsResponse.payload && studentStatsResponse.payload.data) {
          const { details } = studentStatsResponse.payload.data;
          const totalRevenue = details.reduce(
            (sum, item) => sum + (item.revenue.totalRevenue || 0),
            0
          );
          const daysInMonth = getDaysInMonth(parseInt(month), parseInt(year));
          const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayData =
              details.find((item) => item.periodNumber === day) || {
                revenue: { totalRevenue: 0, studentRevenue: 0 },
              };
            return {
              name: `Ngày ${day}`,
              totalRevenue: dayData.revenue.totalRevenue || 0,
              studentRevenue: dayData.revenue.studentRevenue || 0,
            };
          });
          setYearlyStats({
            totalRevenue,
          });
          setDetailedStats(dailyData);
        } else {
          const daysInMonth = getDaysInMonth(parseInt(month), parseInt(year));
          const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
            name: `Ngày ${i + 1}`,
            totalRevenue: 0,
            studentRevenue: 0,
          }));
          setYearlyStats({ totalRevenue: 0 });
          setDetailedStats(dailyData);
        }

        setShowCharts(true);
      }
    } catch (err) {
      console.log("Error fetching data:", err);
      toast.error("Đã xảy ra lỗi khi tải dữ liệu!");
      setShowCharts(false);
    }
  };

  const totalRevenue = yearlyStats ? yearlyStats.totalRevenue || 0 : 0;

  const calculateTotalDepreciation = () => {
    const dataSource = period === "năm" ? depreciationsByYear : depreciations;

    if (!dataSource || dataSource.length === 0) return 0;

    return dataSource.reduce((total, item) => {
      if (!item || !item.sumDate || item.depreciationAmount === undefined) return total;

      const date = new Date(item.sumDate);
      if (isNaN(date.getTime())) return total;

      const itemYear = date.getFullYear();
      const itemMonth = date.getMonth();

      if (itemYear !== parseInt(year)) return total;

      if (period === "tháng" && month) {
        const selectedMonth = parseInt(month) - 1;
        if (itemMonth !== selectedMonth) return total;
      }

      return total + (item.depreciationAmount || 0);
    }, 0);
  };

  const expenseData = () => {
    const dataSource = period === "năm" ? jobsByYear : jobs;

    if (!dataSource || dataSource.length === 0) {
      return [
        { name: "Bàn", value: 0 },
        { name: "Ghế", value: 0 },
      ];
    }

    const categoryTotals = dataSource.reduce(
      (acc, job) => {
        const category = job.faciCategory === 1 ? "table" : "chair";
        acc[category] += job.amount || 0;
        return acc;
      },
      { table: 0, chair: 0 }
    );

    return [
      { name: "Bàn", value: categoryTotals.table },
      { name: "Ghế", value: categoryTotals.chair },
    ];
  };

  const expenses = expenseData();
  const totalExpenses = expenses.reduce((sum, item) => sum + item.value, 0);

  const areaData = () => {
    if (period === "năm") {
      return detailedStats.length > 0
        ? detailedStats.map((stat) => ({
            name: stat.name,
            studentRevenue: stat.studentRevenue || 0,
          }))
        : Array.from({ length: 12 }, (_, i) => ({
            name: vietnameseMonths[i],
            studentRevenue: 0,
          }));
    } else if (period === "tháng") {
      return detailedStats.length > 0
        ? detailedStats.map((stat) => ({
            name: stat.name,
            studentRevenue: stat.studentRevenue || 0,
          }))
        : Array.from(
            { length: getDaysInMonth(parseInt(month), parseInt(year)) },
            (_, i) => ({
              name: `Ngày ${i + 1}`,
              studentRevenue: 0,
            })
          );
    }
    return [];
  };

  const revenueAreaData = areaData();
  const maxRevenue = Math.max(...revenueAreaData.map((d) => d.studentRevenue), 1000);
  const revenueYTicks = generateYTicks(maxRevenue);
  const revenueMaxY = revenueYTicks[revenueYTicks.length - 1];
  const revenueMinY = 0;

  return (
    <div className="flex flex-col gap-y-4 mb-20 pl-5">
      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Thống kê</h2>

      {/* Filter Section */}
      <div className="mb-6 p-4 border rounded-lg shadow-md mr-5">
        <h3 className="text-lg font-semibold mb-4">Tùy chỉnh thống kê</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium mb-2">Khoảng thời gian:</label>
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                setMonth("");
                setShowCharts(false);
              }}
              className="w-full p-2 border rounded-md"
            >
              <option value="năm">Năm</option>
              <option value="tháng">Tháng</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2">Năm:</label>
            <select
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setShowCharts(false);
              }}
              className="w-full p-2 border rounded-md"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {period === "tháng" && (
            <div>
              <label className="block font-medium mb-2">Tháng:</label>
              <select
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  setShowCharts(false);
                }}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Chọn tháng</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button
          onClick={handleSearch}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          Tìm kiếm
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-6 mr-5">
          <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
          <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center justify-center py-6 mr-5">
          <p className="text-red-500 font-medium">
            Lỗi: {error || "Không thể tải dữ liệu. Vui lòng thử lại!"}
          </p>
        </div>
      )}

      {/* Show Charts if Search is Performed */}
      {!loading && !error && showCharts && (
        <div className="mr-5">
          {/* Overview Section */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 mb-6">
            <div
              className={`card ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"} transition-colors`}
            >
              <div className="card-header">
                <div
                  className={`w-fit rounded-lg p-2 transition-colors ${
                    theme === "dark" ? "bg-orange-600/20 text-orange-400" : "bg-orange-500/20 text-orange-500"
                  }`}
                >
                  <DollarSign size={26} />
                </div>
                <p
                  className={`card-title ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}
                >
                  Tổng doanh thu
                </p>
              </div>
              <div className="card-body">
                <p
                  className={`text-2xl font-bold transition-colors ${theme === "dark" ? "text-white" : "text-black"}`}
                >
                  {totalRevenue.toLocaleString()} DXL
                </p>
                <span
                  className={`flex w-fit items-center gap-x-2 rounded-full border px-2 py-1 font-medium transition-colors ${
                    theme === "dark" ? "border-orange-400 text-orange-400" : "border-orange-500 text-orange-500"
                  }`}
                >
                  <TrendingUp size={18} />
                  25%
                </span>
              </div>
            </div>

            <div
              className={`card ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"} transition-colors`}
            >
              <div className="card-header">
                <div
                  className={`w-fit rounded-lg p-2 transition-colors ${
                    theme === "dark" ? "bg-orange-600/20 text-orange-400" : "bg-orange-500/20 text-orange-500"
                  }`}
                >
                  <Package size={26} />
                </div>
                <p
                  className={`card-title ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}
                >
                  Tổng chi phí bỏ ra
                </p>
              </div>
              <div className="card-body">
                <p
                  className={`text-2xl font-bold transition-colors ${theme === "dark" ? "text-white" : "text-black"}`}
                >
                  {totalExpenses.toLocaleString()} DXL
                </p>
                <span
                  className={`flex w-fit items-center gap-x-2 rounded-full border px-2 py-1 font-medium transition-colors ${
                    theme === "dark" ? "border-orange-400 text-orange-400" : "border-orange-500 text-orange-500"
                  }`}
                >
                  <TrendingUp size={18} />
                  10%
                </span>
              </div>
            </div>

            <div
              className={`card ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"} transition-colors`}
            >
              <div className="card-header">
                <div
                  className={`w-fit rounded-lg p-2 transition-colors ${
                    theme === "dark" ? "bg-orange-600/20 text-orange-400" : "bg-orange-500/20 text-orange-500"
                  }`}
                >
                  <CreditCard size={26} />
                </div>
                <p
                  className={`card-title ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}
                >
                  Tổng chi phí khấu hao
                </p>
              </div>
              <div className="card-body">
                <p
                  className={`text-2xl font-bold transition-colors ${theme === "dark" ? "text-white" : "text-black"}`}
                >
                  {calculateTotalDepreciation().toLocaleString()} DXL
                </p>
                <span
                  className={`flex w-fit items-center gap-x-2 rounded-full border px-2 py-1 font-medium transition-colors ${
                    theme === "dark" ? "border-orange-400 text-orange-400" : "border-orange-500 text-orange-500"
                  }`}
                >
                  <TrendingUp size={18} />
                  0%
                </span>
              </div>
            </div>

            <div
              className={`card ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"} transition-colors`}
            >
              <div className="card-header">
                <div
                  className={`w-fit rounded-lg p-2 transition-colors ${
                    theme === "dark" ? "bg-orange-600/20 text-orange-400" : "bg-orange-500/20 text-orange-500"
                  }`}
                >
                  <TrendingUp size={26} />
                </div>
                <p
                  className={`card-title ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}
                >
                  Hiệu suất sử dụng trung bình
                </p>
              </div>
              <div className="card-body">
                <p
                  className={`text-2xl font-bold transition-colors ${theme === "dark" ? "text-white" : "text-black"}`}
                >
                  {avgUtilizationRate.toFixed(1)}%
                </p>
                <span
                  className={`flex w-fit items-center gap-x-2 rounded-full border px-2 py-1 font-medium transition-colors ${
                    theme === "dark" ? "border-orange-400 text-orange-400" : "border-orange-500 text-orange-500"
                  }`}
                >
                  <TrendingUp size={18} />
                  12%
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("revenue")}
                className={`${
                  activeTab === "revenue"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                Thống kê doanh thu
              </button>
              <button
                onClick={() => setActiveTab("cost")}
                className={`${
                  activeTab === "cost"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                Thống kê chi phí bỏ ra
              </button>
              <button
                onClick={() => setActiveTab("depreciation")}
                className={`${
                  activeTab === "depreciation"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                Thống kê khấu hao
              </button>
              <button
                onClick={() => setActiveTab("performance")}
                className={`${
                  activeTab === "performance"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                Hiệu suất
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "revenue" && (
              <RevenueStatistics
                revenueAreaData={revenueAreaData}
                revenueMinY={revenueMinY}
                revenueMaxY={revenueMaxY}
                revenueYTicks={revenueYTicks}
                period={period}
                year={year}
                month={month}
              />
            )}

            {activeTab === "cost" && (
              <CostStatistics
                jobs={period === "năm" ? jobsByYear : jobs}
                period={period}
                year={year}
                month={month}
              />
            )}

            {activeTab === "depreciation" && (
              <DepreciationStatistics
                depreciations={period === "năm" ? depreciationsByYear : depreciations}
                period={period}
                year={year}
                month={month}
              />
            )}

            {activeTab === "performance" && (
              <PerformanceStatistics
                period={period}
                year={year}
                month={month}
                performanceMinY={0}
                performanceMaxY={100}
                performanceYTicks={[0, 20, 40, 60, 80, 100]}
                onRoomSelect={handleRoomSelect}
              />
            )}
          </div>
        </div>
      )}

      {/* No Search Performed Message */}
      {!loading && !error && !showCharts && (
        <div className="flex items-center justify-center py-6 mr-5">
          <p
            className={`text-lg font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
          >
            Vui lòng thực hiện tìm kiếm để xem thống kê
          </p>
        </div>
      )}
    </div>
  );
};

export default Page;