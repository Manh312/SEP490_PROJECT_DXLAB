import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { PlusCircle, ArrowLeftCircle } from "lucide-react";
import { useTheme } from "../../../hooks/use-theme";
import { createBlog } from "../../../redux/slices/Blog"; // Import thunk từ blogSlice

const CreateBlog = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { loading } = useSelector((state) => state.blogs);

  const [newBlog, setNewBlog] = useState({
    blogTitle: "",
    blogContent: "",
    images: "",
    blogCreatedDate: new Date().toISOString().split("T")[0],
  });

  const [imageFile, setImageFile] = useState(null);

  const handleSubmitApproval = async () => {
    if (!newBlog.blogTitle || !newBlog.blogContent) {
      toast.error("Vui lòng điền đầy đủ tiêu đề và nội dung!");
      return;
    }

    const blogData = {
      ...newBlog,
    };

    if (imageFile) {
      const formData = new FormData();
      formData.append("blogTitle", blogData.blogTitle);
      formData.append("blogContent", blogData.blogContent);
      formData.append("blogCreatedDate", blogData.blogCreatedDate);
      // formData.append("images", blogData.images);

      try {
        await dispatch(createBlog(formData)).unwrap(); 
        toast.success("Bài viết đã được gửi!");
        navigate("/manage/blog");
      } catch (err) {
        console.log(err);
        console.log(err?.message);
      }
    } else {
      // Nếu dùng URL ảnh
      try {
        await dispatch(createBlog(blogData)).unwrap();
        toast.success("Bài viết đã được gửi!");
        navigate("/manage/blog");
      } catch (err) {
        console.log(err);
        toast.error(err?.message || "Có lỗi xảy ra khi tạo bài viết!");
      }
    }
  };

  // Xử lý khi chọn file ảnh
  // const handleImageUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setImageFile(file);
  //     setNewBlog({ ...newBlog, image: "" }); // Xóa URL nếu chọn file
  //   }
  // };

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div
        className={`w-full max-w-4xl mx-auto border rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 ${theme === "dark" ? "bg-black text-white" : "bg-white text-gray-800"
          }`}
      >
        {/* Header Section */}
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
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
            <label className="font-medium text-sm sm:text-base">Tiêu đề</label>
            <input
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2  text-sm sm:text-base shadow-sm ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
                }`}
              placeholder="Nhập tiêu đề blog"
              value={newBlog.title}
              onChange={(e) => setNewBlog({ ...newBlog, blogTitle: e.target.value })}
            />
          </div>

          {/* Content Textarea */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm sm:text-base">Nội dung</label>
            <textarea
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2  text-sm sm:text-base shadow-sm resize-y min-h-[150px] ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
                }`}
              placeholder="Nhập nội dung blog"
              value={newBlog.content}
              onChange={(e) => setNewBlog({ ...newBlog, blogContent: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm sm:text-base">Ngày tạo blog</label>
            <input
              type="date"
              name="blogCreatedDate"
              value={newBlog.blogCreatedDate}
              onChange={(e) => setNewBlog({ ...newBlog, blogCreatedDate: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2  text-sm sm:text-base shadow-sm ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }`}
            />

          </div>

          {/* Image Input */}
          {/* <div className="flex flex-col gap-2">
            <label className="font-medium text-sm sm:text-base">Ảnh</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className={`w-full sm:w-1/3 px-4 py-2 border rounded-lg text-sm sm:text-base shadow-sm ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
                  }`}
                disabled={newBlog.images !== ""} // Vô hiệu hóa nếu đã nhập URL
              />
            </div>
            {imageFile && (
              <p className="text-sm text-gray-600 mt-1">
                Đã chọn: {imageFile.name}
              </p>
            )}
          </div> */}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              onClick={handleSubmitApproval}
              className={`bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all w-full sm:w-auto ${loading ? "opacity-50 cursor-not-allowed" : ""
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