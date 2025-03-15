import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { updateAccount, fetchAccountById, fetchRolesByAdmin } from "../../redux/slices/Account";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUser, FaEnvelope, FaTag, FaCheck } from "react-icons/fa";

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
    if (selectedAccount && selectedAccount.userId === id) {
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
      if (!role || role.trim() === "") {
        toast.error("Vui lòng chọn vai trò!");
        return;
      }

      const roleName = role;
      await dispatch(updateAccount({ id, roleName })).unwrap();
      toast.success("Cập nhật thành công!");
      navigate("/dashboard/account");
    } catch (err) {
      const errorMessage = err.errors
        ? Object.values(err.errors).join(", ")
        : err.message || "Unknown error";
      toast.error(`Lỗi khi cập nhật tài khoản: ${errorMessage}`);
      console.error("Update error:", err);
    }
  };

  // Hiển thị loading nếu dữ liệu chưa sẵn sàng
  if (loading || !selectedAccount) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-600 text-lg animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg rounded-xl border shadow-2xl p-8 space-y-8 transition-all duration-300 hover:shadow-3xl">
      <div>
          <h2 className="text-3xl font-bold text-center">Cập Nhật Tài Khoản</h2>
          <p className="mt-2 text-sm text-center">Chỉnh sửa thông tin vai trò tài khoản</p>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              <span className="flex items-center">
                <FaUser className="mr-2 text-orange-500" /> Họ và Tên
              </span>
            </label>
            <input
              type="text"
              value={selectedAccount.fullName || ""}
              disabled
              className="w-full px-4 py-3 rounded-lg border focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              <span className="flex items-center">
                <FaEnvelope className="mr-2 text-orange-500" /> Email
              </span>
            </label>
            <input
              type="text"
              value={selectedAccount.email || ""}
              disabled
              className="w-full px-4 py-3 rounded-lg border focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              <span className="flex items-center">
                <FaTag className="mr-2 text-orange-500" /> Vai Trò
              </span>
            </label>
            <select
              value={role || ""}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-500 focus:border-orange-500 duration-150 ease-in-out"
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
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition duration-150 ease-in-out"
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