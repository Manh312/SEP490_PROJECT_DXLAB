import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { fetchRooms } from "../../redux/slices/Room";
import { Link, useNavigate } from "react-router-dom";
import { PencilLine, Hotel, Filter, Search, Home, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { FaSpinner } from "react-icons/fa";
import Pagination from "../../hooks/use-pagination";
import debounce from "lodash/debounce";

const RoomList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { rooms, loading } = useSelector((state) => state.rooms);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [imageIndices, setImageIndices] = useState({}); // To track the current image index for each room
  const roomsPerPage = 5;
  const baseUrl = "https://localhost:9999"; // Base URL for image paths, matching BlogList

  // Debounced search function
  const debouncedSearch = debounce((value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, 300);

  // Lọc và tìm kiếm danh sách phòng
  const filteredRooms = useMemo(() => {
    if (!Array.isArray(rooms)) return [];

    let result = rooms.filter((room) => {
      if (!room || typeof room !== "object" || !room.roomId || !room.roomName) return false;
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Hoạt động" && !room.isDeleted) ||
        (statusFilter === "Đã xóa" && room.isDeleted);
      return matchesStatus;
    });

    if (searchQuery) {
      result = result.filter((room) =>
        room.roomName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [rooms, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const currentRooms = filteredRooms.slice(
    (currentPage - 1) * roomsPerPage,
    currentPage * roomsPerPage
  );

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  const getEmptyStateMessage = () => {
    if (statusFilter === "All") {
      return searchQuery
        ? "Không tìm thấy phòng nào khớp với tìm kiếm"
        : "Hiện tại không có phòng nào";
    }
    return searchQuery
      ? `Không tìm thấy phòng nào thuộc trạng thái "${statusFilter}" khớp với tìm kiếm`
      : `Không có phòng nào thuộc trạng thái "${statusFilter}"`;
  };

  const getFilterBgClass = () => {
    switch (statusFilter) {
      case "All":
        return "bg-gray-100 text-gray-800";
      case "Hoạt động":
        return "bg-green-100 text-green-800";
      case "Đã xóa":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to render multiple images with navigation, similar to BlogList
  const renderImages = (images, roomId) => {
    const validImages = Array.isArray(images) && images.length > 0 ? images : [];
    if (!validImages.length) {
      return (
        <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded-lg mx-auto">
          <span className="text-gray-500 text-sm">Không có ảnh</span>
        </div>
      );
    }

    const currentIndex = imageIndices[roomId] || 0;

    const prevImage = () => {
      setImageIndices((prev) => ({
        ...prev,
        [roomId]: (currentIndex - 1 + validImages.length) % validImages.length,
      }));
    };

    const nextImage = () => {
      setImageIndices((prev) => ({
        ...prev,
        [roomId]: (currentIndex + 1) % validImages.length,
      }));
    };

    const imageSrc = validImages[currentIndex];
    const displaySrc =
      typeof imageSrc === "string"
        ? imageSrc.startsWith("http")
          ? imageSrc
          : `${baseUrl}/${imageSrc}` // Prepend baseUrl if the image path doesn't start with http
        : "/placeholder-image.jpg";

    return (
      <div className="relative w-40 h-40 mx-auto group">
        <img
          src={displaySrc}
          alt={`Room image ${currentIndex}`}
          className="w-full h-full object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
          onError={(e) => (e.target.src = "/placeholder-image.jpg")} // Fallback image on error
        />
        {validImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
              {validImages.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full ${
                    idx === currentIndex ? "bg-white" : "bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <Tooltip id="action-tooltip" />
      <div className="w-full border border-gray-600 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <Home className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Danh Sách Phòng
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/dashboard/room/create")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              <span className="hidden sm:inline">Thêm Phòng</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 p-4 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên phòng"
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 text-sm sm:text-base shadow-sm"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-5 w-5 text-orange-500" />
              <span className="font-medium text-sm sm:text-base">Lọc theo trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full sm:w-auto px-3 py-2 border rounded-lg text-sm sm:text-base ${getFilterBgClass()} shadow-sm`}
              >
                <option value="All">Tất cả</option>
                <option value="Hoạt động">Hoạt động</option>
                <option value="Đã xóa">Đã xóa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading or Empty State */}
        {loading ? (
          <div className="flex items-center justify-center py-6 mb-200">
            <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
            <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Hotel className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">{getEmptyStateMessage()}</p>
          </div>
        ) : (
          <>
            {/* Table for Desktop */}
            <div className="hidden md:block border rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b items-center bg-gray-400">
                  <tr>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">#</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Hình Ảnh</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Tên Phòng</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Tên Khu Vực</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Loại Khu Vực</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Sức Chứa</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Trạng Thái</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRooms.map((room, index) => (
                    <tr key={room.roomId} className="border-b hover:bg-gray-400 transition-colors">
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {(currentPage - 1) * roomsPerPage + index + 1}
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {renderImages(room.images, room.roomId)} {/* Use renderImages for multiple images */}
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {room.roomName}
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {room.area_DTO.map((area, idx) => (
                          <span key={idx} className="block">
                            {area.areaName}
                          </span>
                        ))}
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {room.area_DTO.map((area, idx) => (
                          <span key={idx} className="block">
                            {area.areaTypeName}
                          </span>
                        ))}
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {room.capacity} người
                      </td>
                      <td className="px-2 py-3 md:px-4 md:py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-normal text-xs md:text-sm ${
                            room.isDeleted ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {room.isDeleted ? "Đã xóa" : "Hoạt động"}
                        </span>
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        <div className="flex justify-center items-center gap-2 h-full">
                          <button
                            onClick={() => navigate(`/dashboard/room/${room.roomId}`)}
                            data-tooltip-id="action-tooltip"
                            data-tooltip-content="Xem chi tiết"
                            className="bg-orange-100 text-orange-700 ml-2 hover:bg-orange-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/dashboard/room/update/${room.roomId}`)}
                            data-tooltip-id="action-tooltip"
                            data-tooltip-content="Cập nhật"
                            className="bg-yellow-100 text-yellow-700 hover:bg-yellow-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                          >
                            <PencilLine className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="block md:hidden space-y-4">
              {currentRooms.length > 0 ? (
                currentRooms.map((room, index) => (
                  <div
                    key={room.roomId || index}
                    className="border rounded-lg p-3 sm:p-4 shadow-sm hover:bg-gray-500 transition-colors"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-sm">
                          #{(currentPage - 1) * roomsPerPage + index + 1}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal ${
                            room.isDeleted ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {room.isDeleted ? "Đã xóa" : "Hoạt động"}
                        </span>
                      </div>
                      {/* Add image rendering in mobile view */}
                      {renderImages(room.images, room.roomId)}
                      <p className="text-sm">
                        <span className="font-medium">Tên Phòng:</span> {room.roomName}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Tên Khu Vực:</span>{" "}
                        {room.area_DTO.map((area, idx) => (
                          <span key={idx} className="block">
                            {area.areaName}
                          </span>
                        ))}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Loại Khu Vực:</span>{" "}
                        {room.area_DTO.map((area, idx) => (
                          <span key={idx} className="block">
                            {area.areaTypeName}
                          </span>
                        ))}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Sức Chứa:</span> {room.capacity} người
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        <button
                          onClick={() => navigate(`/dashboard/room/detail/${room.roomId}`)}
                          className="bg-yellow-100 text-yellow-700 hover:bg-yellow-400 p-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                        >
                          <Eye className="w-4 h-4" /> Xem chi tiết
                        </button>
                        <button
                          onClick={() => navigate(`/dashboard/room/update/${room.roomId}`)}
                          className="bg-yellow-100 text-yellow-700 hover:bg-yellow-400 p-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                        >
                          <PencilLine className="w-4 h-4" /> Cập nhật
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Hotel className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">{getEmptyStateMessage()}</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RoomList;