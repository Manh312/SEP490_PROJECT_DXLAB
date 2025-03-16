import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Filter, Search, CheckCircle, XCircle } from "lucide-react";
import { useTheme } from "../../hooks/use-theme";
import { toast, ToastContainer } from "react-toastify";
import Pagination from "../../hooks/use-pagination";
import debounce from "lodash/debounce";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminPendingBlogs,
  fetchAdminApprovedBlogs,
  approveAdminBlog,
  cancelAdminBlog,
  setAdminStatusFilter,
} from "../../redux/slices/Blog";

const BlogListOfStaff = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();

  // Select admin state from Redux store
  const { adminBlogs, adminLoading, adminStatusFilter } = useSelector(
    (state) => state.blogs
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const blogsPerPage = 5;

  // Debounced search function
  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300);

  // Fetch blogs based on adminStatusFilter
  useEffect(() => {
    if (adminStatusFilter === "Pending") {
      dispatch(fetchAdminPendingBlogs());
    } else if (adminStatusFilter === "Approved") {
      dispatch(fetchAdminApprovedBlogs());
    }
  }, [dispatch, adminStatusFilter]);

  // Filter and search logic (client-side filtering for search)
  const filteredBlogs = useMemo(() => {
    let result = adminBlogs || [];

    if (searchTerm) {
      result = result.filter((blog) =>
        blog.blogTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return result;
  }, [adminBlogs, searchTerm]);

  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const displayedBlogs = filteredBlogs.slice(
    (currentPage - 1) * blogsPerPage,
    currentPage * blogsPerPage
  );

  // Adjust current page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Handle approve blog
  const handleApprove = async (id) => {
    try {
      await dispatch(approveAdminBlog(id)).unwrap();
      toast.success("Bài blog đã được phê duyệt!");
      if (adminStatusFilter === "Pending") dispatch(fetchAdminPendingBlogs());
      else if (adminStatusFilter === "Approved") dispatch(fetchAdminApprovedBlogs());
    } catch (err) {
      toast.error("Phê duyệt thất bại!");
    }
  };

  // Handle cancel blog
  const handleCancel = async (id) => {
    try {
      await dispatch(cancelAdminBlog(id)).unwrap();
      toast.success("Bài blog đã bị hủy!");
      if (adminStatusFilter === "Pending") dispatch(fetchAdminPendingBlogs());
    } catch (err) {
      toast.error("Hủy thất bại!");
    }
  };

  const getFilterBgClass = () => {
    switch (adminStatusFilter) {
      case "All":
        return "bg-gray-100 text-gray-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEmptyStateMessage = () => {
    if (adminStatusFilter === "All") {
      return searchTerm
        ? "Không tìm thấy blog nào khớp với tìm kiếm"
        : "Hiện tại không có blog nào";
    }
    return searchTerm
      ? `Không tìm thấy blog nào với trạng thái "${adminStatusFilter}" khớp với tìm kiếm`
      : `Không có blog nào với trạng thái "${adminStatusFilter}"`;
  };

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div
        className={`w-full border mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 ${
          theme === "dark" ? "bg-black text-white" : "bg-white text-gray-800"
        }`}
      >
        {/* Header Section */}
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <PlusCircle className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Danh Sách Blog (Admin)
            </h2>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 p-4 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề"
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base shadow-sm"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-5 w-5 text-orange-500" />
              <span className="font-medium text-sm sm:text-base">Lọc theo trạng thái:</span>
              <select
                value={adminStatusFilter}
                onChange={(e) => dispatch(setAdminStatusFilter(e.target.value))}
                className={`w-full sm:w-auto px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base ${getFilterBgClass()} shadow-sm`}
              >
                <option value="All">Tất cả</option>
                <option value="Approved">Đã duyệt</option>
                <option value="Pending">Đang chờ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading or Empty State */}
        {adminLoading ? (
          <div className="flex items-center justify-center py-6">
            <span className="animate-spin text-orange-500 w-6 h-6 mr-2">⏳</span>
            <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <PlusCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">{getEmptyStateMessage()}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block border rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b bg-gray-400">
                  <tr>
                    <th className="px-3 py-3 font-semibold text-lg uppercase tracking-wide text-center">
                      #
                    </th>
                    <th className="px-3 py-3 font-semibold text-lg uppercase tracking-wide text-center">
                      Tiêu đề
                    </th>
                    <th className="px-3 py-3 font-semibold text-lg uppercase tracking-wide text-center">
                      Ngày tạo
                    </th>
                    <th className="px-3 py-3 font-semibold text-lg uppercase tracking-wide text-center">
                      Trạng thái
                    </th>
                    <th className="px-3 py-3 font-semibold text-lg uppercase tracking-wide text-center">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedBlogs.map((blog, index) => (
                    <tr key={blog.id} className="border-b hover:bg-gray-400 transition-colors">
                      <td className="px-3 py-4 text-center">
                        {(currentPage - 1) * blogsPerPage + index + 1}
                      </td>
                      <td className="px-3 py-4 text-center">
                        <Link to={`/manage/admin/blog/${blog.id}`} className="hover:text-neutral-300">
                          {blog.blogTitle}
                        </Link>
                      </td>
                      <td className="px-3 py-4 text-center">
                        {new Date(blog.blogCreatedDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-normal text-xs md:text-sm ${
                            blog.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {blog.status}
                        </span>
                      </td>
                      <td className="px-3 py-4 flex justify-center gap-2">
                        {blog.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(blog.id)}
                              className="bg-green-100 text-green-700 hover:bg-green-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                              title="Phê duyệt"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCancel(blog.id)}
                              className="bg-red-100 text-red-700 hover:bg-red-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                              title="Hủy"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4">
              {displayedBlogs.map((blog, index) => (
                <div
                  key={blog.id}
                  className="border rounded-lg p-3 sm:p-4 shadow-sm hover:bg-gray-500 transition-colors"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-sm">
                        #{(currentPage - 1) * blogsPerPage + index + 1}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal ${
                          blog.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {blog.status}
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Tiêu đề:</span> {blog.blogTitle}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Ngày tạo:</span>{" "}
                      {new Date(blog.blogCreatedDate).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      {blog.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(blog.id)}
                            className="bg-green-100 text-green-700 hover:bg-green-400 p-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Phê duyệt</span>
                          </button>
                          <button
                            onClick={() => handleCancel(blog.id)}
                            className="bg-red-100 text-red-700 hover:bg-red-400 p-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Hủy</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogListOfStaff;