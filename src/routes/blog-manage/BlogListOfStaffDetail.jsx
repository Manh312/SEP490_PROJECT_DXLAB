import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { approveAdminBlog, cancelAdminBlog, deleteAdminBlog, fetchAdminApprovedBlogs, fetchAdminPendingBlogs, fetchBlogById } from "../../redux/slices/Blog";
import { useTheme } from "../../hooks/use-theme";
import { toast } from "react-toastify";
import { Edit, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

const BlogListOfStaffDetail = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { id } = useParams();

  const { selectedBlog, loading, error } = useSelector((state) => state.blogs);
  const [status, setStatus] = useState("");
  const [mainImage, setMainImage] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [blogIdToDelete, setBlogIdToDelete] = useState(null);
  const [blogTitle, setBlogTitle] = useState("");

  const baseUrl = "https://localhost:9999";

  useEffect(() => {
    if (id) {
      dispatch(fetchBlogById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedBlog) {
      setStatus(selectedBlog.status || "");
      setBlogTitle(selectedBlog.blogTitle || "");
      if (selectedBlog.images && selectedBlog.images.length > 0) {
        setMainImage(selectedBlog.images[0]);
      }
    }
  }, [selectedBlog]);

  useEffect(() => {
    if (error) {
      toast.error(error || "Lỗi khi tải chi tiết blog!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [error]);

  const getStatusDisplayName = (status) => {
    switch (Number(status)) {
      case 2: return "Đã xuất bản";
      case 1: return "Đang chờ";
      case 0: return "Bị hủy";
      default: return "Không xác định";
    }
  };

  const getStatusClass = (status) => {
    switch (Number(status)) {
      case 2: return "bg-green-100 text-green-700";
      case 1: return "bg-yellow-100 text-yellow-700";
      case 0: return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  const handleApprove = async (blogId) => {
    if (!blogId) {
      toast.error("Không tìm thấy ID của blog!");
      return;
    }
    setLocalLoading(true);
    try {
      const response = await dispatch(approveAdminBlog(blogId)).unwrap();
      console.log(response.message);
      toast.success(response.message);
      await Promise.all([
        dispatch(fetchAdminPendingBlogs()),
        dispatch(fetchAdminApprovedBlogs()),
      ]);
      dispatch(fetchBlogById(id)); // Refresh current blog
    } catch (err) {
      toast.error(err.message || "Phê duyệt thất bại!");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleCancel = async (blogId) => {
    if (!blogId) {
      toast.error("Không tìm thấy ID của blog!");
      return;
    }
    setLocalLoading(true);
    try {
      const response = await dispatch(cancelAdminBlog(blogId)).unwrap();
      toast.success(response.message || "Bài blog đã bị hủy!");
      await Promise.all([
        dispatch(fetchAdminPendingBlogs()),
        dispatch(fetchAdminApprovedBlogs()),
      ]);
      dispatch(fetchBlogById(id)); // Refresh current blog
    } catch (err) {
      toast.error(err.message || "Hủy thất bại!");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleOpenDeleteModal = (blogId, title) => {
    setBlogIdToDelete(blogId);
    setBlogTitle(title);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setBlogIdToDelete(null);
    setBlogTitle("");
  };

  // Note: deleteAdminBlog action is not imported - assuming it exists
  const handleDelete = async () => {
    if (!blogIdToDelete) {
      toast.error("Không tìm thấy ID của blog!");
      return;
    }
    setLocalLoading(true);
    try {
      // Assuming deleteAdminBlog exists in your redux slice
      const response = await dispatch(deleteAdminBlog(blogIdToDelete)).unwrap();
      toast.success(response.message || "Bài blog đã được xóa!");
      await Promise.all([
        dispatch(fetchAdminPendingBlogs()),
        dispatch(fetchAdminApprovedBlogs()),
      ]);
    } catch (err) {
      toast.error(err.message || "Xóa thất bại!");
    } finally {
      setLocalLoading(false);
      setIsDeleteModalOpen(false);
      setBlogIdToDelete(null);
      setBlogTitle("");
    }
  };

  const renderImages = (images, currentMainImage, updateMainImage) => {
    if (!Array.isArray(images) || images.length === 0) {
      return (
        <div className={`w-full h-72 flex items-center justify-center rounded-xl border-2 border-dashed ${theme === "dark" ? "border-gray-700 bg-gray-800 text-gray-400" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
          <span className="text-base font-medium">Không có ảnh nào</span>
        </div>
      );
    }

    const defaultMainImage = currentMainImage || images[0];
    const currentIndex = images.indexOf(defaultMainImage);

    const handlePrev = () => {
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
      updateMainImage(images[prevIndex]);
    };

    const handleNext = () => {
      const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
      updateMainImage(images[nextIndex]);
    };

    return (
      <div className="space-y-4">
        <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-xl group transition-all duration-500 bg-neutral-300">
          <img
            src={defaultMainImage.startsWith("http") ? defaultMainImage : `${baseUrl}/${defaultMainImage}`}
            alt="Ảnh chính"
            className="w-full h-full object-contain transition-all duration-300 ease-in-out animate-fadeIn"
          />
          {images.length > 1 && (
            <>
              <button onClick={handlePrev} className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md opacity-0 group-hover:opacity-100`}>
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button onClick={handleNext} className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md opacity-0 group-hover:opacity-100`}>
                <ChevronRight className="h-6 w-6" />
              </button>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700">
                <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }} />
              </div>
              <div className={`absolute bottom-2 right-2 px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm`}>
                {currentIndex + 1}/{images.length}
              </div>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-3 overflow-x-auto py-2 justify-center">
          {images.map((image, index) => (
            <div
              key={index}
              className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border-2 ${image === defaultMainImage ? "border-orange-500 scale-105 shadow-lg" : theme === "dark" ? "border-gray-700 hover:border-orange-400" : "border-gray-200 hover:border-orange-300"}`}
              onClick={() => updateMainImage(image)}
            >
              <img
                src={image.startsWith("http") ? image : `${baseUrl}/${image}`}
                alt={`Thumbnail ${index}`}
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "/placeholder-image.jpg")}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className={`text-xl font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  if (!selectedBlog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className={`text-2xl font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
          Không tìm thấy blog!
        </p>
        <Link to="/dashboard/blog" className="mt-8 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 flex items-center gap-2 transition-all duration-300 shadow-lg">
          <ArrowLeft className="h-5 w-5" /> Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 px-8 sm:px-12 lg:px-20 min-h-screen">
      <div className={`w-full max-w-7xl mx-auto rounded-2xl shadow-2xl p-10 transition-all duration-300 ${theme === "dark" ? "bg-gray-950 text-gray-100" : "bg-white text-gray-900"}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 border-b pb-6 border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-4">
            <Edit className="h-9 w-9 text-orange-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Chi Tiết Blog</h2>
          </div>
          <Link to="/dashboard/blog" className={`mt-6 sm:mt-0 px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-md ${theme === "dark" ? "bg-gray-800 text-gray-100 hover:bg-gray-700" : "bg-gray-700 text-white hover:bg-gray-600"}`}>
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Quay lại</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <div className={`rounded-2xl p-8 shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
              <h3 className="text-2xl font-semibold mb-6 text-orange-500">Ảnh Blog</h3>
              {renderImages(selectedBlog.images, mainImage, setMainImage)}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className={`rounded-2xl p-8 shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
              <h3 className="text-2xl font-semibold mb-8 text-orange-500">Thông Tin Blog</h3>
              <div className="space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xl font-bold text-gray-500">Tiêu đề</label>
                    <p className="mt-2 text-xl">{selectedBlog.blogTitle}</p>
                  </div>
                  <div>
                    <label className="block text-xl font-bold text-gray-500">Ngày tạo</label>
                    <p className="mt-2 text-xl">{formatDate(selectedBlog.blogCreatedDate)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xl font-bold text-gray-500">Nội dung</label>
                    <p className="mt-2 text-xl leading-relaxed break-words">{selectedBlog.blogContent}</p>
                  </div>
                  <div>
                    <label className="block text-xl font-bold text-gray-500">Người tạo</label>
                    <p className="mt-2 text-xl leading-relaxed break-words">{selectedBlog.userName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                  <label className="block text-xl font-bold text-gray-500">Trạng thái</label>
                    <p className={`text-base mt-2 inline-flex items-center px-4 py-1.5 rounded-full font-semibold ${getStatusClass(selectedBlog.status)}`}>
                      {getStatusDisplayName(selectedBlog.status)}
                    </p>
                  </div>
                  <div>
                  <div>
                  <label className="block text-xl font-bold text-gray-500">Hành động</label>
                  {Number(selectedBlog.status) === 1 && (
                      <div className="flex items-center gap-4 mt-2">
                        <button
                          onClick={() => handleApprove(selectedBlog.blogId)}
                          className="bg-green-200 text-green-700 hover:bg-green-300 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                          disabled={localLoading}
                        >
                          Phê duyệt
                        </button>
                        <button
                          onClick={() => handleCancel(selectedBlog.blogId)}
                          className="bg-red-200 text-red-700 hover:bg-red-300 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                          disabled={localLoading}
                        >
                          Hủy bỏ
                        </button>
                      </div>
                    )}
                    {Number(selectedBlog.status) === 2 && (
                      <button
                        onClick={() => handleOpenDeleteModal(selectedBlog.blogId, selectedBlog.blogTitle)}
                        className="bg-red-200 text-red-700 hover:bg-red-300 p-2 mt-2 rounded-lg transition-colors"
                        disabled={localLoading}
                      >
                        Xóa blog
                      </button>
                    )}
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
          <div
            className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleCloseDeleteModal}
          >
            <div
              className="bg-gray-300 rounded-lg shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 ease-in-out scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-red-600 mb-4">Xác nhận xóa</h2>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa blog <strong>"{blogTitle}"</strong> không? Hành
                động này không thể hoàn tác.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCloseDeleteModal}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                  disabled={localLoading}
                >
                  {localLoading ? "Đang xóa..." : "Xóa"}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default BlogListOfStaffDetail;