import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createAreaType } from "../../redux/slices/AreaType";
import { Map, X, Building, FileText, Users, Image, Check, Tag } from "lucide-react";
import { toast } from "react-toastify";

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

  const [imagePreviews, setImagePreviews] = useState([]);
  const [failedImages, setFailedImages] = useState(new Set());
  const { areaTypeCategories } = useSelector((state) => state.areaCategory);
  console.log("areaTypeCategories", areaTypeCategories);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setAreaTypeData((prevData) => ({
        ...prevData,
        images: [...prevData.images, ...files],
      }));
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previews]);
    }
  };

  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setAreaTypeData((prevData) => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index),
    }));
  };

  const handleImageError = (index) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!areaTypeData.areaTypeName.trim()) {
      toast.error("Tên loại khu vực là bắt buộc!");
      return;
    }
    if (!areaTypeData.areaDescription.trim()) {
      toast.error("Mô tả là bắt buộc!");
      return;
    }
    if (!areaTypeData.size || areaTypeData.size <= 0) {
      toast.error("Số ghế phải lớn hơn 0!");
      return;
    }
    if (!areaTypeData.price || areaTypeData.price < 0) {
      toast.error("Giá phải lớn hơn hoặc bằng 0!");
      return;
    }
    if (areaTypeData.images.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ảnh!");
      return;
    }

    const newAreaType = {
      AreaTypeName: areaTypeData.areaTypeName,
      AreaCategory: areaTypeData.areaCategory,
      AreaDescription: areaTypeData.areaDescription,
      Size: areaTypeData.size,
      Price: areaTypeData.price,
      IsDeleted: areaTypeData.isDeleted,
    };

    const files = areaTypeData.images;

    try {
      await dispatch(createAreaType({ newAreaType, files })).unwrap();
      toast.success("Tạo loại khu vực thành công!");
      navigate("/dashboard/areaType");
    } catch (error) {
      toast.error(error.message || "Lỗi khi tạo loại khu vực!");
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl rounded-xl border shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl">
        <div>
          <h2 className="text-3xl font-bold text-center text-orange-500">Thêm Kiểu Khu Vực</h2>
          <p className="mt-2 text-sm text-center text-gray-600">Tạo mới một kiểu khu vực cho hệ thống</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột bên trái */}
            <div className="space-y-6">
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <Building className="mr-2 text-orange-500" /> Tên Kiểu Khu Vực
                  </span>
                </label>
                <input
                  type="text"
                  name="areaTypeName"
                  value={areaTypeData.areaTypeName}
                  onChange={handleChange}
                  placeholder="Nhập tên kiểu khu vực"
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out h-12"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <Users className="mr-2 text-orange-500" /> Số Ghế
                  </span>
                </label>
                <input
                  type="number"
                  name="size"
                  value={areaTypeData.size}
                  min={1}
                  onChange={handleNumberChange}
                  placeholder="Nhập số ghế"
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out h-12"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  <span className="flex items-center">
                    <Tag className="mr-1.5 text-orange-500" /> Giá
                  </span>
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={areaTypeData.price}
                    min={0}
                    step="0.01"
                    onChange={handleNumberChange}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out h-12"
                    placeholder="Nhập giá"
                    required
                  />
                  <span className="flex items-center gap-1 text-sm text-gray-500 font-medium whitespace-nowrap">
                    DXL
                  </span>
                </div>
              </div>
            </div>

            {/* Cột bên phải */}
            <div className="space-y-6">
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <FileText className="mr-2 text-orange-500" /> Mô Tả
                  </span>
                </label>
                <textarea
                  ref={textareaRef}
                  name="areaDescription"
                  value={areaTypeData.areaDescription}
                  onChange={handleChange}
                  placeholder="Nhập mô tả kiểu khu vực"
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out min-h-[50px]"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <Map className="mr-2 text-orange-500" /> Danh Mục Loại Khu Vực
                  </span>
                </label>
                <select
                  name="areaCategory"
                  value={areaTypeData.areaCategory}
                  onChange={handleCategoryChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-500 focus:border-orange-500 duration-150 ease-in-out h-12"
                >
                  {areaTypeCategories.map((category) => (
                    <option key={category.id} value={category.categoryId}>
                      {category.title}
                    </option>
                  ))}
                  
                </select>
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <Image className="mr-2 text-orange-500" /> Hình Ảnh
                  </span>
                </label>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="border-dashed border-2 border-gray-400 rounded-lg p-2 text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-all"
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
                  {imagePreviews.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={failedImages.has(index) ? "/placeholder-image.jpg" : preview}
                            alt={`preview-${index}`}
                            className="w-20 h-20 object-cover rounded-lg border"
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
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/areaType")}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 ease-in-out"
            >
              Quay lại
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
                  <Check className="mr-2" /> Thêm Kiểu Khu Vực
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