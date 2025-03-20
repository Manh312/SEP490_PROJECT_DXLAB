import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const FacilitiesDetail = () => {
  const { id } = useParams();
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
    </div>
  );
};

export default FacilitiesDetail;