import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MapPin, ArrowLeft, X } from "lucide-react";
import { fetchAllAreaTypeCategories, updateAreaTypeCategory } from "../../redux/slices/AreaCategory";
import { toast } from "react-toastify";

const BACKEND_URL = "https://localhost:9999"; // Define your backend URL

const UpdateAreaCategory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams(); // Lấy ID từ URL params
  const fileInputRef = useRef(null); // Ref for file input

  // Get loading and error states from Redux store
  const { loading, areaTypeCategories } = useSelector((state) => state.areaCategory);

  // Tìm category hiện tại từ danh sách trong store
  const currentCategory = areaTypeCategories.find(
    (cat) => cat.categoryId === parseInt(id)
  );

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    categoryDescription: "",
    images: [], // Để xử lý file mới nếu có
    status: 1,
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [failedImages, setFailedImages] = useState(new Set());

  // Khởi tạo formData với dữ liệu hiện tại khi component mount
  useEffect(() => {
    if (currentCategory) {
      // Đảm bảo images là một mảng
      const images = Array.isArray(currentCategory.images)
        ? currentCategory.images
        : [currentCategory.images || ""];

      // Thêm domain của backend vào URL của ảnh
      const existing = images
        .filter((img) => typeof img === "string" && img) // Lọc các giá trị hợp lệ
        .map((img) => {
          if (img.startsWith("http")) {
            return img;
          }
          return `${BACKEND_URL}${img}`;
        });

      setFormData({
        title: currentCategory.title || "",
        categoryDescription: currentCategory.categoryDescription || "",
        images: [], // Không set ảnh cũ vào state, chỉ xử lý ảnh mới
        status: currentCategory.status || 1,
      });

      setExistingImages(existing);
      setImagePreviews(existing);
    }
  }, [currentCategory]);

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
        images: [...prev.images, ...files],
      }));
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previews]);
    }
  };

  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    if (index < existingImages.length) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingImages.length;
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== fileIndex),
      }));
    }
  };

  const handleImageError = (index) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  // Fetch image as Blob
  const fetchImageAsBlob = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new File([blob], imageUrl.split("/").pop(), { type: blob.type });
    } catch (error) {
      console.error("Failed to fetch image as Blob:", error);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

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

    // Validate that at least one image is present
    // if (imagePreviews.length === 0) {
    //   toast.error("Vui lòng chọn ít nhất một ảnh!");
    //   return;
    // }

    const areaData = {
      title: trimmedTitle,
      categoryDescription: trimmedDescription,
      status: formData.status,
      existingImages: existingImages, // Gửi danh sách ảnh hiện tại
    };

    let filesToSend = [];

    try {
      // Nếu có ảnh mới, sử dụng ảnh mới
      if (formData.images.length > 0) {
        filesToSend = formData.images;
      } else if (existingImages.length > 0) {
        // Nếu không có ảnh mới, fetch ảnh hiện tại và gửi dưới dạng file
        filesToSend = await Promise.all(
          existingImages.map(async (imageUrl) => await fetchImageAsBlob(imageUrl))
        );
      }

      const response = await dispatch(
        updateAreaTypeCategory({
          categoryId: parseInt(id),
          areaData,
          files: filesToSend,
        })
      ).unwrap();

      await dispatch(fetchAllAreaTypeCategories()).unwrap();
      toast.success(response.message || "Cập nhật loại khu vực thành công!");
      navigate("/dashboard/area");
    } catch (err) {
      toast.error(err.message || "Lỗi khi cập nhật loại khu vực");
      console.error("Failed to update area type category:", err);
    }
  };

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <div className="w-full border border-gray-600 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <MapPin className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Cập Nhật Loại Khu Vực
            </h2>
          </div>
          <button
            onClick={() => navigate("/dashboard/area")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Quay Lại</span>
          </button>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Tên Loại Khu Vực
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="Nhập tên loại khu vực"
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
              placeholder="Nhập mô tả loại khu vực"
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
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Đang cập nhật..." : "Cập Nhật Loại Khu Vực"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAreaCategory;