import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { products } from "../../constants";

const UpdateFacilities = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const facility = products.find((p) => p.id.toString() === id);
  
  const [formData, setFormData] = useState({
    name: facility?.name || "",
    quantity: facility?.quantity || 0,
    status: facility?.status || "Còn hàng",
  });

  if (!facility) {
    return <p className="text-red-500">Không tìm thấy cơ sở vật chất có ID {id}!</p>;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dữ liệu cập nhật:", formData);
    alert("Cập nhật thành công!");
    navigate("/dashboard/facilities"); // Chuyển hướng sau khi cập nhật
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-semibold text-center mb-4 text-blue-600">Cập Nhật Cơ Sở Vật Chất</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Tên:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block font-semibold">Số Lượng:</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block font-semibold">Tình Trạng:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg"
          >
            <option value="Còn hàng">Còn hàng</option>
            <option value="Hết hàng">Hết hàng</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
          Lưu Cập Nhật
        </button>
      </form>
    </div>
  );
};

export default UpdateFacilities;
