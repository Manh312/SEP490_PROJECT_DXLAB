import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PencilLine, ArrowLeft } from "lucide-react"; // Thêm ArrowLeft
import { useDispatch, useSelector } from "react-redux";
import { fetchAreaTypeById } from "../../redux/slices/AreaType";

const AreaTypeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Lấy dữ liệu từ Redux store
  const { selectedAreaType, loading, error } = useSelector((state) => state.areaTypes);

  // Gọi API lấy chi tiết loại khu vực khi component render
  useEffect(() => {
    dispatch(fetchAreaTypeById(id));
  }, [dispatch, id]);

  if (loading) return (
    <div className="text-center py-4 mt-10">
      <p className="text-orange-500 text-lg">Đang tải dữ liệu...</p>
    </div>
  );
  if (error) return (
    <p className="text-red-500 text-center mt-10">Lỗi: {error}</p>
  );
  if (!selectedAreaType) return (
    <p className="text-red-500 text-center mt-10">Không tìm thấy loại khu vực có ID {id}!</p>
  );

  const { areaTypeId, areaTypeName, areaDescription, areaCategory, size, price, isDeleted, images } = selectedAreaType;

  return (
    <div className="max-w-2xl mx-auto mt-10 mb-20 p-6 rounded-lg shadow-xl border transition-all">
      {/* Tiêu đề */}
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-orange-500">
        Chi Tiết Loại Khu Vực
      </h2>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <tbody>
            {/* Area Type ID */}
            <tr className="border-b bg-gray-500">
              <td className="px-4 py-3 font-semibold text-white">Mã Loại Khu Vực</td>
              <td className="px-4 py-3 text-white">{areaTypeId}</td>
            </tr>
            {/* Area Type Name */}
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold bg-gray-200 text-gray-700">Tên Loại Khu Vực</td>
              <td className="px-4 py-3">{areaTypeName}</td>
            </tr>
            {/* Description */}
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold bg-gray-200 text-gray-700">Mô Tả</td>
              <td className="px-4 py-3">{areaDescription}</td>
            </tr>
            {/* Category */}
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold bg-gray-200 text-gray-700">Danh Mục</td>
              <td className="px-4 py-3">{areaCategory === 1 ? "Khu vực cá nhân" : "Khu vực nhóm"}</td>
            </tr>
            {/* Size */}
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold bg-gray-200 text-gray-700">Số Lượng (Ghế)</td>
              <td className="px-4 py-3">{size} ghế</td>
            </tr>
            {/* Price */}
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold bg-gray-200 text-gray-700">Giá</td>
              <td className="px-4 py-3">{price.toLocaleString()} DXLAB Coin</td>
            </tr>
            {/* Status */}
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold bg-gray-200 text-gray-700">Trạng Thái</td>
              <td className={`px-4 py-3 ${isDeleted ? "text-red-500" : "text-green-500"}`}>
                {isDeleted ? "Đã xóa" : "Đang hoạt động"}
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
                      src={`https://localhost:9999${img}`}
                      alt={`areaType-${index}`}
                      className="w-32 h-32 object-cover rounded-md"
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

      {/* Nút Quay lại, Chỉnh sửa & Toggle Trạng thái */}
      <div className="flex justify-between mt-4 gap-4">
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-x-2 hover:bg-gray-600 transition"
          onClick={() => {
            console.log("Navigating to /dashboard/areaType");
            navigate("/dashboard/areaType");
          }}
        >
          <ArrowLeft size={20} /> Quay Lại
        </button>
        <div className="flex gap-4">
          <button
            className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-x-2 hover:bg-orange-600 transition"
            onClick={() => navigate(`/dashboard/areaType/update/${areaTypeId}`)}
          >
            <PencilLine size={20} /> Chỉnh Sửa
          </button>
        </div>
      </div>
    </div>
  );
};

export default AreaTypeDetail;