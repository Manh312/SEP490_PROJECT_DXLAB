import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { fetchRooms, deleteRoom } from "../../redux/slices/Room";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Eye, PencilLine, Trash2, PlusCircle, Filter, Hotel } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { FaSpinner } from "react-icons/fa";

const RoomList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { rooms, loading } = useSelector((state) => state.rooms);

  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const roomsPerPage = 5;

  // Lọc danh sách phòng theo trạng thái
  const filteredRooms = useMemo(() => {
    if (!Array.isArray(rooms)) return [];
    return rooms.filter((room) =>
      statusFilter === "All" ? true : room.status === statusFilter
    );
  }, [rooms, statusFilter]);

  const totalRooms = Math.ceil(filteredRooms.length / roomsPerPage);

  useEffect(() => {
    if (currentPage > totalRooms && totalRooms > 0) {
      setCurrentPage(totalRooms);
    } else if (totalRooms === 0) {
      setCurrentPage(1);
    }
  }, [totalRooms, currentPage]);

  const currentRooms = filteredRooms.slice(
    (currentPage - 1) * roomsPerPage,
    currentPage * roomsPerPage
  );

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  // Xử lý xóa phòng
  const handleDelete = async (roomId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phòng này?")) {
      try {
        await dispatch(deleteRoom(roomId)).unwrap();
        toast.success("Xóa phòng thành công");
        dispatch(fetchRooms());
      } catch (err) {
        toast.error("Lỗi khi xóa phòng: " + err);
      }
    }
  };

  // Màu nền của filter
  const getFilterBgClass = () => {
    switch (statusFilter) {
      case "All":
        return "bg-gray-100 text-gray-800";
      case "Còn trống":
        return "bg-green-100 text-green-800";
      case "Đã đặt":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Tooltip id="action-tooltip" />
      <div className="w-full border border-gray-600 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <Hotel className="h-6 w-6 text-blue-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Danh Sách Phòng</h2>
          </div>
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            onClick={() => navigate("/dashboard/room/create")}
          >
            <PlusCircle className="h-5 w-5" />
            <span>Thêm Phòng</span>
          </button>
        </div>

        {/* Filter Section */}
        <div className="mb-6 rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              <span className="font-medium text-sm sm:text-base">Lọc theo trạng thái</span>
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`w-30 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${getFilterBgClass()} transition-colors duration-300`}
          >
            <option value="All">Tất Cả</option>
            <option value="Còn trống">Còn Trống</option>
            <option value="Đã đặt">Đã Đặt</option>
          </select>
        </div>

        {/* Hiển thị danh sách phòng */}
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <FaSpinner className="animate-spin text-blue-500 w-6 h-6 mr-2" />
            <p className="text-blue-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Hotel className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm">Không có phòng nào</p>
          </div>
        ) : (
          <>
            {/* Table for Desktop */}
            <div className="hidden md:block rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b items-center bg-blue-500 text-white">
                  <tr>
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">Hình ảnhảnh</th>
                    <th className="p-3 text-left">Tên Phòng</th>
                    <th className="p-3 text-center">Trạng Thái</th>
                    <th className="p-3 text-center">Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRooms.map((room, index) => (
                    <tr key={room.roomId} className="border-b hover:bg-gray-500 transition">
                      <td className="p-3">{(currentPage - 1) * roomsPerPage + index + 1}</td>
                      <td className="p-3">
                      <img src={`../../assets/${room.images}`} alt="Room" className="w-20 h-20 object-cover rounded-md shadow" />
                      </td>
                      <td className="p-3">{room.roomName}</td>
                      <td className="p-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${room.isDeleted === true ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"}`}>
                          {room.isDeleted ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3 flex justify-center gap-x-3">
                        <button onClick={() => navigate(`/dashboard/room/${room.roomId}`)} className="text-blue-500 hover:text-blue-700 transition">
                          <Eye size={22} />
                        </button>
                        <button onClick={() => navigate(`/dashboard/room/update/${room.roomId}`)} className="text-yellow-500 hover:text-yellow-700 transition">
                          <PencilLine size={22} />
                        </button>
                        <button onClick={() => handleDelete(room.roomId)} className="text-red-500 hover:text-red-700 transition">
                          <Trash2 size={22} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoomList;
