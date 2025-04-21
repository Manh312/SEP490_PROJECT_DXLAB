import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ClipboardList, ArrowLeft, User, Calendar, Hash, MapPin, Home, Box, Check } from "lucide-react";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";
import { fetchReportById, removeAreaFacility } from "../../redux/slices/Report";

const ManageReportDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentReport, loading, error } = useSelector((state) => state.reports);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    dispatch(fetchReportById(id));
  }, [dispatch, id]);

  // Handle the "Kiểm Tra Thiết Bị" button click
  const handleCheckEquipment = () => {
    if (currentReport) {
      const { areaId, facilityId, facilityQuantity } = currentReport;
      if (areaId && facilityId && facilityQuantity) {
        dispatch(
          removeAreaFacility({
            areaId: parseInt(areaId),
            facilityId: parseInt(facilityId),
            quantity: parseInt(facilityQuantity),
          })
        ).then(() => {
          // Navigate to the FacilitiesListDelete page after the API call
          navigate(`/dashboard/report/${currentReport.reportId}/check`);
        })
      }
      }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 mt-50 mb-200">
        <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
        <p className="text-orange-500 font-medium text-base sm:text-lg">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-6 mt-50 mb-200">
        <p className="text-red-500 text-base sm:text-lg font-normal text-center">
          Lỗi: {error}
        </p>
      </div>
    );
  }

  if (!currentReport) {
    return (
      <div className="flex justify-center items-center py-6 mt-50 mb-200">
        <p className="text-red-500 text-base sm:text-lg font-normal text-center">
          Không tìm thấy báo cáo!
        </p>
      </div>
    );
  }

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
          <div className="flex flex-col items-center gap-2">
            <ClipboardList className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <h2 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-white text-center">
              Chi Tiết Báo Cáo RP-{currentReport.reportId || id}
            </h2>
          </div>
        </div>

        {/* Report Information */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column - Thông Tin Báo Cáo */}
            <div className="space-y-4 sm:space-y-6">
              {/* Mã Báo Cáo */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Mã Báo Cáo</p>
                    <p className="text-sm sm:text-base font-normal text-gray-800 truncate">
                      RP-{currentReport.reportId || id}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Tên Nhân Viên */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Tên Nhân Viên</p>
                    <p className="text-sm sm:text-base font-normal text-gray-800 truncate">
                      {currentReport.staffName || "N/A"}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Phòng */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Home className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Phòng</p>
                    <p className="text-sm sm:text-base font-normal text-gray-800 truncate">
                      {currentReport.roomName || "N/A"}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Cơ Sở Vật Chất */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Box className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Cơ Sở Vật Chất</p>
                    <p className="text-sm sm:text-base font-normal text-gray-800 truncate">
                      {currentReport.facilityTitle ? `${currentReport.facilityTitle} - ${currentReport.batchNumber || "N/A"}` : "N/A"}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Thông Tin Liên Quan */}
            <div className="space-y-4 sm:space-y-6">
              {/* Mã Đặt Chỗ */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Mã Đặt Chỗ</p>
                    <p className="text-sm sm:text-base font-normal text-gray-800 truncate">
                      DXL-{currentReport.bookingDetailId || "N/A"}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Ngày Tạo */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Ngày Tạo</p>
                    <p className="text-sm sm:text-base font-normal text-gray-800 truncate">
                      {formatDate(currentReport.createdDate)}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Khu Vực & Vị Trí */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Khu Vực & Vị Trí</p>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2 text-sm sm:text-base font-normal text-gray-800 border-b border-gray-200 pb-2">
                        <span className="text-orange-600">•</span>
                        <p className="truncate">
                          {currentReport.areaName ? `${currentReport.areaName} - ${currentReport.areaTypeName || "N/A"}` : "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm sm:text-base font-normal text-gray-800">
                        <span className="text-orange-600">•</span>
                        <p className="truncate">
                          Vị Trí: {currentReport.position || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Cơ Sở Vật Chất */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Box className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Số Lượng Thiết Bị</p>
                    <p className="text-sm sm:text-base font-normal text-gray-800 truncate">
                      {currentReport.facilityQuantity || "N/A"}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Back Button */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8"
            variants={itemVariants}
          >
            <Link
              to="/dashboard/report"
              className="w-full sm:w-auto bg-gradient-to-r from-gray-500 to-gray-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-x-2 hover:from-gray-600 hover:to-gray-800 transition-all shadow-md text-sm sm:text-base font-normal"
            >
              <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> Quay Lại
            </Link>
            <button
              onClick={handleCheckEquipment}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-x-2 hover:from-orange-600 hover:to-orange-800 transition-all shadow-md text-sm sm:text-base font-normal"
            >
              <Check size={14} className="sm:w-4 sm:h-4" /> Kiểm Tra Thiết Bị
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ManageReportDetail;