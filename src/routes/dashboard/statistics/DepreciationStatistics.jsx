import PropTypes from "prop-types";
import { useTheme } from "../../../hooks/use-theme";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from "recharts";

// Tạo danh sách màu sắc cho bàn và ghế
const COLORS = [
  "#3b82f6", // Xanh dương (Ghế)
  "#ef4444", // Đỏ (Bàn)
];

const DepreciationStatistics = ({ depreciations, period, year, month }) => {
  const { theme } = useTheme();

  // Định nghĩa các category (bàn và ghế)
  const facilityCategories = {
    0: "Ghế",
    1: "Bàn",
  };

  // Tính toán dữ liệu cho Pie Chart (phân bổ khấu hao theo facilityCategory cho toàn bộ khoảng thời gian)
  const calculatePieData = () => {
    if (!depreciations || depreciations.length === 0) {
      return [];
    }

    // Khởi tạo dữ liệu cho bàn và ghế
    const categoryTotals = Object.keys(facilityCategories).reduce((acc, category) => {
      acc[category] = 0;
      return acc;
    }, {});

    // Tính tổng khấu hao cho từng facilityCategory trong khoảng thời gian được chọn
    depreciations.forEach((item) => {
      if (!item || !item.sumDate || item.facilityCategory === undefined) {
        return; // Bỏ qua nếu item không hợp lệ
      }

      const date = new Date(item.sumDate);
      if (isNaN(date.getTime())) {
        return; // Bỏ qua nếu ngày không hợp lệ
      }

      const itemYear = date.getFullYear();
      const itemMonth = date.getMonth(); // getMonth() trả về 0-11

      // Lọc theo năm
      if (itemYear !== parseInt(year)) {
        return; // Bỏ qua nếu không thuộc năm được chọn
      }

      // Nếu period là "tháng", chỉ xử lý nếu item thuộc tháng được chọn
      if (period === "tháng" && month) {
        const selectedMonth = parseInt(month) - 1; // Chuyển month về dạng 0-11 để so sánh
        if (itemMonth !== selectedMonth) {
          return; // Bỏ qua nếu không thuộc tháng được chọn
        }
      }

      const category = item.facilityCategory.toString();
      const amount = item.depreciationAmount || 0;

      // Cộng dồn giá trị khấu hao
      if (categoryTotals[category] !== undefined) {
        categoryTotals[category] += amount;
      }
    });

    // Chuyển đổi dữ liệu thành định dạng phù hợp cho Pie Chart
    return Object.entries(categoryTotals)
      .map(([category, value]) => ({
        name: facilityCategories[category],
        value: value,
      }))
      .filter((entry) => entry.value > 0); // Loại bỏ các category có giá trị 0
  };

  // Tạo danh sách các tháng để hiển thị trên biểu đồ Area Chart (chỉ dùng khi period === "năm")
  const initializeAreaData = () => {
    if (period === "năm") {
      return Array.from({ length: 12 }, (_, i) => {
        const monthData = { name: `Tháng ${i + 1}`, total: 0 };
        Object.keys(facilityCategories).forEach((category) => {
          monthData[facilityCategories[category]] = 0; // Khởi tạo giá trị khấu hao cho bàn và ghế
        });
        return monthData;
      });
    }
    return [];
  };

  // Xử lý dữ liệu khấu hao để nhóm theo tháng và facilityCategory cho Area Chart (chỉ dùng khi period === "năm")
  const processAreaData = () => {
    const data = initializeAreaData();

    if (!depreciations || depreciations.length === 0 || period !== "năm") {
      return data;
    }

    // Bước 1: Tính tổng khấu hao cho từng tháng
    depreciations.forEach((item) => {
      if (!item || !item.sumDate || item.facilityCategory === undefined) {
        return; // Bỏ qua nếu item không hợp lệ
      }

      const date = new Date(item.sumDate);
      if (isNaN(date.getTime())) {
        return; // Bỏ qua nếu ngày không hợp lệ
      }

      const itemYear = date.getFullYear();
      const itemMonth = date.getMonth(); // getMonth() trả về 0-11

      // Lọc theo năm
      if (itemYear !== parseInt(year)) {
        return; // Bỏ qua nếu không thuộc năm được chọn
      }

      const index = itemMonth; // Chỉ số của tháng
      const category = facilityCategories[item.facilityCategory];
      const amount = item.depreciationAmount || 0;

      // Cộng dồn giá trị khấu hao vào tháng tương ứng cho facilityCategory
      if (data[index] && data[index][category] !== undefined) {
        data[index][category] += amount;
        data[index].total += amount; // Cộng dồn vào tổng
      }
    });

    // Bước 2: Chuyển đổi giá trị thành tỷ lệ phần trăm
    return data.map((monthData) => {
      const total = monthData.total || 1; // Tránh chia cho 0
      const percentageData = { name: monthData.name };
      Object.keys(facilityCategories).forEach((category) => {
        const categoryName = facilityCategories[category];
        const value = monthData[categoryName] || 0;
        percentageData[categoryName] = (value / total) * 100; // Chuyển thành %
      });
      return percentageData;
    });
  };

  // Tính toán Y-axis domain và ticks động dựa trên dữ liệu cho Area Chart (phần trăm)
  const calculateYAxisProps = (data) => {
    const categories = Object.values(facilityCategories);
    const maxValue = Math.max(
      ...data.map((item) =>
        Math.max(...categories.map((category) => item[category] || 0))
      ),
      10 // Đảm bảo giá trị tối thiểu cho visibility
    );
    const roundedMax = Math.min(Math.ceil(maxValue / 10) * 10, 100); // Giới hạn tối đa là 100%
    const step = roundedMax / 4;
    const ticks = [];
    for (let i = 0; i <= 4; i++) {
      ticks.push(Math.round(i * step));
    }
    return {
      minY: 0,
      maxY: roundedMax,
      ticks: ticks,
    };
  };

  const pieData = calculatePieData();
  const areaData = processAreaData();
  const { minY, maxY, ticks } = calculateYAxisProps(areaData);

  return (
    <div
      className={`card col-span-1 md:col-span-2 lg:col-span-4 rounded-xl shadow-lg transition-all duration-300 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Card Header */}
      <div className="card-header border-b border-gray-200 dark:border-gray-700">
        <p
          className={`card-title text-2xl font-semibold p-6 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Thống kê khấu hao
        </p>
      </div>

      {/* Chart Container - Stacked Vertically */}
      <div className="card-body p-6 flex flex-col gap-8">
        {/* Pie Chart for Depreciation Distribution by facilityCategory */}
        <div className="flex flex-col items-center animate-fade-in">
          <h3
            className={`text-xl font-medium mb-4 ${
              theme === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Phân bổ khấu hao theo hạng mục - {period === "năm" ? `Năm ${year}` : `Tháng ${month}/${year}`}
          </h3>
          {pieData.every(item => item.value === 0) ? (
            <p className={`text-center text-gray-500 dark:text-gray-400`}>Không có dữ liệu khấu hao</p>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(1)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value.toLocaleString()} DXLAB Coin`}
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                    color: theme === "dark" ? "#ffffff" : "#1f2937",
                    borderRadius: "8px",
                    border: `1px solid ${theme === "dark" ? "#4b5563" : "#e5e7eb"}`,
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    padding: "8px 12px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Area Chart for Depreciation Percentages by Month - Chỉ hiển thị khi period là "năm" */}
        {period === "năm" && (
          <div className="flex flex-col animate-fade-in">
            <h3
              className={`text-xl font-medium mb-4 ${
                theme === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Biểu đồ thống kê khấu hao (theo %)
            </h3>
            {areaData.every(item => item["Ghế"] === 0 && item["Bàn"] === 0) ? (
              <p className={`text-center text-gray-500 dark:text-gray-400`}>Không có dữ liệu khấu hao</p>
            ) : (
              <ResponsiveContainer width="100%" height={500}>
                <AreaChart
                  data={areaData}
                  margin={{ top: 20, right: 30, left: 40, bottom: 50 }}
                >
                  <defs>
                    <linearGradient id="colorChair" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorTable" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    cursor={{ stroke: theme === "dark" ? "#4b5563" : "#e5e7eb", strokeWidth: 1 }}
                    formatter={(value) => `${value.toFixed(1)}%`}
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                      color: theme === "dark" ? "#ffffff" : "#1f2937",
                      borderRadius: "8px",
                      border: `1px solid ${theme === "dark" ? "#4b5563" : "#e5e7eb"}`,
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      padding: "8px 12px",
                    }}
                  />
                  <XAxis
                    dataKey="name"
                    strokeWidth={0}
                    stroke={theme === "light" ? "#64748b" : "#94a3b8"}
                    tick={{ fontSize: 14, fill: theme === "dark" ? "#d1d5db" : "#6b7280" }}
                  />
                  <YAxis
                    strokeWidth={0}
                    stroke={theme === "light" ? "#64748b" : "#94a3b8"}
                    tickFormatter={(value) => `${value}%`}
                    tickMargin={20}
                    domain={[minY, maxY]}
                    ticks={ticks}
                    width={100}
                    tick={{ fontSize: 14, fill: theme === "dark" ? "#d1d5db" : "#6b7280" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Ghế"
                    name="Ghế"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorChair)"
                    activeDot={{ r: 6, fill: "#3b82f6", stroke: theme === "dark" ? "#1f2937" : "#ffffff" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Bàn"
                    name="Bàn"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTable)"
                    activeDot={{ r: 6, fill: "#ef4444", stroke: theme === "dark" ? "#1f2937" : "#ffffff" }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => (
                      <span
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {value}
                      </span>
                    )}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

DepreciationStatistics.propTypes = {
  depreciations: PropTypes.arrayOf(
    PropTypes.shape({
      depreciationSumId: PropTypes.number,
      sumDate: PropTypes.string,
      batchNumber: PropTypes.string,
      depreciationAmount: PropTypes.number,
      facilityCategory: PropTypes.number,
      facilityTitle: PropTypes.string,
    })
  ).isRequired,
  period: PropTypes.oneOf(["năm", "tháng"]).isRequired,
  year: PropTypes.string.isRequired,
  month: PropTypes.string,
};

export default DepreciationStatistics;