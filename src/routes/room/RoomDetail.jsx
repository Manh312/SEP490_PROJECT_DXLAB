import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PencilLine, ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getRoomById } from "../../redux/slices/Room";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedRoom, loading, error } = useSelector((state) => state.rooms);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // Để theo dõi ảnh chính đang hiển thị
  const baseUrl = "https://localhost:9999"; // Base URL cho đường dẫn ảnh

  useEffect(() => {
    dispatch(getRoomById(id));
  }, [dispatch, id]);

  if (loading)
    return (
      <div className="text-center py-4 mt-10">
        <p className="text-orange-500 text-lg">Đang tải dữ liệu...</p>
      </div>
    );
  if (error)
    return <p className="text-red-500 text-center mt-10">Lỗi: {error}</p>;
  if (!selectedRoom)
    return (
      <p className="text-red-500 text-center mt-10">
        Không tìm thấy phòng có ID {id}!
      </p>
    );

  const {
    roomId,
    roomName,
    roomDescription,
    capacity,
    status,
    images,
    area_DTO,
  } = selectedRoom;

  // Hàm hiển thị ảnh với phong cách giống Shopee
  const renderImages = (images) => {
    const validImages = Array.isArray(images) && images.length > 0 ? images : [];
    if (!validImages.length) {
      return (
        <div className="w-full h-96 flex items-center justify-center bg-gray-200 rounded-lg">
          <span className="text-gray-500 text-lg">Không có ảnh</span>
        </div>
      );
    }

    const imageSrc = validImages[selectedImageIndex];
    const displaySrc =
      typeof imageSrc === "string"
        ? imageSrc.startsWith("http")
          ? imageSrc
          : `${baseUrl}/${imageSrc}`
        : "/placeholder-image.jpg";

    return (
      <div className="flex flex-col items-center">
        {/* Ảnh chính */}
        <div className="w-full h-96 overflow-hidden rounded-lg shadow-lg mb-4">
          <img
            src={displaySrc}
            alt={`Room image ${selectedImageIndex}`}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => (e.target.src = "/placeholder-image.jpg")} // Ảnh dự phòng nếu lỗi
          />
        </div>
        {/* Các ảnh thumbnail */}
        <div className="flex gap-2 overflow-x-auto w-full justify-center">
          {validImages.map((img, idx) => {
            const thumbnailSrc =
              typeof img === "string"
                ? img.startsWith("http")
                  ? img
                  : `${baseUrl}/${img}`
                : "/placeholder-image.jpg";
            return (
              <img
                key={idx}
                src={thumbnailSrc}
                alt={`Thumbnail ${idx}`}
                className={`w-16 h-16 object-cover rounded-md cursor-pointer transition-all duration-300 border-2 ${
                  idx === selectedImageIndex
                    ? "border-orange-500 opacity-100"
                    : "border-gray-300 opacity-70 hover:opacity-100"
                }`}
                onClick={() => setSelectedImageIndex(idx)}
                onError={(e) => (e.target.src = "/placeholder-image.jpg")}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 mb-20 p-6 bg-white rounded-xl shadow-2xl transition-all">
      {/* Tiêu đề */}
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-orange-500 to-orange-700 text-transparent bg-clip-text">
        Chi Tiết Phòng
      </h2>

      {/* Layout chính: Ảnh bên trái, thông tin bên phải */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cột ảnh (bên trái trên desktop) */}
        <div className="lg:order-1">{renderImages(images)}</div>

        {/* Cột thông tin (bên phải trên desktop) */}
        <div className="lg:order-2 space-y-6">
          {/* Tên Phòng */}
          <div className="border-b pb-4">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
              {roomName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Mã Phòng: {roomId}</p>
          </div>

          {/* Trạng Thái */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Trạng Thái:</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                status === 0
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {status === 0 ? "Chưa sẵn sàng" : "Sẵn sàng"}
            </span>
          </div>

          {/* Sức Chứa */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Sức Chứa:</span>
            <span className="text-gray-800">{capacity} người</span>
          </div>

          {/* Mô Tả */}
          <div>
            <span className="font-semibold text-gray-700 block mb-1">
              Mô Tả:
            </span>
            <p className="text-gray-600 bg-gray-100 p-4 rounded-lg shadow-inner">
              {roomDescription}
            </p>
          </div>

          {/* Khu Vực */}
          <div>
            <span className="font-semibold text-gray-700 block mb-2">
              Khu Vực:
            </span>
            {area_DTO && area_DTO.length > 0 ? (
              <div className="space-y-3">
                {area_DTO.map((area, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-all"
                  >
                    <p className="font-medium text-gray-800">{area.areaName}</p>
                    <p className="text-sm text-gray-600">
                      Loại: {area.areaTypeName}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-gray-500">Không có khu vực</span>
            )}
          </div>
        </div>
      </div>

      {/* Nút Quay lại và Chỉnh sửa */}
      <div className="flex justify-between mt-8">
        <button
          className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg flex items-center gap-x-2 hover:from-gray-600 hover:to-gray-700 transition-all shadow-md"
          onClick={() => navigate("/dashboard/room")}
        >
          <ArrowLeft size={20} /> Quay Lại
        </button>
        <button
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg flex items-center gap-x-2 hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
          onClick={() => navigate(`/dashboard/room/update/${roomId}`)}
        >
          <PencilLine size={20} /> Chỉnh Sửa
        </button>
      </div>
    </div>
  );
};

export default RoomDetail;