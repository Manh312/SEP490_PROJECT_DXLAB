import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createAreaType } from "../../redux/slices/AreaType";
import { X } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

const CreateAreaType = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.areaTypes);

  const [areaTypeData, setAreaTypeData] = useState({
    areaTypeName: "",
    areaCategory: 1, // 1: Khu vực cá nhân, 2: Khu vực nhóm
    areaDescription: "",
    size: "",
    price: "",
    isDeleted: false,
    images: [],
  });

  const [errors, setErrors] = useState({});

  // Validate dữ liệu trước khi submit
  const validate = () => {
    let newErrors = {};
    if (!areaTypeData.areaTypeName.trim()) newErrors.areaTypeName = "Tên loại khu vực không được để trống!";
    if (!areaTypeData.areaTypeName.trim()) newErrors.areaTypeName = "Tên loại khu vực không được để trống!";
    if (!areaTypeData.areaDescription.trim()) newErrors.areaDescription = "Mô tả không được để trống!";
    // if (!areaTypeData.size || areaTypeData.size <= 0) newErrors.size = "Diện tích phải lớn hơn 0!";
    // if (!areaTypeData.price || areaTypeData.price < 0) newErrors.price = "Giá phải lớn hơn hoặc bằng 0!";
    if (areaTypeData.images.length === 0) newErrors.images = "Vui lòng chọn ít nhất một hình ảnh!";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAreaTypeData({ ...areaTypeData, [name]: value });
  };

  // Xử lý thay đổi input số (size & price)
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setAreaTypeData({ ...areaTypeData, [name]: value === "" ? "" : parseFloat(value) });
  };

  // Xử lý thay đổi danh mục
  const handleCategoryChange = (e) => {
    setAreaTypeData({ ...areaTypeData, areaCategory: parseInt(e.target.value) });
  };

  // Xử lý chọn trạng thái isDeleted
  const handleToggleDelete = () => {
    setAreaTypeData({ ...areaTypeData, isDeleted: !areaTypeData.isDeleted });
  };

  // Xử lý chọn ảnh
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileNames = files.map((file) => file.name);

    // Lọc ảnh trùng
    const newImages = fileNames.filter((name) => !areaTypeData.images.includes(name));

    if (newImages.length === 0) {
      toast.error("Ảnh đã tồn tại, vui lòng chọn ảnh khác!");
      return;
    }

    setAreaTypeData((prevData) => ({
      ...prevData,
      images: [...prevData.images, ...newImages],
    }));
  };

  // Xóa ảnh khỏi danh sách
  const handleRemoveImage = (index) => {
    setAreaTypeData((prevData) => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index),
    }));
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await dispatch(createAreaType(areaTypeData)).unwrap();
      navigate("/dashboard/areaType", { state: { successMessage: res.message } });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 rounded-lg shadow-lg">
      <ToastContainer />
      <h2 className="text-2xl font-semibold text-center mb-4 text-blue-600">Thêm Loại Khu Vực</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tên loại khu vực */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Tên Loại Khu Vực</label>
          <input
            type="text"
            name="areaTypeName"
            value={areaTypeData.areaTypeName}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          {errors.areaTypeName && <p className="text-red-500 text-sm">{errors.areaTypeName}</p>}
        </div>

        {/* Danh mục */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Danh Mục</label>
          <select
            name="areaCategory"
            value={areaTypeData.areaCategory}
            onChange={handleCategoryChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value={1}>Khu vực cá nhân</option>
            <option value={2}>Khu vực nhóm</option>
          </select>
        </div>

        {/* SỐ lượng */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Số lượng (ghế)</label>
          <input
            type="number"
            name="size"
            value={areaTypeData.size}
            min={1}
            onChange={handleNumberChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          {errors.size && <p className="text-red-500 text-sm">{errors.size}</p>}
        </div>

        {/* Mô tả */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Mô Tả</label>
          <textarea
            name="areaDescription"
            value={areaTypeData.areaDescription}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          {errors.areaDescription && <p className="text-red-500 text-sm">{errors.areaDescription}</p>}
        </div>

         {/* Checkbox isDeleted */}
         <div className="mb-4 ">
          <input
            type="checkbox"
            id="isDeleted"
            checked={areaTypeData.isDeleted}
            onChange={handleToggleDelete}
            className="w-4 h-4 text-red-500 focus:ring-red-400"
          />
          <label htmlFor="isDeleted" className="ml-2 font-medium">Đánh dấu xác nhận không hoạt động</label>
        </div>

        {/* Giá */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Giá</label>
          <input
            type="number"
            name="price"
            value={areaTypeData.price}
            min={0}
            step="0.01" // ✅ Cho phép nhập số thập phân (2 chữ số sau dấu chấm)
            onChange={handleNumberChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
        </div>

        
        {/* Chọn ảnh */}
        <div className=" col-span-2 mb-4">
          <label className="block font-medium mb-2">Hình Ảnh</label>
          <input type="file" multiple accept="image/*" onChange={handleImageUpload} required/>
          {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}

          {/* Hiển thị ảnh */}
          <div className="flex flex-wrap gap-2 mt-2">
            {areaTypeData.images.map((file, index) => (
              <div key={index} className="relative">
                <img src={`/assets/${file}`} alt="preview" className="w-20 h-20 object-cover rounded-md shadow-md" />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 flex items-center justify-center"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Nút hành động */}
        <div className="col-span-2 flex justify-between">
          <button
            type="button"
            className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
            onClick={() => navigate("/dashboard/areaType")}
          >
            Hủy
          </button>
          <button
            type="submit"
            className={`bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Đang tạo..." : "Thêm loại khu vực"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAreaType;
