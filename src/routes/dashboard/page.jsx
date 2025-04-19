import { CreditCard, DollarSign, Package, TrendingUp, Users } from "lucide-react";
import { useTheme } from "../../hooks/use-theme";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchStudentGroupStats,
  fetchJobsByYearAndMonth,
  fetchJobsByYear,
  fetchDepreciationsByYearAndMonth,
  fetchDepreciationsByYear,
  fetchUtilizationRateByYearAndMonth,
  fetchUtilizationRateByYear,
  resetStats,
} from "../../redux/slices/Statistics";
import { FaSpinner } from "react-icons/fa";
import RevenueStatistics from "./statistics/RevenueStatistics";
import CostStatistics from "./statistics/CostStatistics";
import DepreciationStatistics from "./statistics/DepreciationStatistics";
import PerformanceStatistics from "./statistics/PerformanceStatistics";
import { toast } from "react-toastify";

const Page = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { jobs, jobsByYear, depreciations, depreciationsByYear, utilizationRates, utilizationRatesByYear, loading, error } = useSelector(
    (state) => state.statistics
  );

  const [period, setPeriod] = useState("năm");
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("");
  const [showCharts, setShowCharts] = useState(false);
  const [activeTab, setActiveTab] = useState("revenue");
  const [yearlyStats, setYearlyStats] = useState(null);
  const [detailedStats, setDetailedStats] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [performanceMinY, setPerformanceMinY] = useState(0);
  const [performanceMaxY, setPerformanceMaxY] = useState(100);
  const [performanceYTicks, setPerformanceYTicks] = useState([0, 20, 40, 60, 80, 100]);
  const [isDataReady, setIsDataReady] = useState(false); // New state to track data readiness

  const years = Array.from({ length: 10 }, (_, i) => (2025 - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  const vietnameseMonths = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
  ];

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
      setIsDataReady(true); // Mark data as ready after fetch
    });
  }, [dispatch, year]);

  // Process performanceData when utilizationRates or utilizationRatesByYear changes
  useEffect(() => {
    if (period === "năm" && utilizationRatesByYear.length > 0) {
      const monthlyPerformanceData = Array.from({ length: 12 }, (_, i) => ({
        name: vietnameseMonths[i],
      })).map((monthEntry, i) => {
        const entries = utilizationRatesByYear.filter((entry) => {
          const date = new Date(entry.theDate);
          return date.getMonth() === i;
        });
        const areaTotals = entries.reduce((acc, entry) => {
          const areaName = entry.areaName || "Unknown Area";
          const areaKey = areaName.replace(/\s+/g, "");
          const rate = entry.rate || 0;
          if (!acc[areaKey]) {
            acc[areaKey] = { totalRate: 0, count: 0 };
          }
          acc[areaKey].totalRate += rate * 100; // Convert to percentage
          acc[areaKey].count += 1;
          return acc;
        }, {});
        const entry = { name: monthEntry.name };
        Object.keys(areaTotals).forEach((key) => {
          if (areaTotals[key].count > 0) {
            entry[key] = Math.round((areaTotals[key].totalRate / areaTotals[key].count) * 100) / 100;
          } else {
            entry[key] = 0;
          }
        });
        return entry;
      });

      setPerformanceData(monthlyPerformanceData);
      const rates = monthlyPerformanceData.flatMap((d) => Object.values(d).filter((v) => typeof v === "number"));
      const minRate = rates.length > 0 ? Math.min(...rates) : 0;
      const maxRate = rates.length > 0 ? Math.max(...rates) : 100;
      setPerformanceMinY(Math.floor(minRate / 20) * 20);
      setPerformanceMaxY(Math.ceil(maxRate / 20) * 20);
      setPerformanceYTicks(generateYTicks(maxRate, minRate));
    } else if (period === "tháng" && utilizationRates.length > 0 && month && year) {
      const daysInMonth = getDaysInMonth(parseInt(month), parseInt(year));
      const dailyPerformance = Array.from({ length: daysInMonth }, (_, i) => ({
        name: (i + 1).toString().padStart(2, "0"),
      })).map((dayEntry) => {
        const entries = utilizationRates.filter((entry) => {
          const date = new Date(entry.theDate);
          return date.getDate().toString().padStart(2, "0") === dayEntry.name;
        });
        const areaTotals = entries.reduce((acc, entry) => {
          const areaName = entry.areaName || "Unknown Area";
          const areaKey = areaName.replace(/\s+/g, "");
          const rate = entry.rate || 0;
          if (!acc[areaKey]) {
            acc[areaKey] = { totalRate: 0, count: 0 };
          }
          acc[areaKey].totalRate += rate * 100; // Convert to percentage
          acc[areaKey].count += 1;
          return acc;
        }, {});
        const entry = { name: dayEntry.name };
        Object.keys(areaTotals).forEach((key) => {
          if (areaTotals[key].count > 0) {
            entry[key] = Math.round((areaTotals[key].totalRate / areaTotals[key].count) * 100) / 100;
          } else {
            entry[key] = 0;
          }
        });
        return entry;
      });

      setPerformanceData(dailyPerformance);
      const rates = dailyPerformance.flatMap((d) => Object.values(d).filter((v) => typeof v === "number"));
      const minRate = rates.length > 0 ? Math.min(...rates) : 0;
      const maxRate = rates.length > 0 ? Math.max(...rates) : 100;
      setPerformanceMinY(Math.floor(minRate / 20) * 20);
      setPerformanceMaxY(Math.ceil(maxRate / 20) * 20);
      setPerformanceYTicks(generateYTicks(maxRate, minRate));
    } else {
      setPerformanceData([]);
    }
  }, [utilizationRates, utilizationRatesByYear, period, month, year]);

  const generateYTicks = (maxValue, minValue = 0) => {
    if (maxValue === 0) return [0, 20, 40, 60, 80, 100];
    const roundedMax = Math.ceil(maxValue / 20) * 20;
    const roundedMin = Math.floor(minValue / 20) * 20;
    const step = (roundedMax - roundedMin) / 5;
    return Array.from({ length: 6 }, (_, i) => Math.round(roundedMin + i * step));
  };

  const handleSearch = async () => {
    dispatch(resetStats());
    setYearlyStats(null);
    setDetailedStats([]);
    setPerformanceData([]);
    setShowCharts(false);
    setIsDataReady(false); // Reset data readiness

    try {
      if (period === "năm") {
        const [studentStatsResponse] = await Promise.all([
          dispatch(fetchStudentGroupStats({ period: "năm", year: year, month: null })),
          dispatch(fetchJobsByYear({ year })),
          dispatch(fetchDepreciationsByYear({ year })),
          dispatch(fetchUtilizationRateByYear({ year })),
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
                revenue: { totalRevenue: 0, studentRevenue: 0, studentPercentage: 0 },
              };
            return {
              name: vietnameseMonths[i],
              totalRevenue: item.revenue.totalRevenue || 0,
              studentRevenue: item.revenue.studentRevenue || 0,
              studentPercentage: item.revenue.studentPercentage || 0,
            };
          });
          const totalStudentPercentage =
            monthlyData.length > 0
              ? monthlyData.reduce((sum, item) => sum + (item.studentPercentage || 0), 0) / monthlyData.length
              : 0;
          setYearlyStats({
            totalRevenue,
            studentPercentage: totalStudentPercentage,
          });
          setDetailedStats(monthlyData || []);
        } else {
          const monthlyData = Array.from({ length: 12 }, (_, i) => ({
            name: vietnameseMonths[i],
            totalRevenue: 0,
            studentRevenue: 0,
            studentPercentage: 0,
          }));
          setYearlyStats({ totalRevenue: 0, studentPercentage: 0 });
          setDetailedStats(monthlyData);
        }

        setShowCharts(true);
        setIsDataReady(true); // Mark data as ready after fetch
      } else if (period === "tháng") {
        if (!month || !year) {
          toast.error("Vui lòng chọn tháng và năm!");
          return;
        }

        const [studentStatsResponse] = await Promise.all([
          dispatch(fetchStudentGroupStats({ period: "tháng", year: year, month: month })),
          dispatch(fetchJobsByYearAndMonth({ year, month })),
          dispatch(fetchDepreciationsByYearAndMonth({ year, month })),
          dispatch(fetchUtilizationRateByYearAndMonth({ year, month })),
        ]);

        const monthData = yearlyData.find((d) => d.periodNumber === parseInt(month));
        const monthStudentPercentage = monthData ? monthData.revenue.studentPercentage || 0 : 0;

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
          setDetailedStats(dailyData || []);
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
        setIsDataReady(true); // Mark data as ready after fetch
      }
    } catch (err) {
      console.log("Error fetching data:", err);
      toast.error("Đã xảy ra lỗi khi tải dữ liệu!");
      setShowCharts(false);
      setDetailedStats([]);
      setIsDataReady(true); // Mark data as ready even on error
    }
  };

  const totalRevenue = yearlyStats ? yearlyStats.totalRevenue || 0 : 0;
  const avgStudentPercentage = yearlyStats ? yearlyStats.studentPercentage || 0 : 0;

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
            name: vietnameseMonths[i],
            studentRevenue: 0,
            studentPercentage: 0,
          }));
    } else if (period === "tháng") {
      const parsedMonth = parseInt(month);
      const parsedYear = parseInt(year);
      if (isNaN(parsedMonth) || isNaN(parsedYear)) {
        return [];
      }
      return detailedStats.length > 0
        ? detailedStats.map((stat) => ({
            name: stat.name,
            studentRevenue: stat.studentRevenue || 0,
            studentPercentage: stat.studentPercentage || 0,
          }))
        : Array.from(
            { length: getDaysInMonth(parsedMonth, parsedYear) },
            (_, i) => ({
              name: `Ngày ${i + 1}`,
              studentRevenue: 0,
              studentPercentage: 0,
            })
          );
    }
    return [];
  };

  const revenueAreaData = areaData() || [];
  const maxRevenue = revenueAreaData.length > 0 ? Math.max(...revenueAreaData.map((d) => d.studentRevenue || 0), 1000) : 1000;
  const revenueYTicks = generateYTicks(maxRevenue);
  const revenueMaxY = revenueYTicks.length > 0 ? revenueYTicks[revenueYTicks.length - 1] : 1000;
  const revenueMinY = 0;

  // Thêm log để kiểm tra dữ liệu
  console.log("Page.jsx - period:", period);
  console.log("Page.jsx - year:", year);
  console.log("Page.jsx - month:", month);
  console.log("Page.jsx - showCharts:", showCharts);
  console.log("Page.jsx - revenueAreaData length:", revenueAreaData ? revenueAreaData.length : "undefined");
  console.log("Page.jsx - revenueAreaData:", revenueAreaData || "undefined");

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

      {/* Show Charts if Search is Performed and Data is Ready */}
      {!loading && !error && showCharts && isDataReady && (
        <div className="mr-5">
          {/* Overview Section */}
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
            {activeTab === "revenue" && revenueAreaData && revenueAreaData.length > 0 && (
              <RevenueStatistics
                revenueAreaData={revenueAreaData}
                revenueMinY={revenueMinY}
                revenueMaxY={revenueMaxY}
                revenueYTicks={revenueYTicks}
                participationPieData={participationPieData}
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
                utilizationRates={utilizationRates}
                utilizationRatesByYear={utilizationRatesByYear}
                performanceData={performanceData}
                performanceMinY={performanceMinY}
                performanceMaxY={performanceMaxY}
                performanceYTicks={performanceYTicks}
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