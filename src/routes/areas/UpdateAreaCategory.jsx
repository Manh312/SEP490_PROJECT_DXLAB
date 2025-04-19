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
import { Building, Image, FileText, Check, X, Plus } from "lucide-react";

const BACKEND_URL = "https://localhost:9999";

const UpdateAreaCategory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const { loading, areaTypeCategories, error } = useSelector((state) => state.areaCategory);
  const currentCategory = areaTypeCategories.find(
    (cat) => cat.categoryId === parseInt(id)
  );

  const [formData, setFormData] = useState({
    title: "",
    categoryDescription: "",
    status: 1,
    images: [],
  });
  const [hasDetailsChange, setHasDetailsChange] = useState(false);
  const [hasImageChange, setHasImageChange] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [failedImages, setFailedImages] = useState(new Set());

  useEffect(() => {
    if (!currentCategory) {
      dispatch(fetchAllAreaTypeCategories());
    } else {
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
  }, [currentCategory, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "status" ? parseInt(value) : value,
    }));
    setHasDetailsChange(true);
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

    try {
      if (imagesToDelete.length > 0) {
        for (const imageUrl of imagesToDelete) {
          await dispatch(
            deleteAreaTypeCategoryImage({
              categoryId: parseInt(id),
              imageUrl,
            })
          ).unwrap();
        }
        toast.success("Xóa ảnh thành công!");
        setImagesToDelete([]);
      }

      if (hasDetailsChange) {
        const patchDoc = [];
        if (currentCategory.title !== trimmedTitle) {
          patchDoc.push({ op: "replace", path: "title", value: trimmedTitle });
        }
        if (currentCategory.categoryDescription !== trimmedDescription) {
          patchDoc.push({
            op: "replace",
            path: "categoryDescription",
            value: trimmedDescription,
          });
        }
        if (currentCategory.status !== formData.status) {
          patchDoc.push({ op: "replace", path: "status", value: formData.status });
        }

        if (patchDoc.length > 0) {
          await dispatch(
            updateAreaTypeCategory({
              categoryId: parseInt(id),
              patchDoc,
            })
          ).unwrap();
          toast.success("Cập nhật thông tin danh mục thành công!");
        }
      }

      if (hasImageChange && formData.images.length > 0) {
        await dispatch(
          updateAreaTypeCategoryImages({
            categoryId: parseInt(id),
            files: formData.images,
          })
        ).unwrap();
        toast.success("Cập nhật ảnh thành công!");
      }

      if (!hasDetailsChange && !hasImageChange && imagesToDelete.length === 0) {
        toast.info("Không có thay đổi nào để cập nhật!");
        return;
      }

      await dispatch(fetchAllAreaTypeCategories()).unwrap();
      navigate("/dashboard/area");
    } catch (err) {
      const errorMessage = err.message || "Lỗi khi cập nhật danh mục dịch vụ";
      toast.error(errorMessage);
    }
  };

  if (loading || !currentCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-lg sm:text-xl font-semibold text-gray-600 animate-pulse text-center">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-red-500 text-lg sm:text-xl font-semibold text-center">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full border max-w-4xl mx-auto rounded-2xl shadow-xl p-6 sm:p-8 transform transition-all duration-300 hover:shadow-2xl">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <Building className="h-8 w-8 text-orange-600" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              Cập Nhật Danh Mục dịch vụ {id}
            </h2>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Title */}
              <div className="flex flex-col">
                <label className="flex items-center text-sm font-medium mb-2">
                  <Building className="mr-2 h-5 w-5 text-orange-600" />
                  Tên Danh Mục
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-orange-500 transition duration-150 ease-in-out"
                  placeholder="Nhập tên danh mục"
                  required
                />
              </div>

              {/* Status */}
              <div className="flex flex-col">
                <label className="flex items-center text-sm font-medium mb-2">
                  <Check className="mr-2 h-5 w-5 text-orange-600" />
                  Trạng Thái
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-orange-500 transition duration-150 ease-in-out"
                >
                  <option value={1}>Hoạt động</option>
                  <option value={0}>Không hoạt động</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Description */}
              <div className="flex flex-col">
                <label className="flex items-center text-sm font-medium mb-2">
                  <FileText className="mr-2 h-5 w-5 text-orange-600" />
                  Mô Tả
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  name="categoryDescription"
                  value={formData.categoryDescription}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-orange-500 transition duration-150 ease-in-out min-h-[100px]"
                  placeholder="Nhập mô tả danh mục"
                  required
                />
              </div>

              {/* Images */}
              <div className="flex flex-col">
                <label className="flex items-center text-sm font-medium mb-2">
                  <Image className="mr-2 h-5 w-5 text-orange-600" />
                  Hình Ảnh
                </label>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-4">
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
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg shadow-sm"
                            onError={() => handleImageError(index)}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="w-20 h-20 sm:w-24 sm:h-24 border-dashed border-2 border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-all"
                    >
                      <Plus size={24} />
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
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/area")}
              className="w-full sm:w-auto py-3 px-6 border border-gray-300 rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 ease-in-out"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
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
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Cập Nhật
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAreaCategory;