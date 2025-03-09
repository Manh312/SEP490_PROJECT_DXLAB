import { useEffect } from "react";
import { PencilLine, Trash, Eye, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteRoom, fetchRooms } from "../../redux/slices/Room";


const RoomList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Lấy danh sách phòng từ Redux store
  const { rooms, loading, error } = useSelector((state) => state.rooms);

  // Gọi API lấy danh sách phòng khi component được render
  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  // Hàm xử lý xóa phòng
  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa phòng này?");
    if (confirmDelete) {
      dispatch(deleteRoom(id));
    }
  };

  return (
    <div className="p-6 shadow-xl rounded-lg transition-all">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">🏨 Danh Sách Phòng</h2>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-x-2 shadow-md hover:bg-green-600 transition"
          onClick={() => navigate("/dashboard/room/create")}
        >
          <PlusCircle size={20} /> Thêm Phòng
        </button>
      </div>

      {/* Hiển thị trạng thái tải dữ liệu */}
      {loading && <p className="text-center text-blue-600">Đang tải danh sách phòng...</p>}
      {error && <p className="text-center text-red-500">Lỗi: {error}</p>}

      {/* Hiển thị danh sách phòng */}
      {!loading && !error && rooms.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="w-full border-collapse">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Tên Phòng</th>
                <th className="p-3 text-center">Trạng Thái</th>
                <th className="p-3 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {rooms.map((room, index) => (
                <tr key={room.roomId} className="hover:bg-gray-500 transition">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{room.roomName}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        room.status === "Còn trống"
                          ? "bg-green-200 text-green-700"
                          : "bg-red-200 text-red-700"
                      }`}
                    >
                      {room.status}
                    </span>
                  </td>
                  <td className="p-3 flex justify-center gap-x-3">
                    <button
                      className="text-blue-500 hover:text-blue-700 transition"
                      onClick={() => navigate(`/dashboard/room/${room.roomId}`)}
                    >
                      <Eye size={22} />
                    </button>
                    <button
                      className="text-yellow-500 hover:text-yellow-700 transition"
                      onClick={() => navigate(`/dashboard/room/update/${room.roomId}`)}
                    >
                      <PencilLine size={22} />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700 transition"
                      onClick={() => handleDelete(room.roomId)}
                    >
                      <Trash size={22} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && !error && <p className="text-center text-gray-500">Không có phòng nào</p>
      )}
    </div>
  );
};

export default RoomList;
