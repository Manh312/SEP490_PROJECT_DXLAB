import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllAreaTypeCategories,
  updateAreaTypeCategory,
  updateAreaTypeCategoryImages,
  deleteAreaTypeCategoryImage,
} from "../../redux/slices/AreaCategory";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Image, FileText, Check, X, Plus, Power, Map, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

const BACKEND_URL = "https://localhost:9999";

const UpdateAreaCategory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const { loading, areaTypeCategories } = useSelector((state) => state.areaCategory);
  const currentCategory = areaTypeCategories?.find(
    (cat) => cat?.categoryId === parseInt(id)
  );

  const [formData, setFormData] = useState({
    title: "",
    categoryDescription: "",
    status: 1,
    images: [],
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [failedImages, setFailedImages] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!areaTypeCategories || areaTypeCategories.length === 0) {
      dispatch(fetchAllAreaTypeCategories());
    }
  }, [dispatch, areaTypeCategories]);

  useEffect(() => {
    if (currentCategory) {
      const images = Array.isArray(currentCategory.images)
        ? currentCategory.images
        : [currentCategory.images].filter(Boolean);
      const existing = images.map((img) =>
        img.startsWith("http") ? img : `${BACKEND_URL}${img}`
      );

      setFormData({
        title: currentCategory.title || "",
        categoryDescription: currentCategory.categoryDescription || "",
        status: currentCategory.status !== undefined ? currentCategory.status : 1,
        images: [],
      });

      setExistingImages(existing);
      setImagePreviews(existing);
    }
  }, [currentCategory]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "status" ? parseInt(value) : value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...files],
      }));
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previews]);
    }
  };

  const handleRemoveImage = (index) => {
    const isExistingImage = index < existingImages.length;
    let updatedPreviews = [...imagePreviews];
    let updatedImages = [...formData.images];
    let updatedExistingImages = [...existingImages];

    if (isExistingImage) {
      let imageUrl = existingImages[index];
      imageUrl = imageUrl.replace(BACKEND_URL, "");
      if (!imageUrl.startsWith("/")) {
        imageUrl = "/" + imageUrl;
      }
      if (!imageUrl.startsWith("/Images/")) {
        const filename = imageUrl.split("/").pop();
        imageUrl = `/Images/${filename}`;
      }

      setImagesToDelete((prev) => [...prev, imageUrl]);
      updatedExistingImages = updatedExistingImages.filter((_, i) => i !== index);
      updatedPreviews = updatedPreviews.filter((_, i) => i !== index);

      setExistingImages(updatedExistingImages);
      setImagePreviews(updatedPreviews);
    } else {
      const fileIndex = index - existingImages.length;
      updatedPreviews = updatedPreviews.filter((_, i) => i !== index);
      updatedImages = updatedImages.filter((_, i) => i !== fileIndex);

      setImagePreviews(updatedPreviews);
      setFormData((prev) => ({
        ...prev,
        images: updatedImages,
      }));
    }
  };

  const handleImageError = (index) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  const hasChanges = () => {
    const trimmedTitle = formData.title.trim();
    const trimmedDescription = formData.categoryDescription.trim();
    return (
      trimmedTitle !== (currentCategory?.title || "") ||
      trimmedDescription !== (currentCategory?.categoryDescription || "") ||
      formData.status !== (currentCategory?.status || 1) ||
      formData.images.length > 0 ||
      imagesToDelete.length > 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = formData.title.trim();
    const trimmedDescription = formData.categoryDescription.trim();

    if (!trimmedTitle) {
      toast.error("Tên dịch vụ là bắt buộc!");
      return;
    }
    if (!trimmedDescription) {
      toast.error("Mô tả là bắt buộc!");
      return;
    }

    if (!hasChanges()) {
      toast.info("Không có thay đổi nào để cập nhật!");
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1: Delete images if any
      if (imagesToDelete.length > 0) {
        await Promise.all(
          imagesToDelete.map((imageUrl) =>
            dispatch(
              deleteAreaTypeCategoryImage({
                categoryId: parseInt(id),
                imageUrl,
              })
            ).unwrap()
          )
        );
        setImagesToDelete([]);
      }

      // Step 2: Update details if there are changes
      const patchDoc = [];
      if (currentCategory?.title !== trimmedTitle) {
        patchDoc.push({ op: "replace", path: "title", value: trimmedTitle });
      }
      if (currentCategory?.categoryDescription !== trimmedDescription) {
        patchDoc.push({
          op: "replace",
          path: "categoryDescription",
          value: trimmedDescription,
        });
      }
      if (currentCategory?.status !== formData.status) {
        patchDoc.push({ op: "replace", path: "status", value: formData.status });
      }

      if (patchDoc.length > 0) {
        await dispatch(
          updateAreaTypeCategory({
            categoryId: parseInt(id),
            patchDoc,
          })
        ).unwrap();
      }

      // Step 3: Upload new images if any
      if (formData.images.length > 0) {
        await dispatch(
          updateAreaTypeCategoryImages({
            categoryId: parseInt(id),
            files: formData.images,
          })
        ).unwrap();
      }

      // Step 4: Refresh the category list
      await dispatch(fetchAllAreaTypeCategories()).unwrap();

      // Show a single success toast
      toast.success("Cập nhật dịch vụ thành công!");
      navigate("/dashboard/area");
    } catch (err) {
      const errorMessage = err.message || "Lỗi khi cập nhật danh mục dịch vụ";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
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
      <div className="flex items-center justify-center py-6 mt-50 mb-200">
        <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
        <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-red-500 text-base sm:text-lg font-normal text-center">
          Không tìm thấy danh mục với ID: {id}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 px-3 sm:px-6 lg:px-8 overflow-x-hidden">
      <motion.div
        className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header với gradient */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-700 p-4 sm:p-6">
          <div className="flex flex-row justify-center items-center p-4 gap-2">
            <Map className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <h2 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-white text-center">
              Cập Nhật Dịch Vụ: {formData.title || id}
            </h2>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Title */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Map className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                      Tên Dịch Vụ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out"
                      placeholder="Nhập tên danh mục"
                      required
                    />
                  </div>
                </div>
              </motion.div>

              {/* Status */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Power className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                      Trạng Thái
                    </label>
                    <input
                      name="status"
                      value={String(formData.status === 1 ? "Hoạt động" : "Không hoạt động")}
                      onChange={handleInputChange}
                      className="w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 text-sm sm:text-base font-normal cursor-not-allowed"
                      readOnly
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Description */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500">
                      Mô Tả <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="categoryDescription"
                      value={formData.categoryDescription}
                      onChange={handleInputChange}
                      className="w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out min-h-[100px]"
                      placeholder="Nhập mô tả danh mục"
                      required
                    />
                  </div>
                </div>
              </motion.div>

              {/* Images */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Image className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500">
                      Hình Ảnh
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
                                alt={`Category preview ${index}`}
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
                          onChange={handleFileChange}
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
              onClick={() => navigate("/dashboard/area")}
              className="w-full sm:w-auto bg-gray-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-x-2 hover:bg-gray-600 transition-all shadow-md text-sm sm:text-base font-normal"
            >
              <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> Quay lại
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-x-2 hover:from-orange-600 hover:to-orange-800 transition-all shadow-md disabled:bg-orange-300 disabled:cursor-not-allowed text-sm sm:text-base font-normal"
            >
              {isSubmitting || loading ? (
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
              Cập Nhật
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default UpdateAreaCategory;