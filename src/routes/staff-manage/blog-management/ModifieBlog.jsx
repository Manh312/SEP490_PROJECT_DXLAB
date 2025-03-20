import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Edit, ArrowLeft } from "lucide-react";
import { useTheme } from "../../../hooks/use-theme";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBlogById,
  updateBlog,
  fetchBlogsByStatus,
} from "../../../redux/slices/Blog";

const BACKEND_URL = "https://localhost:9999"; 

const ModifieBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const { selectedBlog, loading } = useSelector((state) => state.blogs);

  const [editedBlog, setEditedBlog] = useState({
    blogTitle: "",
    blogContent: "",
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [failedImages, setFailedImages] = useState(new Set()); 

  useEffect(() => {
    dispatch(fetchBlogById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedBlog) {
      // Đảm bảo images là một mảng
      const images = Array.isArray(selectedBlog.images)
        ? selectedBlog.images
        : [selectedBlog.images || ""];

      // Thêm domain của backend vào URL của ảnh
      const existing = images
        .filter((img) => typeof img === "string" && img) // Lọc các giá trị hợp lệ
        .map((img) => {
          // Nếu img đã là URL đầy đủ (bắt đầu bằng http), giữ nguyên
          if (img.startsWith("http")) {
            return img;
          }
          // Nếu img là đường dẫn tương đối, thêm domain của backend
          return `${BACKEND_URL}${img}`;
        });

      setEditedBlog({
        blogTitle: selectedBlog.blogTitle || "",
        blogContent: selectedBlog.blogContent || "",
        images: [],
      });

      setExistingImages(existing);
      setImagePreviews(existing);
    }
  }, [selectedBlog]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setEditedBlog((prev) => ({
        ...prev,
        images: [...prev.images, ...files],
      }));
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previews]);
    }
  };

  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    if (index < existingImages.length) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingImages.length;
      setEditedBlog((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== fileIndex),
      }));
    }
  };

  const handleImageError = (index) => {
    // Đánh dấu ảnh không tải được để tránh vòng lặp onError
    setFailedImages((prev) => new Set(prev).add(index));
  };

  const handleUpdateBlog = async () => {
    const trimmedBlogTitle = editedBlog.blogTitle.trim();
    const trimmedBlogContent = editedBlog.blogContent.trim();

    if (!trimmedBlogTitle) {
      toast.error("Tiêu đề blog là bắt buộc!");
      return;
    }
    if (!trimmedBlogContent) {
      toast.error("Nội dung blog là bắt buộc!");
      return;
    }

    const blogData = {
      blogTitle: trimmedBlogTitle,
      blogContent: trimmedBlogContent,
      blogCreatedDate: new Date().toISOString(),
      status: editedBlog.status,
    };

    try {
      console.log("Data sent to API:", blogData);
      const response = await dispatch(updateBlog({ id, blogData, files: editedBlog.images })).unwrap();
      console.log("Update response:", response);

      setEditedBlog((prev) => ({
        ...prev,
        blogUpdatedDate: currentTime,
      }));

      toast.success(response.message || "Cập nhật blog thành công!");
      dispatch(fetchBlogsByStatus("Pending"));
      navigate("/manage/blog");
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err?.message || "Lỗi khi cập nhật bài viết!");
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

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <div
        className={`max-w-4xl mx-auto border rounded-xl shadow-lg p-6 sm:p-8 lg:p-10 ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-800"
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Edit className="h-7 w-7 text-orange-500" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
              Chỉnh sửa Blog
            </h2>
          </div>
          <Link
            to="/manage/blog"
            className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm sm:text-base">Hủy</span>
          </Link>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm sm:text-base">Tiêu đề Blog</label>
            <input
              className={`w-full px-4 py-2 border rounded-lg shadow-sm ${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }`}
              value={editedBlog.blogTitle}
              onChange={(e) =>
                setEditedBlog({ ...editedBlog, blogTitle: e.target.value })
              }
              placeholder="Nhập tiêu đề blog"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm sm:text-base">Nội dung Blog</label>
            <textarea
              ref={textareaRef}
              className={`w-full px-4 py-2 border rounded-lg shadow-sm min-h-[200px] ${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }`}
              value={editedBlog.blogContent}
              onChange={(e) =>
                setEditedBlog({ ...editedBlog, blogContent: e.target.value })
              }
              placeholder="Nhập nội dung blog (hỗ trợ HTML cơ bản)"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm sm:text-base">Hình ảnh</label>
            <div className="flex items-center gap-4 flex-wrap">
              {imagePreviews.length > 0 &&
                imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={failedImages.has(index) ? "/placeholder-image.jpg" : preview}
                      alt={`Blog preview ${index}`}
                      className="w-24 h-24 object-cover rounded-lg shadow-sm"
                      onError={() => handleImageError(index)}
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="border-dashed border-2 border-gray-400 rounded-lg p-4 text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-all"
              >
                Chọn tệp
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              onClick={handleUpdateBlog}
              disabled={loading}
              className={`bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all w-full sm:w-auto ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Edit className="h-5 w-5" />
              {loading ? "Đang cập nhật..." : "Cập nhật & Gửi yêu cầu duyệt"}
            </button>
            <button
              onClick={() => navigate("/manage/blog")}
              className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all w-full sm:w-auto"
              disabled={loading}
            >
              <ArrowLeft className="h-5 w-5" />
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModifieBlog;