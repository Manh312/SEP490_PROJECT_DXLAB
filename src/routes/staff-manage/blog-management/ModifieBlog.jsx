import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Edit, ArrowLeft, Upload, Bold, Italic, List, Link as LinkIcon } from "lucide-react";
import { useTheme } from "../../../hooks/use-theme";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBlogById,
  updateBlog,
  fetchBlogsByStatus,
} from "../../../redux/slices/Blog";

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
    blogCreatedDate: new Date().toISOString(),
    status: 0,
    images: [],
  });

  useEffect(() => {
    dispatch(fetchBlogById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedBlog) {
      const blogCreatedDate = selectedBlog.blogCreatedDate
        ? new Date(selectedBlog.blogCreatedDate)
        : new Date();

      setEditedBlog({
        blogTitle: selectedBlog.blogTitle || "",
        blogContent: selectedBlog.blogContent || "",
        blogCreatedDate: isNaN(blogCreatedDate.getTime())
          ? new Date().toISOString()
          : blogCreatedDate.toISOString(),
        status: selectedBlog.status || 0,
        images: Array.isArray(selectedBlog.images) ? selectedBlog.images : [selectedBlog.images || ""],
      });
    }
  }, [selectedBlog]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedBlog({ ...editedBlog, images: [reader.result] });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateBlog = async () => {
    if (!editedBlog.blogTitle || !editedBlog.blogContent) {
      toast.error("Vui lòng điền đầy đủ tiêu đề và nội dung!");
      return;
    }

    // Gửi dữ liệu dạng phẳng, không bọc trong blogDto
    const blogData = {
      blogTitle: editedBlog.blogTitle,
      blogContent: editedBlog.blogContent,
      blogCreatedDate: editedBlog.blogCreatedDate,
      status: editedBlog.status,
      images: editedBlog.images,
    };

    try {
      console.log("Data sent to API:", blogData); // Log để kiểm tra dữ liệu gửi đi
      const response = await dispatch(updateBlog({ id, blogData })).unwrap();
      console.log("Update response:", response);
      toast.success(response.message);
      dispatch(fetchBlogsByStatus("Pending"));
      navigate("/manage/blog");
    } catch (err) {
      console.error("Update error:", err); // Log lỗi chi tiết
      toast.error(err?.message || "Lỗi khi cập nhật bài viết!");
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

    setEditedBlog({ ...editedBlog, blogContent: newText });
    textarea.focus();
  };

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
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
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm sm:text-base">Quay lại</span>
          </Link>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Tiêu đề Blog</label>
            <input
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm ${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }`}
              value={editedBlog.blogTitle}
              onChange={(e) =>
                setEditedBlog({ ...editedBlog, blogTitle: e.target.value })
              }
              placeholder="Nhập tiêu đề blog"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nội dung Blog</label>
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm min-h-[200px] ${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }`}
              value={editedBlog.blogContent}
              onChange={(e) =>
                setEditedBlog({ ...editedBlog, blogContent: e.target.value })
              }
              placeholder="Nhập nội dung blog (hỗ trợ HTML cơ bản)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Hỗ trợ định dạng HTML: <b>đậm</b>, <i>nghiêng</i>, <ul><li>danh sách</li></ul>, <a href="...">liên kết</a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ngày tạo</label>
            <input
              type="date"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm ${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }`}
              value={formatDateForInput(editedBlog.blogCreatedDate)}
              onChange={(e) =>
                setEditedBlog({
                  ...editedBlog,
                  blogCreatedDate: e.target.value ? new Date(e.target.value).toISOString() : "",
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Hình ảnh</label>
            <div className="flex items-center gap-4">
              {editedBlog.images.length > 0 && (
                <img
                  src={editedBlog.images[0]}
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

          <button
            onClick={handleUpdateBlog}
            disabled={loading}
            className={`w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Edit className="h-5 w-5" />
            <span>Cập nhật & Gửi yêu cầu duyệt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModifieBlog;