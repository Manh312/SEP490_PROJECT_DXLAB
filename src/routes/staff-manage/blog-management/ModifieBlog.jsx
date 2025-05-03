import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FileText, Image, Check, X, Plus, ArrowLeft, Edit } from "lucide-react";
import { useTheme } from "../../../hooks/use-theme";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBlogById,
  updateBlog,
  fetchBlogsByStatus,
} from "../../../redux/slices/Blog";
import { motion } from "framer-motion";

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
  const maxTitleLength = 100; // Character limit for title

  useEffect(() => {
    dispatch(fetchBlogById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedBlog) {
      const images = Array.isArray(selectedBlog.images)
        ? selectedBlog.images
        : [selectedBlog.images || ""];
      const existing = images
        .filter((img) => typeof img === "string" && img)
        .map((img) => (img.startsWith("http") ? img : `${BACKEND_URL}${img}`));

      setEditedBlog({
        blogTitle: selectedBlog.blogTitle || "",
        blogContent: selectedBlog.blogContent || "",
        images: [],
      });

      setExistingImages(existing);
      setImagePreviews(existing);
    }
  }, [selectedBlog]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "blogTitle") {
      if (value.length > maxTitleLength) {
        toast.error(`Tiêu đề không được vượt quá ${maxTitleLength} ký tự!`);
        return;
      }
    }
    setEditedBlog((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
    setFailedImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleImageError = (index) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  const handleTextareaResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    handleTextareaResize();
  }, [editedBlog.blogContent]);

  const handleUpdateBlog = async (e) => {
    e.preventDefault();

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
    if (existingImages.length === 0 && editedBlog.images.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ảnh!");
      return;
    }

    const blogData = {
      blogTitle: trimmedBlogTitle,
      blogContent: trimmedBlogContent,
      blogCreatedDate: new Date().toISOString(),
      status: 1, // Default status to "Đang chờ" (Pending)
    };

    try {
      const response = await dispatch(updateBlog({ id, blogData, files: editedBlog.images })).unwrap();
      toast.success(response.message || "Cập nhật blog thành công!");
      dispatch(fetchBlogsByStatus("Pending"));
      navigate("/manage/blog");
    } catch (err) {
      toast.error(err?.message || "Lỗi khi cập nhật bài viết!");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <svg
          className="animate-spin h-6 w-6 text-orange-500 mr-2"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 px-3 sm:px-6 lg:px-8 overflow-x-hidden">
      <motion.div
        className={`w-full max-w-4xl mx-auto rounded-2xl shadow-lg overflow-hidden ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-800"
          }`}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header với gradient */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-700 p-4 sm:p-6">
          <div className="flex flex-row justify-center items-center p-4 space-x-2 mb-4 sm:mb-0">
            <Edit className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <h2 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-white text-center">
              Chỉnh sửa Blog
            </h2>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleUpdateBlog} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Title */}
              <motion.div
                className={`relative rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300 ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
                  }`}
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                      Tiêu đề Blog <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="blogTitle"
                      value={editedBlog.blogTitle}
                      onChange={handleInputChange}
                      className={`w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-gray-800"
                        }`}
                      placeholder="Nhập tiêu đề blog"
                      required
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {editedBlog.blogTitle.length}/{maxTitleLength}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Description */}
              <motion.div
                className={`relative rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300 ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
                  }`}
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500">
                      Nội dung Blog <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      ref={textareaRef}
                      name="blogContent"
                      value={editedBlog.blogContent}
                      onChange={handleInputChange}
                      className={`w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out min-h-[40px] sm:min-h-[48px] resize-none ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-gray-800"
                        }`}
                      placeholder="Nhập nội dung blog (hỗ trợ HTML cơ bản)"
                      required
                    />
                  </div>
                </div>
              </motion.div>

              {/* Images */}
              <motion.div
                className={`relative rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300 ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
                  }`}
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Image className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500">
                      Hình ảnh <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col gap-2 sm:gap-4 mt-2">
                      <div className="flex flex-wrap gap-2 sm:gap-4">
                        {imagePreviews.length > 0 &&
                          imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={
                                  failedImages.has(index)
                                    ? "/placeholder-image.jpg"
                                    : preview
                                }
                                alt={`Blog preview ${index}`}
                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg shadow-sm"
                                onError={() => handleImageError(index)}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition"
                              >
                                <X size={12} className="sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          ))}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current.click()}
                          className="w-16 h-16 sm:w-20 sm:h-20 border-dashed border-2 border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-all"
                        >
                          <Plus size={20} className="sm:w-6 sm:h-6" />
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
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8"
            variants={itemVariants}
          >
            <button
              type="button"
              onClick={() => navigate("/manage/blog")}
              className="w-full sm:w-auto bg-gray-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-x-2 hover:bg-gray-600 transition-all shadow-md text-sm sm:text-base font-normal"
              disabled={loading}
            >
              <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> Quay lại
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-x-2 hover:from-orange-600 hover:to-orange-800 transition-all shadow-md disabled:bg-orange-300 disabled:cursor-not-allowed text-sm sm:text-base font-normal"
            >
              {loading ? (
                <svg
                  className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <Check size={14} className="sm:w-4 sm:h-4" />
              )}
              Cập nhật & Gửi yêu cầu duyệt
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default ModifieBlog;