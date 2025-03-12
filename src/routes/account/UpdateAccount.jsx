import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { updateAccount, fetchAccountById } from "../../redux/slices/Account";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUser, FaEnvelope, FaTag, FaCheck } from "react-icons/fa";

const UpdateAccount = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedAccount, loading, error } = useSelector((state) => state.accounts);
  const [role, setRole] = useState("");

  useEffect(() => {
    if (!selectedAccount && !loading) {
      dispatch(fetchAccountById(id));
    }
  }, [dispatch, id, selectedAccount, loading]);

  useEffect(() => {
    if (selectedAccount && selectedAccount.id === id) {
      console.log("Dữ liệu selectedAccount:", selectedAccount); // Log để kiểm tra
      const roleNameFromServer = selectedAccount.roleName || "";
      // Chuyển đổi roleName để khớp với giá trị trong <option>
      const normalizedRoleName = roleNameFromServer.charAt(0).toUpperCase() + roleNameFromServer.slice(1).toLowerCase();
      setRole(normalizedRoleName);
    }
  }, [selectedAccount, id]);

  const handleUpdate = async () => {
    try {
      if (!role || role.trim() === "") {
        toast.error("Vui lòng chọn vai trò!");
        return;
      }
      const updatedData = { roleName: role }; // Sử dụng roleName
      console.log("Dữ liệu gửi đi:", updatedData); // Log để kiểm tra
      const result = await dispatch(updateAccount({ id, updatedData })).unwrap();
      console.log("Phản hồi từ server:", result); // Log để kiểm tra
      if (result) {
        toast.success("Cập nhật thành công!");
        dispatch(fetchAccountById(id));
        navigate("/dashboard/account");
      }
    } catch (err) {
      const errorMessage = err.errors
        ? Object.values(err.errors).join(", ")
        : err.message || "Unknown error";
      toast.error(`Lỗi khi cập nhật tài khoản: ${errorMessage}`);
      console.error("Lỗi cập nhật:", err);
    }
  };

  if (loading)
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-600 text-lg animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );

  if (error) {
    const errorMessage =
      error.message ||
      (error.errors && Object.values(error.errors).join(", ")) ||
      "Đã xảy ra lỗi không xác định";
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-red-600 text-lg font-medium bg-red-50 p-4 rounded-lg">
          Lỗi: {errorMessage}
        </p>
      </div>
    );
  }

  if (!selectedAccount)
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-600 text-lg">Không tìm thấy tài khoản!</p>
      </div>
    );

  return (
    <div className=" flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 rounded-xl shadow-lg p-8 transform transition-all hover:shadow-xl">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          theme="colored"
        />

        <div>
          <h2 className="text-3xl font-bold text-center">Cập Nhật Tài Khoản</h2>
          <p className="mt-2 text-sm text-center">
            Chỉnh sửa thông tin vai trò tài khoản
          </p>
        </div>

        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <span className="flex items-center">
                <FaUser className="mr-2 text-orange-500" /> Họ và Tên
              </span>
            </label>
            <input
              type="text"
              value={selectedAccount.account?.fullName || ""}
              disabled
              className="w-full px-4 py-3 rounded-lg border focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <span className="flex items-center">
                <FaEnvelope className="mr-2 text-orange-500" /> Email
              </span>
            </label>
            <input
              type="text"
              value={selectedAccount.account?.email || ""}
              disabled
              className="w-full px-4 py-3 rounded-lg border focus:outline-none"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <span className="flex items-center">
                <FaTag className="mr-2 text-orange-500" /> Vai Trò
              </span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-500 focus:border-orange-500  duration-150 ease-in-out"
            >
              <option value="">-- Chọn vai trò --</option> {/* Tùy chọn mặc định */}
              <option value="Staff">Staff</option>
              <option value="Student">Student</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <>
                <FaCheck className="mr-2" /> Cập Nhật
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateAccount;