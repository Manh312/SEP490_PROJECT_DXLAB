import { PencilLine, Trash, Eye, PlusCircle } from "lucide-react";
import { rooms } from "../../constants";
import { useNavigate } from "react-router-dom";

const RoomList = () => {
  const navigate = useNavigate();

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa phòng này?");
    if (confirmDelete) {
      console.log(`Xóa phòng có ID: ${id}`);
      // Thêm logic xóa phòng ở đây
    }
  };

  return (
    <div className={`p-6 shadow-xl rounded-lg transition-all`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">🏨 Danh Sách Phòng</h2>
        <button 
          className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-x-2 shadow-md hover:bg-green-600 transition"
          onClick={() => navigate("/dashboard/rooms/create")}
        >
          <PlusCircle size={20}/> Thêm Phòng
        </button>
      </div>
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
    <tr key={room.id} className="hover:bg-gray-500 transition">
      <td className="p-3">{index + 1}</td>
      <td className="p-3">{room.name}</td>
      <td className="p-3 text-center">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          room.status === "Còn trống" ? "bg-green-200 text-green-700" 
          : "bg-red-200 text-red-700"
        }`}>
          {room.status}
        </span>
      </td>
      <td className="p-3 flex justify-center gap-x-3">
        <button 
          className="text-blue-500 hover:text-blue-700 transition"
          onClick={() => navigate(`/dashboard/rooms/${room.id}`)}
        >
          <Eye size={22} />
        </button>
        <button 
          className="text-yellow-500 hover:text-yellow-700 transition"
          onClick={() => navigate(`/dashboard/rooms/update/${room.id}`)}
        >
          <PencilLine size={22}/>
        </button>
        <button 
          className="text-red-500 hover:text-red-700 transition"
          onClick={() => handleDelete(room.id)}
        >
          <Trash size={22}/>
        </button>
      </td>
    </tr>
 

            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RoomList;
