import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Edit, ArrowLeft } from "lucide-react";
import { useTheme } from "../../../hooks/use-theme";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogById, updateBlog, fetchBlogsByStatus } from "../../../redux/slices/Blog";

const ModifieBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const dispatch = useDispatch();

  // Lấy dữ liệu từ Redux store
  const { selectedBlog, loading, error } = useSelector((state) => state.blogs);

  const [editedBlog, setEditedBlog] = useState({
    blogTitle: "",
    blogContent: "",
    status: "Pending"
  });

  // Fetch blog data khi component mount
  useEffect(() => {
    dispatch(fetchBlogById(id));
  }, [dispatch, id]);

  // Cập nhật state local khi selectedBlog thay đổi
  useEffect(() => {
    if (selectedBlog) {
      setEditedBlog({
        title: selectedBlog.blogTitle || "",
        content: selectedBlog.blogContent || "",
        status: selectedBlog.status || "Pending"
      });
    }
  }, [selectedBlog]);

  // Handle update blog
  const handleUpdateBlog = async () => {
    if (!editedBlog.blogTitle || !editedBlog.blogContent) {
      toast.error("Vui lòng điền đầy đủ tiêu đề và nội dung!");
      return;
    }

    try {
      await dispatch(updateBlog({ id, blogData: editedBlog })).unwrap();
      toast.success("Bài viết đã được cập nhật và gửi yêu cầu duyệt!");
      dispatch(fetchBlogsByStatus("")); // Refresh danh sách blog
      navigate("/manage/blog");
    } catch (err) {
      toast.error(err || "Lỗi khi cập nhật bài viết!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <span className="animate-spin text-orange-500 w-6 h-6 mr-2">⏳</span>
        <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="flex items-center justify-center py-6">
  //       <p className="text-red-500 font-medium">{error}</p>
  //     </div>
  //   );
  // }

  // if (!selectedBlog) {
  //   return (
  //     <div className="flex items-center justify-center py-6">
  //       <p className="text-gray-500 font-medium">Không tìm thấy bài viết</p>
  //     </div>
  //   );
  // }

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div
        className={`max-w-3xl mx-auto border rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 ${
          theme === "dark" ? "bg-black text-white" : "bg-white text-gray-800"
        }`}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Edit className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
              Sửa đổi Blog
            </h2>
          </div>
          <Link
            to="/manage/blog"
            className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Quay lại</span>
          </Link>
        </div>

        {/* Form Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tiêu đề</label>
            <input
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 shadow-sm"
              value={editedBlog.blogTitle}
              onChange={(e) =>
                setEditedBlog({ ...editedBlog, blogTitle: e.target.value })
              }
              placeholder="Nhập tiêu đề blog"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nội dung</label>
            <textarea
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 shadow-sm"
              rows={8}
              value={editedBlog.blogContent}
              onChange={(e) =>
                setEditedBlog({ ...editedBlog, blogContent: e.target.value })
              }
              placeholder="Nhập nội dung blog"
            />
          </div>

          <button
            onClick={handleUpdateBlog}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <Edit className="h-5 w-5" />
            <span>Sửa đổi & Gửi yêu cầu duyệt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModifieBlog;