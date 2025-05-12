import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAreaTypeById, updateAreaType, updateAreaTypeImages, deleteAreaTypeImage } from "../../redux/slices/AreaType";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FileText, Image, Check, Tag, X, Plus, ArrowLeft, Map, Users, Power, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

const BACKEND_URL = "https://localhost:9999";

const UpdateAreaType = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { areaTypeCategories } = useSelector((state) => state.areaCategory);
  const { selectedAreaType, loading: areaTypeLoading } = useSelector((state) => state.areaTypes);

  const [formData, setFormData] = useState({
    areaTypeName: "",
    areaDescription: "",
    price: "",
    areaCategory: "",
    size: "",
    status: true,
    images: [],
  });
  const [hasImageChange, setHasImageChange] = useState(false);
  const [hasDetailsChange, setHasDetailsChange] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [failedImages, setFailedImages] = useState(new Set());
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchAreaTypeById(id));
  }, [dispatch, id]);

  useEffect(() => {
    const initializeFormData = async () => {
      if (selectedAreaType) {
        const images = Array.isArray(selectedAreaType.images)
          ? selectedAreaType.images
          : [selectedAreaType.images || ""];
        const existing = images.map((img) =>
          img.startsWith("http") ? img : `${BACKEND_URL}${img}`
        );

        setFormData({
          areaTypeName: selectedAreaType.areaTypeName || "",
          areaDescription: selectedAreaType.areaDescription || "",
          price: selectedAreaType.price !== undefined ? String(selectedAreaType.price) : "",
          areaCategory: selectedAreaType.areaCategory || 1,
          size: selectedAreaType.size || "",
          status: selectedAreaType.status !== undefined ? selectedAreaType.status : true,
          images: [],
        });

        setExistingImages(existing);
        setImagePreviews(existing);
      }
    };
    initializeFormData();
  }, [selectedAreaType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "status" ? value === "true" : value,
    }));
    setHasDetailsChange(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData((prevData) => ({
        ...prevData,
        images: [...prevData.images, ...files],
      }));
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previews]);
      setHasImageChange(true);
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

    setHasImageChange(true);
  };

  const handleImageError = (index) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.areaTypeName.trim()) {
      toast.error("Tên loại khu vực là bắt buộc!");
      return;
    }
    if (!formData.areaDescription.trim()) {
      toast.error("Mô tả là bắt buộc!");
      return;
    }
    if (!formData.price || formData.price < 0) {
      toast.error("Giá phải lớn hơn hoặc bằng 0!");
      return;
    }

    const newFiles = formData.images.filter((img) => img instanceof File);

    try {
      if (imagesToDelete.length > 0) {
        for (const imageUrl of imagesToDelete) {
          await dispatch(deleteAreaTypeImage({ areaTypeId: id, imageUrl })).unwrap();
        }
        setImagesToDelete([]);
      }

      if (hasDetailsChange) {
        const patchDoc = [];
        if (selectedAreaType.areaTypeName !== formData.areaTypeName) {
          patchDoc.push({ op: "replace", path: "areaTypeName", value: formData.areaTypeName });
        }
        if (selectedAreaType.areaDescription !== formData.areaDescription) {
          patchDoc.push({ op: "replace", path: "areaDescription", value: formData.areaDescription });
        }
        if (selectedAreaType.price !== parseFloat(formData.price)) {
          patchDoc.push({ op: "replace", path: "price", value: parseFloat(formData.price) });
        }
        if (selectedAreaType.status !== formData.status) {
          patchDoc.push({ op: "replace", path: "status", value: formData.status });
        }

        if (patchDoc.length > 0) {
          await dispatch(
            updateAreaType({
              areaTypeId: id,
              patchDoc,
            })
          ).unwrap();
        }
      }

      if (hasImageChange && newFiles.length > 0) {
        await dispatch(
          updateAreaTypeImages({
            areaTypeId: id,
            files: newFiles,
          })
        ).unwrap();
      }

      if (!hasDetailsChange && !hasImageChange && imagesToDelete.length === 0) {
        toast.info("Không có thay đổi nào để cập nhật!");
        return;
      }

      toast.success("Cập nhật loại khu vực thành công!");
      navigate("/dashboard/areaType");
    } catch (error) {
      const errorMessage = error.message || "Unknown error";
      toast.error(errorMessage);
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

  if (areaTypeLoading || !selectedAreaType) {
    return (
      <div className="flex items-center justify-center py-6 mt-50 mb-200">
        <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
        <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  const selectedCategory = areaTypeCategories.find(
    (category) => category.categoryId === Number(formData.areaCategory)
  );

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
            <Tag className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <h2 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-white text-center">
              Cập Nhật Kiểu Khu Vực: {formData.areaTypeName || id}
            </h2>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Area Type Name */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                      Tên Kiểu Khu Vực <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="areaTypeName"
                      value={formData.areaTypeName}
                      onChange={handleInputChange}
                      className="w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out cursor-not-allowed"
                      placeholder="Nhập tên dịch vụ"
                      readOnly
                    />
                  </div>
                </div>
              </motion.div>

              {/* Size (Read-only) */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                      Số Ghế
                    </label>
                    <input
                      type="number"
                      name="size"
                      value={formData.size}
                      className="w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 text-sm sm:text-base font-normal cursor-not-allowed"
                      readOnly
                    />
                  </div>
                </div>
              </motion.div>

              {/* Price */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                      Giá <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center mt-1 sm:mt-2 gap-2">
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        min={0}
                        step="0.01"
                        onChange={handleInputChange}
                        className="w-full px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out"
                        placeholder="Nhập giá dịch vụ"
                        required
                      />
                       <span className="text-gray-500 font-medium text-sm sm:text-base">
                        DXL
                      </span>
                    </div>
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
                      name="areaDescription"
                      value={formData.areaDescription}
                      onChange={handleInputChange}
                      className="w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out min-h-[100px]"
                      placeholder="Nhập mô tả dịch vụ"
                      required
                    />
                  </div>
                </div>
              </motion.div>

              {/* Category (Read-only) */}
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
                      Dịch Vụ
                    </label>
                    <input
                      type="text"
                      value={selectedCategory ? selectedCategory.title : "Không xác định"}
                      className="w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 text-sm sm:text-base font-normal cursor-not-allowed"
                      readOnly
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
                                alt={`Area preview ${index}`}
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
                          onChange={handleImageChange}
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
              onClick={() => navigate("/dashboard/areaType")}
              className="w-full sm:w-auto bg-gray-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-x-2 hover:bg-gray-600 transition-all shadow-md text-sm sm:text-base font-normal"
            >
              <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> Quay lại
            </button>
            <button
              type="submit"
              disabled={areaTypeLoading}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-x-2 hover:from-orange-600 hover:to-orange-800 transition-all shadow-md disabled:bg-orange-300 disabled:cursor-not-allowed text-sm sm:text-base font-normal"
            >
              {areaTypeLoading ? (
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

export default UpdateAreaType;