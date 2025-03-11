  import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchDeletedAccounts, restoreAccount, deletePermanently } from "../../redux/slices/Account"; 
import { toast, ToastContainer } from "react-toastify";

const StorageListAccount = () => {
  const dispatch = useDispatch();
  const { deletedAccounts, loading, error } = useSelector((state) => state.storage);
  const [loadingId, setLoadingId] = useState(null); // Để xác định tài khoản nào đang loading

  useEffect(() => {
    dispatch(fetchDeletedAccounts());
  }, [dispatch]);

  const handleRestore = async (userId) => {
    setLoadingId(userId);
    try {
      await dispatch(restoreAccount(userId)).unwrap();
      toast.success("Khôi phục tài khoản thành công! ✅");
    } catch (err) {
      toast.error("Lỗi khôi phục tài khoản! ❌");
    }
    setLoadingId(null);
  };

  const handleDeletePermanently = async (userId) => {
    setLoadingId(userId);
    try {
      await dispatch(deletePermanently(userId)).unwrap();
      toast.success("Xóa vĩnh viễn tài khoản! ❌");
    } catch (err) {
      toast.error("Lỗi xóa vĩnh viễn tài khoản! ❌");
    }
    setLoadingId(null);
  };

  return (
    <div className="p-6 shadow-xl rounded-lg bg-white max-w-4xl mx-auto">
      <ToastContainer />
      <h2 className="text-2xl font-semibold mb-4">🗑 Danh Sách Tài Khoản Đã Xóa</h2>

      {loading && <p className="text-blue-500">Đang tải dữ liệu...</p>}
      {error && <p className="text-red-500">Lỗi: {error}</p>}

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Họ và Tên</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Vai Trò</th>
            <th className="px-4 py-2">Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {deletedAccounts.length > 0 ? (
            deletedAccounts.map((user, index) => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{user.fullName}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.roleName}</td>
                <td className="px-4 py-2 flex space-x-2">
                  <button
                    onClick={() => handleRestore(user.userId)}
                    disabled={loadingId === user.userId}
                    className={`px-3 py-1 rounded-lg ${
                      loadingId === user.userId
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    🔄 {loadingId === user.userId ? "Đang xử lý..." : "Khôi Phục"}
                  </button>
                  <button
                    onClick={() => handleDeletePermanently(user.userId)}
                    disabled={loadingId === user.userId}
                    className={`px-3 py-1 rounded-lg ${
                      loadingId === user.userId
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    🗑 {loadingId === user.userId ? "Đang xử lý..." : "Xóa Vĩnh Viễn"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-gray-500 py-4">
                Không có tài khoản nào bị xóa.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StorageListAccount;