import { useNavigate, useParams } from "react-router-dom";
import { MapPin, ArrowLeft } from "lucide-react";
import { areas } from "../../constants"; // Giả sử dữ liệu khu vực được lấy từ đây
import { useEffect, useState } from "react";

const ManageAreaDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy ID từ URL
  const [area, setArea] = useState(null);

  // Tìm khu vực dựa trên ID (giả lập dữ liệu từ constants)
  useEffect(() => {
    const selectedArea = areas.find((a) => a.id === id);
    if (selectedArea) {
      setArea(selectedArea);
    } else {
      // Nếu không tìm thấy khu vực, có thể chuyển hướng hoặc hiển thị thông báo
      navigate("/dashboard/areas"); // Quay lại danh sách nếu không tìm thấy
    }
  }, [id, navigate]);

  if (!area) {
    return (
      <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
        <div className="w-full border border-gray-600 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">Không tìm thấy khu vực</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <div className="w-full border border-gray-600 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <MapPin className="h-6 w-6 text-blue-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Chi Tiết Khu Vực: {area.name}
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/dashboard/areas")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Quay Lại</span>
            </button>
          </div>
        </div>

        {/* Area Details Section */}
        <div className="mb-6 p-4 rounded-lg shadow-sm bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Thông tin chi tiết */}
            <div className="flex flex-col gap-2">
              <p className="text-sm md:text-base">
                <span className="font-medium">Tên Khu Vực:</span> {area.name}
              </p>
              <p className="text-sm md:text-base">
                <span className="font-medium">Loại (Type):</span> {area.type}
              </p>
              <p className="text-sm md:text-base">
                <span className="font-medium">Trạng Thái:</span>{" "}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full font-normal text-xs md:text-sm ${
                    area.Room === "Hoạt động"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {area.Room === "Hoạt động" ? "Hoạt động" : "Không hoạt động"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information (Có thể mở rộng) */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Thông Tin Bổ Sung</h3>
          <p className="text-sm text-gray-600">
            (Hiện tại chưa có thông tin bổ sung. Có thể thêm các trường khác như mô tả, vị trí, v.v. nếu cần.)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManageAreaDetail;