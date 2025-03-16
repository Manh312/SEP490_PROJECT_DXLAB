import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogById } from "../../../redux/slices/Blog";
import { useTheme } from "../../../hooks/use-theme";
import { toast, ToastContainer } from "react-toastify";
import { Edit, ArrowLeft } from "lucide-react";

const ManageBlogDetail = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { id } = useParams();

  const { selectedBlog, loading, error } = useSelector((state) => state.blogs);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(fetchBlogById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedBlog) {
      setStatus(selectedBlog.status || "");
    }
  }, [selectedBlog]);

  useEffect(() => {
    if (error) {
      toast.error(error || "Lỗi khi tải chi tiết blog!");
    }
  }, [error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="animate-spin text-orange-600 w-8 h-8 mr-3">⏳</span>
        <p className="text-orange-600 text-lg font-semibold">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!selectedBlog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600 text-xl font-medium">Không tìm thấy blog!</p>
        <Link
          to="/manage/blog"
          className="mt-6 px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 transition-all duration-300"
        >
          <ArrowLeft className="h-5 w-5" /> Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-12 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme={theme} />

      {/* Card Container */}
      <div
        className={`w-full rounded-xl shadow-xl p-6 sm:p-8 lg:p-10 transition-all duration-300 ${
          theme === "dark" ? "bg-gray-950 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 border-b pb-4 border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Edit className="h-7 w-7 text-orange-500" />
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Chi Tiết Blog</h2>
          </div>
          <Link
            to="/manage/blog"
            className={`mt-4 sm:mt-0 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
              theme === "dark"
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-600 text-white hover:bg-gray-700"
            }`}
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Quay lại</span>
          </Link>
        </div>

        {/* Blog Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Image Section */}
          <div className="lg:col-span-4">
            <div
              className={`rounded-lg p-6 shadow-md ${
                theme === "dark" ? "bg-gray-800" : "bg-gray-50"
              }`}
            >
              <h3 className="text-lg font-semibold mb-4 text-orange-500">Ảnh Blog</h3>
              {selectedBlog.images ? (
                <img
                  src={selectedBlog.images}
                  alt={selectedBlog.blogTitle}
                  className="w-full h-64 object-cover rounded-md transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div
                  className={`w-full h-64 flex items-center justify-center rounded-md ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <span className="text-gray-500 text-sm">Không có ảnh</span>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-8">
            <div
              className={`rounded-lg p-6 shadow-md ${
                theme === "dark" ? "bg-gray-800" : "bg-gray-50"
              }`}
            >
              <h3 className="text-lg font-semibold mb-6 text-orange-500">Thông Tin Blog</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Tiêu đề</label>
                    <p className="mt-1 text-base font-medium">{selectedBlog.blogTitle}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Ngày tạo</label>
                    <p className="mt-1 text-base">
                      {new Date(selectedBlog.blogCreatedDate).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Nội dung</label>
                  <p className="mt-1 text-base leading-relaxed break-words">
                    {selectedBlog.blogContent}
                  </p>
                </div>
                {status && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Trạng thái</label>
                    <p className="mt-1 text-base">{status}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBlogDetail;