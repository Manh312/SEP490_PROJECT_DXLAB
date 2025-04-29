import { useTheme } from "../../../hooks/use-theme";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ReferenceLine,
} from "recharts";
import PropTypes from "prop-types";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRooms } from "../../../redux/slices/Room";
import axios from "../../../utils/axios";
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
  const { rooms, loading: roomsLoading } = useSelector((state) => state.rooms);
  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f97316", "#8b5cf6", "#ec4899", "#eab308"];

  const [isLargeScreen, setIsLargeScreen] = useState(typeof window !== "undefined" ? window.innerWidth > 768 : false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [isDateSearchPerformed, setIsDateSearchPerformed] = useState(false);
  const [isRoomSearchPerformed, setIsRoomSearchPerformed] = useState(false);
  const [filteredRoomData, setFilteredRoomData] = useState([]);
  const [roomNameFromApi, setRoomNameFromApi] = useState("");
  const [showRoomFilter, setShowRoomFilter] = useState(false);
  const [utilizationRates, setUtilizationRates] = useState([]);
  const [utilizationRatesByYear, setUtilizationRatesByYear] = useState([]);
  const [utilizationRatesByDate, setUtilizationRatesByDate] = useState([]);
  const [loading, setLoading] = useState(false);

  // Utility to get days in month
  const getDaysInMonth = useCallback((month, year) => {
    const parsedMonth = parseInt(month);
    const parsedYear = parseInt(year);
    if (isNaN(parsedMonth) || isNaN(parsedYear)) return 0;
    return new Date(parsedYear, parsedMonth, 0).getDate();
  }, []);

  // Get selected room name
  const selectedRoomName = useMemo(() => {
    if (!selectedRoom) return "";
    const room = rooms.find((room) => room.roomId === parseInt(selectedRoom));
    return room ? room.roomName : "";
  }, [selectedRoom, rooms]);

  // Define transformedDateData for date search
  const transformedDateData = useMemo(() => {
    if (!utilizationRatesByDate || !Array.isArray(utilizationRatesByDate) || utilizationRatesByDate.length === 0) {
      return [];
    }
    return utilizationRatesByDate.map((entry) => ({
      name: entry.roomName || "Unknown Room",
      rate: (entry.rate || 0) * 100,
    }));
  }, [utilizationRatesByDate]);

  // Dynamic X-axis interval for date search
  const maxLabels = 10;
  const xAxisInterval = useMemo(() => {
    if (isDateSearchPerformed && selectedDate) {
      const roomCount = transformedDateData.length;
      return roomCount > maxLabels ? Math.ceil(roomCount / maxLabels) : 0;
    }
    const daysInMonth = period === "tháng" && month && year ? getDaysInMonth(month, year) : 0;
    return period === "tháng" && !isDateSearchPerformed && daysInMonth > maxLabels
      ? Math.ceil(daysInMonth / maxLabels)
      : 0;
  }, [period, isDateSearchPerformed, selectedDate, transformedDateData, month, year, getDaysInMonth]);

  // Fetch rooms
  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset states when period, year, or month changes
  useEffect(() => {
    setSelectedRoom("");
    setSelectedDate("");
    setIsDateSearchPerformed(false);
    setIsRoomSearchPerformed(false);
    setFilteredRoomData([]);
    setRoomNameFromApi("");
    setShowRoomFilter(false);
    setUtilizationRates([]);
    setUtilizationRatesByYear([]);
    setUtilizationRatesByDate([]);
  }, [period, year, month]);

  // Update roomNameFromApi and reset date-related states when selecting a room
  useEffect(() => {
    if (selectedRoom && showRoomFilter) {
      if (filteredRoomData && filteredRoomData.length > 0) {
        setIsRoomSearchPerformed(true);
        setIsDateSearchPerformed(false);
        const roomName = filteredRoomData[0]?.roomName || selectedRoomName;
        setRoomNameFromApi(roomName);
      } else {
        setIsRoomSearchPerformed(true);
        setIsDateSearchPerformed(false);
        setRoomNameFromApi(selectedRoomName);
      }
      // Clear date-related data
      setSelectedDate("");
      setUtilizationRatesByDate([]);
    } else if (selectedRoomName && !isRoomSearchPerformed && !isDateSearchPerformed && showRoomFilter) {
      setRoomNameFromApi(selectedRoomName);
    }
  }, [filteredRoomData, selectedRoom, selectedRoomName, showRoomFilter, isRoomSearchPerformed, isDateSearchPerformed]);

  // API calls
  const fetchUtilizationRateByDate = useCallback(async (dateTime, paraFilter) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateTime)) {
      throw new Error("dateTime phải có định dạng YYYY-MM-DD hợp lệ");
    }
    const paraFilterInt = parseInt(paraFilter, 10);
    if (isNaN(paraFilterInt)) {
      throw new Error("paraFilter phải là số nguyên hợp lệ");
    }
    const queryParams = new URLSearchParams({ dateTime, paraFilter: paraFilterInt });
    const response = await axios.get(`/ultilizationrate/date?${queryParams.toString()}`);
    const data = response.data?.data || [];
    if (!Array.isArray(data)) {
      throw new Error("Dữ liệu tỷ lệ sử dụng theo ngày không hợp lệ");
    }
    return data.map((item) => ({
      dateTH: item.dateTH || "",
      roomId: typeof item.roomId === "number" ? item.roomId : parseInt(item.roomId) || 0,
      roomName: item.roomName || "",
      rate: typeof item.rate === "number" ? item.rate : parseFloat(item.rate) || 0,
    }));
  }, []);

  const fetchUtilizationRateByYearAndMonth = useCallback(async (roomId, year, month) => {
    const yearInt = parseInt(year, 10);
    const monthInt = month ? parseInt(month, 10) : null;
    const roomInt = roomId ? parseInt(roomId, 10) : null;
    if (isNaN(yearInt) || (month && isNaN(monthInt))) {
      throw new Error("Year và Month phải là số nguyên hợp lệ");
    }
    const queryParams = new URLSearchParams({ year: yearInt });
    if (monthInt) queryParams.append("month", monthInt);
    if (roomInt) queryParams.append("roomId", roomInt);
    const response = await axios.get(`/ultilizationrate/month?${queryParams.toString()}`);
    const data = response.data?.data || [];
    if (!Array.isArray(data)) {
      throw new Error("Dữ liệu tỷ lệ sử dụng không hợp lệ");
    }
    return data.map((item) => ({
      roomId: typeof item.roomId === "number" ? item.roomId : parseInt(item.roomId) || 0,
      roomName: item.roomName || "",
      rate: typeof item.rate === "number" ? item.rate : parseFloat(item.rate) || 0,
      dateTH: item.dateTH || "",
    }));
  }, []);

  const fetchUtilizationRateByYear = useCallback(async (roomId, year) => {
    const yearInt = parseInt(year, 10);
    const roomInt = roomId ? parseInt(roomId, 10) : null;
    if (isNaN(yearInt)) {
      throw new Error("Year phải là số nguyên hợp lệ");
    }
    const queryParams = new URLSearchParams({ year: yearInt });
    if (roomInt) queryParams.append("roomId", roomInt);
    const response = await axios.get(`/ultilizationrate/year?${queryParams.toString()}`);
    const data = response.data?.data || [];
    if (!Array.isArray(data)) {
      throw new Error("Dữ liệu tỷ lệ sử dụng theo năm không hợp lệ");
    }
    return data.map((item) => ({
      roomId: typeof item.roomId === "number" ? item.roomId : parseInt(item.roomId) || 0,
      roomName: item.roomName || "",
      rate: typeof item.rate === "number" ? item.rate : parseFloat(item.rate) || 0,
      dateTH: item.dateTH || "",
    }));
  }, []);

  const handleSearch = useCallback(async () => {
    if (!selectedDate && !selectedRoom) {
      toast.error("Vui lòng chọn ngày hoặc phòng để tìm kiếm!");
      return;
    }
    if (loading || roomsLoading) {
      toast.info("Đang tải dữ liệu, vui lòng đợi...");
      return;
    }
    if (!rooms || rooms.length === 0) {
      toast.error("Không có danh sách phòng để tìm kiếm!");
      return;
    }
    try {
      setLoading(true);
      if (selectedDate) {
        const data = await fetchUtilizationRateByDate(selectedDate, 1);
        setUtilizationRatesByDate(data);
        if (data.length > 0) {
          setIsDateSearchPerformed(true);
          setIsRoomSearchPerformed(false);
          setFilteredRoomData([]);
          setRoomNameFromApi("");
          const selectedRoomData = selectedRoom
            ? data.find((entry) => entry.roomId === parseInt(selectedRoom))
            : null;
          const rate = selectedRoomData ? selectedRoomData.rate * 100 : 0;
          onRoomSelect(rate);
        } else {
          setIsDateSearchPerformed(true);
          setIsRoomSearchPerformed(false);
          setFilteredRoomData([]);
          setRoomNameFromApi("");
          toast.error(`Không có dữ liệu hiệu suất cho ngày ${selectedDate}!`);
          onRoomSelect(0);
        }
      } else if (selectedRoom && showRoomFilter) {
        let data;
        if (period === "năm") {
          data = await fetchUtilizationRateByYear(parseInt(selectedRoom), year);
          setUtilizationRatesByYear(data);
        } else if (period === "tháng" && month) {
          data = await fetchUtilizationRateByYearAndMonth(parseInt(selectedRoom), year, month);
          setUtilizationRates(data);
        } else {
          toast.error("Vui lòng chọn tháng khi tìm kiếm theo tháng!");
          setLoading(false);
          return;
        }
        setFilteredRoomData(data);
        const avgRate = data.length > 0 ? data.reduce((sum, entry) => sum + (entry.rate || 0) * 100, 0) / data.length : 0;
        onRoomSelect(avgRate);
        if (data.length === 0) {
          toast.error(`Không có dữ liệu hiệu suất cho phòng ${roomNameFromApi || selectedRoomName || "đã chọn"}!`);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu hiệu suất:", error);
      setIsDateSearchPerformed(selectedDate ? true : false);
      setIsRoomSearchPerformed(selectedRoom && showRoomFilter ? true : false);
      onRoomSelect(0);
      toast.error(error.message || "Lỗi khi tải dữ liệu hiệu suất!");
    } finally {
      setLoading(false);
    }
  }, [
    selectedDate,
    selectedRoom,
    showRoomFilter,
    period,
    year,
    month,
    rooms,
    roomsLoading,
    roomNameFromApi,
    selectedRoomName,
    fetchUtilizationRateByDate,
    fetchUtilizationRateByYearAndMonth,
    fetchUtilizationRateByYear,
    onRoomSelect,
    loading,
  ]);

  const processedRoomData = useMemo(() => {
    if (isRoomSearchPerformed && filteredRoomData.length > 0) {
      return period === "năm"
        ? Array.from({ length: 12 }, (_, i) => ({
            name: `Tháng ${i + 1}`,
            rate: 0,
          })).map((monthEntry, i) => {
            const entries = filteredRoomData.filter((entry) => {
              if (!entry || !entry.dateTH) return false;
              const date = new Date(entry.dateTH);
              const isValidDate = !isNaN(date.getTime());
              const monthMatch = isValidDate && date.getMonth() === i;
              return monthMatch;
            });
            const totalRate = entries.reduce((sum, entry) => sum + (entry.rate || 0) * 100, 0);
            const count = entries.length;
            const avgRate = count > 0 ? Math.round((totalRate / count) * 100) / 100 : 0;
            return { name: monthEntry.name, rate: avgRate };
          })
        : Array.from({ length: getDaysInMonth(parseInt(month), parseInt(year)) }, (_, i) => ({
            name: `Ngày ${i + 1}`,
            rate: 0,
          })).map((dayEntry, i) => {
            const entries = filteredRoomData.filter((entry) => {
              if (!entry || !entry.dateTH) return false;
              const date = new Date(entry.dateTH);
              const isValidDate = !isNaN(date.getTime());
              const dayMatch = isValidDate && date.getDate() === i + 1;
              return dayMatch;
            });
            const totalRate = entries.reduce((sum, entry) => sum + (entry.rate || 0) * 100, 0);
            const count = entries.length;
            const avgRate = count > 0 ? Math.round((totalRate / count) * 100) / 100 : 0;
            return { name: dayEntry.name, rate: avgRate };
          });
    }

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
          return { name: monthEntry.name, rate: avgRate };
        })
      : Array.from({ length: getDaysInMonth(parseInt(month), parseInt(year)) }, (_, i) => ({
          name: `Ngày ${i + 1}`,
          rate: 0,
        })).map((dayEntry, i) => {
          const entries = dataSource.filter((entry) => {
            if (!entry || !entry.dateTH) return false;
            const date = new Date(entry.dateTH);
            const isValidDate = !isNaN(date.getTime());
            const dayMatch = isValidDate && date.getDate() === i + 1;
            return dayMatch;
          });
          const totalRate = entries.reduce((sum, entry) => sum + (entry.rate || 0) * 100, 0);
          const count = entries.length;
          const avgRate = count > 0 ? Math.round((totalRate / count) * 100) / 100 : 0;
          return { name: dayEntry.name, rate: avgRate };
        });
  }, [
    utilizationRates,
    utilizationRatesByYear,
    period,
    month,
    year,
    isRoomSearchPerformed,
    filteredRoomData,
    getDaysInMonth,
  ]);

  const hasPerformanceData = processedRoomData.length > 0 && processedRoomData.some((entry) => entry.rate > 0);
  const hasDateData = transformedDateData.length > 0 && transformedDateData.some((entry) => entry.rate > 0);

  // Pie chart data for room search or default (not for date search)
  const utilizationPieData = useMemo(() => {
    if (isRoomSearchPerformed) {
      const avgRate = filteredRoomData.reduce((sum, entry) => sum + (entry.rate || 0) * 100, 0) / filteredRoomData.length;
      return [
        { name: "Tỷ lệ sử dụng", value: avgRate || 0 },
        { name: "Chưa sử dụng", value: 100 - (avgRate || 0) },
      ];
    } else if (!isDateSearchPerformed) {
      const avgRate = processedRoomData.reduce((sum, entry) => sum + (entry.rate || 0), 0) / processedRoomData.length;
      return [
        { name: "Tỷ lệ sử dụng", value: avgRate || 0 },
        { name: "Chưa sử dụng", value: 100 - (avgRate || 0) },
      ];
    }
    return [];
  }, [isDateSearchPerformed, isRoomSearchPerformed, filteredRoomData, processedRoomData]);

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
            theme === "dark" ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"
          }`}
        >
          <p className="font-semibold mb-2">{label}</p>
          <p className="text-sm">Hiệu suất sử dụng: {(data.rate || 0).toFixed(2)}%</p>
        </div>
      );
    }
    return null;
  };

  const referenceLines =
    isLargeScreen && period === "tháng" && !isDateSearchPerformed && getDaysInMonth(month, year) > 0 ? (
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
          x={`Ngày ${getDaysInMonth(month, year)}`}
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
          className={`card-title text-2xl font-semibold p-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
        >
          Thống kê hiệu suất
        </p>
      </div>

      <div className="card-body p-6 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label
              className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
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
              disabled={selectedRoom && showRoomFilter}
              className={`w-full p-2 rounded-lg border ${
                theme === "dark"
                  ? "bg-gray-800 text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                selectedRoom && showRoomFilter ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
          </div>
          {showRoomFilter && (
            <div className="flex-1">
              <label
                className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
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
                <option value="">Chọn phòng</option>
                {rooms.map((room) => (
                  <option key={room.roomId} value={room.roomId}>
                    {room.roomName}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-end gap-2">
            <button
              onClick={() => setShowRoomFilter(!showRoomFilter)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              {showRoomFilter ? "Ẩn phòng" : "Hiển thị phòng"}
            </button>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              disabled={loading || roomsLoading}
            >
              {loading || roomsLoading ? "Đang tải..." : "Tìm kiếm"}
            </button>
          </div>
        </div>

        {/* Chỉ hiển thị PieChart khi không phải tìm kiếm theo ngày */}
        {!isDateSearchPerformed && utilizationPieData.length > 0 && (
          <div className="flex flex-col items-center animate-fade-in">
            <h3
              className={`text-xl font-medium mb-4 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
            >
              Hiệu suất sử dụng trung bình -{" "}
              {isRoomSearchPerformed && roomNameFromApi
                ? `Phòng ${roomNameFromApi} - ${period === "năm" ? `Năm ${year}` : `Tháng ${month}/${year}`}`
                : period === "năm"
                ? `Năm ${year}`
                : `Tháng ${month}/${year}`}
            </h3>
            {utilizationPieData.every((item) => item.value === 0) ? (
              <p className={`text-center text-gray-500 dark:text-gray-400`}>
                Không có dữ liệu hiệu suất cho{" "}
                {isRoomSearchPerformed && roomNameFromApi
                  ? `phòng ${roomNameFromApi}`
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
                    labelLine={true}
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
                      <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        <div className="flex flex-col animate-fade-in">
          <h3
            className={`text-xl font-medium mb-4 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
          >
            Biểu đồ thống kê hiệu suất (theo %) -{" "}
            {isDateSearchPerformed && selectedDate
              ? `Ngày ${selectedDate}`
              : isRoomSearchPerformed && roomNameFromApi
              ? `Phòng ${roomNameFromApi} - ${period === "năm" ? `Năm ${year}` : `Tháng ${month}/${year}`}`
              : period === "năm"
              ? `Năm ${year}`
              : `Tháng ${month}/${year}`}
          </h3>
          {loading ? (
            <p className={`text-center text-gray-500 dark:text-gray-400`}>Đang tải dữ liệu...</p>
          ) : (!hasPerformanceData && !hasDateData) ? (
            <p className={`text-center text-gray-500 dark:text-gray-400`}>
              Không có dữ liệu hiệu suất cho{" "}
              {isDateSearchPerformed && selectedDate
                ? `ngày ${selectedDate}`
                : isRoomSearchPerformed && roomNameFromApi
                ? `phòng ${roomNameFromApi}`
                : period === "năm"
                ? `năm ${year}`
                : `tháng ${month}/${year}`}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={500}>
              <AreaChart
                data={isDateSearchPerformed && selectedDate ? processDateData : processedRoomData}
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
                  angle={
                    isDateSearchPerformed && selectedDate
                      ? -45
                      : period === "năm" || (period === "tháng" && !isDateSearchPerformed)
                      ? -45
                      : 0
                  }
                  textAnchor={
                    isDateSearchPerformed && selectedDate
                      ? "end"
                      : period === "năm" || (period === "tháng" && !isDateSearchPerformed)
                      ? "end"
                      : "middle"
                  }
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
                  type={isDateSearchPerformed && selectedDate ? "natural" : "monotone"}
                  dataKey="rate"
                  name="Tỷ lệ sử dụng"
                  stroke="#f97316"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  activeDot={false}
                />
                {isDateSearchPerformed && selectedDate ? null : referenceLines}
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