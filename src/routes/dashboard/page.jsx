import { CreditCard, DollarSign, Package, TrendingUp, Users } from "lucide-react";
import { useTheme } from "../../hooks/use-theme";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchStudentGroupStats,
  fetchJobsByYearAndMonth,
  fetchJobsByYear,
  fetchDepreciationsByYearAndMonth, // Thêm import
  fetchDepreciationsByYear, // Thêm import
  resetStats,
} from "../../redux/slices/Statistics";
import { FaSpinner } from "react-icons/fa";

// Import the components
import RevenueStatistics from "./statistics/RevenueStatistics";
import CostStatistics from "./statistics/CostStatistics";
import DepreciationStatistics from "./statistics/DepreciationStatistics";
import PerformanceStatistics from "./statistics/PerformanceStatistics";

import { toast } from "react-toastify";

const Page = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { jobs, jobsByYear, depreciations, depreciationsByYear, loading, error } = useSelector(
    (state) => state.statistics
  ); // Thêm depreciations và depreciationsByYear vào useSelector

  const [period, setPeriod] = useState("năm");
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("");
  const [showCharts, setShowCharts] = useState(false);
  const [activeTab, setActiveTab] = useState("revenue");

  const [yearlyStats, setYearlyStats] = useState(null);
  const [detailedStats, setDetailedStats] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);

  const years = Array.from({ length: 10 }, (_, i) => (2025 - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

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

  const handleSearch = () => {
    dispatch(resetStats());
    setYearlyStats(null);
    setDetailedStats([]);
    setShowCharts(false);

    if (period === "năm") {
      dispatch(
        fetchStudentGroupStats({
          period: "năm",
          year: year,
          month: null,
        })
      ).then((response) => {
        if (response.payload && response.payload.data) {
          const { details } = response.payload.data;
          const totalRevenue = details.reduce(
            (sum, item) => sum + (item.revenue.totalRevenue || 0),
            0
          );
          const monthlyData = Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const item =
              details.find((d) => d.periodNumber === month) || {
                revenue: { totalRevenue: 0, studentRevenue: 0, studentPercentage: 0 },
              };
            return {
              name: `Tháng ${month}`,
              totalRevenue: item.revenue.totalRevenue || 0,
              studentRevenue: item.revenue.studentRevenue || 0,
              studentPercentage: item.revenue.studentPercentage || 0,
            };
          });
          const totalStudentPercentage =
            monthlyData.length > 0
              ? monthlyData.reduce((sum, item) => sum + (item.studentPercentage || 0), 0) /
                monthlyData.length
              : 0;
          setYearlyStats({
            totalRevenue,
            studentPercentage: totalStudentPercentage,
          });
          setDetailedStats(monthlyData);
        } else {
          const monthlyData = Array.from({ length: 12 }, (_, i) => ({
            name: `Tháng ${i + 1}`,
            totalRevenue: 0,
            studentRevenue: 0,
            studentPercentage: 0,
          }));
          setYearlyStats({ totalRevenue: 0, studentPercentage: 0 });
          setDetailedStats(monthlyData);
        }
        setShowCharts(true);
      });

      // Gọi API để lấy jobs và depreciations cho cả năm
      dispatch(fetchJobsByYear({ year }));
      dispatch(fetchDepreciationsByYear({ year })); // Thêm gọi API khấu hao theo năm
    } else if (period === "tháng") {
      if (!month || !year) {
        toast.error("Vui lòng chọn tháng và năm!");
        return;
      }
      const monthData = yearlyData.find((d) => d.periodNumber === parseInt(month));
      const monthStudentPercentage = monthData
        ? monthData.revenue.studentPercentage || 0
        : 0;
      dispatch(
        fetchStudentGroupStats({
          period: "tháng",
          year: year,
          month: month,
        })
      ).then((response) => {
        if (response.payload && response.payload.data) {
          const { details } = response.payload.data;
          const totalRevenue = details.reduce(
            (sum, item) => sum + (item.revenue.totalRevenue || 0),
            0
          );
          const daysInMonth = getDaysInMonth(parseInt(month), parseInt(year));
          const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayData =
              details.find((item) => item.periodNumber === day) || {
                revenue: { totalRevenue: 0, studentRevenue: 0, studentPercentage: 0 },
              };
            return {
              name: `Ngày ${day}`,
              totalRevenue: dayData.revenue.totalRevenue || 0,
              studentRevenue: dayData.revenue.studentRevenue || 0,
              studentPercentage: dayData.revenue.studentPercentage || 0,
            };
          });
          setYearlyStats({
            totalRevenue,
            studentPercentage: monthStudentPercentage,
          });
          setDetailedStats(dailyData);
        } else {
          const daysInMonth = getDaysInMonth(parseInt(month), parseInt(year));
          const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
            name: `Ngày ${i + 1}`,
            totalRevenue: 0,
            studentRevenue: 0,
            studentPercentage: 0,
          }));
          setYearlyStats({ totalRevenue: 0, studentPercentage: monthStudentPercentage });
          setDetailedStats(dailyData);
        }
        setShowCharts(true);
      });

      // Gọi API để lấy jobs và depreciations cho tháng được chọn
      dispatch(fetchJobsByYearAndMonth({ year, month }));
      dispatch(fetchDepreciationsByYearAndMonth({ year, month })); // Thêm gọi API khấu hao theo tháng
    }
  };

  const totalRevenue = yearlyStats ? yearlyStats.totalRevenue || 0 : 0;
  const avgStudentPercentage = yearlyStats ? yearlyStats.studentPercentage || 0 : 0;

  // Calculate expense distribution (same logic as in CostStatistics)
  const expenseData = () => {
    // Sử dụng jobsByYear khi period là "năm", jobs khi period là "tháng"
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
        acc[category] += job.amount || 0; // Sửa "amout" thành "amount"
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

  // Data for the participation pie chart
  const participationPieData = [
    { name: "Sinh viên tham gia", value: avgStudentPercentage },
    { name: "Không tham gia", value: 100 - avgStudentPercentage },
  ];

  const areaData = () => {
    if (period === "năm") {
      return detailedStats.length > 0
        ? detailedStats.map((stat) => ({
            name: stat.name,
            studentRevenue: stat.studentRevenue || 0,
            studentPercentage: stat.studentPercentage || 0,
          }))
        : Array.from({ length: 12 }, (_, i) => ({
            name: `Tháng ${i + 1}`,
            studentRevenue: 0,
            studentPercentage: 0,
          }));
    } else if (period === "tháng") {
      return detailedStats.length > 0
        ? detailedStats.map((stat) => ({
            name: stat.name,
            studentRevenue: stat.studentRevenue || 0,
            studentPercentage: stat.studentPercentage || 0,
          }))
        : Array.from(
            { length: getDaysInMonth(parseInt(month), parseInt(year)) },
            (_, i) => ({
              name: `Ngày ${i + 1}`,
              studentRevenue: 0,
              studentPercentage: 0,
            })
          );
    }
    return [];
  };

  // Hàm tính toán yTicks động dựa trên maxValue
  const generateYTicks = (maxValue) => {
    if (maxValue === 0) return [0, 200, 400, 600, 800, 1000];

    const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
    const roundedMax = Math.ceil(maxValue / magnitude) * magnitude;
    const step = roundedMax / 4;
    const ticks = [];
    for (let i = 0; i <= 4; i++) {
      ticks.push(Math.round(i * step));
    }
    return ticks;
  };

  // Tính maxY và yTicks cho biểu đồ doanh thu
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
              onChange={(e) => setYear(e.target.value)}
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
                onChange={(e) => setMonth(e.target.value)}
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
      {!loading && error && (
        <div className="flex items-center justify-center py-6 mr-5">
          <p
            className={`text-lg font-medium ${theme === "dark" ? "text-red-400" : "text-red-600"}`}
          >
            Lỗi: {error}
          </p>
        </div>
      )}

      {/* Show Charts if Search is Performed */}
      {!loading && !error && showCharts && (
        <div className="mr-5">
          {/* Overview Section (Above Tabs) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
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
                  {totalRevenue.toLocaleString()} DXLAB Coin
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
                  <Users size={26} />
                </div>
                <p
                  className={`card-title ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}
                >
                  Tỷ lệ sinh viên tham gia
                </p>
              </div>
              <div className="card-body">
                <p
                  className={`text-2xl font-bold transition-colors ${theme === "dark" ? "text-white" : "text-black"}`}
                >
                  {avgStudentPercentage.toFixed(1)}%
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
                  {totalExpenses.toLocaleString()} DXLAB Coin
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
                  Tổng số người dùng
                </p>
              </div>
              <div className="card-body">
                <p
                  className={`text-2xl font-bold transition-colors ${theme === "dark" ? "text-white" : "text-black"}`}
                >
                  Chưa có dữ liệu
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
                participationPieData={participationPieData}
              />
            )}

            {activeTab === "cost" && (
              <CostStatistics
                jobs={period === "năm" ? jobsByYear : jobs} // Truyền jobsByYear khi period là "năm", jobs khi period là "tháng"
                period={period}
                year={year}
                month={month}
              />
            )}

            {activeTab === "depreciation" && (
              <DepreciationStatistics
                depreciations={period === "năm" ? depreciationsByYear : depreciations} // Truyền dữ liệu khấu hao
                period={period}
                year={year}
                month={month}
              />
            )}

            {activeTab === "performance" && <PerformanceStatistics />}
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