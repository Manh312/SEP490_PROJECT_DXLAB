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

// Tạo danh sách màu sắc cho bàn, ghế và tổng (Pie Chart)
const COLORS = [
  "#3b82f6", // Xanh dương (Ghế)
  "#ef4444", // Đỏ (Bàn)
  "#6b7280", // Xám (Tổng)
];

const DepreciationStatistics = ({ depreciations, period, year, month }) => {
  const { theme } = useTheme();

  // Định nghĩa các category (bàn và ghế)
  const facilityCategories = {
    0: "Ghế",
    1: "Bàn",
  };


  // Tính toán dữ liệu cho Pie Chart
  const calculatePieData = () => {
    if (!depreciations || depreciations.length === 0) {
      return [];
    }

    const categoryTotals = Object.keys(facilityCategories).reduce((acc, category) => {
      acc[category] = 0;
      return acc;
    }, {});

    depreciations.forEach((item) => {
      if (!item || !item.sumDate || item.facilityCategory === undefined) {
        return;
      }

      const date = new Date(item.sumDate);
      if (isNaN(date.getTime())) {
        return;
      }

      const itemYear = date.getFullYear();
      const itemMonth = date.getMonth();

      if (itemYear !== parseInt(year)) {
        return;
      }

      if (period === "tháng" && month) {
        const selectedMonth = parseInt(month) - 1;
        if (itemMonth !== selectedMonth) {
          return;
        }
      }

      const category = item.facilityCategory.toString();
      const amount = item.depreciationAmount || 0;

      if (categoryTotals[category] !== undefined) {
        categoryTotals[category] += amount;
      }
    });

    return Object.entries(categoryTotals)
      .map(([category, value]) => ({
        name: facilityCategories[category],
        value: value,
      }))
      .filter((entry) => entry.value > 0);
  };

  // Tạo danh sách các tháng cho Area Chart
  const initializeAreaData = () => {
    if (period === "năm") {
      return Array.from({ length: 12 }, (_, i) => {
        const monthData = { name: `Tháng ${i + 1}`, total: 0 };
        Object.keys(facilityCategories).forEach((category) => {
          monthData[facilityCategories[category]] = 0;
        });
        return monthData;
      });
    }
    return [];
  };

  // Xử lý dữ liệu cho Area Chart
  const processAreaData = () => {
    const data = initializeAreaData();

    if (!depreciations || depreciations.length === 0 || period !== "năm") {
      return data;
    }

    depreciations.forEach((item) => {
      if (!item || !item.sumDate || item.facilityCategory === undefined) {
        return;
      }

      const date = new Date(item.sumDate);
      if (isNaN(date.getTime())) {
        return;
      }

      const itemYear = date.getFullYear();
      const itemMonth = date.getMonth();

      if (itemYear !== parseInt(year)) {
        return;
      }

      const index = itemMonth;
      const category = facilityCategories[item.facilityCategory];
      const amount = item.depreciationAmount || 0;

      if (data[index] && data[index][category] !== undefined) {
        data[index][category] += amount;
        data[index].total += amount;
      }
    });

    return data;
  };

  // Tính toán Y-axis dựa trên giá trị total
  const calculateYAxisProps = (data) => {
    const maxValue = Math.max(
      ...data.map((item) => item.total || 0),
      10
    );
    const roundedMax = Math.ceil(maxValue / 100) * 100;
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

  // Custom Tooltip cho Area Chart
  const CustomTooltip = ({ active, payload, label }) => {
    CustomTooltip.propTypes = {
      active: PropTypes.bool,
      payload: PropTypes.array,
      label: PropTypes.string,
    };
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className={`p-4 rounded-lg shadow-lg border ${theme === "dark"
              ? "bg-gray-800 text-white border-gray-700"
              : "bg-white text-gray-900 border-gray-200"
            }`}
        >
          <p className="font-semibold mb-2">{label}</p>
          <p className="text-sm">
            Ghế: {data["Ghế"].toLocaleString()} DXL
          </p>
          <p className="text-sm">
            Bàn: {data["Bàn"].toLocaleString()} DXL
          </p>
          <p className="text-sm font-medium mt-2">
            Tổng: {data.total.toLocaleString()} DXL
          </p>
        </div>
      );
    }
    return null;
  };

  const pieData = calculatePieData();
  const areaData = processAreaData();
  const { minY, maxY, ticks } = calculateYAxisProps(areaData);

  return (
    <div
      className={`card col-span-1 md:col-span-2 lg:col-span-4 rounded-xl shadow-lg transition-all duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
    >
      {/* Card Header */}
      <div className="card-header border-b border-gray-200 dark:border-gray-700">
        <p
          className={`card-title text-2xl font-semibold p-6 ${theme === "dark" ? "text-white" : "text-gray-900"
            }`}
        >
          Thống kê khấu hao
        </p>
      </div>

      {/* Chart Container */}
      <div className="card-body p-6 flex flex-col gap-8">
        {/* Pie Chart */}
        <div className="flex flex-col items-center animate-fade-in">
          <h3
            className={`text-xl font-medium mb-4 ${theme === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
          >
            Phân bổ khấu hao theo hạng mục -{" "}
            {period === "năm" ? `Năm ${year}` : `Tháng ${month}/${year}`}
          </h3>
          {pieData.every((item) => item.value === 0) ? (
            <p className={`text-center text-gray-500 dark:text-gray-400`}>
              Không có dữ liệu khấu hao
            </p>
          ) : (
            <>
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
                    label={({ name, value }) =>
                      `${name}: ${value.toLocaleString()} DXL`
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
                    formatter={(value) => `${value.toLocaleString()} DXL`}
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                      color: theme === "dark" ? "#ffffff" : "#1f2937",
                      borderRadius: "8px",
                      border: `1px solid ${theme === "dark" ? "#4b5563" : "#e5e7eb"
                        }`,
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      padding: "8px 12px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span
                        className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"
                          }`}
                      >
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        {/* Area Chart */}
        {period === "năm" && (
          <div className="flex flex-col animate-fade-in">
            <h3
              className={`text-xl font-medium mb-4 ${theme === "dark" ? "text-gray-200" : "text-gray-700"
                }`}
            >
              Biểu đồ thống kê khấu hao (theo DXL)
            </h3>
            {areaData.every((item) => item.total === 0) ? (
              <p className={`text-center text-gray-500 dark:text-gray-400`}>
                Không có dữ liệu khấu hao
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={500}>
                <AreaChart
                  data={areaData}
                  margin={{ top: 20, right: 30, left: 40, bottom: 50 }}
                >
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    cursor={{ stroke: theme === "dark" ? "#4b5563" : "#e5e7eb", strokeWidth: 1 }}
                    content={<CustomTooltip />}
                  />
                  <XAxis
                    dataKey="name"
                    strokeWidth={0}
                    stroke={theme === "light" ? "#64748b" : "#94a3b8"}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={0}
                    tick={{
                      fontSize: 14,
                      fill: theme === "dark" ? "#d1d5db" : "#6b7280",
                    }}
                  />
                  <YAxis
                    strokeWidth={0}
                    stroke={theme === "light" ? "#64748b" : "#94a3b8"}
                    tickFormatter={(value) =>
                      `${value.toLocaleString()} DXL`
                    }
                    tickMargin={20}
                    domain={[minY, maxY]}
                    ticks={ticks}
                    width={100}
                    tick={{
                      fontSize: 14,
                      fill: theme === "dark" ? "#d1d5db" : "#6b7280",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Tổng"
                    stroke="#f97316"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                    activeDot={{
                      r: 6,
                      fill: "#f97316",
                      stroke: theme === "dark" ? "#1f2937" : "#ffffff",
                    }}
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