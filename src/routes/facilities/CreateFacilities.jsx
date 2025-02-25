import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateFacilities = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    quantity: 1,
    status: "Còn hàng",
  });

  // Cập nhật dữ liệu nhập vào
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý thêm sản phẩm
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thêm thành công! Tên: ${formData.name}, Số lượng: ${formData.quantity}, Tình trạng: ${formData.status}`);
    navigate("/dashboard/facilities"); // Quay lại danh sách
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Thêm Cơ Sở Vật Chất</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold">Tên Sản Phẩm:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold">Số Lượng:</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold">Tình Trạng:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="Còn hàng">Còn hàng</option>
            <option value="Hết hàng">Hết hàng</option>
          </select>
        </div>
        <button type="submit" className="bg-green-500 text-white p-2 rounded hover:bg-green-600">
          Thêm Sản Phẩm
        </button>
      </form>
    </div>
  );
};

export default CreateFacilities;
