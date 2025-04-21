import { useTheme } from "../../../hooks/use-theme";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ReferenceLine } from "recharts";
import PropTypes from "prop-types";
import { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUtilizationRateByDate } from "../../../redux/slices/Statistics"; // Thêm fetchRooms
import { fetchRooms } from "../../../redux/slices/Room";

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
  const dispatch = useDispatch();
  const { rooms } = useSelector((state) => state.rooms); // Lấy danh sách phòng từ Redux
  const COLORS = ["#3b82f6", "#ef4444"];

  const [isLargeScreen, setIsLargeScreen] = useState(typeof window !== "undefined" ? window.innerWidth > 768 : false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("all");
  const [dateData, setDateData] = useState([]);
  const [isDateSearchPerformed, setIsDateSearchPerformed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch rooms khi component mount
  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle search button click
  const handleDateSearch = () => {
    if (!selectedDate) {
      setIsDateSearchPerformed(false);
      setDateData([]);
      setSelectedRoom("all");
      return;
    }

    setIsLoading(true);
    dispatch(fetchUtilizationRateByDate({ dateTime: selectedDate, paraFilter: 1 }))
      .then((response) => {
        if (response.payload && response.payload.data) {
          setDateData(response.payload.data);
          setIsDateSearchPerformed(true);
        } else {
          setDateData([]);
          setIsDateSearchPerformed(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching date data:", error);
        setDateData([]);
        setIsDateSearchPerformed(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Transform performanceData for year/month with room filter
  const transformedPerformanceData = useMemo(() => {
    if (!performanceData || performanceData.length === 0) return [];

    let filteredData = performanceData;
    if (selectedRoom !== "all") {
      filteredData = filteredData.map((entry) => {
        const filteredAreas = entry.areas.filter((area) =>
          utilizationRates.find(
            (rate) => rate.areaName === area.areaName && rate.roomId === parseInt(selectedRoom)
          )
        );
        return { ...entry, areas: filteredAreas };
      });
    }

    return filteredData.map((entry) => {
      const areas = Object.keys(entry)
        .filter((key) => key !== "name")
        .map((key) => ({
          areaName: key.replace(/Khuvực/g, "Khu vực "),
          rate: typeof entry[key] === "number" && entry[key] > 0 && entry[key] <= 1 ? entry[key] * 100 : entry[key] || 0,
        }));
      return {
        name: entry.name,
        areas,
      };
    });
  }, [performanceData, selectedRoom, utilizationRates]);

  // Transform dateData for specific date
  const transformedDateData = useMemo(() => {
    if (!dateData || dateData.length === 0) return [];

    let filteredData = dateData;
    if (selectedRoom !== "all") {
      filteredData = filteredData.filter((entry) => entry.roomId === parseInt(selectedRoom));
    }

    return filteredData.map((entry) => ({
      name: entry.roomName,
      rate: (entry.rate || 0) * 100,
    }));
  }, [dateData, selectedRoom]);

  // Get list of areas dynamically
  const areas = useMemo(() =>
    Array.from(
      new Set(
        transformedPerformanceData.flatMap((entry) =>
          entry.areas.map((area) => area.areaName)
        )
      )
    ),
    [transformedPerformanceData]
  );

  // Check if data exists
  const hasPerformanceData = transformedPerformanceData.some((entry) =>
    entry.areas.some((area) => area.rate > 0)
  );

  const hasDateData = transformedDateData.length > 0;

  // Compute average utilization rate for pie chart
  const avgUtilizationRate = useMemo(() => {
    if (!hasPerformanceData || areas.length === 0) return 0;

    let totalRate = 0;
    let totalEntries = 0;

    transformedPerformanceData.forEach((entry) => {
      entry.areas.forEach((area) => {
        const rate = area.rate || 0;
        if (rate > 0) {
          totalRate += rate;
          totalEntries += 1;
        }
      });
    });

    const avgRate = totalEntries > 0 ? totalRate / totalEntries : 0;
    return avgRate;
  }, [hasPerformanceData, transformedPerformanceData, areas]);

  const avgUtilizationRateByDate = useMemo(() => {
    if (!hasDateData) return 0;

    const totalRate = transformedDateData.reduce((sum, entry) => sum + (entry.rate || 0), 0);
    const avgRate = transformedDateData.length > 0 ? totalRate / transformedDateData.length : 0;
    return avgRate;
  }, [hasDateData, transformedDateData]);

  const utilizationPieData = isDateSearchPerformed && selectedDate
    ? [
        { name: "Tỷ lệ sử dụng", value: avgUtilizationRateByDate },
        { name: "Chưa sử dụng", value: 100 - avgUtilizationRateByDate },
      ]
    : [
        { name: "Tỷ lệ sử dụng", value: avgUtilizationRate },
        { name: "Chưa sử dụng", value: 100 - avgUtilizationRate },
      ];

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

      transformedPerformanceData.forEach((entry) => {
        const day = parseInt(entry.name, 10) - 1;
        if (day >= 0 && day < daysInMonth) {
          const areaValues = entry.areas.reduce((sum, area) => sum + (area.rate || 0), 0);
          const total = entry.areas.length > 0 ? areaValues / entry.areas.length : 0;
          dailyData[day] = {
            name: `Ngày ${day + 1}`,
            total: total || 0,
            ...entry.areas.reduce((acc, area) => ({ ...acc, [area.areaName]: area.rate || 0 }), {}),
          };
        }
      });

      return dailyData;
    }

    return transformedPerformanceData.map((entry) => {
      const areaValues = entry.areas.reduce((sum, area) => sum + (area.rate || 0), 0);
      const total = entry.areas.length > 0 ? areaValues / entry.areas.length : 0;
      return {
        name: entry.name,
        total: total || 0,
        ...entry.areas.reduce((acc, area) => ({ ...acc, [area.areaName]: area.rate || 0 }), {}),
      };
    });
  }, [hasPerformanceData, period, month, year, transformedPerformanceData, areas]);

  // Process data for specific date
  const processDateData = useMemo(() => {
    if (!hasDateData) return [];

    return transformedDateData.map((entry) => ({
      name: entry.name,
      total: entry.rate || 0,
    }));
  }, [hasDateData, transformedDateData]);

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
          {isDateSearchPerformed && selectedDate ? (
            <p className="text-sm">
              Tỷ lệ sử dụng: {(data.total || 0).toFixed(2)}%
            </p>
          ) : (
            <>
              {areas.map((area, id) => (
                <p key={id} className="text-sm">
                  {area}: {(data[area] || 0).toFixed(2)}%
                </p>
              ))}
              <p className="text-sm font-medium mt-2">
                Hiệu suất trung bình: {(data.total || 0).toFixed(2)}%
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  const areaData = isDateSearchPerformed && selectedDate ? processDateData : processAreaData;

  const maxLabels = 10;
  const xAxisInterval =
    period === "tháng" && !(isDateSearchPerformed && selectedDate) && areaData.length > maxLabels
      ? Math.ceil(areaData.length / maxLabels)
      : 0;

  const daysInMonth = period === "tháng" && month && year ? getDaysInMonth(month, year) : 0;
  const referenceLines = isLargeScreen && period === "tháng" && !(isDateSearchPerformed && selectedDate) && daysInMonth > 0 ? (
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
      <div className="card-header border-b border-gray-200 dark:border-gray-700">
        <p
          className={`card-title text-2xl font-semibold p-6 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Thống kê hiệu suất
        </p>
      </div>

      <div className="card-body p-6 flex flex-col gap-8">
        {/* Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label
              className={`block text-sm font-medium mb-2 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Chọn ngày
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                if (!e.target.value) {
                  setIsDateSearchPerformed(false);
                  setDateData([]);
                  setSelectedRoom("all");
                }
              }}
              className={`w-full p-2 rounded-lg border ${
                theme === "dark"
                  ? "bg-gray-800 text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div className="flex-1">
            <label
              className={`block text-sm font-medium mb-2 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Chọn phòng
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className={`w-full p-2 rounded-lg border ${
                theme === "dark"
                  ? "bg-gray-800 text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="all">Tất cả phòng</option>
              {rooms.map((room) => (
                <option key={room.roomId} value={room.roomId}>
                  {room.roomName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleDateSearch}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg науки:bg-orange-600 transition"
              disabled={isLoading}
            >
              {isLoading ? "Đang tải..." : "Tìm kiếm"}
            </button>
          </div>
        </div>

        {/* Pie Chart Section */}
        <div className="flex flex-col items-center animate-fade-in">
          <h3
            className={`text-xl font-medium mb-4 ${
              theme === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Tỷ lệ sử dụng trung bình -{" "}
            {isDateSearchPerformed && selectedDate
              ? `Ngày ${selectedDate}`
              : period === "năm"
              ? `Năm ${year}`
              : `Tháng ${month}/${year}`}
          </h3>
          {utilizationPieData.every((item) => item.value === 0) ? (
            <p className={`text-center text-gray-500 dark:text-gray-400`}>
              Không có dữ liệu hiệu suất cho{" "}
              {isDateSearchPerformed && selectedDate
                ? `ngày ${selectedDate}`
                : period === "năm"
                ? `năm ${year}`
                : `tháng ${month}/${year}`}
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

        {/* Area Chart Section */}
        <div className="flex flex-col animate-fade-in">
          <h3
            className={`text-xl font-medium mb-4 ${
              theme === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Biểu đồ thống kê hiệu suất (theo %)
          </h3>
          {isLoading ? (
            <p className={`text-center text-gray-500 dark:text-gray-400`}>Đang tải dữ liệu...</p>
          ) : areaData.length === 0 || areaData.every((item) => item.total === 0) ? (
            <p className={`text-center text-gray-500 dark:text-gray-400`}>
              Không có dữ liệu hiệu suất cho{" "}
              {isDateSearchPerformed && selectedDate
                ? `ngày ${selectedDate}`
                : period === "năm"
                ? `năm ${year}`
                : `tháng ${month}/${year}`}
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