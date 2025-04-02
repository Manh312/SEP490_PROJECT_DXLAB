import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminBlogById,
  approveAdminBlog,
  cancelAdminBlog,
  deleteAdminBlog,
  fetchAdminPendingBlogs,
  fetchAdminApprovedBlogs,
} from "../../redux/slices/Blog";
import { useTheme } from "../../hooks/use-theme";
import { toast } from "react-toastify";
import { Edit, ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, XCircle, Trash } from "lucide-react";
import { FaSpinner } from "react-icons/fa";

const BlogListOfStaffDetail = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { id } = useParams();

  const { adminSelectedBlog, adminLoading } = useSelector((state) => state.blogs);
  const [mainImage, setMainImage] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [blogIdToDelete, setBlogIdToDelete] = useState(null);
  const [blogTitle, setBlogTitle] = useState("");
  const [imageIndex, setImageIndex] = useState(0);
  const navigate = useNavigate();

  const baseUrl = "https://localhost:9999";

  useEffect(() => {
    if (id) {
      dispatch(fetchAdminBlogById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (adminSelectedBlog && adminSelectedBlog.images && adminSelectedBlog.images.length > 0) {
      setMainImage(adminSelectedBlog.images[0]);
      setImageIndex(0);
    } else {
      setMainImage(null);
      setImageIndex(0);
    }
  }, [adminSelectedBlog]);


  const mapStatusToString = (status) => {
    switch (Number(status)) {
      case 1: return "Đang chờ";
      case 2: return "Đã duyệt";
      default: return "Không xác định";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Đã duyệt": return "bg-green-100 text-green-800";
      case "Đang chờ": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
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

  const handleApprove = async (blogId) => {
    if (!blogId) {
      toast.error("Không tìm thấy ID của blog!");
      return;
    }
    setLocalLoading(true);
    try {
      const response = await dispatch(approveAdminBlog(blogId)).unwrap();
      toast.success(response.message || "Bài blog đã được phê duyệt!");
      await Promise.all([
        dispatch(fetchAdminPendingBlogs()),
        dispatch(fetchAdminApprovedBlogs()),
        dispatch(fetchAdminBlogById(id)), // Refresh current blog
      ]);
      navigate('/dashboard/blog');
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
        dispatch(fetchAdminBlogById(id)), // Refresh current blog
      ]);
      navigate('/dashboard/blog');
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

  const handleDelete = async () => {
    if (!blogIdToDelete) {
      toast.error("Không tìm thấy ID của blog!");
      return;
    }
    setLocalLoading(true);
    try {
      const response = await dispatch(deleteAdminBlog(blogIdToDelete)).unwrap();
      toast.success(response.message || "Bài blog đã được xóa!");
      await Promise.all([
        dispatch(fetchAdminPendingBlogs()),
        dispatch(fetchAdminApprovedBlogs()),
      ]);
      navigate('/dashboard/blog');
    } catch (err) {
      toast.error(err.message || "Xóa thất bại!");
    } finally {
      setLocalLoading(false);
      setIsDeleteModalOpen(false);
      setBlogIdToDelete(null);
      setBlogTitle("");
    }
  };

  const renderImages = (images) => {
    if (!Array.isArray(images) || images.length === 0) {
      return (
        <div className={`w-full h-72 flex items-center justify-center rounded-xl border-2 border-dashed ${theme === "dark" ? "border-gray-700 bg-gray-800 text-gray-400" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
          <span className="text-base font-medium">Không có ảnh nào</span>
        </div>
      );
    }

    const prevImage = () => {
      setImageIndex((prev) => (prev - 1 + images.length) % images.length);
      setMainImage(images[(imageIndex - 1 + images.length) % images.length]);
    };

    const nextImage = () => {
      setImageIndex((prev) => (prev + 1) % images.length);
      setMainImage(images[(imageIndex + 1) % images.length]);
    };

    return (
      <div className="space-y-4">
        <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-xl group transition-all duration-500 bg-neutral-300">
          <img
            src={
              images[imageIndex].startsWith("http")
                ? images[imageIndex]
                : `${baseUrl}/${images[imageIndex]}`
            }
            alt={`Blog image ${imageIndex}`}
            className="w-full h-full object-contain transition-all duration-300 ease-in-out animate-fadeIn"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md opacity-0 group-hover:opacity-100`}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md opacity-0 group-hover:opacity-100`}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full bg-orange-500 transition-all duration-300"
                  style={{ width: `${((imageIndex + 1) / images.length) * 100}%` }}
                />
              </div>
              <div
                className={`absolute bottom-2 right-2 px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm`}
              >
                {imageIndex + 1}/{images.length}
              </div>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-3 overflow-x-auto py-2 justify-center">
          {images.map((image, index) => (
            <div
              key={index}
              className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border-2 ${
                image === mainImage
                  ? "border-orange-500 scale-105 shadow-lg"
                  : theme === "dark"
                  ? "border-gray-700 hover:border-orange-400"
                  : "border-gray-200 hover:border-orange-300"
              }`}
              onClick={() => {
                setMainImage(image);
                setImageIndex(index);
              }}
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

  if (adminLoading || localLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2"/>
        <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!adminSelectedBlog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className={`text-2xl font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
          Không tìm thấy blog!
        </p>
        <Link
          to="/dashboard/blog"
          className="mt-8 px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 transition-all duration-300 shadow-lg"
        >
          <ArrowLeft className="h-5 w-5" /> Quay lại danh sách
        </Link>
      </div>
    );
  }

  const statusDisplay = mapStatusToString(adminSelectedBlog.status);

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-6 xl:px-8 mb-10">
      <div
        className={`w-full border border-gray-600 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 ${
          theme === "dark" ? "bg-gray-950 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 border-b pb-4 border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <Edit className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Chi Tiết Blog</h2>
          </div>
          <Link
            to="/dashboard/blog"
            className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:bg-orange-600 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Quay lại</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <div className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
              <h3 className="text-xl font-semibold mb-4 text-orange-500">Ảnh Blog</h3>
              {renderImages(adminSelectedBlog.images)}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
              <h3 className="text-xl font-semibold mb-6 text-orange-500">Thông Tin Blog</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-lg font-medium text-gray-500">Tiêu đề</label>
                    <p className="mt-1 text-lg">{adminSelectedBlog.blogTitle}</p>
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-gray-500">Ngày tạo</label>
                    <p className="mt-1 text-lg">{formatDate(adminSelectedBlog.blogCreatedDate)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-lg font-medium text-gray-500">Nội dung</label>
                    <p className="mt-1 text-lg leading-relaxed break-words">{adminSelectedBlog.blogContent}</p>
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-gray-500">Người tạo</label>
                    <p className="mt-1 text-lg leading-relaxed break-words">{adminSelectedBlog.userName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-lg font-medium text-gray-500">Trạng thái</label>
                    <p
                      className={`text-base mt-1 inline-flex items-center px-3 py-1 rounded-full font-medium ${getStatusClass(
                        statusDisplay
                      )}`}
                    >
                      {statusDisplay}
                    </p>
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-gray-500">Hành động</label>
                    <div className="flex gap-2 mt-2">
                      {statusDisplay === "Đang chờ" && (
                        <>
                          <button
                            onClick={() => handleApprove(adminSelectedBlog.blogId)}
                            className="bg-green-200 text-green-700 hover:bg-green-300 p-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                            disabled={localLoading}
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Phê duyệt</span>
                          </button>
                          <button
                            onClick={() => handleCancel(adminSelectedBlog.blogId)}
                            className="bg-red-200 text-red-700 hover:bg-red-300 p-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                            disabled={localLoading}
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Hủy</span>
                          </button>
                        </>
                      )}
                      {statusDisplay === "Đã duyệt" && (
                        <button
                          onClick={() => handleOpenDeleteModal(adminSelectedBlog.blogId, adminSelectedBlog.blogTitle)}
                          className="bg-red-200 text-red-700 hover:bg-red-300 p-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                          disabled={localLoading}
                        >
                          <Trash className="w-4 h-4" />
                          <span>Xóa</span>
                        </button>
                      )}
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
                Bạn có chắc chắn muốn xóa blog <strong>"{blogTitle}"</strong> không? Hành động này không thể hoàn tác.
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
    </div>
  );
};

export default BlogListOfStaffDetail;