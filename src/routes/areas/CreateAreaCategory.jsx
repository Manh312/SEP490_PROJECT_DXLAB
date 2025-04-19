import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MapPin, ArrowLeft, X } from "lucide-react";
import { createAreaTypeCategory } from "../../redux/slices/AreaCategory";
import { toast } from "react-toastify";

const CreateAreaCategory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null); // Ref for file input

  // Get loading and error states from Redux store
  const { loading } = useSelector((state) => state.areaCategory);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    categoryDescription: "",
    images: [], // Store array of files
    status: 1, // Default to "Hoạt động" (1)
  });

  const [imagePreviews, setImagePreviews] = useState([]); // Store preview URLs for images
  const [failedImages, setFailedImages] = useState(new Set()); // Track failed image loads

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...files], // Add new files to the array
      }));
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previews]);
    }
  };

  // Handle image removal
  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Handle image load error
  const handleImageError = (index) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
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
    if (formData.images.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ảnh!");
      return;
    }

    // Prepare the data to send to the API
    const newAreaTypeCategory = {
      title: trimmedTitle,
      categoryDescription: trimmedDescription,
      status: formData.status,
    };

    // Prepare the files array
    const files = formData.images;

    try {
      // Dispatch the createAreaTypeCategory thunk with the correct arguments
      await dispatch(
        createAreaTypeCategory({ newAreaTypeCategory, files })
      ).unwrap();
      toast.success("Tạo khu vực thành công!");
      navigate("/dashboard/area");
    } catch (err) {
      toast.error(err.message || "Lỗi khi tạo dịch vụ");
      console.error("Failed to create area type category:", err);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl rounded-xl border shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Thêm dịch vụ Mới
            </h2>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Tên dịch vụ
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="Nhập tên dịch vụ"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700">
              Mô Tả
            </label>
            <textarea
              id="categoryDescription"
              name="categoryDescription"
              value={formData.categoryDescription}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="Nhập mô tả dịch vụ"
              rows="4"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-700">Ảnh</label>
            <div className="flex items-center gap-4 flex-wrap">
              {imagePreviews.length > 0 &&
                imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={failedImages.has(index) ? "/placeholder-image.jpg" : preview}
                      alt={`Area preview ${index}`}
                      className="w-24 h-24 object-cover rounded-lg shadow-sm"
                      onError={() => handleImageError(index)}
                    />
                    <button
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

          {/* Submit Button */}
          <div className="mt-8 flex justify-between gap-4">
            <button
              onClick={() => navigate("/dashboard/area")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Quay Lại</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all ${loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              {loading ? "Đang tạo..." : "Tạo dịch vụ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAreaCategory;