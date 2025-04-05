import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MapPin, ArrowLeft } from "lucide-react";
import { fetchAllAreaTypeCategories, updateAreaTypeCategory } from "../../redux/slices/AreaCategory";
import { toast } from "react-toastify";

const UpdateAreaCategory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams(); // Lấy ID từ URL params

  // Get loading and error states from Redux store
  const { loading, areaTypeCategories } = useSelector((state) => state.areaCategory);

  // Tìm category hiện tại từ danh sách trong store
  const currentCategory = areaTypeCategories.find(
    (cat) => cat.categoryId === parseInt(id)
  );

  console.log("Current Category:", currentCategory);
  

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    categoryDescription: "",
    images: [], // Để xử lý file mới nếu có
    status: 1,
  });

  // Khởi tạo formData với dữ liệu hiện tại khi component mount
  useEffect(() => {
    if (currentCategory) {
      setFormData({
        title: currentCategory.title || "",
        categoryDescription: currentCategory.categoryDescription || "",
        images: [], // Không set ảnh cũ vào state, chỉ xử lý ảnh mới
        status: currentCategory.status || 1,
      });
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
    setFormData((prev) => ({
      ...prev,
      images: e.target.files[0],
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the data to send to the API
    const updatedAreaTypeCategory = {
      title: formData.title,
      categoryDescription: formData.categoryDescription,
      status: formData.status,
    };

    // Nếu có file ảnh mới thì thêm vào FormData
    const formDataToSend = new FormData();
    formDataToSend.append("Title", updatedAreaTypeCategory.title);
    formDataToSend.append("CategoryDescription", updatedAreaTypeCategory.categoryDescription);
    formDataToSend.append("Status", updatedAreaTypeCategory.status);
    
    if (formData.images) {
      formDataToSend.append("Images", formData.images);
    }

    try {
      await dispatch(
        updateAreaTypeCategory({
          categoryId: parseInt(id),
          updatedData: formDataToSend,
        })
      ).unwrap();
      await dispatch(fetchAllAreaTypeCategories()).unwrap();
      toast.success("Cập nhật loại khu vực thành công!");
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
          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700">
              Ảnh
            </label>
            <input
              type="file"
              id="images"
              name="images"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              accept="image/*"
            />
            {formData.images && (
              <p className="mt-2 text-sm text-gray-600">Đã chọn: {formData.images.name}</p>
            )}
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