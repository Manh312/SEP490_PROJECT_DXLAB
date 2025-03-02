
import { useParams, useNavigate } from "react-router-dom";
import { room } from "../../constants";
import { PencilLine, Trash } from "lucide-react";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Tìm phòng theo ID
  const roomDetail = room.find((r) => r.id.toString() === id);

  if (!roomDetail) {
    return <p className="text-red-500">Không tìm thấy phòng có ID {id}!</p>;
  }

  const handleDelete = () => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa phòng này?");
    if (confirmDelete) {
      console.log(`Xóa phòng có ID: ${id}`);
      // Thêm logic xóa phòng ở đây
      navigate("/dashboard/room");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-semibold text-center mb-4 text-blue-600">Chi Tiết Phòng</h2>
      <table className="w-full border-collapse border border-gray-300">
        <tbody>
          <tr className="border-b">
            <td className="px-4 py-3 font-semibold bg-gray-200">Tên Phòng</td>
            <td className="px-4 py-3">{roomDetail.name}</td>
          </tr>
          <tr>
            <td className="px-4 py-3 font-semibold bg-gray-200">Trạng Thái</td>
            <td className={`px-4 py-3 text-center font-semibold ${roomDetail.status === "Còn trống" ? "text-green-500" : "text-red-500"}`}>
              {roomDetail.status}
            </td>
          </tr>
        </tbody>
      </table>
      <div className="flex gap-x-3 mt-4">
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center gap-x-2 shadow-md hover:bg-yellow-600 transition"
          onClick={() => navigate(`/dashboard/room/update/${roomDetail.id}`)}
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
