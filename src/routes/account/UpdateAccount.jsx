// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { updateAccountRole } from "../../redux/slices/Account"; 
// import { useState, useEffect } from "react";

// const UpdateAccount = () => {
//   const { id } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const account = useSelector((state) => 
//     state.accounts.accounts.find((acc) => acc.id === parseInt(id))
//   );

//   const [roleId, setRoleId] = useState(account?.roleId || "Student");
//   const [loading, setLoading] = useState(false);

//   // Cập nhật roleId khi account thay đổi (tránh lỗi state không đồng bộ)
//   useEffect(() => {
//     if (account) {
//       setRoleId(account.roleId);
//     }
//   }, [account]);

//   // Xử lý cập nhật vai trò
//   const handleUpdateRole = async () => {
//     if (!account) return;
    
//     setLoading(true);
//     await dispatch(updateAccountRole({ id: parseInt(id), roleId }));
//     setLoading(false);

//     navigate("/dashboard/account"); // Quay lại danh sách tài khoản
//   };

//   // Nếu account không tồn tại, hiển thị thông báo lỗi
//   if (!account) {
//     return (
//       <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
//         <h2 className="text-2xl font-semibold mb-4 text-red-500">Người dùng không tồn tại!</h2>
//         <button 
//           onClick={() => navigate("/dashboard/account")}
//           className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
//         >
//           Quay lại danh sách
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
//       <h2 className="text-2xl font-semibold mb-4">Cập Nhật Vai Trò</h2>

//       {/* Họ và Tên */}
//       <label className="block font-medium mb-2">Họ và Tên</label>
//       <input 
//         type="text" 
//         value={account.fullName} 
//         disabled 
//         className="w-full px-3 py-2 border rounded-lg bg-gray-100"
//       />

//       {/* Email */}
//       <label className="block font-medium mt-4 mb-2">Email</label>
//       <input 
//         type="email" 
//         value={account.email} 
//         disabled 
//         className="w-full px-3 py-2 border rounded-lg bg-gray-100"
//       />

//       {/* Ví Ethereum */}
//       <label className="block font-medium mt-4 mb-2">Ví Ethereum</label>
//       <input 
//         type="text" 
//         value={account.walletAddress} 
//         disabled 
//         className="w-full px-3 py-2 border rounded-lg bg-gray-100"
//       />

//       {/* Chọn Vai Trò */}
//       <label className="block font-medium mt-4 mb-2">Chọn Vai Trò</label>
//       <select 
//         value={roleId} 
//         onChange={(e) => setRoleId(e.target.value)}
//         className="w-full px-3 py-2 border rounded-lg"
//       >
//         <option value="Staff">Staff</option>
//         <option value="Student">Student</option>
//       </select>

//       {/* Nút cập nhật */}
//       <button 
//         onClick={handleUpdateRole} 
//         disabled={loading}
//         className={`mt-4 w-full text-white py-2 rounded-lg transition ${
//           loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
//         }`}
//       >
//         {loading ? "Đang cập nhật..." : "Cập Nhật"}
//       </button>
//     </div>
//   );
// };

// export default UpdateAccount;
