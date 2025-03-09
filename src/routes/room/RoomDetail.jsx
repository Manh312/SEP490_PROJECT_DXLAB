import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PencilLine, Trash } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { deleteRoom, getRoomById } from "../../redux/slices/Room";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Lấy dữ liệu từ Redux store
  const { selectedRoom, loading, error } = useSelector((state) => state.rooms);

  // Gọi API lấy chi tiết phòng khi component render
  useEffect(() => {
    dispatch(getRoomById(id));
  }, [dispatch, id]);

  // Xử lý xóa phòng
  const handleDelete = async () => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa phòng này?");
    if (confirmDelete) {
      try {
        await dispatch(deleteRoom(id)).unwrap();
        navigate("/dashboard/room"); // Chuyển hướng sau khi xóa
      } catch (error) {
        console.error("Lỗi khi xóa phòng:", error);
      }
    }
  };

  // Hiển thị trạng thái tải dữ liệu hoặc lỗi
  if (loading) return <p className="text-blue-500 text-center">Đang tải thông tin phòng...</p>;
  if (error) return <p className="text-red-500 text-center">Lỗi: {error}</p>;
  if (!selectedRoom) return <p className="text-gray-500 text-center">Không tìm thấy phòng có ID {id}!</p>;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-semibold text-center mb-4 text-blue-600">Chi Tiết Phòng</h2>
      <table className="w-full border-collapse border border-gray-300">
        <tbody>
          <tr className="border-b">
            <td className="px-4 py-3 font-semibold bg-gray-200">Tên Phòng</td>
            <td className="px-4 py-3">{selectedRoom.roomName}</td>
          </tr>
          <tr>
            <td className="px-4 py-3 font-semibold bg-gray-200">Trạng Thái</td>
            <td className={`px-4 py-3 text-center font-semibold ${selectedRoom.status === "Còn trống" ? "text-green-500" : "text-red-500"}`}>
              {selectedRoom.status}
            </td>
          </tr>
        </tbody>
      </table>
      <div className="flex gap-x-3 mt-4">
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center gap-x-2 shadow-md hover:bg-yellow-600 transition"
          onClick={() => navigate(`/dashboard/room/update/${selectedRoom.roomId}`)}
        >
          <PencilLine size={20} /> Chỉnh Sửa
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-x-2 shadow-md hover:bg-red-600 transition"
          onClick={handleDelete}
        >
          <Trash size={20} /> Xóa Phòng
        </button>
      </div>
    </div>
  );
};

export default RoomDetail;
