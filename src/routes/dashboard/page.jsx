import { CreditCard, DollarSign, Package, TrendingUp, Users } from "lucide-react";
import { useTheme } from "../../hooks/use-theme";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchStudentGroupStats, fetchJobsByYearAndDate, resetStats } from "../../redux/slices/Statistics";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import { FaSpinner } from "react-icons/fa";

const Page = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { stats, jobs, loading } = useSelector((state) => state.statistics);

  const [period, setPeriod] = useState("năm"); 
  const [year, setYear] = useState("2025"); 
  const [month, setMonth] = useState(""); 
  const [showCharts, setShowCharts] = useState(false);

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
          const totalRevenue = details.reduce((sum, item) => sum + (item.revenue.totalRevenue || 0), 0);
          const monthlyData = Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const item = details.find((d) => d.periodNumber === month) || {
              revenue: { totalRevenue: 0, studentRevenue: 0, studentPercentage: 0 },
            };
            return {
              name: `Tháng ${month}`,
              totalRevenue: item.revenue.totalRevenue || 0,
              studentRevenue: item.revenue.studentRevenue || 0,
              studentPercentage: item.revenue.studentPercentage || 0,
            };
          });
          const totalStudentPercentage = monthlyData.length > 0 ? monthlyData.reduce((sum, item) => sum + (item.studentPercentage || 0), 0) / monthlyData.length : 0;
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
    } else if (period === "tháng") {
      if (!month || !year) {
        alert("Vui lòng chọn tháng và năm!");
        return;
      }
      const monthData = yearlyData.find((d) => d.periodNumber === parseInt(month));
      const monthStudentPercentage = monthData ? monthData.revenue.studentPercentage || 0 : 0;
      dispatch(
        fetchStudentGroupStats({
          period: "tháng",
          year: year,
          month: month,
        })
      ).then((response) => {
        if (response.payload && response.payload.data) {
          const { details } = response.payload.data;
          const totalRevenue = details.reduce((sum, item) => sum + (item.revenue.totalRevenue || 0), 0);
          const daysInMonth = getDaysInMonth(parseInt(month), parseInt(year));
          const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayData = details.find((item) => item.periodNumber === day) || {
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
    }
    dispatch(fetchJobsByYearAndDate({ year: year, date: `${year}-04-13` }));
  };

  const totalRevenue = yearlyStats ? yearlyStats.totalRevenue || 0 : 0;
  const avgStudentPercentage = yearlyStats ? yearlyStats.studentPercentage || 0 : 0;

  const pieData = [
    { name: "Sinh viên tham gia", value: avgStudentPercentage },
    { name: "Không tham gia", value: 100 - avgStudentPercentage },
  ];
  const COLORS = ["#f97316", "#94a3b8"];

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
        : Array.from({ length: getDaysInMonth(parseInt(month), parseInt(year)) }, (_, i) => ({
            name: `Ngày ${i + 1}`,
            studentRevenue: 0,
            studentPercentage: 0,
          }));
    }
    return [];
  };

  const costData = () => {
    if (period === "năm") {
      const data = [];
      for (let month = 1; month <= 12; month++) {
        const monthlyJobs = jobs.filter((job) => {
          const jobMonth = new Date(job.date).getMonth() + 1;
          return jobMonth === month && new Date(job.date).getFullYear() === parseInt(year);
        });
        const totalCost = monthlyJobs.reduce((sum, job) => sum + (job.cost || 0), 0);
        data.push({
          name: `Tháng ${month}`,
          totalCost: totalCost,
        });
      }
      return data;
    } else if (period === "tháng") {
      const daysInMonth = getDaysInMonth(parseInt(month), parseInt(year));
      const data = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const dailyJobs = jobs.filter((job) => {
          const jobDate = new Date(job.date);
          return (
            jobDate.getDate() === day &&
            jobDate.getMonth() + 1 === parseInt(month) &&
            jobDate.getFullYear() === parseInt(year)
          );
        });
        const totalCost = dailyJobs.reduce((sum, job) => sum + (job.cost || 0), 0);
        data.push({
          name: `Ngày ${day}`,
          totalCost: totalCost,
        });
      }
      return data;
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
  const maxRevenue = Math.max(
    ...revenueAreaData.map((d) => d.studentRevenue),
    1000
  );
  const revenueYTicks = generateYTicks(maxRevenue);
  const revenueMaxY = revenueYTicks[revenueYTicks.length - 1];
  const revenueMinY = 0;

  // Tính maxY và yTicks cho biểu đồ chi phí
  const costAreaData = costData();
  const maxCost = Math.max(
    ...costAreaData.map((d) => d.totalCost),
    1000
  );
  const costYTicks = generateYTicks(maxCost);
  const costMaxY = costYTicks[costYTicks.length - 1];
  const costMinY = 0;

  return (
    <div className="flex flex-col gap-y-4 mb-20 pl-5">
      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
        Thống kê
      </h2>

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

      {loading && (
        <div className="flex items-center justify-center py-6 mt-50 mb-200">
          <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
          <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
        </div>
      )}

      {!loading && showCharts && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mr-5">
          <div
            className={`card ${
              theme === "dark" ? "bg-black text-white" : "bg-white text-black"
            } transition-colors`}
          >
            <div className="card-header">
              <div
                className={`w-fit rounded-lg p-2 transition-colors ${
                  theme === "dark"
                    ? "bg-orange-600/20 text-orange-400"
                    : "bg-orange-500/20 text-orange-500"
                }`}
              >
                <DollarSign size={26} />
              </div>
              <p
                className={`card-title ${
                  theme === "dark" ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                Tổng doanh thu
              </p>
            </div>
            <div className="card-body">
              <p
                className={`text-3xl font-bold transition-colors ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}
              >
                {totalRevenue} DXLAB Coin
              </p>
              <span
                className={`flex w-fit items-center gap-x-2 rounded-full border px-2 py-1 font-medium transition-colors ${
                  theme === "dark"
                    ? "border-orange-400 text-orange-400"
                    : "border-orange-500 text-orange-500"
                }`}
              >
                <TrendingUp size={18} />
                25%
              </span>
            </div>
          </div>

          <div
            className={`card ${
              theme === "dark" ? "bg-black text-white" : "bg-white text-black"
            } transition-colors`}
          >
            <div className="card-header">
              <div
                className={`w-fit rounded-lg p-2 transition-colors ${
                  theme === "dark"
                    ? "bg-orange-600/20 text-orange-400"
                    : "bg-orange-500/20 text-orange-500"
                }`}
              >
                <Users size={26} />
              </div>
              <p
                className={`card-title ${
                  theme === "dark" ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                Tỷ lệ sinh viên tham gia
              </p>
            </div>
            <div className="card-body">
              <p
                className={`text-3xl font-bold transition-colors ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}
              >
                {avgStudentPercentage.toFixed(1)}%
              </p>
              <span
                className={`flex w-fit items-center gap-x-2 rounded-full border px-2 py-1 font-medium transition-colors ${
                  theme === "dark"
                    ? "border-orange-400 text-orange-400"
                    : "border-orange-500 text-orange-500"
                }`}
              >
                <TrendingUp size={18} />
                12%
              </span>
            </div>
          </div>

          <div
            className={`card ${
              theme === "dark" ? "bg-black text-white" : "bg-white text-black"
            } transition-colors`}
          >
            <div className="card-header">
              <div
                className={`w-fit rounded-lg p-2 transition-colors ${
                  theme === "dark"
                    ? "bg-orange-600/20 text-orange-400"
                    : "bg-orange-500/20 text-orange-500"
                }`}
              >
                <Package size={26} />
              </div>
              <p
                className={`card-title ${
                  theme === "dark" ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                Tổng chi phí bỏ ra
              </p>
            </div>
            <div className="card-body">
              <p
                className={`text-3xl font-bold transition-colors ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}
              >
                {jobs.reduce((sum, job) => sum + (job.cost || 0), 0)} DXLAB Coin
              </p>
              <span
                className={`flex w-fit items-center gap-x-2 rounded-full border px-2 py-1 font-medium transition-colors ${
                  theme === "dark"
                    ? "border-orange-400 text-orange-400"
                    : "border-orange-500 text-orange-500"
                }`}
              >
                <TrendingUp size={18} />
                10%
              </span>
            </div>
          </div>

          <div
            className={`card ${
              theme === "dark" ? "bg-black text-white" : "bg-white text-black"
            } transition-colors`}
          >
            <div className="card-header">
              <div
                className={`w-fit rounded-lg p-2 transition-colors ${
                  theme === "dark"
                    ? "bg-orange-600/20 text-orange-400"
                    : "bg-orange-500/20 text-orange-500"
                }`}
              >
                <CreditCard size={26} />
              </div>
              <p
                className={`card-title ${
                  theme === "dark" ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                Tổng số người dùng
              </p>
            </div>
            <div className="card-body">
              <p
                className={`text-3xl font-bold transition-colors ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}
              >
                Chưa có dữ liệu
              </p>
              <span
                className={`flex w-fit items-center gap-x-2 rounded-full border px-2 py-1 font-medium transition-colors ${
                  theme === "dark"
                    ? "border-orange-400 text-orange-400"
                    : "border-orange-500 text-orange-500"
                }`}
              >
                <TrendingUp size={18} />
                0%
              </span>
            </div>
          </div>
        </div>
      )}

      {!loading && showCharts && yearlyStats && (
        <div
          className={`card mr-5 col-span-1 md:col-span-2 lg:col-span-4 ${
            theme === "dark" ? "bg-black text-white" : "bg-white text-black"
          }`}
        >
          <div className="card-header">
            <p
              className={`card-title ${
                theme === "dark" ? "bg-black text-white" : "bg-white text-black"
              } p-5`}
            >
              Tỷ lệ sinh viên tham gia
            </p>
          </div>
          <div className="card-body p-0">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(1)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value.toFixed(1)}%`}
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "black" : "white",
                    color: theme === "dark" ? "white" : "black",
                    borderRadius: "8px",
                    border: `1px solid ${
                      theme === "dark" ? "#334155" : "#cbd5e1"
                    }`,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!loading && showCharts && (
        <div
          className={`card mr-5 col-span-1 md:col-span-2 lg:col-span-4 ${
            theme === "dark" ? "bg-black text-white" : "bg-white text-black"
          }`}
        >
          <div className="card-header">
            <p
              className={`card-title ${
                theme === "dark" ? "bg-black text-white" : "bg-white text-black"
              } p-5`}
            >
              Thống kê doanh thu
            </p>
          </div>
          <div className="card-body p-0">
            <ResponsiveContainer width="100%" height={500}>
              <AreaChart
                data={revenueAreaData}
                margin={{ top: 30, right: 30, left: 50, bottom: 30 }}
              >
                <defs>
                  <linearGradient id="colorTotalOverview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  cursor={false}
                  formatter={(value, name) => name === "studentPercentage" ? `${value}%` : `${value} DXLAB Coin`}
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "black" : "white",
                    color: theme === "dark" ? "white" : "black",
                    borderRadius: "8px",
                    border: `1px solid ${theme === "dark" ? "#334155" : "#cbd5e1"}`,
                  }}
                />
                <XAxis
                  dataKey="name"
                  strokeWidth={0}
                  stroke={theme === "light" ? "#475569" : "#94a3b8"}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis
                  dataKey="studentRevenue"
                  strokeWidth={0}
                  stroke={theme === "light" ? "#475569" : "#94a3b8"}
                  tickFormatter={(value) => `${value} DXLAB Coin`}
                  tickMargin={40}
                  domain={[revenueMinY, revenueMaxY]}
                  ticks={revenueYTicks}
                  width={100}
                />
                <Area
                  type="monotone"
                  dataKey="studentRevenue"
                  stroke="#f97316"
                  fillOpacity={1}
                  fill="url(#colorTotalOverview)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!loading && showCharts && (
        <div
          className={`card mr-5 col-span-1 md:col-span-2 lg:col-span-4 ${
            theme === "dark" ? "bg-black text-white" : "bg-white text-black"
          }`}
        >
          <div className="card-header">
            <p
              className={`card-title ${
                theme === "dark" ? "bg-black text-white" : "bg-white text-black"
              } p-5`}
            >
              Thống kê chi phí bỏ ra
            </p>
          </div>
          <div className="card-body p-0">
            <ResponsiveContainer width="100%" height={500}>
              <AreaChart
                data={costAreaData}
                margin={{ top: 30, right: 30, left: 50, bottom: 30 }}
              >
                <defs>
                  <linearGradient id="colorCostOverview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  cursor={false}
                  formatter={(value) => `${value} DXLAB Coin`}
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "black" : "white",
                    color: theme === "dark" ? "white" : "black",
                    borderRadius: "8px",
                    border: `1px solid ${theme === "dark" ? "#334155" : "#cbd5e1"}`,
                  }}
                />
                <XAxis
                  dataKey="name"
                  strokeWidth={0}
                  stroke={theme === "light" ? "#475569" : "#94a3b8"}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis
                  dataKey="totalCost"
                  strokeWidth={0}
                  stroke={theme === "light" ? "#475569" : "#94a3b8"}
                  tickFormatter={(value) => `${value} DXLAB Coin`}
                  tickMargin={40}
                  domain={[costMinY, costMaxY]}
                  ticks={costYTicks}
                  width={100}
                />
                <Area
                  type="monotone"
                  dataKey="totalCost"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorCostOverview)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;