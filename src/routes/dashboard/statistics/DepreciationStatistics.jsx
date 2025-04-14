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

// Tạo danh sách màu sắc cho các lô hàng
const COLORS = [
  "#3b82f6", // Xanh dương
  "#ef4444", // Đỏ
  "#10b981", // Xanh lá
  "#f59e0b", // Vàng
  "#8b5cf6", // Tím
  "#ec4899", // Hồng
  "#6b7280", // Xám
];

const DepreciationStatistics = ({ depreciations, period, year, month }) => {
  const { theme } = useTheme();

  // Lấy danh sách các batchNumber duy nhất
  const getUniqueBatchNumbers = () => {
    if (!depreciations || depreciations.length === 0) {
      return [];
    }
    const batchNumbers = [...new Set(depreciations.map((item) => item.batchNumber).filter(Boolean))];
    return batchNumbers;
  };

  // Tính toán dữ liệu cho Pie Chart (phân bổ khấu hao theo batchNumber)
  const calculatePieData = () => {
    if (!depreciations || depreciations.length === 0) {
      return [];
    }

    const batchTotals = depreciations.reduce((acc, item) => {
      if (!item.batchNumber) return acc;
      acc[item.batchNumber] = (acc[item.batchNumber] || 0) + (item.depreciationAmount || 0);
      return acc;
    }, {});

    return Object.entries(batchTotals).map(([batch, value]) => ({
      name: batch,
      value: value,
    }));
  };

  // Tạo danh sách các tháng để hiển thị trên biểu đồ Area Chart (chỉ dùng khi period === "năm")
  const initializeAreaData = () => {
    const batchNumbers = getUniqueBatchNumbers();
    if (period === "năm") {
      return Array.from({ length: 12 }, (_, i) => {
        const monthData = { name: `Tháng ${i + 1}` };
        batchNumbers.forEach((batch) => {
          monthData[batch] = 0; // Khởi tạo giá trị khấu hao cho mỗi lô hàng
        });
        return monthData;
      });
    }
    return [];
  };

  // Xử lý dữ liệu khấu hao để nhóm theo tháng và batchNumber cho Area Chart (chỉ dùng khi period === "năm")
  const processAreaData = () => {
    const data = initializeAreaData();

    if (!depreciations || depreciations.length === 0 || period !== "năm") {
      return data;
    }

    depreciations.forEach((item) => {
      if (!item || !item.sumDate || !item.batchNumber) {
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
      const batchNumber = item.batchNumber;
      const amount = item.depreciationAmount || 0;

      // Cộng dồn giá trị khấu hao vào tháng tương ứng cho lô hàng
      if (data[index] && data[index][batchNumber] !== undefined) {
        data[index][batchNumber] += amount;
      }
    });

    return data;
  };

  // Tính toán Y-axis domain và ticks động dựa trên dữ liệu cho Area Chart
  const calculateYAxisProps = (data) => {
    const batchNumbers = getUniqueBatchNumbers();
    const maxValue = Math.max(
      ...data.map((item) =>
        Math.max(...batchNumbers.map((batch) => item[batch] || 0))
      ),
      10 // Đảm bảo giá trị tối thiểu cho visibility
    );
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
    const roundedMax = Math.ceil(maxValue / magnitude) * magnitude;
    const step = roundedMax / 4;
    const ticks = [];
    for (let i = 0; i <= 4; i++) {
      ticks.push(Math.round(i * step));
    }
    return {
      minY: 0,
      maxY: ticks[ticks.length - 1],
      ticks: ticks,
    };
  };

  const pieData = calculatePieData();
  const areaData = processAreaData();
  const batchNumbers = getUniqueBatchNumbers();
  const { minY, maxY, ticks } = calculateYAxisProps(areaData);

  return (
    <div
      className={`card col-span-1 md:col-span-2 lg:col-span-4 ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <div className="card-header">
        <p
          className={`card-title ${
            theme === "dark" ? "bg-black text-white" : "bg-white text-black"
          } p-5`}
        >
          Thống kê khấu hao theo lô hàng
        </p>
      </div>
      <div className="card-body p-5">
        {batchNumbers.length === 0 ? (
          <p className={`text-center text-gray-500 dark:text-gray-400 py-6`}>
            Không có dữ liệu khấu hao
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {/* Pie Chart: Phân bổ khấu hao theo batchNumber */}
            <div>
              <h3
                className={`text-lg font-semibold mb-4 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Phân bổ khấu hao theo lô hàng
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(1)}%`
                    }
                    labelLine={true}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `${value.toLocaleString()} DXLAB Coin`}
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "black" : "white",
                      color: theme === "dark" ? "white" : "black",
                      borderRadius: "8px",
                      border: `1px solid ${theme === "dark" ? "#334155" : "#cbd5e1"}`,
                    }}
                  />
                  <Legend
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
            </div>

            {/* Area Chart: Xu hướng khấu hao theo thời gian (chỉ hiển thị khi period === "năm") */}
            {period === "năm" && (
              <div>
                <h3
                  className={`text-lg font-semibold mb-4 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Xu hướng khấu hao theo thời gian
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart
                    data={areaData}
                    margin={{ top: 10, right: 30, left: 50, bottom: 30 }}
                  >
                    <Tooltip
                      formatter={(value) => `${value.toLocaleString()} DXLAB Coin`}
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
                      tick={{ fontSize: 12, fill: theme === "dark" ? "#d1d5db" : "#6b7280" }}
                    />
                    <YAxis
                      strokeWidth={0}
                      stroke={theme === "light" ? "#475569" : "#94a3b8"}
                      tickFormatter={(value) => `${value.toLocaleString()} DXLAB Coin`}
                      tickMargin={40}
                      domain={[minY, maxY]}
                      ticks={ticks}
                      width={100}
                      tick={{ fontSize: 12, fill: theme === "dark" ? "#d1d5db" : "#6b7280" }}
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
                    {batchNumbers.map((batch, index) => (
                      <Area
                        key={batch}
                        type="monotone"
                        dataKey={batch}
                        name={batch}
                        stroke={COLORS[index % COLORS.length]}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.3}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
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