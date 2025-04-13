import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { PlusCircle, Filter, Search, Edit, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import debounce from "lodash/debounce";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogsByStatus, setStatusFilter } from "../../../redux/slices/Blog";
import { addNotification } from "../../../redux/slices/Notification"; // Import action
import Pagination from "../../../hooks/use-pagination";
import { FaSpinner } from "react-icons/fa";
import { startSignalRConnection, stopSignalRConnection, registerSignalREvent } from "../../../utils/signalR";

// Utility to track shown notifications
const notificationTracker = new Set();

const BlogList = () => {
  const dispatch = useDispatch();
  const { blogs, statusFilter, error, loading } = useSelector((state) => state.blogs);
  const { token } = useSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [imageIndices, setImageIndices] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [signalRError, setSignalRError] = useState(null);
  const blogsPerPage = 5;
  const baseUrl = "https://localhost:9999";

  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300);

  // SignalR Setup
  useEffect(() => {
    let connection;
    const setupSignalR = async () => {

      let retries = 3;
      while (retries > 0) {
        try {
          connection = await startSignalRConnection(token);

          if (!connection) {
            throw new Error("Không thể thiết lập kết nối SignalR.");
          }

          registerSignalREvent("ReceiveBlogStatus", (blog) => {
            console.log("Nhận được cập nhật trạng thái blog:", blog);
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
              notificationTracker.delete(notificationKey);
            }
            dispatch(fetchBlogsByStatus(statusFilter)).unwrap().catch((err) => {
              console.error("Lỗi khi làm mới danh sách blog:", err);
            });
          });

          registerSignalREvent("ReceiveBlogDeleted", (blogId) => {
            console.log("Nhận được thông báo xóa blog:", blogId);
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
              console.error("Lỗi khi làm mới danh sách blog:", err);
            });
          });

          break;
        } catch (err) {
          console.error("Lỗi khi thiết lập SignalR:", err);
          retries--;
          // if (retries === 0) {
          //   dispatch(
          //     addNotification({
          //       id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          //       message: "Không thể kết nối SignalR. Vui lòng thử lại.",
          //       type: "error",
          //       timestamp: new Date().toISOString(),
          //     })
          //   );
          //   break;
          // }
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      // Fetch initial blogs
      try {
        const fetchPromise = dispatch(fetchBlogsByStatus(statusFilter)).unwrap();
        await Promise.all([
          fetchPromise,
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách blog:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    setupSignalR();

    return () => {
      if (connection) {
        console.log("Dọn dẹp kết nối SignalR...");
        stopSignalRConnection();
      }
    };
  }, [token, dispatch, statusFilter]);

  // Refresh blog list when statusFilter changes
  useEffect(() => {
    setInitialLoading(true);
    dispatch(fetchBlogsByStatus(statusFilter))
      .unwrap()
      .catch((err) => {
        console.error("Lỗi khi làm mới danh sách blog:", err);
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

  const hasCancelledBlogs = useMemo(() => {
    return filteredBlogs.some((blog) => blog.status === 0);
  }, [filteredBlogs]);

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
        <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded-lg mx-auto">
          <span className="text-gray-500 text-sm">Không có ảnh</span>
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
      <div className="relative w-40 h-40 mx-auto group">
        <img
          src={displaySrc}
          alt={`Blog image ${currentIndex}`}
          className="w-full h-full object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
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
    <div className="py-4 px-2 sm:px-4 lg:px-6 xl:px-8 mb-10">
      <div className="w-full border border-gray-600 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <FileText className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Danh Sách Blog
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <NavLink
              to="create"
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md"
            >
              <PlusCircle className="h-5 w-5" />
              <span className="hidden sm:inline">Tạo Blog</span>
            </NavLink>
            {/* Removed <Notification /> */}
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
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm sm:text-base shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-5 w-5 text-orange-500" />
              <span className="font-medium text-sm sm:text-base">Lọc:</span>
              <select
                value={statusFilter}
                onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                className={`w-full sm:w-auto px-3 py-2 border rounded-lg text-sm sm:text-base ${getFilterBgClass()} shadow-sm`}
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
          <div className="flex items-center justify-center py-6 mb-200">
            <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
            <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">
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
            <div className="hidden md:block border rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b bg-gray-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">
                      #
                    </th>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">
                      Ảnh
                    </th>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">
                      Tiêu đề
                    </th>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">
                      Nội dung
                    </th>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">
                      Trạng thái
                    </th>
                    {hasCancelledBlogs && (
                      <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">
                        Thao tác
                      </th>
                    )}
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
                          to={`/manage/blog/${blog.blogId}`}
                          className="hover:text-orange-400 transition-colors"
                        >
                          {blog.blogTitle}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-center truncate max-w-xs">
                        {blog.blogContent}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {formatDate(blog.blogCreatedDate)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full font-normal text-sm ${getStatusClass(
                            blog.status
                          )}`}
                        >
                          {getStatusDisplayName(blog.status)}
                        </span>
                      </td>
                      {hasCancelledBlogs && (
                        <td className="px-4 py-4 text-center">
                          {blog.status === 0 && (
                            <Link
                              to={`/manage/blog/update/${blog.blogId}`}
                              className="inline-flex items-center justify-center bg-yellow-100 text-yellow-700 hover:bg-yellow-200 p-2 rounded-lg transition-colors w-10 h-10"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                          )}
                        </td>
                      )}
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
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                          blog.status
                        )}`}
                      >
                        {getStatusDisplayName(blog.status)}
                      </span>
                    </div>
                    {renderImages(blog.images, blog.blogId)}
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Tiêu đề:</span>{" "}
                      <Link
                        to={`/manage/blog/${blog.blogId}`}
                        className="text-orange-500 hover:text-orange-600"
                      >
                        {blog.blogTitle}
                      </Link>
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      <span className="font-medium">Nội dung:</span>{" "}
                      {blog.blogContent}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Ngày tạo:</span>{" "}
                      {formatDate(blog.blogCreatedDate)}
                    </p>
                    {blog.status === 0 && (
                      <Link
                        to={`/manage/blog/update/${blog.blogId}`}
                        className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 p-2 rounded-lg flex items-center justify-center w-10 h-10 mt-2 mx-auto"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    )}
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

export default BlogList;