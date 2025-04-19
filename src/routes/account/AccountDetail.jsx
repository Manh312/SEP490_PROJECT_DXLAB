import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Key, Edit } from "lucide-react";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

const AccountDetail = () => {
  const { accounts, loading } = useSelector((state) => state.accounts);
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
    return (
      <p className="text-red-500 text-center mt-10 text-base sm:text-lg font-normal">
        Lỗi: ID không hợp lệ!
      </p>
    );
  }

  const account = accounts.find((f) => f.userId === parseInt(id));
  console.log("Selected account:", account);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 mt-50 mb-200">
        <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
        <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!account) {
    return (
      <p className="text-red-500 text-center mt-10 text-base sm:text-lg font-normal">
        Không tìm thấy tài khoản có ID {id}!
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
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <h2 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-white text-center">
              Chi Tiết Tài Khoản Người Dùng
            </h2>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {/* Họ Và Tên */}
            <motion.div
              className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-orange-100 rounded-full p-2">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Họ Và Tên</p>
                  <p className="text-sm sm:text-base font-normal text-gray-800 truncate">{account.fullName}</p>
                </div>
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-orange-100 rounded-full p-2">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Email</p>
                  <p className="text-sm sm:text-base font-normal text-gray-800 truncate">{account.email}</p>
                </div>
              </div>
            </motion.div>

            {/* Vai Trò */}
            <motion.div
              className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-orange-100 rounded-full p-2">
                  <Key className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Vai Trò</p>
                  <p className="text-sm sm:text-base font-normal text-gray-800 truncate">{account.roleName}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Nút Quay Lại và Chỉnh Sửa */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8"
            variants={itemVariants}
          >
            <button
              className="w-full sm:w-auto bg-gray-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-x-2 hover:bg-gray-600 transition-all shadow-md text-sm sm:text-base font-normal"
              onClick={() => {
                console.log("Navigating to /dashboard/account");
                navigate("/dashboard/account");
              }}
            >
              <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> Quay Lại
            </button>
            <button
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-x-2 hover:from-orange-600 hover:to-orange-800 transition-all shadow-md text-sm sm:text-base font-normal"
              onClick={() => {
                console.log("Navigating to /dashboard/account/update/", account.userId);
                navigate(`/dashboard/account/update/${account.userId}`);
              }}
            >
              <Edit size={14} className="sm:w-4 sm:h-4" /> Chỉnh Sửa
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AccountDetail;