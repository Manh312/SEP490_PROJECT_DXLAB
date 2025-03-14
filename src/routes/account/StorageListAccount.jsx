import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { fetchDeletedAccounts, restoreAccount, deletePermanently, fetchAccountsByRoleName, setRoleFilter } from "../../redux/slices/Account";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrashRestore, FaTrashAlt, FaUsers, FaSpinner } from "react-icons/fa";
import { Filter } from "lucide-react";
import { Tooltip } from "react-tooltip";

const StorageListAccount = () => {
  const dispatch = useDispatch();
  const { deletedAccounts, roleFilter, loading, error } = useSelector((state) => state.accounts);
  const [loadingId, setLoadingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const filteredDeletedAccounts = useMemo(() => {
    if (!Array.isArray(deletedAccounts)) return [];
    return deletedAccounts.filter((acc) =>
      roleFilter === "All" ? true : acc.roleName === roleFilter
    );
  }, [deletedAccounts, roleFilter]);

  const totalAccounts = Math.ceil(filteredDeletedAccounts.length / postsPerPage);

  useEffect(() => {
    if (currentPage > totalAccounts && totalAccounts > 0) {
      setCurrentPage(totalAccounts);
    } else if (totalAccounts === 0) {
      setCurrentPage(1);
    }
  }, [totalAccounts, currentPage]);

  const currentPosts = filteredDeletedAccounts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  useEffect(() => {
    dispatch(fetchDeletedAccounts());
  }, [dispatch]);

  const handleRestore = async (userId) => {
    setLoadingId(userId);
    try {
      await dispatch(restoreAccount(userId)).unwrap();
      dispatch(fetchDeletedAccounts());
      toast.success("Khôi phục tài khoản thành công!");
    } catch (err) {
      toast.error("Lỗi khôi phục tài khoản!");
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
      toast.success("Xóa vĩnh viễn tài khoản thành công!");
      dispatch(fetchDeletedAccounts());
      if (roleFilter !== "All") {
        dispatch(fetchAccountsByRoleName(roleFilter));
      }
      dispatch(fetchDeletedAccounts());
    } catch (err) {
      toast.error("Lỗi xóa vĩnh viễn tài khoản!");
      console.log(err);
    }
    setLoadingId(null);
  };

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Tooltip id="action-tooltip" />

      <div className="w-full mx-auto border border-gray-600 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <FaUsers className="text-orange-500" /> Danh Sách Tài Khoản Đã Xóa Mềm
          </h2>
          <span className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-0">
            Tổng: {deletedAccounts.length} tài khoản
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
            <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : null}

        {error && (
          <p className="text-red-600 bg-red-50 p-4 rounded-lg mb-6 text-center text-sm sm:text-base">
            Lỗi: {error.message || "Đã xảy ra lỗi không xác định"}
          </p>
        )}

        <div className="mb-6 rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              <span className="font-medium text-sm sm:text-base">Lọc theo vai trò</span>
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => dispatch(setRoleFilter(e.target.value))}
            className="w-30 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
          >
            <option value="All">Tất Cả</option>
            <option value="Student">Student</option>
            <option value="Staff">Staff</option>
          </select>
        </div>

        {!loading && !error && (
          <>
            <div className="hidden md:block overflow-x-auto rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead className="border-b text-center bg-gray-500">
                  <tr>
                    <th className="px-2 py-2 md:px-4 md:py-3 font-semibold text-xs md:text-sm uppercase tracking-wide">#</th>
                    <th className="px-2 py-2 md:px-4 md:py-3 font-semibold text-xs md:text-sm uppercase tracking-wide">Họ và Tên</th>
                    <th className="px-2 py-2 md:px-4 md:py-3 font-semibold text-xs md:text-sm uppercase tracking-wide">Email</th>
                    <th className="px-2 py-2 md:px-4 md:py-3 font-semibold text-xs md:text-sm uppercase tracking-wide">Vai Trò</th>
                    <th className="px-2 py-2 md:px-4 md:py-3 font-semibold text-xs md:text-sm uppercase tracking-wide">Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPosts.map((user, index) => (
                    <tr key={user.id} className="border-b text-center hover:bg-gray-500 transition-colors">
                      <td className="px-2 py-3 md:px-4 md:py-4">{index + 1}</td>
                      <td className="px-2 py-3 md:px-4 md:py-4">{user.fullName}</td>
                      <td className="px-2 py-3 md:px-4 md:py-4">{user.email}</td>
                      <td className="px-2 py-3 md:px-4 md:py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-normal text-xs md:text-sm 
                            ${user.roleName === "Admin" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
                        >
                          {user.roleName}
                        </span>
                      </td>
                      <td className="px-2 py-3 md:px-4 md:py-4 flex gap-2 md:gap-3 justify-center">
                        <button
                          onClick={() => handleRestore(user.userId)}
                          data-tooltip-id="action-tooltip"
                          data-tooltip-content="Khôi phục tài khoản"
                          className="bg-green-100 text-green-700 hover:bg-green-400 p-2 rounded-lg transition-colors"
                        >
                          <FaTrashRestore className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <button
                          onClick={() => handleDeletePermanently(user.userId)}
                          data-tooltip-id="action-tooltip"
                          data-tooltip-content="Xóa vĩnh viễn"
                          className="bg-red-100 text-red-700 hover:bg-red-400 p-2 rounded-lg transition-colors"
                        >
                          <FaTrashAlt className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* List for Mobile and Tablet */}
            <div className="block md:hidden space-y-4">
              {currentPosts.map((user, index) => (
                <div
                  key={user.id}
                  className="border rounded-lg p-4 shadow-sm hover:bg-gray-500 transition-colors"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-sm">#{index + 1}</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal 
                          ${user.roleName === "Admin" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
                      >
                        {user.roleName}
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Họ và Tên:</span> {user.fullName}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Email:</span> {user.email}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                      <button
                        onClick={() => handleRestore(user.userId)}
                        className="bg-green-100 text-green-700 hover:bg-green-400 p-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                      >
                        <FaTrashRestore className="w-4 h-4" /> Khôi phục
                      </button>
                      <button
                        onClick={() => handleDeletePermanently(user.userId)}
                        className="bg-red-100 text-red-700 hover:bg-red-400 p-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                      >
                        <FaTrashAlt className="w-4 h-4" /> Xóa vĩnh viễn
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hiển thị thông báo không có tài khoản dưới bảng/list */}
            {filteredDeletedAccounts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 mt-6">
                <FaUsers className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">Không có tài khoản nào bị xóa mềm.</p>
              </div>
            )}
          </>
        )}

        {totalAccounts > 1 && (
          <div className="flex justify-center mt-6 flex-wrap gap-2">
            {[...Array(totalAccounts)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 rounded-lg text-sm ${
                  currentPage === index + 1 ? "bg-orange-500 text-white" : "bg-gray-200 text-black"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageListAccount;