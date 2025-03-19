import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PencilLine, ToggleLeft, ToggleRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAreaTypeById, updateAreaType } from "../../redux/slices/AreaType";
import { toast, ToastContainer } from "react-toastify";

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

  // Xử lý cập nhật trạng thái `isDeleted`
  const handleToggleStatus = async () => {
    const updatedStatus = !selectedAreaType.isDeleted;

    try {
      const updates = [
        {
          operationType: 0,
          path: "isDeleted",
          op: "replace",
          value: updatedStatus,
        },
      ];

      const res = await dispatch(updateAreaType({ areaTypeId: id, updatedData: updates })).unwrap();
      toast.success(res.message);
       // 🟢 Fetch lại dữ liệu để cập nhật giao diện
      // 🕑 Đợi một chút trước khi fetch lại
    setTimeout(() => {
      dispatch(fetchAreaTypeById(id));
    }, 1000);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Hiển thị trạng thái tải dữ liệu hoặc lỗi
  if (loading) return <p className="text-blue-500 text-center">Đang tải thông tin loại khu vực...</p>;
  if (error) return <p className="text-red-500 text-center">Lỗi: {error}</p>;
  if (!selectedAreaType) return <p className="text-gray-500 text-center">Không tìm thấy loại khu vực có ID {id}!</p>;

  // Lấy dữ liệu từ API response mới
  const { areaTypeId, areaTypeName, areaDescription, areaCategory, size, price, isDeleted, images } = selectedAreaType;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 rounded-lg shadow-lg">
      <ToastContainer />
      <h2 className="text-2xl font-semibold text-center mb-4 text-blue-600">Chi Tiết Loại Khu Vực</h2>
      <table className="w-full border-collapse border border-gray-300">
        <tbody>
          <tr className="border-b">
            <td className="px-4 py-3 font-semibold border-r border-gray-300">Tên Loại Khu Vực</td>
            <td className="px-4 py-3">{areaTypeName}</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-3 font-semibold border-r border-gray-300">Mô Tả</td>
            <td className="px-4 py-3">{areaDescription}</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-3 font-semibold border-r border-gray-300">Danh Mục</td>
            <td className="px-4 py-3">{areaCategory === 1 ? "Khu vực cá nhân" : "Khu vực nhóm"}</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-3 font-semibold border-r border-gray-300">Số lượng (ghế)</td>
            <td className="px-4 py-3">{size} ghế</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-3 font-semibold border-r border-gray-300">Giá</td>
            <td className="px-4 py-3">{price.toLocaleString()} VNĐ</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-3 font-semibold border-r border-gray-300">Trạng Thái</td>
            <td className={`px-4 py-3 font-semibold ${isDeleted ? "text-red-500" : "text-green-500"}`}>
              {isDeleted ? "Không hoạt động" : "Đang hoạt động"}
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
                    alt={`areaType-${index}`}
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

      {/* Nút Chỉnh sửa & Toggle Trạng thái */}
      <div className="flex gap-x-3 mt-4">
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center gap-x-2 shadow-md hover:bg-yellow-600 transition"
          onClick={() => navigate(`/dashboard/areaType/update/${areaTypeId}`)}
        >
          <PencilLine size={20} /> Chỉnh Sửa
        </button>
        <button
          className={`px-4 py-2 rounded-lg flex items-center gap-x-2 shadow-md transition ${
            isDeleted ? "bg-green-500 text-white hover:bg-green-600" : "bg-red-500 text-white hover:bg-red-600"
          }`}
          onClick={handleToggleStatus}
        >
          {isDeleted ? <ToggleLeft size={20} /> : <ToggleRight size={20} />}
          {isDeleted ? "Kích hoạt" : "Vô hiệu hóa"}
        </button>
      </div>
    </div>
  );
};

export default AreaTypeDetail;
