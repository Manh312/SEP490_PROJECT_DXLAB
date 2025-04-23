import { useTheme } from "../../../hooks/use-theme";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ReferenceLine } from "recharts";
import PropTypes from "prop-types";
import { useMemo, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUtilizationRateByDate, fetchUtilizationRateByYear, fetchUtilizationRateByYearAndMonth } from "../../../redux/slices/Statistics";
import { fetchRooms } from "../../../redux/slices/Room";
import { toast } from "react-toastify";

const PerformanceStatistics = ({
  period,
  year,
  month,
  performanceMinY,
  performanceMaxY,
  performanceYTicks,
  onRoomSelect,
}) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { rooms } = useSelector((state) => state.rooms);
  const { utilizationRates, utilizationRatesByYear, utilizationRatesByDate, loading: isLoading } = useSelector((state) => state.statistics);
  const COLORS = ["#3b82f6", "#ef4444"];

  const [isLargeScreen, setIsLargeScreen] = useState(typeof window !== "undefined" ? window.innerWidth > 768 : false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [isDateSearchPerformed, setIsDateSearchPerformed] = useState(false);
  const [isRoomSearchPerformed, setIsRoomSearchPerformed] = useState(false);
  const [selectedRoomNameForDisplay, setSelectedRoomNameForDisplay] = useState("");
  const selectedRoomRef = useRef("");

  // Utility to get days in month
  const getDaysInMonth = (month, year) => {
    const parsedMonth = parseInt(month);
    const parsedYear = parseInt(year);
    if (isNaN(parsedMonth) || isNaN(parsedYear)) return 0;
    return new Date(parsedYear, parsedMonth, 0).getDate();
  };

  // Get selected room name
  const selectedRoomName = useMemo(() => {
    if (!selectedRoom) return "";
    const room = rooms.find((room) => room.roomId === parseInt(selectedRoom));
    const roomName = room ? room.roomName : "";
    console.log("Selected Room Name:", roomName, "Selected Room ID:", selectedRoom);
    return roomName;
  }, [selectedRoom, rooms]);

  // Define transformedDateData before xAxisInterval
  const transformedDateData = useMemo(() => {
    if (!utilizationRatesByDate || utilizationRatesByDate.length === 0) return [];
    return utilizationRatesByDate.map((entry) => ({
      name: entry.roomName,
      rate: (entry.rate || 0) * 100,
    }));
  }, [utilizationRatesByDate]);

  // Dynamic X-axis interval to avoid label clutter
  const maxLabels = 10;
  const daysInMonth = period === "tháng" && month && year ? getDaysInMonth(month, year) : 0;
  const xAxisInterval = useMemo(() => {
    if (isDateSearchPerformed && selectedDate) {
      const roomCount = transformedDateData.length;
      return roomCount > maxLabels ? Math.ceil(roomCount / maxLabels) : 0;
    }
    return period === "tháng" && !isDateSearchPerformed && daysInMonth > maxLabels
      ? Math.ceil(daysInMonth / maxLabels)
      : 0;
  }, [period, isDateSearchPerformed, selectedDate, daysInMonth, transformedDateData]);

  useEffect(() => {
    dispatch(fetchRooms());
    console.log("Rooms Data:", rooms);
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Debug component render and props changes
  useEffect(() => {
    console.log("Component Rendered - isRoomSearchPerformed:", isRoomSearchPerformed, "selectedRoom:", selectedRoom, "selectedRoomNameForDisplay:", selectedRoomNameForDisplay);
    console.log("Props - period:", period, "year:", year, "month:", month);
  }, [period, year, month, isRoomSearchPerformed, selectedRoom, selectedRoomNameForDisplay]);

  const handleSearch = async () => {
    if (!selectedDate && !selectedRoom) {
      toast.error("Vui lòng chọn phòng hoặc ngày để tìm kiếm!");
      return;
    }

    try {
      console.log("Handle Search - Selected Room:", selectedRoom, "Selected Date:", selectedDate);
      if (selectedDate) {
        const response = await dispatch(fetchUtilizationRateByDate({ dateTime: selectedDate, paraFilter: 1 }));
        const data = response.payload?.data || [];
        if (data.length > 0) {
          setIsDateSearchPerformed(true);
          setIsRoomSearchPerformed(false);
          setSelectedRoomNameForDisplay("");
          setSelectedRoom("");
          selectedRoomRef.current = "";
          const avgRate = data.length > 0
            ? data.reduce((sum, entry) => sum + (entry.rate || 0) * 100, 0) / data.length
            : 0;
          onRoomSelect(avgRate);
        } else {
          setIsDateSearchPerformed(true);
          setIsRoomSearchPerformed(false);
          setSelectedRoomNameForDisplay("");
          setSelectedRoom("");
          selectedRoomRef.current = "";
          toast.error(`Không có dữ liệu hiệu suất cho ngày ${selectedDate}!`);
          onRoomSelect(0);
        }
      } else if (selectedRoom) {
        selectedRoomRef.current = selectedRoom;
        let response;
        if (period === "năm") {
          response = await dispatch(fetchUtilizationRateByYear({ roomId: parseInt(selectedRoom), year }));
        } else if (period === "tháng" && month) {
          response = await dispatch(fetchUtilizationRateByYearAndMonth({ roomId: parseInt(selectedRoom), year, month }));
        } else {
          toast.error("Vui lòng chọn tháng khi tìm kiếm theo tháng!");
          return;
        }

        const data = response.payload?.data || [];
        console.log("Room Search Response Data:", data);
        if (data.length > 0) {
          setIsDateSearchPerformed(false);
          setIsRoomSearchPerformed(true);
          setSelectedRoomNameForDisplay(selectedRoomName);
          console.log("After Room Search - isRoomSearchPerformed:", true, "selectedRoomNameForDisplay:", selectedRoomName);
          const avgRate = data.length > 0
            ? data.reduce((sum, entry) => sum + (entry.rate || 0) * 100, 0) / data.length
            : 0;
          onRoomSelect(avgRate);
        } else {
          setIsDateSearchPerformed(false);
          setIsRoomSearchPerformed(true);
          setSelectedRoomNameForDisplay(selectedRoomName);
          console.log("After Room Search (No Data) - isRoomSearchPerformed:", true, "selectedRoomNameForDisplay:", selectedRoomName);
          toast.error(`Không có dữ liệu hiệu suất cho phòng ${selectedRoomName || "đã chọn"}!`);
          onRoomSelect(0);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu hiệu suất:", error);
      onRoomSelect(0);
      toast.error("Lỗi khi tải dữ liệu hiệu suất!");
    }
  };

  const processedRoomData = useMemo(() => {
    const dataSource = period === "năm" ? utilizationRatesByYear : utilizationRates;

    if (!dataSource || dataSource.length === 0) {
      if (period === "năm") {
        return Array.from({ length: 12 }, (_, i) => ({
          name: `Tháng ${i + 1}`,
          rate: 0,
        }));
      } else if (period === "tháng" && month && year) {
        const daysInMonth = getDaysInMonth(parseInt(month), parseInt(year));
        if (daysInMonth === 0) return [];
        return Array.from({ length: daysInMonth }, (_, i) => ({
          name: `Ngày ${i + 1}`,
          rate: 0,
        }));
      }
      return [];
    }

    return period === "năm"
      ? Array.from({ length: 12 }, (_, i) => ({
          name: `Tháng ${i + 1}`,
          rate: 0,
        })).map((monthEntry, i) => {
          const entries = dataSource.filter((entry) => {
            if (!entry || !entry.dateTH) return false;
            const date = new Date(entry.dateTH);
            const isValidDate = !isNaN(date.getTime());
            const monthMatch = isValidDate && date.getMonth() === i;
            return monthMatch;
          });
          const totalRate = entries.reduce((sum, entry) => sum + (entry.rate || 0) * 100, 0);
          const count = entries.length;
          const avgRate = count > 0 ? Math.round((totalRate / count) * 100) / 100 : 0;
          return {
            name: monthEntry.name,
            rate: avgRate,
          };
        })
      : Array.from({ length: getDaysInMonth(parseInt(month), parseInt(year)) }, (_, i) => ({
          name: `Ngày ${i + 1}`,
          rate: 0,
        })).map((dayEntry, i) => {
          const entries = dataSource.filter((entry) => {
            if (!entry || !entry.dateTH) return false;
            const date = new Date(entry.dateTH);
            const isValidDate = !isNaN(date.getTime());
            const dayMatch = isValidDate && date.getDate() === (i + 1);
            return dayMatch;
          });
          const totalRate = entries.reduce((sum, entry) => sum + (entry.rate || 0) * 100, 0);
          const count = entries.length;
          const avgRate = count > 0 ? Math.round((totalRate / count) * 100) / 100 : 0;
          return {
            name: dayEntry.name,
            rate: avgRate,
          };
        });
  }, [utilizationRates, utilizationRatesByYear, period, month, year]);

  const hasPerformanceData = processedRoomData.length > 0 && processedRoomData.some((entry) => entry.rate > 0);
  const hasDateData = transformedDateData.length > 0 && transformedDateData.some((entry) => entry.rate > 0);

  const avgUtilizationRate = useMemo(() => {
    if (!hasPerformanceData) return 0;
    const totalRate = processedRoomData.reduce((sum, entry) => sum + (entry.rate || 0), 0);
    return processedRoomData.length > 0 ? totalRate / processedRoomData.length : 0;
  }, [hasPerformanceData, processedRoomData]);

  const avgUtilizationRateByDate = useMemo(() => {
    if (!hasDateData) return 0;
    const totalRate = transformedDateData.reduce((sum, entry) => sum + (entry.rate || 0), 0);
    return transformedDateData.length > 0 ? totalRate / transformedDateData.length : 0;
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

  const processDateData = useMemo(() => {
    if (!hasDateData) return [];
    return transformedDateData.map((entry) => ({
      name: entry.name,
      rate: entry.rate || 0,
    }));
  }, [hasDateData, transformedDateData]);

  const minY = performanceMinY;
  const maxY = performanceMaxY;
  const ticks = performanceYTicks;

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
          <p className="text-sm">
            Hiệu suất sử dụng: {(data.rate || 0).toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const referenceLines = isLargeScreen && period === "tháng" && !isDateSearchPerformed && daysInMonth > 0 ? (
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

  const areaData = isDateSearchPerformed && selectedDate ? processDateData : processedRoomData;

  // Debug log for title rendering
  console.log("Rendering Title - isRoomSearchPerformed:", isRoomSearchPerformed, "selectedRoom:", selectedRoom, "selectedRoomName:", selectedRoomName, "selectedRoomNameForDisplay:", selectedRoomNameForDisplay);

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
              disabled={isDateSearchPerformed && selectedDate}
            >
              <option value="">Chọn phòng</option>
              {rooms.map((room) => (
                <option key={room.roomId} value={room.roomId}>
                  {room.roomName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              disabled={isLoading}
            >
              {isLoading ? "Đang tải..." : "Tìm kiếm"}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center animate-fade-in">
          <h3
            className={`text-xl font-medium mb-4 ${
              theme === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Hiệu suất sử dụng trung bình -{" "}
            {isDateSearchPerformed && selectedDate
              ? `Ngày ${selectedDate}`
              : isRoomSearchPerformed && selectedRoomNameForDisplay
              ? `Phòng ${selectedRoomNameForDisplay} - ${period === "năm" ? `Năm ${year}` : `Tháng ${month}/${year}`}`
              : period === "năm"
              ? `Năm ${year}`
              : `Tháng ${month}/${year}`}
          </h3>
          {utilizationPieData.every((item) => item.value === 0) ? (
            <p className={`text-center text-gray-500 dark:text-gray-400`}>
              Không có dữ liệu hiệu suất cho{" "}
              {isDateSearchPerformed && selectedDate
                ? `ngày ${selectedDate}`
                : isRoomSearchPerformed && selectedRoomNameForDisplay
                ? `phòng ${selectedRoomNameForDisplay}`
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

        <div className="flex flex-col animate-fade-in">
          <h3
            className={`text-xl font-medium mb-4 ${
              theme === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Biểu đồ thống kê hiệu suất (theo %) -{" "}
            {isDateSearchPerformed && selectedDate
              ? `Ngày ${selectedDate}`
              : isRoomSearchPerformed && selectedRoomNameForDisplay
              ? `Phòng ${selectedRoomNameForDisplay} - ${period === "năm" ? `Năm ${year}` : `Tháng ${month}/${year}`}`
              : period === "năm"
              ? `Năm ${year}`
              : `Tháng ${month}/${year}`}
          </h3>
          {isLoading ? (
            <p className={`text-center text-gray-500 dark:text-gray-400`}>Đang tải dữ liệu...</p>
          ) : (!hasPerformanceData && !hasDateData) ? (
            <p className={`text-center text-gray-500 dark:text-gray-400`}>
              Không có dữ liệu hiệu suất cho{" "}
              {isDateSearchPerformed && selectedDate
                ? `ngày ${selectedDate}`
                : isRoomSearchPerformed && selectedRoomNameForDisplay
                ? `phòng ${selectedRoomNameForDisplay}`
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
                  angle={period === "năm" || (period === "tháng" && !isDateSearchPerformed) ? -45 : 0}
                  textAnchor={period === "năm" || (period === "tháng" && !isDateSearchPerformed) ? "end" : "middle"}
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
                  dataKey="rate"
                  name="Tỷ lệ sử dụng"
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
  performanceMinY: PropTypes.number.isRequired,
  performanceMaxY: PropTypes.number.isRequired,
  performanceYTicks: PropTypes.arrayOf(PropTypes.number).isRequired,
  onRoomSelect: PropTypes.func,
};

export default PerformanceStatistics;