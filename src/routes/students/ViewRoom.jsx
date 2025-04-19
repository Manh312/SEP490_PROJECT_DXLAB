import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchRooms } from "../../redux/slices/Room";
import { AreaChartIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { FaSpinner } from "react-icons/fa";

const ViewRoom = () => {
  const dispatch = useDispatch();
  const { rooms, loading, error } = useSelector((state) => state.rooms);
  const [imageIndices, setImageIndices] = useState({});
  const baseUrl = "https://localhost:9999";

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  // Auto-slide effect for images
  useEffect(() => {
    const timers = {};
    rooms.forEach((room) => {
      if (room.images && room.images.length > 1) {
        timers[room.roomId] = setInterval(() => {
          setImageIndices((prev) => {
            const currentIndex = prev[room.roomId] || 0;
            const nextIndex = (currentIndex + 1) % room.images.length;
            return { ...prev, [room.roomId]: nextIndex };
          });
        }, 3000); // Change image every 3 seconds
      }
    });

    return () => {
      Object.values(timers).forEach((timer) => clearInterval(timer));
    };
  }, [rooms]);

  const activeRooms = rooms.filter((room) => room.status === 1);

  const renderImages = (images, roomId) => {
    const validImages = Array.isArray(images) && images.length > 0 ? images : [];
    if (!validImages.length) {
      return (
        <div className="w-full h-56 flex items-center justify-center bg-gray-200 rounded-t-lg">
          <span className="text-gray-500 text-sm">Không có ảnh</span>
        </div>
      );
    }

    const currentIndex = imageIndices[roomId] || 0;

    const prevImage = () => {
      setImageIndices((prev) => ({
        ...prev,
        [roomId]: (currentIndex - 1 + validImages.length) % validImages.length,
      }));
    };

    const nextImage = () => {
      setImageIndices((prev) => ({
        ...prev,
        [roomId]: (currentIndex + 1) % validImages.length,
      }));
    };

    const imageSrc = validImages[currentIndex];
    const displaySrc =
      typeof imageSrc === "string"
        ? imageSrc.startsWith("http")
          ? imageSrc
          : `${baseUrl}/${imageSrc}`
        : "/placeholder-image.jpg";

    return (
      <div className="relative w-full h-56 group">
        <img
          src={displaySrc}
          alt={`Room ${roomId} - image ${currentIndex + 1}`}
          className="w-full h-full object-cover rounded-t-lg shadow-md transition-transform duration-300 group-hover:scale-105"
          onError={(e) => (e.target.src = "/placeholder-image.jpg")}
        />
        {validImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {validImages.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx === currentIndex ? "bg-white" : "bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 flex flex-col items-center text-center mt-16 mb-20">
      <h2 className="text-4xl mb-10 tracking-wide">
        Danh sách phòng tại{" "}
        <span className="bg-gradient-to-r from-orange-500 to-orange-800 text-transparent bg-clip-text">
          DXLAB Co-Working Space
        </span>
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
          <p className="text-orange-500 font-medium">Đang tải danh sách phòng...</p>
        </div>
      ) : error ? (
        <p className="text-red-500">Lỗi: {error}</p>
      ) : activeRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <AreaChartIcon className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">Không tìm thấy phòng tồn tại trên DXLAB</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl">
          {activeRooms.map((room) => (
            <div
              key={room.roomId}
              className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 flex flex-col"
            >
              {renderImages(room.images, room.roomId)}
              <div className="p-6 text-left flex flex-col flex-grow">
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  Phòng {room.roomName}
                </h3>
                <p className="text-gray-600 text-sm flex-grow">
                  {room.roomDescription}
                </p>
                <Link to={`/room/${room.roomId}`} className="mt-4">
                  <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg text-lg font-semibold transition duration-300">
                    Xem chi tiết
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewRoom;