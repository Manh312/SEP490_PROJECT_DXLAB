import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Filter, Search, CheckCircle, XCircle, Trash, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../../hooks/use-theme";
import { toast, ToastContainer } from "react-toastify";
import debounce from "lodash/debounce";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminPendingBlogs,
  fetchAdminApprovedBlogs,
  approveAdminBlog,
  cancelAdminBlog,
  setAdminStatusFilter,
  deleteAdminBlog,
} from "../../redux/slices/Blog";

const BlogListOfStaff = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { pendingBlogs, approvedBlogs, adminLoading, adminStatusFilter } = useSelector(
    (state) => state.blogs
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogIdToDelete, setBlogIdToDelete] = useState(null);
  const [blogTitle, setBlogTitle] = useState("");
  const [imageIndices, setImageIndices] = useState({}); // Quản lý chỉ số ảnh
  const blogsPerPage = 5;
  const baseUrl = "https://localhost:9999";

  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300);

  useEffect(() => {
    dispatch(fetchAdminPendingBlogs());
    dispatch(fetchAdminApprovedBlogs());
  }, [dispatch]);

  const mapStatusToString = (status) => {
    switch (status) {
      case 1: return "Đang chờ";
      case 2: return "Đã duyệt";
      default: return "Không xác định";
    }
  };

  const filteredBlogs = useMemo(() => {
    let result = [];
    if (adminStatusFilter === "All") {
      result = [...(pendingBlogs || []), ...(approvedBlogs || [])];
    } else if (adminStatusFilter === "Pending") {
      result = pendingBlogs || [];
    } else if (adminStatusFilter === "Approved") {
      result = approvedBlogs || [];
    }

    result = result.filter((blog) => blog && typeof blog === "object");
    if (searchTerm) {
      result = result.filter((blog) =>
        blog.blogTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return result.map((blog) => ({
      ...blog,
      status: blog.status != null ? mapStatusToString(blog.status) : "Không xác định",
    }));
  }, [pendingBlogs, approvedBlogs, searchTerm, adminStatusFilter]);

  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const displayedBlogs = filteredBlogs.slice(
    (currentPage - 1) * blogsPerPage,
    currentPage * blogsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handleApprove = async (blogId) => {
    if (!blogId) {
      toast.error("Không tìm thấy ID của blog!");
      return;
    }
    setLocalLoading(true);
    try {
      const response = await dispatch(approveAdminBlog(blogId)).unwrap();
      toast.success(response.message || "Bài blog đã được phê duyệt!");
      await Promise.all([
        dispatch(fetchAdminPendingBlogs()),
        dispatch(fetchAdminApprovedBlogs()),
      ]);
    } catch (err) {
      toast.error(err.message || "Phê duyệt thất bại!");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleCancel = async (blogId) => {
    if (!blogId) {
      toast.error("Không tìm thấy ID của blog!");
      return;
    }
    setLocalLoading(true);
    try {
      const response = await dispatch(cancelAdminBlog(blogId)).unwrap();
      toast.success(response.message || "Bài blog đã bị hủy!");
      await Promise.all([
        dispatch(fetchAdminPendingBlogs()),
        dispatch(fetchAdminApprovedBlogs()),
      ]);
    } catch (err) {
      toast.error(err.message || "Hủy thất bại!");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!blogIdToDelete) {
      toast.error("Không tìm thấy ID của blog!");
      return;
    }
    setLocalLoading(true);
    try {
      const response = await dispatch(deleteAdminBlog(blogIdToDelete)).unwrap();
      toast.success(response.message || "Bài blog đã được xóa!");
      await Promise.all([
        dispatch(fetchAdminPendingBlogs()),
        dispatch(fetchAdminApprovedBlogs()),
      ]);
    } catch (err) {
      toast.error(err.message || "Xóa thất bại!");
    } finally {
      setLocalLoading(false);
      setIsDeleteModalOpen(false);
      setBlogIdToDelete(null);
      setBlogTitle("");
    }
  };

  const handleOpenDeleteModal = (blogId, title) => {
    setBlogIdToDelete(blogId);
    setBlogTitle(title);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setBlogIdToDelete(null);
    setBlogTitle("");
  };

  const getFilterBgClass = () => {
    switch (adminStatusFilter) {
      case "All": return "bg-gray-100 text-gray-800";
      case "Approved": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Đã duyệt": return "bg-green-100 text-green-800";
      case "Đang chờ": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const renderImages = (images, blogId) => {
    if (!Array.isArray(images) || images.length === 0) {
      return (
        <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded-lg mx-auto">
          <span className="text-gray-500 text-sm">No Image</span>
        </div>
      );
    }

    const currentIndex = imageIndices[blogId] || 0;

    const prevImage = () => {
      setImageIndices((prev) => ({
        ...prev,
        [blogId]: (currentIndex - 1 + images.length) % images.length,
      }));
    };

    const nextImage = () => {
      setImageIndices((prev) => ({
        ...prev,
        [blogId]: (currentIndex + 1) % images.length,
      }));
    };

    return (
      <div className="relative w-40 h-40 mx-auto group">
        <img
          src={
            images[currentIndex].startsWith("http")
              ? images[currentIndex]
              : `${baseUrl}/${images[currentIndex]}`
          }
          alt={`Blog image ${currentIndex}`}
          className="w-full h-full object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
          onError={(e) => (e.target.src = "/placeholder-image.jpg")}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full ${
                    idx === currentIndex ? "bg-white" : "bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div
        className={`w-full border mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 ${
          theme === "dark" ? "bg-black text-white" : "bg-white text-gray-800"
        }`}
      >
        {/* Header */}
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <PlusCircle className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Danh Sách Blog (Admin)
            </h2>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="mb-6 p-4 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề"
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-5 w-5 text-orange-500" />
              <span className="font-medium text-sm sm:text-base">Lọc:</span>
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

        {/* Loading State */}
        {(adminLoading || localLoading) ? (
          <div className="flex items-center justify-center py-6">
            <span className="animate-spin text-orange-500 w-6 h-6 mr-2">⏳</span>
            <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <PlusCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm
                ? `Không tìm thấy blog nào với trạng thái "${adminStatusFilter === "All" ? "Tất cả" : mapStatusToString(adminStatusFilter === "Approved" ? 2 : 1)}" khớp với tìm kiếm`
                : `Không có blog nào với trạng thái "${adminStatusFilter === "All" ? "Tất cả" : mapStatusToString(adminStatusFilter === "Approved" ? 2 : 1)}"`}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block border rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b bg-gray-400">
                  <tr>
                    <th className="px-4 py-3 font-bold text-lg uppercase tracking-wide text-center text-gray-700">#</th>
                    <th className="px-4 py-3 font-bold text-lg uppercase tracking-wide text-center text-gray-700">Ảnh</th>
                    <th className="px-4 py-3 font-bold text-lg uppercase tracking-wide text-center text-gray-700">Tiêu đề</th>
                    <th className="px-4 py-3 font-bold text-lg uppercase tracking-wide text-center text-gray-700">Nội dung</th>
                    <th className="px-4 py-3 font-bold text-lg uppercase tracking-wide text-center text-gray-700">Người tạo</th>
                    <th className="px-4 py-3 font-bold text-lg uppercase tracking-wide text-center text-gray-700">Ngày tạo</th>
                    <th className="px-4 py-3 font-bold text-lg uppercase tracking-wide text-center text-gray-700">Trạng thái</th>
                    <th className="px-4 py-3 font-bold text-lg uppercase tracking-wide text-center text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedBlogs.map((blog, index) => (
                    <tr
                      key={blog.blogId}
                      className="border-b hover:bg-gray-500 transition-colors"
                    >
                      <td className="px-4 py-4 text-center">
                        {(currentPage - 1) * blogsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {renderImages(blog.images, blog.blogId)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Link
                          to={`/dashboard/blog/${blog.blogId}`}
                          className="hover:text-orange-400 transition-colors"
                        >
                          {blog.blogTitle}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-center truncate max-w-xs">
                        {blog.blogContent}
                      </td>
                      <td className="px-4 py-4 text-center">{blog.userName}</td>
                      <td className="px-4 py-4 text-center">
                        {formatDate(blog.blogCreatedDate)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full font-normal text-sm ${getStatusClass(blog.status)}`}
                        >
                          {blog.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center space-x-2">
                        {blog.status === "Đang chờ" && (
                          <>
                            <button
                              onClick={() => handleApprove(blog.blogId)}
                              className="bg-green-100 text-green-700 hover:bg-green-200 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                              title="Phê duyệt"
                              disabled={localLoading}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCancel(blog.blogId)}
                              className="bg-red-100 text-red-700 hover:bg-red-200 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                              title="Hủy"
                              disabled={localLoading}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {blog.status === "Đã duyệt" && (
                          <button
                            onClick={() => handleOpenDeleteModal(blog.blogId, blog.blogTitle)}
                            className="bg-red-100 text-red-700 hover:bg-red-200 p-2 rounded-lg transition-colors w-10 h-10 items-center justify-center inline-flex"
                            title="Xóa"
                            disabled={localLoading}
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="block md:hidden space-y-4">
              {displayedBlogs.map((blog, index) => (
                <div
                  key={blog.blogId}
                  className="border rounded-lg p-4 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm text-gray-700">
                        #{(currentPage - 1) * blogsPerPage + index + 1}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(blog.status)}`}
                      >
                        {blog.status}
                      </span>
                    </div>
                    {renderImages(blog.images, blog.blogId)}
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Tiêu đề:</span>{" "}
                      <Link
                        to={`/manage/admin/blog/${blog.blogId}`}
                        className="text-orange-500 hover:text-orange-600"
                      >
                        {blog.blogTitle}
                      </Link>
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      <span className="font-medium">Nội dung:</span> {blog.blogContent}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{blog.userName}</p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Ngày tạo:</span>{" "}
                      {formatDate(blog.blogCreatedDate)}
                    </p>
                    <div className="flex gap-2 justify-center mt-2">
                      {blog.status === "Đang chờ" && (
                        <>
                          <button
                            onClick={() => handleApprove(blog.blogId)}
                            className="bg-green-200 text-green-700 hover:bg-green-300 p-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                            disabled={localLoading}
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Phê duyệt</span>
                          </button>
                          <button
                            onClick={() => handleCancel(blog.blogId)}
                            className="bg-red-200 text-red-700 hover:bg-red-300 p-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                            disabled={localLoading}
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Hủy</span>
                          </button>
                        </>
                      )}
                      {blog.status === "Đã duyệt" && (
                        <button
                          onClick={() => handleOpenDeleteModal(blog.blogId, blog.blogTitle)}
                          className="bg-red-200 text-red-700 hover:bg-red-300 p-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                          disabled={localLoading}
                        >
                          <Trash className="w-4 h-4" />
                          <span>Xóa</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && (
          <div
            className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleCloseDeleteModal}
          >
            <div
              className="bg-gray-300 rounded-lg shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 ease-in-out scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-red-600 mb-4">Xác nhận xóa</h2>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa blog <strong>"{blogTitle}"</strong> không? Hành
                động này không thể hoàn tác.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCloseDeleteModal}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                  disabled={localLoading}
                >
                  {localLoading ? "Đang xóa..." : "Xóa"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogListOfStaff;