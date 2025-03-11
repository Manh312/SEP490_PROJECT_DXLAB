import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchDeletedAccounts, restoreAccount, deletePermanently } from "../../redux/slices/Account"; 
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StorageListAccount = () => {
  const dispatch = useDispatch();
  const { deletedAccounts, loading, error } = useSelector((state) => state.accounts);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    dispatch(fetchDeletedAccounts());
  }, [dispatch]);

  const handleRestore = async (userId) => {
    setLoadingId(userId);
    try {
      await dispatch(restoreAccount(userId)).unwrap(); // Đảm bảo hành động hoàn tất
      dispatch(fetchDeletedAccounts()); // Làm mới danh sách
      toast.success("Khôi phục tài khoản thành công! ✅");
    } catch (err) {
      toast.error("Lỗi khôi phục tài khoản! ❌");
      console.log(err);   
    }
    setLoadingId(null);
  };

  const handleDeletePermanently = async (userId) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản này?");
    if (!confirmDelete) return;

    setLoadingId(userId);
    try {
      await dispatch(deletePermanently(userId)).unwrap();
      dispatch(fetchDeletedAccounts());
      toast.success("Xóa vĩnh viễn tài khoản thành công! ❌");
    } catch (err) {
      toast.error("Lỗi xóa vĩnh viễn tài khoản! ❌");
      console.log(err);
    }
    setLoadingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            🗑 Danh Sách Tài Khoản Đã Xóa Mềm
          </h2>
          <span className="text-sm text-gray-500">
            Tổng: {deletedAccounts.length} tài khoản
          </span>
        </div>

        {loading && (
          <div className="text-center py-4">
            <p className="text-blue-600 font-medium">Đang tải dữ liệu...</p>
            <div className="loader inline-block w-6 h-6 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <p className="text-red-600 bg-red-100 p-3 rounded-md mb-4">
            Lỗi: {error}
          </p>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="px-6 py-3 font-semibold">#</th>
                  <th className="px-6 py-3 font-semibold">Họ và Tên</th>
                  <th className="px-6 py-3 font-semibold">Email</th>
                  <th className="px-6 py-3 font-semibold">Vai Trò</th>
                  <th className="px-6 py-3 font-semibold">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {deletedAccounts.length > 0 ? (
                  deletedAccounts.map((user, index) => (
                    <tr
                      key={user.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4">{user.fullName}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.roleName === "Admin"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.roleName}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex space-x-3">
                        <button
                          onClick={() => handleRestore(user.userId)}
                          disabled={loadingId === user.userId}
                          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            loadingId === user.userId
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          <span className="mr-1">🔄</span>
                          {loadingId === user.userId ? "Đang xử lý..." : "Khôi phục"}
                        </button>
                        <button
                          onClick={() => handleDeletePermanently(user.userId)}
                          disabled={loadingId === user.userId}
                          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            loadingId === user.userId
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-red-600 text-white hover:bg-red-700"
                          }`}
                        >
                          <span className="mr-1">🗑</span>
                          {loadingId === user.userId ? "Đang xử lý..." : "Xóa vĩnh viễn"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-16 h-16 text-gray-400 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-4.586a1 1 0 01-.707-.293l-1.414-1.414a1 1 0 00-1.414 0l-1.414 1.414a1 1 0 01-.707.293H4"
                          />
                        </svg>
                        <p>Không có tài khoản nào bị xóa mềm.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageListAccount;