import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Package, DollarSign, Calendar, Hash } from "lucide-react";
import { motion } from "framer-motion";
import { MdOutlineFormatListNumberedRtl } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";

const FacilitiesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { facilities, loading } = useSelector((state) => state.facilities);

  if (!id) {
    return (
      <p className="text-red-500 text-center mt-10 text-base sm:text-lg font-normal">
        Lỗi: ID không hợp lệ!
      </p>
    );
  }

  const facility = facilities.find((f) => f.facilityId === parseInt(id));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 mt-50 mb-200">
        <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
        <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!facility) {
    return (
      <p className="text-red-500 text-center mt-10 text-base sm:text-lg font-normal">
        Không tìm thấy cơ sở vật chất có ID {id}!
      </p>
    );
  }

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
    <div className="min-h-screen py-4 px-3 sm:px-6 lg:px-8 overflow-x-hidden mb-20">
      <motion.div
        className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header với gradient */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-700 p-4 sm:p-6">
          <div className="flex flex-col items-center gap-2">
            <Package className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <h2 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-white text-center">
              Chi Tiết Cơ Sở Vật Chất
            </h2>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {/* Số lô */}
            <motion.div
              className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-orange-100 rounded-full p-2">
                  <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Số Lô</p>
                  <p className="text-sm sm:text-base font-normal text-gray-800 truncate">{facility.batchNumber}</p>
                </div>
              </div>
            </motion.div>

            {/* Tiêu đề cơ sở vật chất */}
            <motion.div
              className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-orange-100 rounded-full p-2">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Tiêu Đề</p>
                  <p className="text-sm sm:text-base font-normal text-gray-800 truncate">{facility.facilityTitle}</p>
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
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Giá</p>
                  <p className="text-sm sm:text-base font-normal text-gray-800 truncate">{facility.cost} DXL</p>
                </div>
              </div>
            </motion.div>

            {/* Ngày nhập */}
            <motion.div
              className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-orange-100 rounded-full p-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Ngày Nhập</p>
                  <p className="text-sm sm:text-base font-normal text-gray-800 truncate">
                    {new Date(facility.importDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Số lượng */}
            <motion.div
              className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-orange-100 rounded-full p-2">
                  <MdOutlineFormatListNumberedRtl className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Số Lượng</p>
                  <p className="text-sm sm:text-base font-normal text-gray-800 truncate">{facility.quantity}</p>
                </div>
              </div>
            </motion.div>

            {/* Ngày hết hạn */}
            <motion.div
              className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-orange-100 rounded-full p-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Ngày Hết Hạn</p>
                  <p className="text-sm sm:text-base font-normal text-gray-800 truncate">
                    {new Date(facility.expiredTime).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Nút Quay lại */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8"
            variants={itemVariants}
          >
            <button
              className="w-full sm:w-auto bg-gray-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-x-2 hover:bg-gray-600 transition-all shadow-md text-sm sm:text-base font-normal"
              onClick={() => {
                console.log("Navigating to /dashboard/facilities");
                navigate("/dashboard/facilities");
              }}
            >
              <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> Quay Lại
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default FacilitiesDetail;