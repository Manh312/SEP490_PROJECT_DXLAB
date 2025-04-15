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
import { Building, Image, FileText, Check, X, ArrowLeft } from "lucide-react";

const BACKEND_URL = "https://localhost:9999"; // Define your backend URL

const UpdateAreaCategory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams(); // Get ID from URL params
  const fileInputRef = useRef(null); // Ref for file input

  // Get loading and areaTypeCategories from Redux store
  const { loading, areaTypeCategories, error } = useSelector((state) => state.areaCategory);
  console.log(areaTypeCategories);
  // Find current category from store
  const currentCategory = areaTypeCategories.find(
    (cat) => cat.categoryId === parseInt(id)
  );  


  // Form state
  const [formData, setFormData] = useState({
    title: "",
    categoryDescription: "",
    status: 1,
    images: [], // New images to upload
  });

  const [hasDetailsChange, setHasDetailsChange] = useState(false); // Track changes in details
  const [hasImageChange, setHasImageChange] = useState(false); // Track changes in images
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // Existing image URLs from backend
  const [imagesToDelete, setImagesToDelete] = useState([]); // Images marked for deletion
  const [failedImages, setFailedImages] = useState(new Set()); // Track failed image loads

  // Initialize formData with current category data
  useEffect(() => {
    if (!currentCategory) {
      // Fetch categories if not loaded
      dispatch(fetchAllAreaTypeCategories());
    } else {
      // Normalize images to array
      const images = Array.isArray(currentCategory.images)
        ? currentCategory.images
        : [currentCategory.images].filter(Boolean);

      // Prepend BACKEND_URL to relative image paths
      const existing = images.map((img) =>
        img.startsWith("http") ? img : `${BACKEND_URL}${img}`
      );

      setFormData({
        title: currentCategory.title || "",
        categoryDescription: currentCategory.categoryDescription || "",
        status: currentCategory.status !== undefined ? currentCategory.status : 1,
        images: [], // New images start empty
      });

      setExistingImages(existing);
      setImagePreviews(existing);
    }
  }, [currentCategory, dispatch]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "status" ? parseInt(value) : value,
    }));
    setHasDetailsChange(true); // Mark details as changed
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...files],
      }));
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previews]);
      setHasImageChange(true); // Mark images as changed
    }
  };

  // Handle image removal
  const handleRemoveImage = (index) => {
    const isExistingImage = index < existingImages.length;
    let updatedPreviews = [...imagePreviews];
    let updatedImages = [...formData.images];
    let updatedExistingImages = [...existingImages];

    if (isExistingImage) {
      // Get the image URL to delete
      let imageUrl = existingImages[index];

      // Normalize the imageUrl for backend (remove BACKEND_URL and ensure correct path)
      imageUrl = imageUrl.replace(BACKEND_URL, "");
      if (!imageUrl.startsWith("/")) {
        imageUrl = "/" + imageUrl;
      }
      if (!imageUrl.startsWith("/Images/")) {
        const filename = imageUrl.split("/").pop();
        imageUrl = `/Images/${filename}`;
      }

      // Add to imagesToDelete
      setImagesToDelete((prev) => [...prev, imageUrl]);

      // Update existingImages and previews
      updatedExistingImages = updatedExistingImages.filter((_, i) => i !== index);
      updatedPreviews = updatedPreviews.filter((_, i) => i !== index);

      setExistingImages(updatedExistingImages);
      setImagePreviews(updatedPreviews);
    } else {
      // Remove new image (not yet uploaded)
      const fileIndex = index - existingImages.length;
      updatedPreviews = updatedPreviews.filter((_, i) => i !== index);
      updatedImages = updatedImages.filter((_, i) => i !== fileIndex);

      setImagePreviews(updatedPreviews);
      setFormData((prev) => ({
        ...prev,
        images: updatedImages,
      }));
    }

    setHasImageChange(true); // Mark images as changed
  };

  // Handle image load errors
  const handleImageError = (index) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const trimmedTitle = formData.title.trim();
    const trimmedDescription = formData.categoryDescription.trim();

    if (!trimmedTitle) {
      toast.error("Tên loại khu vực là bắt buộc!");
      return;
    }
    if (!trimmedDescription) {
      toast.error("Mô tả là bắt buộc!");
      return;
    }

    try {
      // Step 1: Delete images marked for deletion
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

      // Step 2: Update category details if changed
      if (hasDetailsChange) {
        // Create JSON Patch document
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

      // Step 3: Update new images if changed
      if (hasImageChange && formData.images.length > 0) {
        await dispatch(
          updateAreaTypeCategoryImages({
            categoryId: parseInt(id),
            files: formData.images,
          })
        ).unwrap();
        toast.success("Cập nhật ảnh thành công!");
      }

      // If no changes, inform user
      if (!hasDetailsChange && !hasImageChange && imagesToDelete.length === 0) {
        toast.info("Không có thay đổi nào để cập nhật!");
        return;
      }

      // Refresh category list and navigate back
      await dispatch(fetchAllAreaTypeCategories()).unwrap();
      navigate("/dashboard/area");
    } catch (err) {
      const errorMessage = err.message || "Lỗi khi cập nhật danh mục loại khu vực";
      toast.error(errorMessage);
      console.error("Update error:", err);
    }
  };

  // Loading state
  if (loading || !currentCategory) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-600 text-lg animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 mb-10">
      <div className="w-full max-w-4xl mx-auto rounded-xl border shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <Building className="h-6 w-6 text-orange-500" />
            <h2 className="text-3xl font-bold text-gray-800">
              Cập Nhật Danh Mục Loại Khu Vực {id}
            </h2>
          </div>
          <button
            onClick={() => navigate("/dashboard/area")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all shadow-md"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Quay Lại</span>
          </button>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Title */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <Building className="mr-2 text-orange-500" /> Tên Loại Danh Mục{" "}
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out h-12"
                  placeholder="Nhập tên danh mục"
                  required
                />
              </div>

              {/* Status */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <Check className="mr-2 text-orange-500" /> Trạng Thái
                  </span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-500 focus:border-orange-500 duration-150 ease-in-out h-12"
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
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <FileText className="mr-2 text-orange-500" /> Mô Tả{" "}
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                <textarea
                  name="categoryDescription"
                  value={formData.categoryDescription}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out min-h-[100px]"
                  placeholder="Nhập mô tả danh mục"
                  required
                />
              </div>

              {/* Images */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <Image className="mr-2 text-orange-500" /> Hình Ảnh
                  </span>
                </label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4 flex-wrap">
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
                            className="w-24 h-24 object-cover rounded-lg shadow-sm"
                            onError={() => handleImageError(index)}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          >
                            <X size={16} />
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
          <div className="mt-8 flex justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/area")}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 ease-in-out"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300 disabled:cursor-not-allowed transition duration-150 ease-in-out"
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
                  <Check className="mr-2" /> Cập Nhật
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