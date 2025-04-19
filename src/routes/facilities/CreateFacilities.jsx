import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Package, ArrowLeft, Box, Tag, DollarSign, Calendar, PlusCircle } from "lucide-react";
import { addFacility, fetchFacilities } from "../../redux/slices/Facilities";
import { motion } from "framer-motion";

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen py-4 px-3 sm:px-6 lg:px-8 overflow-x-hidden">
      <motion.div
        className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header với gradient */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-700 p-4 sm:p-6">
          <div className="flex flex-row justify-center items-center p-4 gap-2">
            <PlusCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <h2 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-white text-center">
              Thêm Cơ Sở Vật Chất
            </h2>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Số Lô */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Box className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                      Số Lô <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="batchNumber"
                      value={facility.batchNumber}
                      onChange={handleChange}
                      placeholder="Nhập số lô"
                      className="w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out"
                      required
                    />
                  </div>
                </div>
              </motion.div>

              {/* Tiêu Đề Cơ Sở Vật Chất */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                      Tiêu Đề Cơ Sở Vật Chất <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="facilityTitle"
                      value={facility.facilityTitle}
                      onChange={handleChange}
                      placeholder="Nhập tiêu đề cơ sở vật chất"
                      className="w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out"
                      required
                    />
                  </div>
                </div>
              </motion.div>

              {/* Giá */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                      Giá <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="cost"
                        value={facility.cost}
                        min={0}
                        step="0.01"
                        onChange={handleNumberChange}
                        className="w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 pr-16 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out"
                        placeholder="Nhập giá"
                        required
                      />
                      <span className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                        DXL
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Ngày Hết Hạn */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                      Ngày Hết Hạn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="expiredTime"
                      value={facility.expiredTime}
                      onChange={handleChange}
                      className="w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out"
                      required
                    />
                  </div>
                </div>
              </motion.div>

              {/* Số Lượng */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Box className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                      Số Lượng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={facility.quantity}
                      min={0}
                      onChange={handleNumberChange}
                      className="w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out"
                      required
                    />
                  </div>
                </div>
              </motion.div>

              {/* Ngày Nhập */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                      Ngày Nhập <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="importDate"
                      value={facility.importDate}
                      onChange={handleChange}
                      className="w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8"
            variants={itemVariants}
          >
            <button
              type="button"
              onClick={() => navigate("/dashboard/facilities")}
              className="w-full sm:w-auto bg-gray-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-x-2 hover:bg-gray-600 transition-all shadow-md text-sm sm:text-base font-normal"
              disabled={loading}
            >
              <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> Quay Lại
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-x-2 hover:from-orange-600 hover:to-orange-800 transition-all shadow-md disabled:bg-orange-300 disabled:cursor-not-allowed text-sm sm:text-base font-normal"
            >
              {loading ? (
                <svg
                  className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <>
                  <Package size={14} className="sm:w-4 sm:h-4" /> Thêm Cơ Sở Vật Chất
                </>
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateFacilities;