import { useTheme } from "../../../hooks/use-theme";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ReferenceLine } from "recharts";
import PropTypes from "prop-types";
import { useMemo, useState, useEffect } from "react";

const PerformanceStatistics = ({
  period,
  year,
  month,
  utilizationRates,
  utilizationRatesByYear,
  performanceData,
  performanceMinY,
  performanceMaxY,
  performanceYTicks,
}) => {
  const { theme } = useTheme();
  const COLORS = ["#3b82f6", "#ef4444"]; // Colors for pie chart

  // Check if screen is large for ReferenceLine
  const [isLargeScreen, setIsLargeScreen] = useState(typeof window !== "undefined" ? window.innerWidth > 768 : false);

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Normalize performanceData to ensure values are in percentage (e.g., 0.11 -> 11)
  const normalizedPerformanceData = useMemo(() => {
    if (!performanceData || performanceData.length === 0) return [];
    const normalized = performanceData.map((entry) => {
      const normalizedEntry = { name: entry.name };
      Object.keys(entry).forEach((key) => {
        if (key !== "name") {
          const value = entry[key];
          // Nếu giá trị nằm trong khoảng (0, 1), nhân với 100 để chuyển thành phần trăm
          normalizedEntry[key] = typeof value === "number" && value > 0 && value <= 1 ? value * 100 : value || 0;
        }
      });
      return normalizedEntry;
    });
    console.log("performanceData:", performanceData);
    console.log("normalizedPerformanceData:", normalized);
    return normalized;
  }, [performanceData]);

  // Get list of areas dynamically
  const areas = useMemo(() =>
    Array.from(
      new Set(
        normalizedPerformanceData.flatMap((entry) => Object.keys(entry).filter((key) => key !== "name"))
      )
    ),
    [normalizedPerformanceData]
  );

  // Check if data exists
  const hasPerformanceData = normalizedPerformanceData.some((entry) =>
    areas.some((area) => entry[area] > 0)
  );

  // Compute average utilization rate for pie chart
  const avgUtilizationRate = useMemo(() => {
    if (!hasPerformanceData || areas.length === 0) return 0;

    // Tính tổng tất cả các rate và đếm tổng số bản ghi
    let totalRate = 0;
    let totalEntries = 0;

    normalizedPerformanceData.forEach((entry) => {
      areas.forEach((area) => {
        const rate = entry[area] || 0;
        if (rate > 0) {
          totalRate += rate;
          totalEntries += 1;
        }
      });
    });

    const avgRate = totalEntries > 0 ? totalRate / totalEntries : 0;
    console.log("totalRate:", totalRate, "totalEntries:", totalEntries, "avgUtilizationRate:", avgRate);
    return avgRate;
  }, [hasPerformanceData, normalizedPerformanceData, areas]);

  const utilizationPieData = [
    { name: "Tỷ lệ sử dụng", value: avgUtilizationRate },
    { name: "Chưa sử dụng", value: 100 - avgUtilizationRate },
  ];

  // Utility to get days in month
  const getDaysInMonth = (month, year) => {
    const parsedMonth = parseInt(month);
    const parsedYear = parseInt(year);
    if (isNaN(parsedMonth) || isNaN(parsedYear)) return 0;
    return new Date(parsedYear, parsedMonth, 0).getDate();
  };

  // Process area data to include total (average across areas)
  const processAreaData = useMemo(() => {
    if (!hasPerformanceData || areas.length === 0) {
      if (period === "năm") {
        return Array.from({ length: 12 }, (_, i) => ({
          name: `Tháng ${i + 1}`,
          total: 0,
          ...areas.reduce((acc, area) => ({ ...acc, [area]: 0 }), {}),
        }));
      } else if (period === "tháng" && month && year) {
        const daysInMonth = getDaysInMonth(month, year);
        if (daysInMonth === 0) return [];
        return Array.from({ length: daysInMonth }, (_, i) => ({
          name: `Ngày ${i + 1}`,
          total: 0,
          ...areas.reduce((acc, area) => ({ ...acc, [area]: 0 }), {}),
        }));
      }
      return [];
    }

    if (period === "tháng" && month && year) {
      const daysInMonth = getDaysInMonth(month, year);
      if (daysInMonth === 0) return [];
      const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
        name: `Ngày ${i + 1}`,
        total: 0,
        ...areas.reduce((acc, area) => ({ ...acc, [area]: 0 }), {}),
      }));

      normalizedPerformanceData.forEach((entry) => {
        const day = parseInt(entry.name, 10) - 1;
        if (day >= 0 && day < daysInMonth) {
          const areaValues = areas.reduce((sum, area) => sum + (entry[area] || 0), 0);
          const total = areas.length > 0 ? areaValues / areas.length : 0;
          dailyData[day] = {
            name: `Ngày ${day + 1}`,
            total: total || 0,
            ...areas.reduce((acc, area) => ({ ...acc, [area]: entry[area] || 0 }), {}),
          };
        }
      });

      return dailyData;
    }

    return normalizedPerformanceData.map((entry) => {
      const areaValues = areas.reduce((sum, area) => sum + (entry[area] || 0), 0);
      const total = areas.length > 0 ? areaValues / areas.length : 0;
      return {
        name: entry.name,
        total: total || 0,
        ...areas.reduce((acc, area) => ({ ...acc, [area]: entry[area] || 0 }), {}),
      };
    });
  }, [hasPerformanceData, period, month, year, normalizedPerformanceData, areas]);

  // Use props for Y-axis
  const minY = performanceMinY;
  const maxY = performanceMaxY;
  const ticks = performanceYTicks;

  // Custom Tooltip for Area Chart
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
          className={`p-4 rounded-lg shadow-lg border ${
            theme === "dark"
              ? "bg-gray-800 text-white border-gray-700"
              : "bg-white text-gray-900 border-gray-200"
          }`}
        >
          <p className="font-semibold mb-2">{label}</p>
          {areas.map((area) => (
            <p key={area} className="text-sm">
              {area}: {(data[area] || 0).toFixed(2)}%
            </p>
          ))}
          <p className="text-sm font-medium mt-2">
            Hiệu suất trung bình: {(data.total || 0).toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const areaData = processAreaData;

  // Dynamic X-axis interval to avoid label clutter
  const maxLabels = 10;
  const xAxisInterval = period === "tháng" && areaData.length > maxLabels ? Math.ceil(areaData.length / maxLabels) : 0;

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
          Thống kê hiệu suất
        </p>
      </div>

      {/* Card Body */}
      <div className="card-body p-6 flex flex-col gap-8">
        {/* Pie Chart */}
        <div className="flex flex-col items-center animate-fade-in">
          <h3
            className={`text-xl font-medium mb-4 ${
              theme === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Tỷ lệ sử dụng trung bình -{" "}
            {period === "năm" ? `Năm ${year}` : `Tháng ${month}/${year}`}
          </h3>
          {utilizationPieData.every((item) => item.value === 0) ? (
            <p className={`text-center text-gray-500 dark:text-gray-400`}>
              Không có dữ liệu hiệu suất cho {period === "năm" ? `năm ${year}` : `tháng ${month}/${year}`}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={utilizationPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                >
                  {utilizationPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip
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

        {/* Area Chart */}
        <div className="flex flex-col animate-fade-in">
          <h3
            className={`text-xl font-medium mb-4 ${
              theme === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Biểu đồ thống kê hiệu suất (theo %)
          </h3>
          {areaData.length === 0 || areaData.every((item) => item.total === 0) ? (
            <p className={`text-center text-gray-500 dark:text-gray-400`}>
              Không có dữ liệu hiệu suất cho {period === "năm" ? `năm ${year}` : `tháng ${month}/${year}`}
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
                  interval={xAxisInterval}
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
                  dataKey="total"
                  name="Tổng"
                  stroke="#f97316"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  activeDot={false}
                />
                {referenceLines}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

PerformanceStatistics.propTypes = {
  period: PropTypes.oneOf(["năm", "tháng"]).isRequired,
  year: PropTypes.string.isRequired,
  month: PropTypes.string,
  utilizationRates: PropTypes.arrayOf(
    PropTypes.shape({
      theDate: PropTypes.string,
      roomId: PropTypes.number,
      roomName: PropTypes.string,
      areaId: PropTypes.number,
      areaName: PropTypes.string,
      areaTypeId: PropTypes.number,
      areaTypeName: PropTypes.string,
      areaTypeCategoryId: PropTypes.number,
      areaTypeCategoryTitle: PropTypes.string,
      rate: PropTypes.number,
    })
  ).isRequired,
  utilizationRatesByYear: PropTypes.arrayOf(
    PropTypes.shape({
      theDate: PropTypes.string,
      roomId: PropTypes.number,
      roomName: PropTypes.string,
      areaId: PropTypes.number,
      areaName: PropTypes.string,
      areaTypeId: PropTypes.number,
      areaTypeName: PropTypes.string,
      areaTypeCategoryId: PropTypes.number,
      areaTypeCategoryTitle: PropTypes.string,
      rate: PropTypes.number,
    })
  ).isRequired,
  performanceData: PropTypes.array.isRequired,
  performanceMinY: PropTypes.number.isRequired,
  performanceMaxY: PropTypes.number.isRequired,
  performanceYTicks: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default PerformanceStatistics;