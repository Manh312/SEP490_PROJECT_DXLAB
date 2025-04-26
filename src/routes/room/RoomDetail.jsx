import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getRoomById } from "../../redux/slices/Room";
import { Home, Power, Users, FileText, Map, ArrowLeft, PencilLine, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedRoom, loading, error } = useSelector((state) => state.rooms);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const baseUrl = "https://localhost:9999";

  useEffect(() => {
    dispatch(getRoomById(id));
  }, [dispatch, id]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 mb-200">
        <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
        <p className="text-orange-500 text-base sm:text-lg font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-red-500 text-base sm:text-lg font-normal text-center">
          Lỗi: {error}
        </p>
      </div>
    );
  }

  if (!selectedRoom) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <Home className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-base sm:text-lg font-normal text-center">
          Không tìm thấy phòng có ID {id}!
        </p>
      </div>
    );
  }

  const { roomId, roomName, roomDescription, capacity, status, images, area_DTO } = selectedRoom;

  // Image rendering function (synced with AreaTypeDetail)
  const renderImages = () => {
    const validImages = Array.isArray(images) && images.length > 0 ? images : [];
    const containerClasses = "relative w-full max-w-md h-64 sm:h-80 lg:h-96 group";

    if (!validImages.length) {
      return (
        <div className={containerClasses}>
          <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg shadow-md">
            <span className="text-gray-500 text-sm sm:text-base font-medium">Không có ảnh</span>
          </div>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-normal text-gray-500 text-center">
            Không có ảnh
          </p>
        </div>
      );
    }

    const prevImage = () => {
      setSelectedImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    };

    const nextImage = () => {
      setSelectedImageIndex((prev) => (prev + 1) % validImages.length);
    };

    const imageSrc = validImages[selectedImageIndex];
    const displaySrc =
      typeof imageSrc === "string"
        ? imageSrc.startsWith("http")
          ? imageSrc
          : `${baseUrl}/${imageSrc}`
        : "/placeholder-image.jpg";

    return (
      <div className={containerClasses}>
        <img
          src={displaySrc}
          alt={`Room image ${selectedImageIndex}`}
          className="w-full h-full object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
          onError={(e) => (e.target.src = "/placeholder-image.jpg")}
        />
        {validImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-70 text-white p-2 sm:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-90"
            >
              <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-70 text-white p-2 sm:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-90"
            >
              <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
            <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2">
              {validImages.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${idx === selectedImageIndex ? "bg-orange-500 scale-125" : "bg-gray-300"}`}
                />
              ))}
            </div>
          </>
        )}
        {/* Thumbnails */}
        <div className="flex gap-2 overflow-x-auto w-full justify-center mt-2 sm:mt-3">
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
                className={`w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md cursor-pointer transition-all duration-300 border-2 ${idx === selectedImageIndex ? "border-orange-500 opacity-100" : "border-gray-300 opacity-70 hover:opacity-100"}`}
                onClick={() => setSelectedImageIndex(idx)}
                onError={(e) => (e.target.src = "/placeholder-image.jpg")}
              />
            );
          })}
        </div>
        <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-normal text-gray-500 text-center">
          {validImages.length > 0 ? `Ảnh ${selectedImageIndex + 1}/${validImages.length}` : "Không có ảnh"}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-4 px-3 sm:px-6 lg:px-8 overflow-x-hidden mb-20">
      <motion.div
        className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header với gradient */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-700 p-4 sm:p-6">
          <div className="flex flex-row justify-center items-center p-4 gap-2">
            <Home className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <h2 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-white text-center">
              Chi Tiết Phòng: {roomName}
            </h2>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Section: Images */}
            <motion.div className="flex flex-col items-center" variants={itemVariants}>
              {renderImages()}
            </motion.div>

            {/* Right Section: Details */}
            <motion.div className="space-y-4 sm:space-y-6" variants={itemVariants}>
              {/* Tên Phòng */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Home className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Tên Phòng</p>
                    <p className="text-sm sm:text-base font-normal text-gray-800 truncate">{roomName}</p>
                  </div>
                </div>
              </motion.div>

              {/* Trạng Thái */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Power className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Trạng Thái</p>
                    <span
                      className={`inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-normal text-xs sm:text-sm transition-all duration-300 ${status === 0 ? "bg-red-100 text-red-800 hover:bg-red-200" : "bg-green-100 text-green-800 hover:bg-green-200"}`}
                    >
                      {status === 0 ? "Chưa sẵn sàng" : "Sẵn sàng"}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Sức Chứa */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Sức Chứa</p>
                    <p className="text-sm sm:text-base font-normal text-gray-800 truncate">{capacity} người</p>
                  </div>
                </div>
              </motion.div>

              {/* Mô Tả */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-500">Mô Tả</p>
                    <div className="max-h-32 sm:max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <p className="text-sm sm:text-base font-normal text-gray-800">{roomDescription}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Khu Vực */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Map className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Khu Vực</p>
                    {area_DTO && area_DTO.length > 0 ? (
                      <div className="space-y-2 mt-2">
                        {area_DTO.map((area, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-2 text-sm sm:text-base font-normal text-gray-800 ${index < area_DTO.length - 1 ? "border-b border-gray-200 pb-2" : ""}`}
                          >
                            <span className="text-orange-600">•</span>
                            <p className="truncate">
                              {area.areaName} - Loại: {area.areaTypeName}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm sm:text-base font-normal text-gray-500 truncate mt-2">
                        Không có khu vực
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8"
            variants={itemVariants}
          >
            <button
              onClick={() => navigate("/dashboard/room")}
              className="w-full sm:w-auto bg-gray-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-x-2 hover:bg-gray-600 transition-all shadow-md text-sm sm:text-base font-normal"
            >
              <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> Quay Lại
            </button>
            <button
              onClick={() => navigate(`/dashboard/room/update/${roomId}`)}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-x-2 hover:from-orange-600 hover:to-orange-800 transition-all shadow-md text-sm sm:text-base font-normal"
            >
              <PencilLine size={14} className="sm:w-4 sm:h-4" /> Chỉnh Sửa
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default RoomDetail;