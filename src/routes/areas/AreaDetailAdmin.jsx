import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MapPin, ArrowLeft, ChevronLeft, ChevronRight, PencilLine, Map } from "lucide-react";

const AreaDetailAdmin = () => {
  const { id } = useParams(); // Get categoryId from URL
  const navigate = useNavigate();

  // Get areaTypeCategories from Redux store
  const { areaTypeCategories, loading } = useSelector((state) => state.areaCategory);

  const [areaDetail, setAreaDetail] = useState(null);
  const [imageIndex, setImageIndex] = useState(0); // Track current image index
  const baseUrl = "https://localhost:9999";

  // Find the area detail by comparing categoryId with the IDs in areaTypeCategories
  useEffect(() => {
    if (id && areaTypeCategories && areaTypeCategories.length > 0) {
      const foundArea = areaTypeCategories.find(
        (area) => area.categoryId === parseInt(id)
      );
      setAreaDetail(foundArea || null);
    }
  }, [id, areaTypeCategories]);

  // Handle image navigation
  const validImages = Array.isArray(areaDetail?.images) && areaDetail.images.length > 0 ? areaDetail.images : [];
  const prevImage = () => {
    setImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };
  const nextImage = () => {
    setImageIndex((prev) => (prev + 1) % validImages.length);
  };

  const displayImageSrc = validImages.length > 0
    ? typeof validImages[imageIndex] === "string"
      ? validImages[imageIndex].startsWith("http")
        ? validImages[imageIndex]
        : `${baseUrl}${validImages[imageIndex]}`
      : "/placeholder-image.jpg"
    : "/placeholder-image.jpg";

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500 text-lg">Đang tải dữ liệu...</p>
      </div>
    );
  }

  // Handle case when area is not found
  if (!areaDetail) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <MapPin className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">Không tìm thấy khu vực.</p>
      </div>
    );
  }

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <div className="w-full border border-gray-300 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 bg-white">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <Map className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
              Chi Tiết Khu Vực: {areaDetail.title}
            </h2>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/dashboard/area")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Quay Lại</span>
            </button>
            <button
              onClick={() => navigate(`/dashboard/area/update/${areaDetail.categoryId}`)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md"
            >
              <PencilLine size={20} />
              <span className="hidden sm:inline">Chỉnh Sửa</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Section: Images */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-md h-80 group">
              <img
                src={displayImageSrc}
                alt={`Area image ${imageIndex}`}
                className="w-full h-full object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                onError={(e) => (e.target.src = "/placeholder-image.jpg")}
              />
              {validImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {validImages.map((_, idx) => (
                      <span
                        key={idx}
                        className={`w-2 h-2 rounded-full ${
                          idx === imageIndex ? "bg-white" : "bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {validImages.length > 0 ? `Ảnh ${imageIndex + 1}/${validImages.length}` : "Không có ảnh"}
            </p>
          </div>

          {/* Right Section: Details */}
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700">Tên Khu Vực</h3>
              <p className="text-gray-600">{areaDetail.title}</p>
            </div>

            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700">Mô Tả</h3>
              <p className="text-gray-600">{areaDetail.categoryDescription}</p>
            </div>

            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700">Trạng Thái</h3>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full font-medium text-sm ${
                  areaDetail.status === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {areaDetail.status === 1 ? "Hoạt động" : "Không hoạt động"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AreaDetailAdmin;