import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createAreaType } from "../../redux/slices/AreaType";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { FaBuilding, FaFileAlt, FaUsers, FaImage, FaCheck, FaTag } from "react-icons/fa";

const CreateAreaType = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.areaTypes);

  const [areaTypeData, setAreaTypeData] = useState({
    areaTypeName: "",
    areaCategory: 1,
    areaDescription: "",
    size: "",
    price: "",
    isDeleted: false,
    images: [],
  });

  const [errors, setErrors] = useState({});
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      if (!areaTypeData.areaDescription.trim()) {
        textareaRef.current.style.height = "50px";
      } else {
        textareaRef.current.style.height = "50px";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }
  }, [areaTypeData.areaDescription]);

  const validate = () => {
    let newErrors = {};
    if (!areaTypeData.areaTypeName.trim()) newErrors.areaTypeName = "Tên loại khu vực không được để trống!";
    if (!areaTypeData.areaDescription.trim()) newErrors.areaDescription = "Mô tả không được để trống!";
    if (!areaTypeData.size || areaTypenewErrors.size <= 0) newErrors.size = "Số ghế phải lớn hơn 0!";
    if (!areaTypeData.price || areaTypeData.price < 0) newErrors.price = "Giá phải lớn hơn hoặc bằng 0!";
    if (areaTypeData.images.length === 0) newErrors.images = "Vui lòng chọn ít nhất một hình ảnh!";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAreaTypeData({ ...areaTypeData, [name]: value });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setAreaTypeData({ ...areaTypeData, [name]: value === "" ? "" : parseFloat(value) });
  };

  const handleCategoryChange = (e) => {
    setAreaTypeData({ ...areaTypeData, areaCategory: parseInt(e.target.value) });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileNames = files.map((file) => file.name);

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

  const handleRemoveImage = (index) => {
    setAreaTypeData((prevData) => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await dispatch(createAreaType(areaTypeData)).unwrap();
      toast.success("Tạo loại khu vực thành công!");
      navigate("/dashboard/areaType", { state: { successMessage: res.message } });
    } catch (error) {
      toast.error(error.message || "Lỗi khi tạo loại khu vực!");
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl rounded-xl border shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl">
        <div>
          <h2 className="text-3xl font-bold text-center text-orange-500">Thêm Loại Khu Vực</h2>
          <p className="mt-2 text-sm text-center text-gray-600">Tạo mới một loại khu vực cho hệ thống</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột bên trái */}
            <div className="space-y-6">
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <FaBuilding className="mr-2 text-orange-500" /> Tên Loại Khu Vực
                  </span>
                </label>
                <input
                  type="text"
                  name="areaTypeName"
                  value={areaTypeData.areaTypeName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out h-12"
                  required
                />
                {errors.areaTypeName && <p className="text-red-500 text-sm mt-1">{errors.areaTypeName}</p>}
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <FaUsers className="mr-2 text-orange-500" /> Số Ghế
                  </span>
                </label>
                <input
                  type="number"
                  name="size"
                  value={areaTypeData.size}
                  min={1}
                  onChange={handleNumberChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out h-12"
                  required
                />
                {errors.size && <p className="text-red-500 text-sm mt-1">{errors.size}</p>}
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <FaTag className="mr-2 text-orange-500" /> Giá
                  </span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    name="price"
                    value={areaTypeData.price}
                    min={0}
                    step="0.01"
                    onChange={handleNumberChange}
                    className="w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out h-12"
                    required
                  />
                  <span className="absolute right-3 text-gray-600">VND</span>
                </div>
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
            </div>

            {/* Cột bên phải */}
            <div className="space-y-6">
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <FaFileAlt className="mr-2 text-orange-500" /> Mô Tả
                  </span>
                </label>
                <textarea
                  ref={textareaRef}
                  name="areaDescription"
                  value={areaTypeData.areaDescription}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out min-h-[50px]"
                  required
                />
                {errors.areaDescription && <p className="text-red-500 text-sm mt-1">{errors.areaDescription}</p>}
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <FaTag className="mr-2 text-orange-500" /> Danh Mục
                  </span>
                </label>
                <select
                  name="areaCategory"
                  value={areaTypeData.areaCategory}
                  onChange={handleCategoryChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-500 focus:border-orange-500 duration-150 ease-in-out h-12"
                >
                  <option value={1}>Khu vực cá nhân</option>
                  <option value={2}>Khu vực nhóm</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <FaImage className="mr-2 text-orange-500" /> Hình Ảnh
                  </span>
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out h-12"
                  required
                />
                {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
                {areaTypeData.images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {areaTypeData.images.map((file, index) => (
                      <div key={index} className="relative w-20 h-20">
                        <img
                          src={`/assets/${file}`}
                          alt={`preview-${index}`}
                          className="w-full h-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/areaType")}
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
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <>
                  <FaCheck className="mr-2" /> Thêm Loại Khu Vực
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAreaType;