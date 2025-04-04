import { CreditCard, DollarSign, Package, TrendingUp, Users } from "lucide-react";
import { useTheme } from "../../hooks/use-theme";
import { useEffect } from "react";
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
  const { stats, jobs, loading, error } = useSelector((state) => state.statistics);

  // Gọi API cho student group stats (doanh thu và tỷ lệ sinh viên)
  useEffect(() => {
    dispatch(resetStats());
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    months.forEach((month) => {
      dispatch(
        fetchStudentGroupStats({
          period: "năm",
          year: 2025,
          month: month,
          week: null,
        })
      );
    });
  }, [dispatch]);

  // Gọi API cho jobs (chi phí bỏ ra) theo năm 2025
  useEffect(() => {
    dispatch(fetchJobsByYearAndDate({ year: "2025", date: "2025-04-13" }));
  }, [dispatch]);

  // Log để kiểm tra dữ liệu
  console.log("Stats:", stats);
  console.log("Jobs:", jobs);
  console.log("Loading:", loading);
  console.log("Error:", error);

  // Tính giá trị tổng (chỉ khi stats là mảng)
  const totalRevenue = Array.isArray(stats)
    ? stats.reduce((sum, item) => sum + (item.totalRevenue || 0), 0)
    : 0;
  const avgStudentPercentage =
    Array.isArray(stats) && stats.length > 0
      ? stats.reduce((sum, item) => sum + (item.studentPercentage || 0), 0) / stats.length
      : 0;

  // Dữ liệu cho biểu đồ hình tròn (Pie Chart) của studentPercentage
  const pieData = [
    { name: "Sinh viên tham gia", value: avgStudentPercentage },
    { name: "Không tham gia", value: 100 - avgStudentPercentage },
  ];
  const COLORS = ["#f97316", "#94a3b8"]; // Màu cam (#f97316) cho phần "Sinh viên tham gia"

  // Tạo dữ liệu cho biểu đồ parabol (12 tháng) cho doanh thu
  const areaData = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const stat = stats.find((item) => item.name === `Tháng ${month}`);
    return {
      name: `Tháng ${month}`,
      total: (month === 3 || month === 9) && stat ? stat.totalRevenue || 0 : 0, // Hiển thị totalRevenue cho tháng 3 và 9, các tháng khác là 0
    };
  });

  // Tạo dữ liệu cho biểu đồ chi phí (cost) từ jobs
  const costData = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    // Giả sử jobs là mảng các job, mỗi job có `date` (ngày) và `cost`
    const monthlyJobs = jobs.filter((job) => {
      const jobMonth = new Date(job.date).getMonth() + 1; // Lấy tháng từ date
      return jobMonth === month;
    });
    const totalCost = monthlyJobs.reduce((sum, job) => sum + (job.cost || 0), 0);
    return {
      name: `Tháng ${month}`,
      totalCost: totalCost, // Tổng chi phí cho tháng đó
    };
  });

  const yTicks = [0, 200, 400, 600, 800, 1000]; // Các mốc bạn muốn hiển thị
  const maxY = 1000; // Giá trị tối đa trên trục Y
  const minY = 0;

  return (
    <div className="flex flex-col gap-y-4 mb-20 pl-5">
      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
        Thống kê
      </h2>

      {/* Hiển thị trạng thái loading và error */}
      {loading && (
        <div className="flex items-center justify-center py-6 mt-50 mb-200">
          <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
          <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
        </div>
      )}
      {error && (
        <div className="text-center text-red-500">
          Lỗi: {error.message || error}
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mr-5">
          {/* Card 1: Tổng doanh thu */}
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

          {/* Card 2: Tỷ lệ sinh viên tham gia trung bình */}
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

          {/* Card 3: Tổng chi phí bỏ ra */}
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
                10% {/* Giá trị này có thể được tính toán nếu có dữ liệu so sánh */}
              </span>
            </div>
          </div>

          {/* Card 4: Placeholder */}
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

      {/* Biểu đồ hình tròn cho studentPercentage */}
      {!loading && Array.isArray(stats) && stats.length > 0 && (
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

      {/* Biểu đồ đường parabol cho doanh thu */}
      {!loading && (
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
                data={areaData}
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
                  dataKey="total"
                  strokeWidth={0}
                  stroke={theme === "light" ? "#475569" : "#94a3b8"}
                  tickFormatter={(value) => `${value} DXLAB Coin`}
                  tickMargin={40}
                  domain={[minY, maxY]}
                  ticks={yTicks}
                  width={100}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#f97316"
                  fillOpacity={1}
                  fill="url(#colorTotalOverview)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Biểu đồ đường parabol cho chi phí bỏ ra */}
      {!loading && (
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
                data={costData}
                margin={{ top: 30, right: 30, left: 50, bottom: 30 }}
              >
                <defs>
                  <linearGradient id="colorCostOverview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} /> {/* Màu xanh emerald */}
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
                  domain={[minY, maxY]}
                  ticks={yTicks}
                  width={100}
                />
                <Area
                  type="monotone"
                  dataKey="totalCost"
                  stroke="#10b981" // Màu xanh emerald
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