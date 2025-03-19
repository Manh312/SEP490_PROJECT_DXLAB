import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { PlusCircle, ArrowLeftCircle } from "lucide-react";
import { useTheme } from "../../../hooks/use-theme";
import { createBlog } from "../../../redux/slices/Blog";

const CreateBlog = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { loading } = useSelector((state) => state.blogs);
  const fileInputRef = useRef(null);

  const [newBlog, setNewBlog] = useState({
    blogTitle: "",
    blogContent: "",
    images: [], 
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files); // Convert FileList to Array
    if (files.length > 0) {
      setNewBlog((prev) => ({
        ...prev,
        images: [...prev.images, ...files],
      }));

      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previews]);
    }
  };

  // Remove an image from the list
  const handleRemoveImage = (index) => {
    setNewBlog((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitApproval = async () => {
    if (!newBlog.blogTitle || !newBlog.blogContent) {
      toast.error("Vui lòng điền đầy đủ tiêu đề và mô tả!");
      return;
    }
  
    const blogData = {
      blogTitle: newBlog.blogTitle,
      blogContent: newBlog.blogContent,
      blogCreatedDate: newBlog.blogCreatedDate,
      status: newBlog.status,
    };
  
    try {
      const response = await dispatch(createBlog({ blogData, files: newBlog.images })).unwrap();
      const successMessage = response.message
        ? response.message
        : `Bài viết "${response.blog?.blogTitle || newBlog.blogTitle}" đã được tạo thành công!`;
  
      toast.success(successMessage);
      navigate("/manage/blog");
    } catch (err) {
      console.error("Create error:", err);
      toast.error(err?.message || "Có lỗi xảy ra khi tạo bài viết!");
    }
  };

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <div
        className={`w-full max-w-4xl mx-auto border rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-800"
        }`}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <PlusCircle className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Tạo Blog Mới
            </h2>
          </div>
        </div>

        {/* Form Section */}
        <div className="space-y-6">
          {/* Title Input */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm sm:text-base">Tiêu đề Blog</label>
            <input
              className={`w-full px-4 py-2 border rounded-lg shadow-sm ${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }`}
              placeholder="Nhập tiêu đề blog"
              value={newBlog.blogTitle}
              onChange={(e) => setNewBlog({ ...newBlog, blogTitle: e.target.value })}
            />
          </div>

          {/* Description Input */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm sm:text-base">Mô tả Blog</label>
            <textarea
              className={`w-full h-50 px-4 py-2 border rounded-lg shadow-sm ${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }`}
              placeholder="Nhập mô tả blog"
              
              value={newBlog.blogContent}
              onChange={(e) => setNewBlog({ ...newBlog, blogContent: e.target.value })}
            />
          </div>

          {/* Image Upload */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm sm:text-base">Hình ảnh</label>
            <div className="flex items-center gap-4 flex-wrap">
              {imagePreviews.length > 0 &&
                imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Blog preview ${index}`}
                      className="w-24 h-24 object-cover rounded-lg shadow-sm"
                      onError={(e) => (e.target.src = "/placeholder-image.jpg")}
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      &times;
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
                multiple // Allow multiple file selection
                className="hidden"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              onClick={handleSubmitApproval}
              className={`bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all w-full sm:w-auto ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              <PlusCircle className="h-5 w-5" />
              {loading ? "Đang gửi..." : "Gửi yêu cầu duyệt"}
            </button>
            <button
              onClick={() => navigate("/manage/blog")}
              className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all w-full sm:w-auto"
              disabled={loading}
            >
              <ArrowLeftCircle className="h-5 w-5" />
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;