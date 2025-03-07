import { PencilLine, Trash, Eye, PlusCircle } from "lucide-react";
import { areas } from "../../constants";
import { useNavigate } from "react-router-dom";

const AreaList = () => {
  const navigate = useNavigate();

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa khu vực này?");
    if (confirmDelete) {
      console.log(`Xóa khu vực có ID: ${id}`);
      // Thêm logic xóa khu vực ở đây
    }
  };

  return (
    <div className={`p-6 shadow-xl rounded-lg transition-all`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">📍 Danh Sách Khu Vực</h2>
        <button 
          className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-x-2 shadow-md hover:bg-green-600 transition"
          onClick={() => navigate("/dashboard/areas/create")}
        >
          <PlusCircle size={20}/> Thêm Khu Vực
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="w-full border-collapse">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Tên Khu Vực</th>
              <th className="p-3 text-center">Type</th>
              <th className="p-3 text-center">Room</th>
              <th className="p-3 text-center">Action</th>
              
             
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {areas.map((area, index) => (
              <tr key={area.id} className="hover:bg-gray-200 transition">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{area.name}</td>
                <td className="p-3 text-center">{area.type}</td>
               
                <td className="p-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    area.Room === "Hoạt động" ? "bg-green-200 text-green-700" 
                    : "bg-red-200 text-red-700"
                  }`}>
                    {area.Room}
                  </span>
                </td>
                <td className="p-3 flex justify-center gap-x-3">
                  <button 
                    className="text-blue-500 hover:text-blue-700 transition"
                    onClick={() => navigate(`/dashboard/areas/${area.id}`)}
                  >
                    <Eye size={22} />
                  </button>
                  <button 
                    className="text-yellow-500 hover:text-yellow-700 transition"
                    onClick={() => navigate(`/dashboard/areas/update/${area.id}`)}
                  >
                    <PencilLine size={22}/>
                  </button>
                  <button 
                    className="text-red-500 hover:text-red-700 transition"
                    onClick={() => handleDelete(area.id)}
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

export default AreaList;
