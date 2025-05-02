import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { fetchRooms, deleteRoom } from "../../redux/slices/Room";
import { useNavigate } from "react-router-dom";
import { PencilLine, Hotel, Filter, Search, Home, Eye, ChevronLeft, ChevronRight, Trash, PlusCircle } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { FaSpinner } from "react-icons/fa";
import Pagination from "../../hooks/use-pagination";
import debounce from "lodash/debounce";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RoomList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { rooms, loading } = useSelector((state) => state.rooms);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [imageIndices, setImageIndices] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roomIdToDelete, setRoomIdToDelete] = useState(null);
  const [roomName, setRoomName] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const roomsPerPage = 5;
  const baseUrl = import.meta.env.VITE_SIGNAL_BASE_URL;

  const debouncedSearch = debounce((value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, 300);

  const filteredRooms = useMemo(() => {
    if (!Array.isArray(rooms)) return [];

    let result = rooms.filter((room) => {
      if (!room || typeof room !== "object" || !room.roomId || !room.roomName) return false;
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Sẵn sàng" && room.status === 1) || // Updated to match AreaList logic
        (statusFilter === "Không sẵn sàng" && room.status === 0);
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
      case "Sẵn sàng":
        return "bg-green-100 text-green-800";
      case "Không sẵn sàng":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
          : `${baseUrl}/${imageSrc}`
        : "/placeholder-image.jpg";

    return (
      <div className="relative w-40 h-40 mx-auto group">
        <img
          src={displaySrc}
          alt={`Room image ${currentIndex}`}
          className="w-full h-full object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
          onError={(e) => (e.target.src = "/placeholder-image.jpg")}
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
                  className={`w-1.5 h-1.5 rounded-full ${idx === currentIndex ? "bg-white" : "bg-gray-400"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const handleOpenDeleteModal = (roomId, roomName) => {
    setRoomIdToDelete(roomId);
    setRoomName(roomName || "N/A");
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setRoomIdToDelete(null);
    setRoomName("");
  };

  const handleDeleteRoom = async () => {
    if (!roomIdToDelete) {
      toast.error("Không tìm thấy ID phòng để xóa!");
      return;
    }
    setLoadingId(roomIdToDelete);
    try {
      await dispatch(deleteRoom(roomIdToDelete)).unwrap();
      toast.success("Xóa phòng thành công!");
      dispatch(fetchRooms());
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingId(null);
      setIsDeleteModalOpen(false);
      setRoomIdToDelete(null);
      setRoomName("");
    }
  };

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <Tooltip id="action-tooltip" />
      <div className="w-full border border-gray-600 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
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
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-md"
            >
              <PlusCircle className="h-5 w-5" />
              <span className="hidden sm:inline">Thêm phòng</span>
            </button>
          </div>
        </div>

        {/* Updated Search and Filter Section to match AreaList */}
        <div className="mb-6 p-4 rounded-lg shadow-sm border border-gray-200">
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
              <Filter className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-sm sm:text-base">Lọc theo trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full sm:w-auto px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base ${getFilterBgClass()} focus:outline-none focus:border-orange-500 transition duration-150 ease-in-out`}
              >
                <option value="All">Tất cả</option>
                <option value="Sẵn sàng">Sẵn sàng</option>
                <option value="Không sẵn sàng">Không sẵn sàng</option>
              </select>
            </div>
          </div>
        </div>

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
            <div className="hidden md:block border rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b items-center bg-gray-400">
                  <tr>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">#</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Hình Ảnh</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Tên Phòng</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Sức Chứa</th>
                    {/* <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Ngày Hết Hạn</th> */}
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
                        {renderImages(room.images, room.roomId)}
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {room.roomName}
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {room.capacity} người
                      </td>
                      {/* <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {new Date(room.expiredTime).toLocaleDateString()}
                      </td> */}
                      <td className="px-2 py-3 md:px-4 md:py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-normal text-xs md:text-sm ${room.status === 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                        >
                          {room.status === 0 ? "Chưa sẵn sàng" : "Sẵn sàng"}
                        </span>
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        <div className="flex justify-center items-center gap-2 h-full">
                          <button
                            onClick={() => navigate(`/dashboard/room/${room.roomId}`)}
                            data-tooltip-id="action-tooltip"
                            data-tooltip-content="Xem chi tiết phòng"
                            className="bg-orange-100 text-orange-700 ml-2 hover:bg-orange-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/dashboard/room/update/${room.roomId}`)}
                            data-tooltip-id="action-tooltip"
                            data-tooltip-content="Cập nhật phòng"
                            className="bg-yellow-100 text-yellow-700 hover:bg-yellow-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                          >
                            <PencilLine className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(room.roomId, room.roomName)}
                            data-tooltip-id="action-tooltip"
                            data-tooltip-content="Xóa phòng"
                            className="bg-red-100 text-red-700 hover:bg-red-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                            disabled={loadingId === room.roomId}
                          >
                            {loadingId === room.roomId ? (
                              <FaSpinner className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal ${room.status ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                        >
                          {room.status ? "Đã xóa" : "Sẵn sàng"}
                        </span>
                      </div>
                      {renderImages(room.images, room.roomId)}
                      <p className="text-sm">
                        <span className="font-medium">Tên Phòng:</span> {room.roomName}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Sức Chứa:</span> {room.capacity} người
                      </p>
                      {/* <p className="text-sm">
                        <span className="font-medium">Ngày Hết Hạn:</span> {new Date(room.expiredTime).toLocaleDateString()}
                      </p> */}
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
                        <button
                          onClick={() => handleOpenDeleteModal(room.roomId, room.roomName)}
                          className="bg-red-100 text-red-700 hover:bg-red-400 p-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                          disabled={loadingId === room.roomId}
                        >
                          {loadingId === room.roomId ? (
                            <FaSpinner className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash className="w-4 h-4" />
                          )}
                          Xóa
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

        {isDeleteModalOpen && (
          <div
            className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleCloseDeleteModal}
          >
            <div
              className="bg-neutral-300 rounded-lg shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 ease-in-out scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-red-600 mb-4">Xác nhận xóa phòng</h2>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa phòng <strong>{roomName}</strong> không? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCloseDeleteModal}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
                  disabled={loadingId === roomIdToDelete}
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteRoom}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                  disabled={loadingId === roomIdToDelete}
                >
                  {loadingId === roomIdToDelete ? "Đang xóa..." : "Xóa phòng"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomList;