import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Clock10Icon, PencilLine, PlusCircle, Filter, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { listSlots, setSlotStatusFilter } from "../../redux/slices/Slot";
import { useTheme } from "../../hooks/use-theme";
import { FaSpinner } from "react-icons/fa";
import debounce from "lodash/debounce";
import { Tooltip } from "react-tooltip";

const SlotList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { slots, loading, error, statusFilter } = useSelector((state) => state.slots);
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");

  // Debounced search handler
  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
  }, 300);

  useEffect(() => {
    dispatch(listSlots());
  }, [dispatch]);

  const handleAddSlot = () => {
    navigate("/dashboard/slot/create");
  };

  // Filter slots based on status and search term
  const filteredSlots = useMemo(() => {
    if (error || !Array.isArray(slots)) return [];
    let result = slots;
    if (statusFilter !== "all") {
      result = result.filter((slot) => String(slot.status) === statusFilter);
    }
    if (searchTerm) {
      result = result.filter((slot) =>
        (slot.slotNumber || "").toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [slots, statusFilter, searchTerm, error]);

  // Get display name and class for status
  const getStatusDisplayName = (status) => {
    switch (status) {
      case 1:
        return "Bình thường";
      case 0:
        return "Sắp hết hạn";
      default:
        return "Không xác định";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 1:
        return "bg-green-100 text-green-800";
      case 0:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <div className="w-full border border-gray-600 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <Clock10Icon className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Danh Sách Slot Trong Ngày
            </h2>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-md"
            onClick={handleAddSlot}
          >
            <PlusCircle size={20} /> Thêm Slot
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo số slot"
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 text-sm sm:text-base shadow-sm"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-sm sm:text-base">Lọc theo trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => dispatch(setSlotStatusFilter(e.target.value))}
                className={`w-full sm:w-auto px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:border-orange-500 transition duration-150 ease-in-out ${statusFilter === "1"
                    ? "bg-green-100 text-green-800"
                    : statusFilter === "0"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
              >
                <option value="all">Tất cả</option>
                <option value="1">Bình thường</option>
                <option value="0">Sắp hết hạn</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-6 mb-200">
            <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
            <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-red-500 text-lg">
              Lỗi: {error.message || JSON.stringify(error)}
            </p>
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Clock10Icon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm
                ? `Không tìm thấy slot nào khớp với tìm kiếm`
                : `Không có slot nào với trạng thái "${statusFilter === "all" ? "Tất cả" : getStatusDisplayName(Number(statusFilter))}"`}
            </p>
          </div>
        ) : (
          <>
            {/* Table for Desktop */}
            <div className="hidden md:block border rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b items-center bg-gray-400">
                  <tr>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">#</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">
                      Số Slot
                    </th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">
                      Giờ Bắt Đầu
                    </th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">
                      Giờ Kết Thúc
                    </th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">
                      Ngày Hết Hạn
                    </th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">
                      Trạng Thái
                    </th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">
                      Hành Động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSlots.map((slot, index) => (
                    <tr
                      key={slot.slotId}
                      className={`border-b hover:bg-gray-400 transition-colors ${theme === "dark" ? "hover:bg-gray-300" : ""}`}
                    >
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">{index + 1}</td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {slot.slotNumber ? `Slot ${slot.slotNumber}` : "N/A"}
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">{slot.startTime}</td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">{slot.endTime}</td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {new Date(slot.expiredTime).toLocaleDateString() === new Date('1/1/3000').toLocaleDateString()
                          ? 'Không xác định'
                          : new Date(slot.expiredTime).toLocaleDateString()}
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full font-medium text-xs sm:text-sm ${getStatusClass(slot.status)}`}
                        >
                          {getStatusDisplayName(slot.status)}
                        </span>
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        <button
                          onClick={() => navigate(`/dashboard/slot/update/${slot.slotId}`)}
                          data-tooltip-id="action-tooltip"
                          data-tooltip-content="Cập nhật slot"
                          className="bg-yellow-100 text-yellow-700 hover:bg-yellow-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <PencilLine className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Card View for Mobile */}
            <div className="block md:hidden space-y-4">
              {filteredSlots.map((slot, index) => (
                <div
                  key={slot.slotId}
                  className={`border rounded-lg p-3 sm:p-4 shadow-sm hover:bg-gray-500 transition-colors ${theme === "dark" ? "hover:bg-gray-300" : ""}`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-sm">#{index + 1}</span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full font-medium text-xs ${getStatusClass(slot.status)}`}
                      >
                        {getStatusDisplayName(slot.status)}
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Số Slot:</span>{" "}
                      {slot.slotNumber ? `Slot ${slot.slotNumber}` : "N/A"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Giờ Bắt Đầu:</span> {slot.startTime}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Giờ Kết Thúc:</span> {slot.endTime}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Giờ Kết Thúc:</span> {slot.expiredTime}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Ngày Hết Hạn:</span> {new Date(slot.expiredTime).toLocaleDateString()}
                    </p>
                    <div className="flex justify-end">
                      <button
                        onClick={() => navigate(`/dashboard/slot/update/${slot.slotId}`)}
                        data-tooltip-id="action-tooltip"
                        data-tooltip-content="Cập nhật slot"
                        className="bg-yellow-100 text-yellow-700 hover:bg-yellow-400 p-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <PencilLine className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Tooltip id="action-tooltip" />
    </div>
  );
};

export default SlotList;