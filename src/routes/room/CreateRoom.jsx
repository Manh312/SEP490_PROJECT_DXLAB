import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createRoom } from "../../redux/slices/Room";

const CreateRoom = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.rooms);

  const [roomData, setRoomData] = useState({
    roomName: "",
    roomDescription: "",
    userId: 123, 
    isDeleted: 0,
  });

  const handleChange = (e) => {
    setRoomData({ ...roomData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(createRoom(roomData)).unwrap(); // unwrap() để lấy kết quả từ createAsyncThunk
      console.log("Tạo phòng thành công:", result);
      navigate("/dashboard/room");
    } catch (error) {
      console.error("Lỗi khi tạo phòng:", error);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-semibold text-center mb-4 text-blue-600">Thêm Phòng Mới</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Tên Phòng</label>
          <input
            type="text"
            name="roomName"
            value={roomData.roomName}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Mô Tả Phòng</label>
          <textarea
            name="roomDescription"
            value={roomData.roomDescription}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
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
            className={`bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Đang tạo..." : "Thêm Phòng"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRoom;
