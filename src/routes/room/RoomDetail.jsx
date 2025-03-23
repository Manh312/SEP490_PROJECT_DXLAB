import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PencilLine } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {  getRoomById } from "../../redux/slices/Room";

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

  // Hiển thị trạng thái tải dữ liệu hoặc lỗi
  if (loading) return <p className="text-blue-500 text-center">Đang tải thông tin phòng...</p>;
  if (error) return <p className="text-red-500 text-center">Lỗi: {error}</p>;
  if (!selectedRoom) return <p className="text-gray-500 text-center">Không tìm thấy phòng có ID {id}!</p>;

   // Lấy dữ liệu từ API response mới
   const { roomId, roomName, roomDescription, capacity, isDeleted, images, area_DTO } = selectedRoom;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-4 text-blue-600">Chi Tiết Phòng: {roomId}</h2>
      <table className="w-full border-collapse border border-gray-300">
        <tbody>
          <tr className="border-b">
            <td className="px-4 py-3 font-semibold border-r border-gray-300">Tên Phòng</td>
            <td className="px-4 py-3">{roomName}</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-3 font-semibold  border-r border-gray-300">Mô Tả</td>
            <td className="px-4 py-3">{roomDescription}</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-3 font-semibold border-r border-gray-300">Sức Chứa</td>
            <td className="px-4 py-3">{capacity} người</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-3 font-semibold  border-r border-gray-300">Trạng Thái</td>
            <td className={`px-4 py-3 font-semibold ${isDeleted ? "text-red-500" : "text-green-500"}`}>
              {isDeleted ? "Đã xóa" : "Đang hoạt động"}
            </td>
          </tr>
          {/* Hiển thị danh sách khu vực */}
          <tr className="border-b">
            <td className="px-4 py-3 font-semibold border-r border-gray-300">Khu Vực</td>
            <td className="px-4 py-3">
              {area_DTO && area_DTO.length > 0 ? (
                <ul className="list-disc pl-5">
                  {area_DTO.map((area, index) => (
                    <li key={index} className="py-1">
                      <span className="font-semibold">Loại khu vực:</span> {area.areaTypeId} - 
                      <span className="font-semibold"> Tên:</span> {area.areaName}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-500">Không có khu vực</span>
              )}
            </td>
          </tr>
          {/* Hiển thị ảnh */}
          <tr>
            <td className="px-4 py-3 font-semibold border-r border-gray-300">Hình Ảnh</td>
            <td className="px-4 py-3 flex flex-wrap gap-2">
              {images && images.length > 0 ? (
                images.map((img, index) => (
                  <img
                    key={index}
                    src={`/assets/${img}`} // Load ảnh từ thư mục assets
                    alt={`room-${index}`}
                    className="w-20 h-20 object-cover rounded-md shadow"
                  />
                ))
              ) : (
                <span className="text-gray-500">Không có hình ảnh</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Nút Chỉnh sửa & Xóa */}
      <div className="flex gap-x-3 mt-4">
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center gap-x-2 shadow-md hover:bg-yellow-600 transition"
          onClick={() => navigate(`/dashboard/room/update/${roomId}`)}
        >
          <PencilLine size={20} /> Chỉnh Sửa
        </button>
      </div>
    </div>
  );
};

export default RoomDetail;
