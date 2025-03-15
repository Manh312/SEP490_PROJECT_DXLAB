import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Package } from "lucide-react";
import { addFacility, fetchFacilities } from "../../redux/slices/Facilities";

const CreateFacilities = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.facilities);

  const [formData, setFormData] = useState({
    batchNumber: "",
    facilityDescription: "",
    cost: "",
    expiredTime: "",
    quantity: 1,
    imporDate: new Date().toISOString().split("T")[0], // Mặc định là ngày hiện tại
  });

  // Cập nhật dữ liệu nhập vào
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý thêm facility
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const facilityData = {
        batchNumber: formData.batchNumber,
        facilityDescription: formData.facilityDescription,
        cost: parseFloat(formData.cost),
        expiredTime: new Date(formData.expiredTime).toISOString(), // Giữ định dạng ISO
        quantity: parseInt(formData.quantity, 10),
        imporDate: new Date(formData.imporDate).toISOString(), // Giữ định dạng ISO
      };

      // Bọc dữ liệu trong key "facilityDto" như API yêu cầu
      const payload = { facilityDto: facilityData };

      console.log("Dữ liệu gửi lên:", payload); // Debug dữ liệu gửi

      const res = await dispatch(addFacility(payload)).unwrap();
      console.log("Phản hồi từ server:", res); // Debug phản hồi

      toast.success(res.message || "Thêm cơ sở vật chất thành công!");
      dispatch(fetchFacilities()); // Reload danh sách
      navigate("/dashboard/facilities");
    } catch (err) {
      console.error("Lỗi khi thêm facility:", err);
      const errorMessage =
        err?.message || err?.data?.message || "Có lỗi xảy ra khi thêm facility!";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="p-6 shadow-xl border rounded-lg max-w-lg mx-auto mt-10 mb-30">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="text-2xl font-semibold mb-4 flex items-center">
        <Package className="mr-2" />
        <span>Thêm Cơ Sở Vật Chất</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Số lô */}
        <div>
          <label className="block font-medium">Số Lô</label>
          <input
            type="text"
            name="batchNumber"
            value={formData.batchNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg hover:bg-gray-100"
            required
          />
        </div>

        {/* Mô tả cơ sở vật chất */}
        <div>
          <label className="block font-medium">Mô Tả Cơ Sở Vật Chất</label>
          <input
            type="text"
            name="facilityDescription"
            value={formData.facilityDescription}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg hover:bg-gray-100"
            required
          />
        </div>

        {/* Giá */}
        <div>
          <label className="block font-medium">Giá</label>
          <input
            type="number"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border rounded-lg hover:bg-gray-100"
            required
          />
        </div>

        {/* Ngày hết hạn */}
        <div>
          <label className="block font-medium">Ngày Hết Hạn</label>
          <input
            type="date"
            name="expiredTime"
            value={formData.expiredTime}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg hover:bg-gray-100"
            required
          />
        </div>

        {/* Số lượng */}
        <div>
          <label className="block font-medium">Số Lượng</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border rounded-lg hover:bg-gray-100"
            required
          />
        </div>

        {/* Ngày nhập */}
        <div>
          <label className="block font-medium">Ngày Nhập</label>
          <input
            type="date"
            name="imporDate"
            value={formData.imporDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg hover:bg-gray-100"
            required
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard/facilities")}
            className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
            disabled={loading}
          >
            {loading ? "Đang thêm..." : "Thêm Cơ Sở Vật Chất"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFacilities;