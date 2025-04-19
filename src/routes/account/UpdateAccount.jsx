import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { updateAccount, fetchAccountById, fetchRolesByAdmin } from "../../redux/slices/Account";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowLeft, User, Mail, Key, Check } from "lucide-react";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

const UpdateAccount = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedAccount, roles, loading } = useSelector((state) => state.accounts);

  const [role, setRole] = useState("");

  // Fetch roles và account khi component mount
  useEffect(() => {
    dispatch(fetchRolesByAdmin()); // Lấy danh sách roles
    dispatch(fetchAccountById(id)); // Lấy thông tin tài khoản
  }, [dispatch, id]);

  // Đồng bộ role khi selectedAccount thay đổi
  useEffect(() => {
    if (selectedAccount && selectedAccount.userId === parseInt(id)) {
      const roleNameFromServer = selectedAccount.roleName || "";
      if (roles.some((r) => r.roleName === roleNameFromServer)) {
        setRole(roleNameFromServer);
      }
    }
  }, [selectedAccount, id, roles]);

  useEffect(() => {
    if (roles.length > 0 && selectedAccount) {
      setRole(selectedAccount.roleName || "");
    }
  }, [roles, selectedAccount]);

  const handleUpdate = async () => {
    try {
      const roleName = role;
      const response = await dispatch(updateAccount({ id, roleName })).unwrap();
      toast.success(response.message || "Cập nhật tài khoản thành công!");
      navigate("/dashboard/account");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Hiển thị loading nếu dữ liệu chưa sẵn sàng
  if (loading || !selectedAccount) {
    return (
      <div className="flex items-center justify-center py-6 mt-50 mb-200">
        <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
        <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
      </div>
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
    <div className="py-4 px-3 sm:px-6 lg:px-8 overflow-x-hidden mb-20">
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
              Cập Nhật Tài Khoản
            </h2>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            {/* Họ và Tên */}
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
                  <p className="text-sm sm:text-base font-normal text-gray-800 truncate">{selectedAccount.fullName || ""}</p>
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
                  <p className="text-sm sm:text-base font-normal text-gray-800 truncate">{selectedAccount.email || ""}</p>
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
                  <p className="text-xs sm:text-sm font-bold text-gray-500">Vai Trò</p>
                  <select
                    value={role || ""}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out"
                  >
                    {roles?.length > 0 ? (
                      roles.map((r) => (
                        <option key={r.id} value={r.roleName}>
                          {r.roleName}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        Không có vai trò nào
                      </option>
                    )}
                  </select>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Nút Cập Nhật và Quay Lại */}
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
              onClick={handleUpdate}
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-x-2 hover:from-orange-600 hover:to-orange-800 transition-all shadow-md disabled:bg-orange-300 disabled:cursor-not-allowed text-sm sm:text-base font-normal"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <Check size={14} className="sm:w-4 sm:h-4" />
              )}
              Cập Nhật
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default UpdateAccount;