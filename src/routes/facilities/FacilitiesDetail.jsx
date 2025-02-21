import { useParams } from "react-router-dom";
import { products } from "../../constants";

const FacilitiesDetail = () => {
  const { id } = useParams();

  if (!id) {
    return <p className="text-red-500">Lỗi: ID không hợp lệ!</p>;
  }

  const product = products.find((p) => p.id.toString() === id);

  if (!product) {
    return <p className="text-red-500">Không tìm thấy sản phẩm có ID {id}!</p>;
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-semibold text-center mb-4 text-blue-600">Chi tiết sản phẩm</h2>
      <table className="w-full border-collapse border border-gray-300">
        <tbody>
          <tr className="border-b">
            <td className="px-4 py-3 font-semibold bg-gray-200">Tên Sản Phẩm</td>
            <td className="px-4 py-3">{product.name}</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-3 font-semibold bg-gray-200">Số Lượng</td>
            <td className="px-4 py-3 text-center">{product.quantity}</td>
          </tr>
          <tr>
            <td className="px-4 py-3 font-semibold bg-gray-200">Tình Trạng</td>
            <td className={`px-4 py-3 text-center font-semibold ${product.status === "Còn hàng" ? "text-green-500" : "text-red-500"}`}>
              {product.status}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default FacilitiesDetail;
