import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import {
  fetchAccounts,
  setRoleFilter,
  addAccount,
  fetchAccountsByRoleName,
  softDeleteAccount,
} from "../../redux/slices/Account";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Upload, Trash2, Edit, Users, Filter } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { FaSpinner } from "react-icons/fa";

const AccountList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { accounts, roleFilter, loading } = useSelector((state) => state.accounts);

  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const filteredAccounts = useMemo(() => {
    if (!Array.isArray(accounts)) return [];
    return accounts.filter((acc) =>
      roleFilter === "All" ? true : acc.roleName === roleFilter
    );
  }, [accounts, roleFilter]);

  const totalAccounts = Math.ceil(filteredAccounts.length / postsPerPage);

  useEffect(() => {
    if (currentPage > totalAccounts && totalAccounts > 0) {
      setCurrentPage(totalAccounts);
    } else if (totalAccounts === 0) {
      setCurrentPage(1);
    }
  }, [totalAccounts, currentPage]);

  const currentPosts = filteredAccounts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  useEffect(() => {
    dispatch(setRoleFilter("All"));
    dispatch(fetchAccounts());
  }, [dispatch]);

  useEffect(() => {
    if (roleFilter !== "All") {
      dispatch(fetchAccountsByRoleName(roleFilter));
    } else {
      dispatch(fetchAccounts());
    }
  }, [dispatch, roleFilter]);

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const res = await dispatch(addAccount(file)).unwrap();
      toast.success(res.message || "Nhập file Excel thành công! ✅");
      dispatch(fetchAccounts());
    } catch (err) {
      console.error("Lỗi khi nhập file Excel:", err);
      toast.error(err?.message || "Có lỗi xảy ra khi nhập file Excel! ❌");
    }
  };

  const handleSoftDelete = async (id) => {
    try {
      const res = await dispatch(softDeleteAccount(id)).unwrap();
      toast.success(res.message || "Xóa mềm thành công");
      dispatch(fetchAccounts());
      if (roleFilter !== "All") {
        dispatch(fetchAccountsByRoleName(roleFilter));
      }
    } catch (err) {
      console.error("Lỗi khi xóa mềm tài khoản:", err);
      toast.error(err?.message || "Lỗi khi xóa mềm tài khoản");
    }
  };

  const getEmptyStateMessage = () => {
    if (roleFilter === "All") {
      return "Hiện tại không có người dùng nào";
    }
    return `Không có người dùng nào thuộc vai trò "${roleFilter}"`;
  };

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Tooltip id="action-tooltip" />
      <div className="w-full border border-gray-600 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <Users className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Danh Sách Người Dùng</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="relative cursor-pointer bg-orange-500 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
              <Upload className="h-5 w-5" />
              <span className="hidden sm:inline">Thêm từ Excel</span>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImportExcel}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
            <button
              onClick={() => navigate("/dashboard/account/storage")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              <Trash2 className="h-5 w-5" />
              <span className="hidden sm:inline">Thùng rác</span>
            </button>
          </div>
        </div>

        {/* Filter Section */}
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

        {/* Accounts Display */}
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
            <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">{getEmptyStateMessage()}</p>
          </div>
        ) : (
          <>
            {/* Table for Desktop and Larger Tablets */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b items-center">
                  <tr>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">#</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Họ và Tên</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Email</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Vai Trò</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPosts.map((user, index) => (
                    <tr key={user.id} className="border-b hover:bg-gray-500 transition-colors">
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">{(currentPage - 1) * postsPerPage + index + 1}</td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">{user.fullName}</td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">{user.email}</td>
                      <td className="px-2 py-3 md:px-4 md:py-4 text-center">
                        <span
                          className={`inline-flex items-center text-center px-2 py-0.5 rounded-full font-normal text-xs md:text-sm 
                            ${user.roleName === "Admin" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
                        >
                          {user.roleName}
                        </span>
                      </td>
                      <td className="px-2 py-3 justify-center md:px-4 md:py-4 flex gap-2">
                        <button
                          onClick={() => handleSoftDelete(user.userId)}
                          data-tooltip-id="action-tooltip"
                          data-tooltip-content="Xóa mềm"
                          className="bg-red-100 text-red-700 hover:bg-red-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/dashboard/account/update/${user.userId}`}
                          data-tooltip-id="action-tooltip"
                          data-tooltip-content="Cập nhật"
                          className="bg-yellow-100 text-yellow-700 hover:bg-yellow-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* List for Mobile and Smaller Tablets */}
            <div className="block md:hidden space-y-4">
              {currentPosts.length > 0 ? (
                currentPosts.map((user, index) => (
                  <div
                    key={user.id}
                    className="border rounded-lg p-3 sm:p-4 bg-white shadow-sm hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-sm">#{(currentPage - 1) * postsPerPage + index + 1}</span>
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
                        <Link
                          to={`/dashboard/account/update/${user.userId}`}
                          className="bg-yellow-100 text-yellow-700 hover:bg-yellow-400 p-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                        >
                          <Edit className="w-4 h-4" /> Cập nhật
                        </Link>
                        <Link
                          onClick={() => handleSoftDelete(user.userId)}
                          className="bg-red-500 text-red-700 hover:bg-red-400 p-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                        >
                          <Trash2 className="w-4 h-4" /> Xóa mềm
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">{getEmptyStateMessage()}</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalAccounts > 1 && (
              <div className="flex justify-center mt-6 flex-wrap gap-2">
                {[...Array(totalAccounts)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 rounded-lg text-sm ${currentPage === index + 1 ? "bg-orange-500 text-white" : "bg-gray-200 text-black"
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AccountList;