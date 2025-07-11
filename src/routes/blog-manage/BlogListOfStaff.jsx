import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Trash,
  ChevronLeft,
  ChevronRight,
  FileText,
  Eye, // Added Eye icon for "Xem chi tiết"
} from "lucide-react";
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
import { addNotification } from "../../redux/slices/Notification";
import Pagination from "../../hooks/use-pagination";
import { FaSpinner } from "react-icons/fa";
import { startSignalRConnection, stopSignalRConnection } from "../../utils/signalR/connection";
import { toast } from "react-toastify";
import { signalRConfig } from "../../utils/signalR/config";
import { Tooltip } from "react-tooltip";

// Utility to track shown notifications
const notificationTracker = new Set();

const BlogListOfStaff = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pendingBlogs, approvedBlogs, adminLoading, adminStatusFilter } = useSelector(
    (state) => state.blogs
  );
  const { token } = useSelector((state) => state.auth);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogIdToDelete, setBlogIdToDelete] = useState(null);
  const [blogTitle, setBlogTitle] = useState("");
  const [imageIndices, setImageIndices] = useState({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const blogsPerPage = 5;
  const baseUrl = signalRConfig.baseUrl;

  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300);

  // SignalR Setup with deduplicated notifications
  useEffect(() => {
    let connection;
    const setupSignalR = async () => {
      try {
        connection = await startSignalRConnection("blogHub", token);

        const showNotificationOnce = (eventName, message, blogId, type) => {
          const notificationKey = `${eventName}-${blogId}`;
          if (!notificationTracker.has(notificationKey)) {
            notificationTracker.add(notificationKey);
            dispatch(
              addNotification({
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                message,
                type,
                timestamp: new Date().toISOString(),
              })
            );
            notificationTracker.delete(notificationKey);
          }
        };

        connection.on("ReceiveNewBlog", (blog) => {
          showNotificationOnce(
            "ReceiveNewBlog",
            `Blog mới: "${blog.blogTitle}" đã được tạo!`,
            blog.blogId,
            "info"
          );
          dispatch(fetchAdminPendingBlogs());
        });

        connection.on("ReceiveEditedBlog", (blog) => {
          showNotificationOnce(
            "ReceiveEditedBlog",
            `Blog "${blog.blogTitle}" đã được chỉnh sửa!`,
            blog.blogId,
            "info"
          );
          if (blog.status === 1) {
            dispatch(fetchAdminPendingBlogs());
          } else if (blog.status === 2) {
            dispatch(fetchAdminApprovedBlogs());
          }
        });

        connection.on("ReceiveBlogStatus", () => {
          dispatch(fetchAdminPendingBlogs());
          dispatch(fetchAdminApprovedBlogs());
        });

        connection.on("ReceiveBlogDeleted", () => {
          dispatch(fetchAdminPendingBlogs());
          dispatch(fetchAdminApprovedBlogs());
        });

        const fetchPromise = Promise.all([
          dispatch(fetchAdminPendingBlogs()).unwrap(),
          dispatch(fetchAdminApprovedBlogs()).unwrap(),
        ]);

        await Promise.all([
          fetchPromise,
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);

        setIsInitialLoading(false);
      } catch (err) {
        console.error("Failed to setup SignalR:", err);
        setIsInitialLoading(false);
      }
    };

    setupSignalR();

    return () => {
      if (connection) {
        connection.off("ReceiveNewBlog");
        connection.off("ReceiveEditedBlog");
        connection.off("ReceiveBlogStatus");
        connection.off("ReceiveBlogDeleted");
        stopSignalRConnection();
      }
    };
  }, [dispatch, token, navigate]);

  // Làm mới danh sách blog định kỳ
  useEffect(() => {
    dispatch(fetchAdminPendingBlogs());
    dispatch(fetchAdminApprovedBlogs());
  }, [dispatch]);

  const mapStatusToString = (status) => {
    switch (status) {
      case 1:
        return "Đang chờ";
      case 2:
        return "Đã duyệt";
      default:
        return "Không xác định";
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
      toast.error("Không tìm thấy ID của blog!", {
        position: "top-right",
      });
      return;
    }
    setLocalLoading(true);
    try {
      const response = await dispatch(approveAdminBlog(blogId)).unwrap();
      toast.success(response.message || "Bài blog đã được phê duyệt!", {
        position: "top-right",
      });
      await Promise.all([
        dispatch(fetchAdminPendingBlogs()),
        dispatch(fetchAdminApprovedBlogs()),
      ]);
    } catch (err) {
      toast.error(err.message || "Phê duyệt thất bại!", {
        position: "top-right",
      });
    } finally {
      setLocalLoading(false);
    }
  };

  const handleCancel = async (blogId) => {
    if (!blogId) {
      toast.error("Không tìm thấy ID của blog!", {
        position: "top-right",
      });
      return;
    }
    setLocalLoading(true);
    try {
      const response = await dispatch(cancelAdminBlog(blogId)).unwrap();
      toast.success(response.message || "Bài blog đã bị hủy!", {
        position: "top-right",
      });
      await Promise.all([
        dispatch(fetchAdminPendingBlogs()),
        dispatch(fetchAdminApprovedBlogs()),
      ]);
    } catch (err) {
      toast.error(err.message || "Hủy thất bại!", {
        position: "top-right",
      });
    } finally {
      setLocalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!blogIdToDelete) {
      toast.error("Không tìm thấy ID của blog!", {
        position: "top-right",
      });
      return;
    }
    setLocalLoading(true);
    try {
      const response = await dispatch(deleteAdminBlog(blogIdToDelete)).unwrap();
      toast.success(response.message || "Bài blog đã được xóa!", {
        position: "top-right",
      });
      await Promise.all([
        dispatch(fetchAdminPendingBlogs()),
        dispatch(fetchAdminApprovedBlogs()),
      ]);
    } catch (err) {
      toast.error(err.message || "Xóa thất bại!", {
        position: "top-right",
      });
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

  const getStatusClass = (status) => {
    switch (status) {
      case "Đã duyệt":
        return "bg-green-100 text-green-800";
      case "Đang chờ":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-gray-200 rounded-lg mx-auto">
          <span className="text-gray-500 text-xs">No Image</span>
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
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto group">
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
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1 h-1 rounded-full ${idx === currentIndex ? "bg-white" : "bg-gray-400"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const formatTitle = (title) => {
    if (typeof title !== "string") return "Untitled";
    if (title.length > 30) {
      return `${title.slice(0, 30)}...`;
    }
    return title;
  };

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-6 xl:px-8 mb-10">
      <div className="w-full border border-gray-600 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <FileText className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Danh Sách Duyệt Blog</h2>
          </div>
        </div>

        <div className="mb-6 p-4 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề"
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm sm:text-base shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-5 w-5 text-orange-500" />
              <span className="font-medium text-sm sm:text-base">Lọc:</span>
              <select
                value={adminStatusFilter}
                onChange={(e) => dispatch(setAdminStatusFilter(e.target.value))}
                className={`w-full sm:w-auto px-3 py-2 border rounded-lg text-sm sm:text-base ${getFilterBgClass()} shadow-sm`}
              >
                <option value="All">Tất cả</option>
                <option value="Approved">Đã duyệt</option>
                <option value="Pending">Đang chờ</option>
              </select>
            </div>
          </div>
        </div>

        {(isInitialLoading || adminLoading || localLoading) ? (
          <div className="flex items-center justify-center py-6 mb-200">
            <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
            <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg text-center">
              {searchTerm
                ? `Không tìm thấy blog nào với trạng thái "${adminStatusFilter === "All" ? "Tất cả" : mapStatusToString(adminStatusFilter === "Approved" ? 2 : 1)}" khớp với tìm kiếm`
                : `Không có blog nào với trạng thái "${adminStatusFilter === "All" ? "Tất cả" : mapStatusToString(adminStatusFilter === "Approved" ? 2 : 1)}"`}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block border rounded Spruce Grove-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b bg-gray-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">#</th>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">Ảnh</th>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">Tiêu đề</th>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">Người tạo</th>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">Ngày tạo</th>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">Trạng thái</th>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">Xem chi tiết</th> {/* New column */}
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedBlogs.map((blog, index) => (
                    <tr key={blog.blogId} className="border-b hover:bg-gray-500 transition-colors">
                      <td className="px-4 py-3 text-center">
                        {(currentPage - 1) * blogsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {renderImages(blog.images, blog.blogId)}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-pre-wrap break-words">
                        {formatTitle(blog.blogTitle)} {/* Removed Link */}
                      </td>
                      <td className="px-4 py-3 text-center">{blog.userName}</td>
                      <td className="px-4 py-3 text-center">
                        {formatDate(blog.blogCreatedDate)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full font-normal ${getStatusClass(blog.status)}`}>
                          {blog.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => navigate(`/dashboard/blog/${blog.blogId}`)}
                          data-tooltip-id="action-tooltip"
                          data-tooltip-content="Xem chi tiết"
                          className="bg-orange-100 text-orange-700 hover:bg-orange-200 p-2 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center space-x-2">
                        {blog.status === "Đang chờ" && (
                          <div className="flex justify-center items-center space-x-2">
                            <button
                              onClick={() => handleApprove(blog.blogId)}
                              data-tooltip-id="action-tooltip"
                              data-tooltip-content="Phê duyệt"
                              className="bg-green-100 text-green-700 hover:bg-green-200 p-2 rounded-lg transition-colors"
                              disabled={localLoading}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCancel(blog.blogId)}
                              data-tooltip-id="action-tooltip"
                              data-tooltip-content="Hủy phê duyệt"
                              className="bg-red-100 text-red-700 hover:bg-red-200 p-2 rounded-lg transition-colors"
                              disabled={localLoading}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {blog.status === "Đã duyệt" && (
                          <button
                            onClick={() => handleOpenDeleteModal(blog.blogId, blog.blogTitle)}
                            data-tooltip-id="action-tooltip"
                            data-tooltip-content="Xóa"
                            className="bg-red-100 text-red-700 hover:bg-red-200 p-2 rounded-lg transition-colors"
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

            <div className="hidden md:block lg:hidden border rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b bg-gray-400">
                  <tr>
                    <th className="px-3 py-2 font-bold text-xs uppercase tracking-wide text-center text-gray-700">#</th>
                    <th className="px-3 py-2 font-bold text-xs uppercase tracking-wide text-center text-gray-700">Ảnh</th>
                    <th className="px-3 py-2 font-bold text-xs uppercase tracking-wide text-center text-gray-700">Tiêu đề</th>
                    <th className="px-3 py-2 font-bold text-xs uppercase tracking-wide text-center text-gray-700">Trạng thái</th>
                    <th className="px-3 py-2 font-bold text-xs uppercase tracking-wide text-center text-gray-700">Xem chi tiết</th> {/* New column */}
                    <th className="px-3 py-2 font-bold text-xs uppercase tracking-wide text-center text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedBlogs.map((blog, index) => (
                    <tr key={blog.blogId} className="border-b hover:bg-gray-500 transition-colors">
                      <td className="px-3 py-2 text-center text-xs">
                        {(currentPage - 1) * blogsPerPage + index + 1}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {renderImages(blog.images, blog.blogId)}
                      </td>
                      <td className="px-3 py-2 text-center text-xs">
                        {formatTitle(blog.blogTitle)} {/* Removed Link */}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full font-normal text-xs ${getStatusClass(blog.status)}`}>
                          {blog.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => navigate(`/dashboard/blog/${blog.blogId}`)}
                          data-tooltip-id="action-tooltip"
                          data-tooltip-content="Xem chi tiết"
                          className="bg-orange-100 text-orange-700 hover:bg-orange-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="px-3 py-2 text-center space-x-1">
                        {blog.status === "Đang chờ" && (
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleApprove(blog.blogId)}
                              data-tooltip-id="action-tooltip"
                              data-tooltip-content="Phê duyệt"
                              className="bg-green-100 text-green-700 hover:bg-green-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                              disabled={localLoading}
                            >
                              <CheckCircle className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleCancel(blog.blogId)}
                              data-tooltip-id="action-tooltip"
                              data-tooltip-content="Hủy phê duyệt"
                              className="bg-red-100 text-red-700 hover:bg-red-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                              disabled={localLoading}
                            >
                              <XCircle className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {blog.status === "Đã duyệt" && (
                          <button
                            onClick={() => handleOpenDeleteModal(blog.blogId, blog.blogTitle)}
                            data-tooltip-id="action-tooltip"
                            data-tooltip-content="Xóa"
                            className="bg-red-100 text-red-700 hover:bg-red-200 p-1 rounded-lg transition-colors"
                            disabled={localLoading}
                          >
                            <Trash className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="block md:hidden space-y-4">
              {displayedBlogs.map((blog, index) => (
                <div key={blog.blogId} className="border rounded-lg p-4 shadow-sm hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-xs text-gray-700">
                        #{(currentPage - 1) * blogsPerPage + index + 1}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(blog.status)}`}>
                        {blog.status}
                      </span>
                    </div>
                    {renderImages(blog.images, blog.blogId)}
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Tiêu đề:</span>{" "}
                      {formatTitle(blog.blogTitle)} {/* Removed Link */}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{blog.userName}</p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Ngày tạo:</span>{" "}
                      {formatDate(blog.blogCreatedDate)}
                    </p>
                    <div className="flex gap-2 justify-center mt-2">
                      <button
                        onClick={() => navigate(`/dashboard/blog/${blog.blogId}`)}
                        data-tooltip-id="action-tooltip"
                        data-tooltip-content="Xem chi tiết"
                        className="bg-orange-100 text-orange-700 hover:bg-orange-200 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer text-xs flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Xem chi tiết</span>
                      </button>
                      {blog.status === "Đang chờ" && (
                        <>
                          <button
                            onClick={() => handleApprove(blog.blogId)}
                            data-tooltip-id="action-tooltip"
                            data-tooltip-content="Phê duyệt"
                            className="bg-green-100 text-green-700 hover:bg-green-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                            disabled={localLoading}
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Phê duyệt</span>
                          </button>
                          <button
                            onClick={() => handleCancel(blog.blogId)}
                            data-tooltip-id="action-tooltip"
                            data-tooltip-content="Hủy phê duyệt"
                            className="bg-red-100 text-red-700 hover:bg-red-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
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
                          data-tooltip-id="action-tooltip"
                          data-tooltip-content="Xóa"
                          className="bg-red-200 text-red-700 hover:bg-red-300 p-2 rounded-lg flex items-center justify-center gap-2 text-xs"
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

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
            )}
          </>
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseDeleteModal}>
            <div className="bg-gray-300 rounded-lg shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 ease-in-out scale-100" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-semibold text-red-600 mb-4">Xác nhận xóa</h2>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa blog <strong>{blogTitle}</strong> không? Hành động này không thể hoàn tác.
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
      <Tooltip id="action-tooltip" />
    </div>
  );
};

export default BlogListOfStaff;