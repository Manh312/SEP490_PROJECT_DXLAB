import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { room } from "../../constants";

const UpdateRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Tìm phòng theo ID
  const roomDetail = room.find((r) => r.id.toString() === id);

  if (!roomDetail) {
    return <p className="text-red-500">Không tìm thấy phòng có ID {id}!</p>;
  }

  const [formData, setFormData] = useState({
    name: roomDetail.name,
    status: roomDetail.status,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Cập nhật phòng:", formData);
    // Thêm logic cập nhật phòng vào cơ sở dữ liệu ở đây
    navigate("/dashboard/rooms");
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-4 text-blue-600">Chỉnh Sửa Phòng</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Tên Phòng</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Trạng Thái</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Lưu Thay Đổi
          </button>
          <button
            type="button"
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            onClick={() => navigate("/dashboard/room")}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateRoom;
