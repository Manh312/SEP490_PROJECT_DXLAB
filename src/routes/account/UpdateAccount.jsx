import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateAccountRole } from "../../redux/slices/Account"; 
import { useState } from "react";

const UpdateAccount = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const account = useSelector((state) => 
    state.accounts.accounts.find((acc) => acc.id === parseInt(id))
  );

  const [roleId, setRoleId] = useState(account?.roleId || "Student");

  const handleUpdateRole = () => {
    dispatch(updateAccountRole({ id: parseInt(id), roleId }));
    navigate("/dashboard/account"); // Quay lại danh sách tài khoản
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Cập Nhật Vai Trò</h2>

      {/* Họ và Tên */}
      <label className="block font-medium mb-2">Họ và Tên</label>
      <input 
        type="text" 
        value={account?.fullName || ""} 
        disabled 
        className="w-full px-3 py-2 border rounded-lg bg-gray-100"
      />

      {/* Email */}
      <label className="block font-medium mt-4 mb-2">Email</label>
      <input 
        type="email" 
        value={account?.email || ""} 
        disabled 
        className="w-full px-3 py-2 border rounded-lg bg-gray-100"
      />

      {/* Ví Ethereum */}
      <label className="block font-medium mt-4 mb-2">Ví Ethereum</label>
      <input 
        type="text" 
        value={account?.walletAddress || ""} 
        disabled 
        className="w-full px-3 py-2 border rounded-lg bg-gray-100"
      />

      {/* Chọn Vai Trò */}
      <label className="block font-medium mt-4 mb-2">Chọn Vai Trò</label>
      <select 
        value={roleId} 
        onChange={(e) => setRoleId(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg"
      >
        <option value="Staff">Staff</option>
        <option value="Student">Student</option>
      </select>

      {/* Nút cập nhật */}
      <button 
        onClick={handleUpdateRole} 
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Cập Nhật
      </button>
    </div>
  );
};

export default UpdateAccount;
