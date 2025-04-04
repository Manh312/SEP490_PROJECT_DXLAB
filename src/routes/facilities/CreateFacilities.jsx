import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Package, X } from "lucide-react";
import { addFacility, fetchFacilities } from "../../redux/slices/Facilities";
import { FaTag, FaCalendarAlt, FaBox, FaDollarSign, FaFileAlt } from "react-icons/fa";

const CreateFacilities = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.facilities);

  const [facility, setFacility] = useState({
    batchNumber: "",
    facilityTitle: "",
    cost: 0,
    expiredTime: "",
    quantity: 0,
    importDate: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFacility({ ...facility, [name]: value });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFacility({ ...facility, [name]: value === "" ? "" : parseFloat(value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!facility.batchNumber) {
      toast.error("Số Lô không được để trống!");
      return;
    }
    if (!facility.facilityTitle) {
      toast.error("Tiêu Đề Cơ Sở Vật Chất không được để trống!");
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
        facilityTitle: facility.facilityTitle,
        cost: parseFloat(facility.cost),
        expiredTime: new Date(facility.expiredTime).toISOString(),
        quantity: parseInt(facility.quantity, 10),
        importDate: new Date(facility.importDate).toISOString(),
      };
      const res = await dispatch(addFacility(facilityData)).unwrap();
      toast.success(res.message);
      dispatch(fetchFacilities());
      navigate("/dashboard/facilities");
    } catch (err) {
      toast.error(err.message || "Lỗi khi thêm cơ sở vật chất!");
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl rounded-xl border shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl">
        <div>
          <h2 className="text-3xl font-bold text-center text-orange-500">Thêm Cơ Sở Vật Chất</h2>
          <p className="mt-2 text-sm text-center text-gray-600">Tạo mới một cơ sở vật chất cho hệ thống</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột bên trái */}
            <div className="space-y-6">
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <FaBox className="mr-2 text-orange-500" /> Số Lô
                  </span>
                </label>
                <input
                  type="text"
                  name="batchNumber"
                  value={facility.batchNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out h-12"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <FaTag className="mr-2 text-orange-500" /> Tiêu Đề Cơ Sở Vật Chất
                  </span>
                </label>
                <input
                  type="text"
                  name="facilityTitle"
                  value={facility.facilityTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out h-12"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <FaDollarSign className="mr-2 text-orange-500" /> Giá
                  </span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    name="cost"
                    value={facility.cost}
                    min={0}
                    step="0.01"
                    onChange={handleNumberChange}
                    className="w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out h-12"
                    required
                  />
                  <span className="absolute right-3 text-gray-600">DXLAB Coin</span>
                </div>
              </div>
            </div>

            {/* Cột bên phải */}
            <div className="space-y-6">
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-orange-500" /> Ngày Hết Hạn
                  </span>
                </label>
                <input
                  type="date"
                  name="expiredTime"
                  value={facility.expiredTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out h-12"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <FaBox className="mr-2 text-orange-500" /> Số Lượng
                  </span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={facility.quantity}
                  min={0}
                  onChange={handleNumberChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out h-12"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-orange-500" /> Ngày Nhập
                  </span>
                </label>
                <input
                  type="date"
                  name="importDate" // Fixed typo from "imporDate" to "importDate"
                  value={facility.importDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out h-12"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/facilities")}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 ease-in-out"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <>
                  <Package className="mr-2" /> Thêm Cơ Sở Vật Chất
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFacilities;