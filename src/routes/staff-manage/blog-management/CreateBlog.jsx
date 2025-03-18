import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { PlusCircle, ArrowLeftCircle, Bold, Italic, List, Link as LinkIcon, Upload } from "lucide-react";
import { useTheme } from "../../../hooks/use-theme";
import { createBlog } from "../../../redux/slices/Blog";

const CreateBlog = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { loading } = useSelector((state) => state.blogs);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const [newBlog, setNewBlog] = useState({
    blogTitle: "",
    blogContent: "",
    blogCreatedDate: new Date().toISOString(),
    status: 1, // Mặc định là "Đang chờ"
    images: [],
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBlog({ ...newBlog, images: [reader.result] });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitApproval = async () => {
    if (!newBlog.blogTitle || !newBlog.blogContent) {
      toast.error("Vui lòng điền đầy đủ tiêu đề và nội dung!");
      return;
    }

    const blogData = {
      blogTitle: newBlog.blogTitle,
      blogContent: newBlog.blogContent,
      blogCreatedDate: newBlog.blogCreatedDate,
      status: newBlog.status,
      images: newBlog.images,
    };

    try {
      const response = await dispatch(createBlog(blogData)).unwrap();      
      const successMessage = response.message 
        ? response.message 
        : `Bài viết "${response.blog?.blogTitle || newBlog.blogTitle}" đã được tạo thành công!`;
      
      toast.success(successMessage); // Hiển thị thông báo từ backend
      navigate("/manage/blog");
    } catch (err) {
      console.error("Create error:", err);
      toast.error(err?.message || "Có lỗi xảy ra khi tạo bài viết!");
    }
  };

  const insertText = (tag) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    let newText;

    if (tag === "link") {
      const url = prompt("Nhập URL:");
      if (!url) return;
      newText = `${text.substring(0, start)}<a href="${url}">${text.substring(start, end)}</a>${text.substring(end)}`;
    } else {
      newText = `${text.substring(0, start)}<${tag}>${text.substring(start, end)}</${tag}>${text.substring(end)}`;
    }

    setNewBlog({ ...newBlog, blogContent: newText });
    textarea.focus();
  };

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
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
          <button
            onClick={() => navigate("/manage/blog")}
            className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <ArrowLeftCircle className="h-5 w-5" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>
        </div>

        {/* Form Section */}
        <div className="space-y-6">
          {/* Title Input */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm sm:text-base">Tiêu đề Blog</label>
            <input
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm ${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }`}
              placeholder="Nhập tiêu đề blog"
              value={newBlog.blogTitle}
              onChange={(e) => setNewBlog({ ...newBlog, blogTitle: e.target.value })}
            />
          </div>

          {/* Content Textarea */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm sm:text-base">Nội dung Blog</label>
            <div className="mb-2 flex gap-2">
              <button
                onClick={() => insertText("b")}
                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800"
                title="In đậm"
              >
                <Bold className="h-5 w-5" />
              </button>
              <button
                onClick={() => insertText("i")}
                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800"
                title="In nghiêng"
              >
                <Italic className="h-5 w-5" />
              </button>
              <button
                onClick={() => insertText("ul")}
                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800"
                title="Danh sách"
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => insertText("link")}
                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800"
                title="Chèn liên kết"
              >
                <LinkIcon className="h-5 w-5" />
              </button>
            </div>
            <textarea
              ref={textareaRef}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm resize-y min-h-[200px] ${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }`}
              placeholder="Nhập nội dung blog (hỗ trợ HTML cơ bản)"
              value={newBlog.blogContent}
              onChange={(e) => setNewBlog({ ...newBlog, blogContent: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Hỗ trợ định dạng HTML: <b>đậm</b>, <i>nghiêng</i>, <ul><li>danh sách</li></ul>, <a href="...">liên kết</a>
            </p>
          </div>

          {/* Created Date */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm sm:text-base">Ngày tạo blog</label>
            <input
              type="date"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm ${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }`}
              value={formatDateForInput(newBlog.blogCreatedDate)}
              onChange={(e) =>
                setNewBlog({
                  ...newBlog,
                  blogCreatedDate: e.target.value ? new Date(e.target.value).toISOString() : "",
                })
              }
            />
          </div>

          {/* Image Upload */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm sm:text-base">Hình ảnh</label>
            <div className="flex items-center gap-4">
              {newBlog.images.length > 0 && (
                <img
                  src={newBlog.images[0]}
                  alt="Blog preview"
                  className="w-24 h-24 object-cover rounded-lg shadow-sm"
                />
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all"
              >
                <Upload className="h-5 w-5" />
                <span>Tải ảnh lên</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
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