import { CreditCard, DollarSign, Package, TrendingUp, Users } from "lucide-react";
import { useTheme } from "../../hooks/use-theme";
import { useEffect, useState } from "react";
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

  // State để quản lý lựa chọn của người dùng
  const [period, setPeriod] = useState("năm"); // Mặc định là "năm"
  const [year, setYear] = useState("2025"); // Mặc định là năm 2025
  const [month, setMonth] = useState(""); // Tháng (1-12)
  const [week, setWeek] = useState(""); // Tuần (1-4)
  const [showCharts, setShowCharts] = useState(false); // Kiểm soát việc hiển thị biểu đồ

  // State để lưu trữ dữ liệu tổng doanh thu và dữ liệu chi tiết riêng biệt
  const [yearlyStats, setYearlyStats] = useState(null); // Dữ liệu tổng doanh thu cả năm
  const [detailedStats, setDetailedStats] = useState([]); // Dữ liệu chi tiết theo tháng hoặc ngày

  // Danh sách các năm để người dùng chọn
  const years = Array.from({ length: 10 }, (_, i) => (2025 - i).toString());

  // Danh sách các tháng (1-12)
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  // Danh sách các tuần (1-4)
  const weeks = ["1", "2", "3", "4"];

  // Hàm tính số ngày trong tháng
  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate(); // Trả về số ngày trong tháng
  };

  // Hàm lấy danh sách ngày trong tuần được chọn
  const getDaysInWeek = (week, month, year) => {
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const firstDayOfWeek = (week - 1) * 7 + 1; // Ngày đầu tiên của tuần
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = firstDayOfWeek + i;
      if (day <= getDaysInMonth(month, year)) {
        days.push(day);
      }
    }
    return days;
  };

  // Hàm tính studentRevenue từ totalRevenue và studentPercentage
  const calculateStudentRevenue = (totalRevenue, studentPercentage) => {
    return totalRevenue * (studentPercentage / 100);
  };

  // Xử lý khi người dùng nhấn "Tìm kiếm"
  const handleSearch = () => {
    dispatch(resetStats()); // Reset dữ liệu cũ
    setYearlyStats(null); // Reset dữ liệu tổng
    setDetailedStats([]); // Reset dữ liệu chi tiết
    setShowCharts(false); // Ẩn biểu đồ cho đến khi có dữ liệu mới

    // Gọi API fetchStudentGroupStats dựa trên period
    if (period === "năm") {
      // Gọi API một lần để lấy tổng doanh thu cho cả năm
      dispatch(
        fetchStudentGroupStats({
          period: "năm",
          year: year,
          month: null,
          week: null,
        })
      ).then((response) => {
        if (response.payload && response.payload.data) {
          // Kiểm tra xem dữ liệu có hợp lệ không
          const data = response.payload.data;
          // Nếu totalRevenue không tồn tại hoặc là 0, hoặc không có dữ liệu hợp lệ, đặt yearlyStats là null
          if (!data.totalRevenue || data.totalRevenue === 0) {
            setYearlyStats(null);
          } else {
            setYearlyStats(data);
          }
        } else {
          setYearlyStats(null); // Không có dữ liệu, đặt yearlyStats là null
        }
      });

      // Gọi API bổ sung để lấy dữ liệu chi tiết theo tháng
      const monthsToFetch = Array.from({ length: 12 }, (_, i) => i + 1);
      const monthlyPromises = monthsToFetch.map((month) =>
        dispatch(
          fetchStudentGroupStats({
            period: "tháng",
            year: year,
            month: month,
            week: null,
          })
        ).then((response) => {
          if (response.payload && response.payload.data) {
            const { totalRevenue, studentPercentage } = response.payload.data;
            return {
              name: `Tháng ${month}`,
              totalRevenue: totalRevenue || 0,
              studentPercentage: studentPercentage || 0,
              studentRevenue: calculateStudentRevenue(totalRevenue || 0, studentPercentage || 0),
            };
          }
          return { name: `Tháng ${month}`, totalRevenue: 0, studentPercentage: 0, studentRevenue: 0 };
        })
      );

      Promise.all(monthlyPromises).then((results) => {
        setDetailedStats(results); // Lưu dữ liệu chi tiết theo tháng
      });
    } else if (period === "tháng") {
      // Gọi API cho tháng được chọn
      if (!month || !year) {
        alert("Vui lòng chọn tháng và năm!");
        return;
      }
      dispatch(
        fetchStudentGroupStats({
          period: "tháng",
          year: year,
          month: month,
          week: null,
        })
      ).then((response) => {
        if (response.payload && response.payload.data) {
          const data = response.payload.data;
          if (!data.totalRevenue || data.totalRevenue === 0) {
            setYearlyStats(null);
          } else {
            setYearlyStats(data);
          }

          // Giả lập dữ liệu chi tiết theo ngày (vì API không trả về dữ liệu theo ngày)
          const daysInMonth = getDaysInMonth(parseInt(month), parseInt(year));
          const dailyData = [];
          for (let day = 1; day <= daysInMonth; day++) {
            // Giả định: Nếu ngày 13 là ngày có booking (theo fetchJobsByYearAndDate), thì gán toàn bộ doanh thu cho ngày đó
            const isBookingDay = day === 13; // Giả định ngày 13 có booking
            const totalRevenue = isBookingDay ? (data.totalRevenue || 0) : 0;
            const studentPercentage = isBookingDay ? (data.studentPercentage || 0) : 0;
            dailyData.push({
              name: `Ngày ${day}`,
              totalRevenue: totalRevenue || 0,
              studentPercentage: studentPercentage || 0,
              studentRevenue: calculateStudentRevenue(totalRevenue || 0, studentPercentage || 0),
            });
          }
          setDetailedStats(dailyData);
        } else {
          setYearlyStats(null);
        }
      });
    } else if (period === "tuần") {
      // Gọi API cho tuần được chọn
      if (!week || !month || !year) {
        alert("Vui lòng chọn tuần, tháng và năm!");
        return;
      }
      dispatch(
        fetchStudentGroupStats({
          period: "tuần",
          year: year,
          month: month,
          week: week,
        })
      ).then((response) => {
        if (response.payload && response.payload.data) {
          const data = response.payload.data;
          if (!data.totalRevenue || data.totalRevenue === 0) {
            setYearlyStats(null);
          } else {
            setYearlyStats(data);
          }

          // Phân bổ doanh thu đều cho các ngày trong tuần
          const daysInWeek = getDaysInWeek(parseInt(week), parseInt(month), parseInt(year));
          const dailyData = [];
          const totalRevenue = data.totalRevenue || 0;
          const studentPercentage = data.studentPercentage || 0;
          const totalStudentRevenue = calculateStudentRevenue(totalRevenue, studentPercentage);
          const dailyStudentRevenue = daysInWeek.length > 0 ? totalStudentRevenue / daysInWeek.length : 0;

          daysInWeek.forEach((day) => {
            dailyData.push({
              name: `Ngày ${day}`,
              totalRevenue: totalRevenue / daysInWeek.length, // Chia đều totalRevenue
              studentPercentage: studentPercentage,
              studentRevenue: dailyStudentRevenue, // Chia đều studentRevenue
            });
          });
          setDetailedStats(dailyData);
        } else {
          setYearlyStats(null);

          // Nếu không có dữ liệu, vẫn tạo dữ liệu cho các ngày trong tuần với giá trị 0
          const daysInWeek = getDaysInWeek(parseInt(week), parseInt(month), parseInt(year));
          const dailyData = [];
          daysInWeek.forEach((day) => {
            dailyData.push({
              name: `Ngày ${day}`,
              totalRevenue: 0,
              studentPercentage: 0,
              studentRevenue: 0,
            });
          });
          setDetailedStats(dailyData);
        }
      });
    }

    // Gọi API fetchJobsByYearAndDate với year được chọn
    dispatch(fetchJobsByYearAndDate({ year: year, date: `${year}-04-13` }));
    setShowCharts(true); // Hiển thị biểu đồ sau khi gọi API
  };

  // Tính giá trị tổng doanh thu (chỉ dựa trên yearlyStats)
  const totalRevenue = yearlyStats ? yearlyStats.totalRevenue || 0 : 0;

  const avgStudentPercentage = yearlyStats
    ? yearlyStats.studentPercentage || 0
    : 0;

  // Dữ liệu cho biểu đồ hình tròn (Pie Chart) của studentPercentage
  const pieData = [
    { name: "Sinh viên tham gia", value: avgStudentPercentage },
    { name: "Không tham gia", value: 100 - avgStudentPercentage },
  ];
  const COLORS = ["#f97316", "#94a3b8"]; // Màu cam (#f97316) cho phần "Sinh viên tham gia"

  // Tạo dữ liệu cho biểu đồ parabol (doanh thu từ sinh viên) dựa trên period
  const areaData = () => {
    if (period === "năm") {
      // Hiển thị dữ liệu cho tất cả 12 tháng, kể cả tháng không có dữ liệu (giá trị 0)
      const data = [];
      for (let month = 1; month <= 12; month++) {
        const stat = detailedStats.find((item) => item.name === `Tháng ${month}`);
        data.push({
          name: `Tháng ${month}`,
          studentRevenue: stat && stat.studentRevenue !== undefined ? stat.studentRevenue : 0,
        });
      }
      return data;
    } else if (period === "tháng") {
      // Hiển thị dữ liệu cho tất cả các ngày trong tháng, kể cả ngày không có dữ liệu (giá trị 0)
      const daysInMonth = getDaysInMonth(parseInt(month), parseInt(year));
      const data = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const stat = detailedStats.find((item) => item.name === `Ngày ${day}`);
        data.push({
          name: `Ngày ${day}`,
          studentRevenue: stat && stat.studentRevenue !== undefined ? stat.studentRevenue : 0,
        });
      }
      return data;
    } else if (period === "tuần") {
      // Hiển thị dữ liệu cho tất cả các ngày trong tuần, kể cả ngày không có dữ liệu (giá trị 0)
      const daysInWeek = getDaysInWeek(parseInt(week), parseInt(month), parseInt(year));
      const data = [];
      daysInWeek.forEach((day) => {
        const stat = detailedStats.find((item) => item.name === `Ngày ${day}`);
        data.push({
          name: `Ngày ${day}`,
          studentRevenue: stat && stat.studentRevenue !== undefined ? stat.studentRevenue : 0,
        });
      });
      return data;
    }
    return [];
  };

  // Tạo dữ liệu cho biểu đồ chi phí (cost) từ jobs dựa trên period
  const costData = () => {
    if (period === "năm") {
      // Hiển thị dữ liệu cho tất cả 12 tháng, kể cả tháng không có dữ liệu (giá trị 0)
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
      // Hiển thị dữ liệu cho tất cả các ngày trong tháng, kể cả ngày không có dữ liệu (giá trị 0)
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
    } else if (period === "tuần") {
      // Hiển thị dữ liệu cho tất cả các ngày trong tuần, kể cả ngày không có dữ liệu (giá trị 0)
      const daysInWeek = getDaysInWeek(parseInt(week), parseInt(month), parseInt(year));
      const data = [];
      daysInWeek.forEach((day) => {
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
      });
      return data;
    }
    return [];
  };

  const yTicks = [0, 200, 400, 600, 800, 1000]; // Các mốc bạn muốn hiển thị
  const maxY = 1000; // Giá trị tối đa trên trục Y
  const minY = 0;

  return (
    <div className="flex flex-col gap-y-4 mb-20 pl-5">
      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
        Thống kê
      </h2>

      {/* Form tùy chỉnh */}
      <div className="mb-6 p-4 border rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Tùy chỉnh thống kê</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Chọn Period */}
          <div>
            <label className="block font-medium mb-2">Khoảng thời gian:</label>
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                setMonth(""); // Reset month khi thay đổi period
                setWeek(""); // Reset week khi thay đổi period
              }}
              className="w-full p-2 border rounded-md"
            >
              <option value="năm">Năm</option>
              <option value="tháng">Tháng</option>
              <option value="tuần">Tuần</option>
            </select>
          </div>

          {/* Chọn Year */}
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

          {/* Chọn Month (hiển thị nếu period là "tháng" hoặc "tuần") */}
          {(period === "tháng" || period === "tuần") && (
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

          {/* Chọn Week (hiển thị nếu period là "tuần") */}
          {period === "tuần" && (
            <div>
              <label className="block font-medium mb-2">Tuần:</label>
              <select
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Chọn tuần</option>
                {weeks.map((w) => (
                  <option key={w} value={w}>
                    Tuần {w}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Nút Tìm kiếm */}
        <button
          onClick={handleSearch}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          Tìm kiếm
        </button>
      </div>

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

      {/* Hiển thị các card và biểu đồ chỉ khi showCharts là true và không có loading */}
      {!loading && showCharts && (
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
                10%
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

      {/* Biểu đồ đường parabol cho doanh thu từ sinh viên */}
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
              Thống kê doanh thu từ sinh viên
            </p>
          </div>
          <div className="card-body p-0">
            <ResponsiveContainer width="100%" height={500}>
              <AreaChart
                data={areaData()}
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
                  dataKey="studentRevenue"
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

      {/* Biểu đồ đường parabol cho chi phí bỏ ra */}
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
                data={costData()}
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
                  domain={[minY, maxY]}
                  ticks={yTicks}
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