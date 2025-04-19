import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { PlusCircle, Filter, Search, Eye, ChevronLeft, ChevronRight, FileText, Edit } from "lucide-react";
import debounce from "lodash/debounce";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogsByStatus, setStatusFilter } from "../../../redux/slices/Blog";
import { addNotification } from "../../../redux/slices/Notification";
import Pagination from "../../../hooks/use-pagination";
import { FaSpinner } from "react-icons/fa";
import { startSignalRConnection, stopSignalRConnection, getSignalRConnection } from "../../../utils/signalR/connection";
import { registerSignalREvent, unregisterSignalREvent } from "../../../utils/signalR/event";
import { signalRConfig } from "../../../utils/signalR/config";

// Utility to track shown notifications
const notificationTracker = new Set();

const BlogList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { blogs, statusFilter, error, loading } = useSelector((state) => state.blogs);
  const { token } = useSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [imageIndices, setImageIndices] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [signalRError, setSignalRError] = useState(null);
  const blogsPerPage = 5;
  const baseUrl = signalRConfig.baseUrl;

  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300);

  // Wait for the connection to be in the "Connected" state
  const waitForConnection = async (hubName, maxWaitTime = 10000, interval = 500) => {
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitTime) {
      const connection = getSignalRConnection(hubName);
      if (connection && connection.state === "Connected") {
        return connection;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    throw new Error(`SignalR connection for ${hubName} did not reach Connected state within ${maxWaitTime / 1000} seconds.`);
  };

  // SignalR Setup (Run only once on mount)
  useEffect(() => {
    let mounted = true;
    let connection = null;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 5000; // 5 seconds

    const setupSignalR = async () => {
      const connectWithRetry = async () => {
        try {
          console.log("Attempting to start SignalR connection...");
          connection = await startSignalRConnection("blogHub", token);
          setSignalRError(null);
          retryCount = 0; // Reset retry count on successful connection

          if (mounted) {
            // Wait for the connection to be fully in the "Connected" state
            await waitForConnection("blogHub");

            // Register SignalR events
            console.log("Registering SignalR events...");
            registerSignalREvent("blogHub", "ReceiveBlogStatus", (blog) => {
              console.log("Received ReceiveBlogStatus event:", blog);
              const message = `Blog "${blog.blogTitle}" đã cập nhật trạng thái thành: ${getStatusDisplayName(blog.status)}`;
              const notificationKey = `ReceiveBlogStatus-${blog.blogId}`;
              if (!notificationTracker.has(notificationKey)) {
                notificationTracker.add(notificationKey);
                dispatch(
                  addNotification({
                    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    message,
                    type: "info",
                    timestamp: new Date().toISOString(),
                  })
                );
                setTimeout(() => notificationTracker.delete(notificationKey), 5000);
              }
              dispatch(fetchBlogsByStatus(statusFilter)).unwrap().catch((err) => {
                console.error("Error refreshing blog list after ReceiveBlogStatus:", err);
              });
            });

            registerSignalREvent("blogHub", "ReceiveBlogDeleted", (blogId) => {
              console.log("Received ReceiveBlogDeleted event:", blogId);
              const message = `Blog với ID ${blogId} đã bị xóa bởi Admin!`;
              const notificationKey = `ReceiveBlogDeleted-${blogId}`;
              if (!notificationTracker.has(notificationKey)) {
                notificationTracker.add(notificationKey);
                dispatch(
                  addNotification({
                    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    message,
                    type: "warning",
                    timestamp: new Date().toISOString(),
                  })
                );
                setTimeout(() => notificationTracker.delete(notificationKey), 5000);
              }
              dispatch(fetchBlogsByStatus(statusFilter)).unwrap().catch((err) => {
                console.error("Error refreshing blog list after ReceiveBlogDeleted:", err);
              });
            });

            registerSignalREvent("blogHub", "ReceiveBlogCanceled", (blog) => {
              console.log("Received ReceiveBlogCanceled event:", blog);
              const message = `Blog "${blog.blogTitle}" đã bị hủy bởi Admin!`;
              const notificationKey = `ReceiveBlogCanceled-${blog.blogId}`;
              if (!notificationTracker.has(notificationKey)) {
                notificationTracker.add(notificationKey);
                dispatch(
                  addNotification({
                    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    message,
                    type: "warning",
                    timestamp: new Date().toISOString(),
                  })
                );
                setTimeout(() => notificationTracker.delete(notificationKey), 5000);
              }
              dispatch(fetchBlogsByStatus(statusFilter)).unwrap().catch((err) => {
                console.error("Error refreshing blog list after ReceiveBlogCanceled:", err);
              });
            });
          }
        } catch (err) {
          console.error("Error setting up SignalR:", err);
          if (mounted) {
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`Retrying SignalR connection (${retryCount}/${maxRetries}) in ${retryDelay / 1000} seconds...`);
              setTimeout(connectWithRetry, retryDelay);
            } else {
              setSignalRError(`Không thể kết nối SignalR sau ${maxRetries} lần thử: ${err.message}`);
            }
          }
        }
      };

      connectWithRetry();
    };

    setupSignalR();

    // Fetch initial blogs (run once on mount)
    const fetchInitialBlogs = async () => {
      try {
        setInitialLoading(true);
        await dispatch(fetchBlogsByStatus(statusFilter)).unwrap();
      } catch (err) {
        console.error("Error fetching initial blogs:", err);
      } finally {
        if (mounted) {
          setInitialLoading(false);
        }
      }
    };

    fetchInitialBlogs();

    return () => {
      mounted = false;
      console.log("Cleaning up SignalR connection...");
      unregisterSignalREvent("blogHub", "ReceiveBlogStatus");
      unregisterSignalREvent("blogHub", "ReceiveBlogDeleted");
      unregisterSignalREvent("blogHub", "ReceiveBlogCanceled");
      if (connection) {
        stopSignalRConnection("blogHub");
      }
    };
  }, [token, dispatch]);

  // Refresh blog list when statusFilter changes
  useEffect(() => {
    setInitialLoading(true);
    dispatch(fetchBlogsByStatus(statusFilter))
      .unwrap()
      .catch((err) => {
        console.error("Error refreshing blog list on statusFilter change:", err);
      })
      .finally(() => {
        setInitialLoading(false);
      });
  }, [dispatch, statusFilter]);

  const filteredBlogs = useMemo(() => {
    if (error || !Array.isArray(blogs)) return [];
    let result = blogs.filter(
      (blog) => blog && String(blog.status) === String(statusFilter)
    );
    if (searchTerm) {
      result = result.filter((blog) =>
        (blog.blogTitle || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [blogs, searchTerm, statusFilter, error]);

  useEffect(() => {
    const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
    if (filteredBlogs.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    } else if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredBlogs, currentPage, blogsPerPage]);

  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const displayedBlogs = filteredBlogs.slice(
    (currentPage - 1) * blogsPerPage,
    currentPage * blogsPerPage
  );

  const getStatusDisplayName = (status) => {
    switch (status) {
      case 2:
        return "Đã xuất bản";
      case 1:
        return "Đang chờ";
      case 0:
        return "Bị hủy";
      default:
        return "Không xác định";
    }
  };

  const getFilterBgClass = () => {
    switch (statusFilter) {
      case "2":
        return "bg-green-100 text-green-800";
      case "1":
        return "bg-yellow-100 text-yellow-800";
      case "0":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 2:
        return "bg-green-100 text-green-800";
      case 1:
        return "bg-yellow-100 text-yellow-800";
      case 0:
        return "bg-red-100 text-red-800";
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
    const validImages = Array.isArray(images) && images.length > 0 ? images : [];
    if (!validImages.length) {
      return (
        <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center bg-gray-200 rounded-lg mx-auto">
          <span className="text-gray-500 text-xs sm:text-sm">Không có ảnh</span>
        </div>
      );
    }

    const currentIndex = imageIndices[blogId] || 0;

    const prevImage = () => {
      setImageIndices((prev) => ({
        ...prev,
        [blogId]: (currentIndex - 1 + validImages.length) % validImages.length,
      }));
    };

    const nextImage = () => {
      setImageIndices((prev) => ({
        ...prev,
        [blogId]: (currentIndex + 1) % validImages.length,
      }));
    };

    const imageSrc = validImages[currentIndex];
    const displaySrc =
      typeof imageSrc === "string"
        ? imageSrc.startsWith("http")
          ? imageSrc
          : `${baseUrl}/${imageSrc}`
        : "/placeholder-image.jpg";

    return (
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto group">
        <img
          src={displaySrc}
          alt={`Blog image ${currentIndex}`}
          className="w-full h-full object-cover rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105"
          onError={(e) => (e.target.src = "/placeholder-image.jpg")}
        />
        {validImages.length > 1 && (
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
              {validImages.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full ${idx === currentIndex ? "bg-white" : "bg-gray-400"}`}
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
      <div className="w-full border border-gray-600 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <FileText className="h-8 w-8 text-orange-500" />
            <h2 className="text-2xl sm:text-3xl font-bold">Danh Sách Blog</h2>
          </div>
          <NavLink
            to="create"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-md"
          >
            <PlusCircle className="h-5 w-5" />
            <span className="text-sm sm:text-base">Tạo Blog</span>
          </NavLink>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề"
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 text-sm sm:text-base shadow-sm"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-sm sm:text-base">Lọc theo trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                className={`w-full sm:w-auto px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base ${getFilterBgClass()} focus:outline-none focus:border-orange-500 transition duration-150 ease-in-out`}
              >
                <option value="2">Đã xuất bản</option>
                <option value="1">Đang chờ</option>
                <option value="0">Bị hủy</option>
              </select>
            </div>
          </div>
        </div>

        {/* SignalR Error */}
        {signalRError && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {signalRError}
          </div>
        )}

        {/* Loading State */}
        {(initialLoading || loading) ? (
          <div className="flex items-center justify-center py-6">
            <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
            <p className="text-orange-500 text-base sm:text-lg font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg sm:text-xl text-gray-600 text-center">
              {searchTerm
                ? `Không tìm thấy blog nào với trạng thái "${getStatusDisplayName(
                    Number(statusFilter)
                  )}" khớp với tìm kiếm`
                : `Không có blog nào với trạng thái "${getStatusDisplayName(
                    Number(statusFilter)
                  )}"`}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block border border-gray-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-sm sm:text-base uppercase tracking-wide text-center">
                      #
                    </th>
                    <th className="px-4 py-3 font-semibold text-sm sm:text-base uppercase tracking-wide text-center">
                      Ảnh
                    </th>
                    <th className="px-4 py-3 font-semibold text-sm sm:text-base uppercase tracking-wide text-center w-[20%]">
                      Tiêu đề
                    </th>
                    <th className="px-4 py-3 font-semibold text-sm sm:text-base uppercase tracking-wide text-center">
                      Nội dung
                    </th>
                    <th className="px-4 py-3 font-semibold text-sm sm:text-base uppercase tracking-wide text-center">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-3 font-semibold text-sm sm:text-base uppercase tracking-wide text-center w-[15%]">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 font-semibold text-sm sm:text-base uppercase tracking-wide text-center w-[15%]">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedBlogs.map((blog, index) => (
                    <tr
                      key={blog.blogId}
                      className="border-b hover:bg-gray-400 transition-colors"
                    >
                      <td className="px-4 py-4 text-center text-sm sm:text-base">
                        {(currentPage - 1) * blogsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {renderImages(blog.images, blog.blogId)}
                      </td>
                      <td className="px-4 py-4 text-center text-sm sm:text-base">
                        {blog.blogTitle}
                      </td>
                      <td className="px-4 py-4 text-center text-sm sm:text-base truncate max-w-xs">
                        {blog.blogContent}
                      </td>
                      <td className="px-4 py-4 text-center text-sm sm:text-base">
                        {formatDate(blog.blogCreatedDate)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full font-medium text-xs sm:text-sm ${getStatusClass(
                            blog.status
                          )}`}
                        >
                          {getStatusDisplayName(blog.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => navigate(`/manage/blog/${blog.blogId}`)}
                            className="bg-orange-100 text-orange-700 hover:bg-orange-400 p-1.5 sm:p-2 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {blog.status === 0 && (
                            <button
                              onClick={() => navigate(`/manage/blog/update/${blog.blogId}`)}
                              className="bg-yellow-100 text-yellow-700 hover:bg-yellow-400 p-1.5 sm:p-2 rounded-lg transition-colors"
                              title="Cập nhật"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </div>
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
                  className="border border-gray-200 rounded-lg p-4 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm text-gray-700">
                        #{(currentPage - 1) * blogsPerPage + index + 1}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                          blog.status
                        )}`}
                      >
                        {getStatusDisplayName(blog.status)}
                      </span>
                    </div>
                    <div className="flex justify-center">
                      {renderImages(blog.images, blog.blogId)}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Tiêu đề:</span>{" "}
                        {blog.blogTitle}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Nội dung:</span>{" "}
                        {blog.blogContent}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Ngày tạo:</span>{" "}
                        {formatDate(blog.blogCreatedDate)}
                      </p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/manage/blog/${blog.blogId}`)}
                        className="bg-orange-100 text-orange-700 hover:bg-orange-200 p-2 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {blog.status === 0 && (
                        <button
                          onClick={() => navigate(`/manage/blog/update/${blog.blogId}`)}
                          className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 p-2 rounded-lg transition-colors"
                          title="Cập nhật"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogList;