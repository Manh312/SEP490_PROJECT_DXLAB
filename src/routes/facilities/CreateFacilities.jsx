import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Package } from "lucide-react";
import { addFacility, fetchFacilities } from "../../redux/slices/Facilities";

const CreateFacilities = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.facilities);

  const [facility, setFacility] = useState({
    batchNumber: "",
    facilityDescription: "",
    cost: 1,
    expiredTime: "",
    quantity: 1,
    importDate: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    setFacility({ ...facility, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!facility.batchNumber) {
      toast.error("Số Lô không được để trống!");
      return;
    }
    if (!facility.facilityDescription) {
      toast.error("Mô Tả Cơ Sở Vật Chất không được để trống!");
      return;
    }
    if (!facility.expiredTime) {
      toast.error("Ngày Hết Hạn không được để trống!");
      return;
    }
    if (!facility.importDate) {
      toast.error("Ngày Nhập không được để trống!");
      return;
    }
    if (parseFloat(facility.cost) <= 0) {
      toast.error("Giá phải là số dương!");
      return;
    }
    if (parseInt(facility.quantity, 10) <= 0) {
      toast.error("Số lượng phải là số nguyên dương!");
      return;
    }

    try {
      const facilityData = {
        batchNumber: facility.batchNumber,
        facilityDescription: facility.facilityDescription,
        cost: parseFloat(facility.cost),
        expiredTime: new Date(facility.expiredTime).toISOString(),
        quantity: parseInt(facility.quantity, 10),
        importDate: new Date(facility.importDate).toISOString(),
      };

      console.log("Dữ liệu gửi lên:", facilityData);
      const res = await dispatch(addFacility(facilityData)).unwrap();
      console.log("Phản hồi từ server:", res.message);

      toast.success(res.message);
      dispatch(fetchFacilities());
      navigate("/dashboard/facilities");
    } catch (err) {
      console.error("Lỗi khi thêm facility:", err.message);
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6 shadow-xl border rounded-lg max-w-lg mx-auto mt-10 mb-30">
      <div className="text-2xl font-semibold mb-4 flex items-center">
        <Package className="mr-2" />
        <span>Thêm Cơ Sở Vật Chất</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Số Lô</label>
          <input
            type="text"
            name="batchNumber"
            value={facility.batchNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg hover:bg-gray-100"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Mô Tả Cơ Sở Vật Chất</label>
          <input
            type="text"
            name="facilityDescription"
            value={facility.facilityDescription}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg hover:bg-gray-100"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Giá</label>
          <input
            type="number"
            name="cost"
            value={facility.cost}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border rounded-lg hover:bg-gray-100"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Ngày Hết Hạn</label>
          <input
            type="date"
            name="expiredTime"
            value={facility.expiredTime}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg hover:bg-gray-100"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Số Lượng</label>
          <input
            type="number"
            name="quantity"
            value={facility.quantity}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border rounded-lg hover:bg-gray-100"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Ngày Nhập</label>
          <input
            type="date"
            name="imporDate"
            value={facility.importDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg hover:bg-gray-100"
            required
          />
        </div>

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