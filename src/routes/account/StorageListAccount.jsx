import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import {
  fetchDeletedAccounts,
  restoreAccount,
  deletePermanently,
  fetchAccountsByRoleName,
  setRoleFilter,
} from "../../redux/slices/Account";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrashRestore, FaTrashAlt, FaUsers, FaSpinner } from "react-icons/fa";
import { Filter, Search } from "lucide-react";
import { Tooltip } from "react-tooltip";
import Pagination from "../../hooks/use-pagination";
import debounce from "lodash/debounce";

const StorageListAccount = () => {
  const dispatch = useDispatch();
  const { deletedAccounts, roleFilter, loading, error } = useSelector((state) => state.accounts);
  const [loadingId, setLoadingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State cho modal
  const [userIdToDelete, setUserIdToDelete] = useState(null); // Lưu userId cần xóa
  const [userFullName, setUserFullName] = useState(""); // Lưu tên người dùng cho modal
  const postsPerPage = 6;

  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300);

  const filteredDeletedAccounts = useMemo(() => {
    if (!Array.isArray(deletedAccounts)) return [];
    let result = deletedAccounts.filter((acc) => {
      if (!acc || typeof acc !== "object" || !acc.userId || !acc.roleName) return false;
      return roleFilter === "All" ? true : acc.roleName === roleFilter;
    });

    if (searchTerm) {
      result = result.filter((acc) =>
        (acc.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         acc.email?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return result;
  }, [deletedAccounts, roleFilter, searchTerm]);

  const totalAccounts = Math.ceil(filteredDeletedAccounts.length / postsPerPage);

  useEffect(() => {
    if (currentPage > totalAccounts && totalAccounts > 0) {
      setCurrentPage(totalAccounts);
    } else if (totalAccounts === 0) {
      setCurrentPage(1);
    }
  }, [totalAccounts, currentPage]);

  const currentPosts = filteredDeletedAccounts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

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

  const handleOpenDeleteModal = (userId, fullName) => {
    setUserIdToDelete(userId);
    setUserFullName(fullName || "N/A");
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserIdToDelete(null);
    setUserFullName("");
  };

  const handleDeletePermanently = async () => {
    if (!userIdToDelete) {
      toast.error("Không tìm thấy ID tài khoản để xóa!");
      return;
    }
    setLoadingId(userIdToDelete);
    try {
      await dispatch(deletePermanently(userIdToDelete)).unwrap();
      toast.success("Xóa vĩnh viễn tài khoản thành công!");
      dispatch(fetchDeletedAccounts());
      if (roleFilter !== "All") {
        dispatch(fetchAccountsByRoleName(roleFilter));
      }
    } catch (err) {
      toast.error("Lỗi xóa vĩnh viễn tài khoản!");
      console.log(err);
    } finally {
      setLoadingId(null);
      setIsDeleteModalOpen(false);
      setUserIdToDelete(null);
      setUserFullName("");
    }
  };

  const getEmptyStateMessage = () => {
    if (roleFilter === "All") {
      return searchTerm
        ? "Không tìm thấy tài khoản đã xóa nào khớp với tìm kiếm"
        : "Hiện tại không có tài khoản nào đã xóa";
    }
    return searchTerm
      ? `Không tìm thấy tài khoản đã xóa nào thuộc vai trò "${roleFilter}" khớp với tìm kiếm`
      : `Không có tài khoản đã xóa nào thuộc vai trò "${roleFilter}"`;
  };

  const getFilterBgClass = () => {
    switch (roleFilter) {
      case "All":
        return "bg-gray-100 text-gray-800";
      case "Student":
        return "bg-green-100 text-green-800";
      case "Staff":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <Tooltip id="action-tooltip" />
      <div className="w-full mx-auto border border-gray-600 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 ">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-2">
            <FaUsers className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Thùng Rác Tài Khoản
            </h2>
          </div>
          <span className="text-sm">
            Tổng: {filteredDeletedAccounts.length} tài khoản
          </span>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 p-4 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email"
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base shadow-sm"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-5 w-5 text-orange-500" />
              <span className="font-medium text-sm sm:text-base">Lọc theo vai trò:</span>
              <select
                value={roleFilter}
                onChange={(e) => dispatch(setRoleFilter(e.target.value))}
                className={`w-full sm:w-auto px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base ${getFilterBgClass()} shadow-sm`}
              >
                <option value="All">Tất cả</option>
                <option value="Student">Student</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 bg-red-50 p-4 rounded-lg mb-6 text-center text-sm sm:text-base">
            Lỗi: {error.message || "Đã xảy ra lỗi không xác định"}
          </p>
        )}

        {/* Loading or Empty State */}
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
            <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : filteredDeletedAccounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FaUsers className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">{getEmptyStateMessage()}</p>
          </div>
        ) : (
          <>
            {/* Table for Desktop */}
            <div className="hidden md:block overflow-x-auto rounded-lg shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="border-b items-center bg-gray-400">
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
                    <tr key={user.id} className="border-b hover:bg-gray-400 transition-colors">
                      <td className="px-4 py-3 text-center">
                        {(currentPage - 1) * postsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-3 text-center">{user.fullName || "N/A"}</td>
                      <td className="px-4 py-3 text-center">{user.email || "N/A"}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center text-center px-2 py-0.5 rounded-full text-xs font-normal md:text-sm ${
                            user.roleName === "Staff" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.roleName || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex justify-center gap-2">
                        <button
                          onClick={() => handleRestore(user.userId)}
                          data-tooltip-id="action-tooltip"
                          data-tooltip-content="Khôi phục tài khoản"
                          className="bg-green-100 text-green-700 hover:bg-green-200 p-2 rounded-lg transition-colors disabled:opacity-50"
                          disabled={loadingId === user.userId}
                        >
                          {loadingId === user.userId ? (
                            <FaSpinner className="w-4 h-4 animate-spin" />
                          ) : (
                            <FaTrashRestore className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(user.userId, user.fullName)}
                          data-tooltip-id="action-tooltip"
                          data-tooltip-content="Xóa vĩnh viễn"
                          className="bg-red-100 text-red-700 hover:bg-red-200 p-2 rounded-lg transition-colors disabled:opacity-50"
                          disabled={loadingId === user.userId}
                        >
                          {loadingId === user.userId ? (
                            <FaSpinner className="w-4 h-4 animate-spin" />
                          ) : (
                            <FaTrashAlt className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Card View for Mobile */}
            <div className="block md:hidden space-y-4">
              {currentPosts.map((user, index) => (
                <div
                  key={user.id}
                  className="border rounded-lg p-4 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">
                        #{(currentPage - 1) * postsPerPage + index + 1}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.roleName === "Staff" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.roleName || "N/A"}
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Họ và Tên:</span> {user.fullName || "N/A"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Email:</span> {user.email || "N/A"}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleRestore(user.userId)}
                        className="flex-1 bg-green-100 text-green-700 hover:bg-green-200 p-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors disabled:opacity-50"
                        disabled={loadingId === user.userId}
                      >
                        {loadingId === user.userId ? (
                          <FaSpinner className="w-4 h-4 animate-spin" />
                        ) : (
                          <FaTrashRestore className="w-4 h-4" />
                        )}
                        Khôi phục
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(user.userId, user.fullName)}
                        className="flex-1 bg-red-100 text-red-700 hover:bg-red-200 p-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors disabled:opacity-50"
                        disabled={loadingId === user.userId}
                      >
                        {loadingId === user.userId ? (
                          <FaSpinner className="w-4 h-4 animate-spin" />
                        ) : (
                          <FaTrashAlt className="w-4 h-4" />
                        )}
                        Xóa vĩnh viễn
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalAccounts > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalAccounts}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            )}
          </>
        )}

        {/* Modal Xóa Vĩnh Viễn */}
        {isDeleteModalOpen && (
          <div
            className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleCloseDeleteModal}
          >
            <div
              className="bg-neutral-300 rounded-lg shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 ease-in-out scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-red-600 mb-4">Xác nhận xóa vĩnh viễn</h2>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản{" "}
                <strong>"{userFullName}"</strong> không? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCloseDeleteModal}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
                  disabled={loadingId === userIdToDelete}
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeletePermanently}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                  disabled={loadingId === userIdToDelete}
                >
                  {loadingId === userIdToDelete ? "Đang xóa..." : "Xóa vĩnh viễn"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageListAccount;