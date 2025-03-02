
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { room} from "../../constants";

const CreateRoom = () => {
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState({ name: "", status: "active" });

  const handleChange = (e) => {
    setRoomData({ ...roomData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Thêm phòng:", roomData);
    // Thêm logic lưu vào database ở đây
    navigate("/dashboard/room");
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-semibold text-center mb-4 text-blue-600">Thêm Phòng Mới</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Tên Phòng</label>
          <input
            type="text"
            name="name"
            value={roomData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Trạng Thái</label>
          <select
            name="status"
            value={roomData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="flex justify-between">
          <button
            type="button"
            className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
            onClick={() => navigate("/dashboard/room")}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
          >
            Thêm Phòng
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRoom;
