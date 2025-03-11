import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { updateAccount, fetchAccountById } from "../../redux/slices/Account";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UpdateAccount = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Selector khớp với cấu trúc state.accounts
  const { selectedAccount, loading, error } = useSelector((state) => state.accounts);

  const [role, setRole] = useState("");

  // Fetch dữ liệu tài khoản chỉ khi component mount và chưa có dữ liệu
  useEffect(() => {
    if (!selectedAccount && !loading) {
      dispatch(fetchAccountById(id));
    }
  }, [dispatch, id, selectedAccount, loading]); // Thêm loading để tránh dispatch liên tục

  // Cập nhật state role khi account thay đổi
  useEffect(() => {
    if (selectedAccount && selectedAccount.id === id) {
      setRole(selectedAccount.roleId || ""); // Gán role từ dữ liệu account
    }
  }, [selectedAccount, id]);

  // Xử lý cập nhật tài khoản
  const handleUpdate = async () => {
    try {
      if (!role) {
        toast.error("Vui lòng chọn vai trò! ⚠️");
        return;
      }

      const updatedData = { roleId: role };
      const result = await dispatch(updateAccount({ id, updatedData })).unwrap();
      
      if (result) {
        toast.success("Cập nhật thành công! ✅");
        // Fetch lại để cập nhật selectedAccount
        dispatch(fetchAccountById(id));
        navigate("/dashboard/account");
      }
    } catch (error) {
      toast.error(`Lỗi khi cập nhật tài khoản: ${error.message || "Unknown error"} ❌`);
      console.error("Lỗi cập nhật:", error);
    }
  };

  // Xử lý các trạng thái UI
  if (loading) return <p className="text-center">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-center text-red-500">Lỗi: {error.message || error}</p>;
  if (!selectedAccount) return <p className="text-center">Không tìm thấy tài khoản!</p>;

  return (
    <div className="p-6 shadow-lg rounded-lg bg-white max-w-lg mx-auto">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <h2 className="text-2xl font-semibold mb-4">✏️ Cập Nhật Tài Khoản</h2>

      {/* Hiển thị họ tên */}
      <div className="mb-4">
        <label className="block font-medium mb-1">👤 Họ và Tên</label>
        <input
          type="text"
          value={selectedAccount.account.fullName || ""}
          disabled
          className="w-full px-3 py-2 border rounded-lg bg-gray-200 cursor-not-allowed"
        />
      </div>

      {/* Hiển thị email */}
      <div className="mb-4">
        <label className="block font-medium mb-1">📧 Email</label>
        <input
          type="text"
          value={selectedAccount.email || ""}
          disabled
          className="w-full px-3 py-2 border rounded-lg bg-gray-200 cursor-not-allowed"
        />
      </div>

      {/* Chọn vai trò */}
      <div className="mb-6">
        <label className="block font-medium mb-1">📌 Vai Trò</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Chọn vai trò --</option>
          <option value="Staff">Staff</option>
          <option value="Student">Student</option>
        </select>
      </div>

      <button
        onClick={handleUpdate}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition w-full disabled:bg-blue-300"
        disabled={loading}
      >
        ✅ Cập Nhật
      </button>
    </div>
  );
};

export default UpdateAccount;