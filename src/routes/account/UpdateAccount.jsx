import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { updateAccount, fetchAccountById } from "../../redux/slices/Account";
import { toast, ToastContainer } from "react-toastify";

const UpdateAccount = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const account = useSelector((state) => state.accounts.selectedAccount); // Lấy dữ liệu từ Redux

  const [role, setRole] = useState("");

  // Fetch dữ liệu tài khoản khi vào trang
  useEffect(() => {
    dispatch(fetchAccountById(id));
  }, [dispatch, id]);

  // Cập nhật state khi có dữ liệu
  useEffect(() => {
    if (account) {
      setRole(account.roleId); // Chỉ cập nhật role
    }
  }, [account]);

  // Xử lý cập nhật tài khoản
  const handleUpdate = async () => {
    try {
      await dispatch(updateAccount({ id, updatedData: { roleId: role } })).unwrap();
      toast.success("Cập nhật thành công! ✅");
      navigate("/dashboard/account"); // Chuyển hướng về danh sách
    } catch (error) {
      toast.error("Lỗi khi cập nhật tài khoản! ❌");
      console.error(error);
    }
  };  

  if (!account) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="p-6 shadow-lg rounded-lg bg-white max-w-lg mx-auto">
      <ToastContainer />
      <h2 className="text-2xl font-semibold mb-4">✏️ Cập Nhật Tài Khoản</h2>

      <div className="mb-4">
        <label className="block font-medium">👤 Họ và Tên</label>
        <input
          type="text"
          value={account.fullName}
          disabled
          className="w-full px-3 py-2 border rounded-lg bg-gray-200 cursor-not-allowed"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium">📧 Email</label>
        <input
          type="text"
          value={account.email}
          disabled
          className="w-full px-3 py-2 border rounded-lg bg-gray-200 cursor-not-allowed"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium">🪙 Ví Ethereum</label>
        <input
          type="text"
          value={account.walletAddress}
          disabled
          className="w-full px-3 py-2 border rounded-lg bg-gray-200 cursor-not-allowed"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium">📌 Vai Trò</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="Staff">Staff</option>
          <option value="Student">Student</option>
        </select>
      </div>

      <button
        onClick={handleUpdate}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition w-full"
      >
        ✅ Cập Nhật
      </button>
    </div>
  );
};

export default UpdateAccount;
