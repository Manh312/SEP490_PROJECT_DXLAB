import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Edit } from "lucide-react"; // Thêm Edit

const FacilitiesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { facilities, loading } = useSelector((state) => state.facilities);

  console.log(facilities);

  if (!id) {
    return <p className="text-red-500 text-center mt-10">Lỗi: ID không hợp lệ!</p>;
  }

  const facility = facilities.find((f) => f.facilityId === parseInt(id));

  if (loading) {
    return (
      <div className="text-center py-4 mt-10">
        <p className="text-orange-500 text-lg">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!facility) {
    return <p className="text-red-500 text-center mt-10">Không tìm thấy cơ sở vật chất có ID {id}!</p>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 mb-20 p-6 rounded-lg shadow-xl border transition-all">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-orange-500">
        Chi Tiết Cơ Sở Vật Chất
      </h2>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <tbody>
            <tr className="border-b bg-gray-500">
              <td className="px-4 py-3 font-semibold text-white">Số Lô</td>
              <td className="px-4 py-3 text-white">{facility.batchNumber}</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold bg-gray-200 text-gray-700">Mô Tả Cơ Sở Vật Chất</td>
              <td className="px-4 py-3">{facility.facilityDescription}</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold bg-gray-200 text-gray-700">Giá</td>
              <td className="px-4 py-3">{facility.cost}</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold bg-gray-200 text-gray-700">Ngày Nhập</td>
              <td className="px-4 py-3">{new Date(facility.importDate).toLocaleDateString("vi-VN")}</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold bg-gray-200 text-gray-700">Số Lượng</td>
              <td className="px-4 py-3">{facility.quantity}</td>
            </tr>
            <tr className="">
              <td className="px-4 py-3 font-semibold bg-gray-200 text-gray-700">Ngày Hết Hạn</td>
              <td className="px-4 py-3">{new Date(facility.expiredTime).toLocaleDateString("vi-VN")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Nút Quay lại và Chỉnh sửa */}
      <div className="flex justify-between mt-4">
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-x-2 hover:bg-gray-600 transition"
          onClick={() => {
            console.log("Navigating to /dashboard/facilities");
            navigate("/dashboard/facilities");
          }}
        >
          <ArrowLeft size={20} /> Quay Lại
        </button>
        <button
          className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-x-2 hover:bg-orange-600 transition"
          onClick={() => {
            console.log("Navigating to /dashboard/facilities/update/", facility.facilityId);
            navigate(`/dashboard/facilities/update/${facility.facilityId}`);
          }}
        >
          <Edit size={20} /> Chỉnh Sửa
        </button>
      </div>
    </div>
  );
};

export default FacilitiesDetail;