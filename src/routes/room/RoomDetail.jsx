import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PencilLine } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getRoomById } from "../../redux/slices/Room";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedRoom, loading, error } = useSelector((state) => state.rooms);

  useEffect(() => {
    dispatch(getRoomById(id));
  }, [dispatch, id]);

  if (loading) return (
    <div className="text-center py-4 mt-10">
      <p className="text-orange-500 text-lg">Đang tải dữ liệu...</p>
    </div>
  );
  if (error) return (
    <p className="text-red-500 text-center mt-10">Lỗi: {error}</p>
  );
  if (!selectedRoom) return (
    <p className="text-red-500 text-center mt-10">Không tìm thấy phòng có ID {id}!</p>
  );

  const { roomId, roomName, roomDescription, capacity, isDeleted, images, area_DTO } = selectedRoom;

  return (
    <div className="max-w-2xl mx-auto mt-10 mb-20 p-6 rounded-lg shadow-xl border transition-all">
      {/* Tiêu đề */}
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-orange-500">
        Chi Tiết Phòng
      </h2>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <tbody>
            {/* Room ID */}
            <tr className="border-b bg-gray-500">
              <td className="px-4 py-3 font-semibold text-white">Mã Phòng</td>
              <td className="px-4 py-3 text-white">{roomId}</td>
            </tr>
            {/* Room Name */}
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold bg-gray-200 text-gray-700">Tên Phòng</td>
              <td className="px-4 py-3">{roomName}</td>
            </tr>
            {/* Description */}
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold bg-gray-200 text-gray-700">Mô Tả</td>
              <td className="px-4 py-3">{roomDescription}</td>
            </tr>
            {/* Capacity */}
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold bg-gray-200 text-gray-700">Sức Chứa</td>
              <td className="px-4 py-3">{capacity} người</td>
            </tr>
            {/* Status */}
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold bg-gray-200 text-gray-700">Trạng Thái</td>
              <td className={`px-4 py-3 ${isDeleted ? "text-red-500" : "text-green-500"}`}>
                {isDeleted ? "Đã xóa" : "Đang hoạt động"}
              </td>
            </tr>
            {/* Areas */}
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold bg-gray-200 text-gray-700">Khu Vực</td>
              <td className="px-4 py-3">
                {area_DTO && area_DTO.length > 0 ? (
                  area_DTO.map((area, index) => (
                    <div key={index} className="py-1">
                      <span>Tên khu vực: </span>{area.areaName} 
                      <p className="text-gray-600">Loại: {area.areaTypeId}</p>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500">Không có khu vực</span>
                )}
              </td>
            </tr>
            {/* Images */}
            <tr>
              <td className="px-4 py-3 font-semibold bg-gray-200 text-gray-700">Hình Ảnh</td>
              <td className="px-4 py-3 flex flex-wrap gap-2">
                {images && images.length > 0 ? (
                  images.map((img, index) => (
                    <img
                      key={index}
                      src={`/assets/${img}`}
                      alt={``}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  ))
                ) : (
                  <span className="text-gray-500">Không có hình ảnh</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Nút Chỉnh sửa */}
      <div className="flex justify-end mt-4">
        <button
          className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-x-2 hover:bg-orange-600 transition"
          onClick={() => navigate(`/dashboard/room/update/${roomId}`)}
        >
          <PencilLine size={20} /> Chỉnh Sửa
        </button>
      </div>
    </div>
  );
};

export default RoomDetail;