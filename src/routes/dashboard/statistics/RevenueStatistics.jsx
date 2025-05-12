import { useTheme } from "../../../hooks/use-theme";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";

const RevenueStatistics = ({ revenueAreaData, revenueMinY, revenueMaxY, revenueYTicks, period, year, month }) => {
  const { theme } = useTheme();

  const hasRevenueData = revenueAreaData.some(
    entry => entry.studentRevenue > 0
  );

  // Check if screen is large for ReferenceLine
  const [isLargeScreen, setIsLargeScreen] = useState(typeof window !== "undefined" ? window.innerWidth > 768 : false);

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Utility to get days in month
  const getDaysInMonth = (month, year) => {
    const parsedMonth = parseInt(month);
    const parsedYear = parseInt(year);
    if (isNaN(parsedMonth) || isNaN(parsedYear)) return 0;
    return new Date(parsedYear, parsedMonth, 0).getDate();
  };

  // Dynamic X-axis interval to avoid label clutter
  const maxLabels = 10;
  const xAxisInterval = period === "tháng" && revenueAreaData.length > maxLabels ? Math.ceil(revenueAreaData.length / maxLabels) : 0;

  // Reference lines for monthly view (only on large screens)
  const daysInMonth = period === "tháng" && month && year ? getDaysInMonth(month, year) : 0;
  const referenceLines = isLargeScreen && period === "tháng" && daysInMonth > 0 ? (
    <>
      <ReferenceLine
        x="Ngày 1"
        stroke="#3b82f6"
        strokeDasharray="3 3"
        label={{ value: "Đầu tháng", position: "top", fill: theme === "dark" ? "#d1d5db" : "#6b7280" }}
      />
      <ReferenceLine
        x="Ngày 15"
        stroke="#ef4444"
        strokeDasharray="3 3"
        label={{ value: "Giữa tháng", position: "top", fill: theme === "dark" ? "#d1d5db" : "#6b7280" }}
      />
      <ReferenceLine
        x={`Ngày ${daysInMonth}`}
        stroke="#10b981"
        strokeDasharray="3 3"
        label={{ value: "Cuối tháng", position: "top", fill: theme === "dark" ? "#d1d5db" : "#6b7280" }}
      />
    </>
  ) : null;

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
          Thống kê doanh thu
        </p>
      </div>

      {/* Chart Container - Stacked Vertically */}
      <div className="card-body p-6 flex flex-col gap-8">

        {/* Area Chart for Revenue Trends */}
        <div className="flex flex-col animate-fade-in">
          <h3
            className={`text-xl font-medium mb-4 ${theme === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
          >
            Biểu đồ thống kê doanh thu
          </h3>
          {hasRevenueData ? (
            <ResponsiveContainer width="100%" height={500}>
              <AreaChart
                data={revenueAreaData}
                margin={{ top: 20, right: 30, left: 40, bottom: 50 }}
              >
                <defs>
                  <linearGradient id="colorTotalOverview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Tooltip
                  cursor={{ stroke: theme === "dark" ? "#4b5563" : "#e5e7eb", strokeWidth: 1 }}
                  formatter={(value, name) =>
                    name === "studentPercentage"
                      ? `${value}%`
                      : [`${value.toLocaleString()} DXL`, "Doanh thu"]
                  }
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
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  interval={xAxisInterval}
                  tick={{ fontSize: 14, fill: theme === "dark" ? "#d1d5db" : "#6b7280" }}
                />
                <YAxis
                  dataKey="studentRevenue"
                  strokeWidth={0}
                  stroke={theme === "light" ? "#64748b" : "#94a3b8"}
                  tickFormatter={(value) => `${value.toLocaleString()} DXL`}
                  tickMargin={20}
                  domain={[revenueMinY, revenueMaxY]}
                  ticks={revenueYTicks}
                  width={100}
                  tick={{ fontSize: 14, fill: theme === "dark" ? "#d1d5db" : "#6b7280" }}
                />
                <Area
                  type="monotone"
                  dataKey="studentRevenue"
                  stroke="#f97316"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotalOverview)"
                  activeDot={{ r: 6, fill: "#f97316", stroke: theme === "dark" ? "#1f2937" : "#ffffff" }}
                />
                {referenceLines}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className={`text-center text-gray-500 dark:text-gray-400`}>
              Không có dữ liệu doanh thu
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

RevenueStatistics.propTypes = {
  revenueAreaData: PropTypes.array.isRequired,
  revenueMinY: PropTypes.number.isRequired,
  revenueMaxY: PropTypes.number.isRequired,
  revenueYTicks: PropTypes.array.isRequired,
  participationPieData: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ).isRequired,
  period: PropTypes.oneOf(["năm", "tháng"]).isRequired,
  year: PropTypes.string.isRequired,
  month: PropTypes.string,
};

export default RevenueStatistics;