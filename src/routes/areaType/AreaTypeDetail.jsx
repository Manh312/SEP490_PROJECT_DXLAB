import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PencilLine, ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAreaTypeById } from "../../redux/slices/AreaType";

const AreaTypeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedAreaType, loading, error } = useSelector((state) => state.areaTypes);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // To track the main image being displayed
  const baseUrl = "https://localhost:9999"; // Base URL for image paths

  // Fetch area type details when the component mounts
  useEffect(() => {
    dispatch(fetchAreaTypeById(id));
  }, [dispatch, id]);

  if (loading)
    return (
      <div className="text-center py-4 mt-10">
        <p className="text-orange-500 text-lg">Đang tải dữ liệu...</p>
      </div>
    );
  if (error)
    return <p className="text-red-500 text-center mt-10">Lỗi: {error}</p>;
  if (!selectedAreaType)
    return (
      <p className="text-red-500 text-center mt-10">
        Không tìm thấy loại khu vực có ID {id}!
      </p>
    );

  const { areaTypeId, areaTypeName, areaDescription, areaCategory, size, price, isDeleted, images } = selectedAreaType;

  // Function to render images in a Shopee-style gallery
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
        {/* Main Image */}
        <div className="w-full h-96 overflow-hidden rounded-lg shadow-lg mb-4">
          <img
            src={displaySrc}
            alt={`AreaType image ${selectedImageIndex}`}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => (e.target.src = "/placeholder-image.jpg")} // Fallback image if error
          />
        </div>
        {/* Thumbnails */}
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
      {/* Title */}
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-orange-500 to-orange-700 text-transparent bg-clip-text">
        Chi Tiết Kiểu Khu Vực
      </h2>

      {/* Main Layout: Images on the left, details on the right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Column (left on desktop) */}
        <div className="lg:order-1">{renderImages(images)}</div>

        {/* Details Column (right on desktop) */}
        <div className="lg:order-2 space-y-6">
          {/* Area Type Name */}
          <div className="border-b pb-4">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
              {areaTypeName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Mã Loại Khu Vực: {areaTypeId}</p>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Trạng Thái:</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isDeleted
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {isDeleted ? "Đã xóa" : "Đang hoạt động"}
            </span>
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Danh Mục:</span>
            <span className="text-gray-800">
              {areaCategory === 1 ? "Khu vực cá nhân" : "Khu vực nhóm"}
            </span>
          </div>

          {/* Size */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Số Lượng (Ghế):</span>
            <span className="text-gray-800">{size} ghế</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Giá:</span>
            <span className="text-gray-800">{price.toLocaleString()} DXLAB Coin</span>
          </div>

          {/* Description */}
          <div>
            <span className="font-semibold text-gray-700 block mb-1">Mô Tả:</span>
            <p className="text-gray-600 bg-gray-100 p-4 rounded-lg shadow-inner">
              {areaDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Back and Edit Buttons */}
      <div className="flex justify-between mt-8">
        <button
          className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg flex items-center gap-x-2 hover:from-gray-600 hover:to-gray-700 transition-all shadow-md"
          onClick={() => navigate("/dashboard/areaType")}
        >
          <ArrowLeft size={20} /> Quay Lại
        </button>
        <button
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg flex items-center gap-x-2 hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
          onClick={() => navigate(`/dashboard/areaType/update/${areaTypeId}`)}
        >
          <PencilLine size={20} /> Chỉnh Sửa
        </button>
      </div>
    </div>
  );
};

export default AreaTypeDetail;