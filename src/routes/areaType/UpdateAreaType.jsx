import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchAreaTypeById, updateAreaType } from "../../redux/slices/AreaType";
import { toast } from "react-toastify";
import { FaBuilding, FaFileAlt, FaUsers, FaImage, FaCheck, FaTag } from "react-icons/fa";
import { X, ArrowLeft } from "lucide-react"; // Thêm ArrowLeft

const UpdateAreaType = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedAreaType, loading } = useSelector((state) => state.areaTypes);

  const [formData, setFormData] = useState({
    areaTypeName: "",
    areaDescription: "",
    price: "",
    areaCategory: "",
    size: "",
    isDeleted: false,
    images: [],
  });

  const [hasImageChange, setHasImageChange] = useState(false);

  useEffect(() => {
    dispatch(fetchAreaTypeById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedAreaType) {
      setFormData({
        areaTypeName: selectedAreaType.areaTypeName || "",
        areaDescription: selectedAreaType.areaDescription || "",
        price: selectedAreaType.price !== undefined ? String(selectedAreaType.price) : "",
        areaCategory: selectedAreaType.areaCategory || 1,
        size: selectedAreaType.size || "",
        isDeleted: selectedAreaType.isDeleted || false,
        images: Array.isArray(selectedAreaType.images) ? selectedAreaType.images : [],
      });
    }
  }, [selectedAreaType]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const fileNames = files.map((file) => file.name);

    const duplicateFiles = fileNames.filter((name) => formData.images.includes(name));
    if (duplicateFiles.length > 0) {
      toast.error(`Ảnh sau đã tồn tại: ${duplicateFiles.join(", ")}`);
      return;
    }

    setFormData({ ...formData, images: [...formData.images, ...fileNames] });
    setHasImageChange(true);
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setHasImageChange(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updates = [];
    if (formData.areaTypeName !== selectedAreaType.areaTypeName) {
      updates.push({ operationType: 0, path: "areaTypeName", op: "replace", value: formData.areaTypeName });
    }
    if (formData.areaDescription !== selectedAreaType.areaDescription) {
      updates.push({ operationType: 0, path: "areaDescription", op: "replace", value: formData.areaDescription });
    }
    if (formData.price !== String(selectedAreaType.price)) {
      updates.push({ operationType: 0, path: "price", op: "replace", value: formData.price });
    }
    if (formData.areaCategory !== selectedAreaType.areaCategory) {
      updates.push({ operationType: 0, path: "areaCategory", op: "replace", value: Number(formData.areaCategory) });
    }
    if (formData.size !== selectedAreaType.size) {
      updates.push({ operationType: 0, path: "size", op: "replace", value: formData.size });
    }
    if (formData.isDeleted !== selectedAreaType.isDeleted) {
      updates.push({ operationType: 0, path: "isDeleted", op: "replace", value: formData.isDeleted });
    }
    if (hasImageChange) {
      updates.push({
        operationType: 0,
        path: "images",
        op: "replace",
        value: formData.images.map((img) => ({ imageUrl: img })),
      });
    }

    if (updates.length === 0) {
      toast.info("Không có thay đổi nào cần cập nhật!");
      return;
    }

    try {
      await dispatch(updateAreaType({ areaTypeId: id, updatedData: updates })).unwrap();
      toast.success("Cập nhật thành công!");
      navigate("/dashboard/areaType");
    } catch (error) {
      const errorMessage = error.message || "Unknown error";
      toast.error(`Lỗi khi cập nhật loại khu vực: ${errorMessage}`);
      console.error("Update error:", error);
    }
  };

  if (loading || !selectedAreaType) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-600 text-lg animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl rounded-xl border shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl">
        <div>
          <h2 className="text-3xl font-bold text-center">Cập Nhật Loại Khu Vực</h2>
          <p className="mt-2 text-sm text-center">Chỉnh sửa thông tin loại khu vực #{id}</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột bên trái */}
            <div className="space-y-6">
              {/* Tên loại khu vực */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <FaBuilding className="mr-2 text-orange-500" /> Tên Loại Khu Vực
                  </span>
                </label>
                <input
                  type="text"
                  name="areaTypeName"
                  value={formData.areaTypeName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out"
                  required
                />
              </div>
              {/* Số ghế */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <FaUsers className="mr-2 text-orange-500" /> Số Ghế
                  </span>
                </label>
                <input
                  type="number"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out"
                />
              </div>
              {/* Giá */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <FaTag className="mr-2 text-orange-500" /> Giá
                  </span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out"
                />
              </div>
              {/* Trạng thái */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <FaTag className="mr-2 text-orange-500" /> Trạng Thái
                  </span>
                </label>
                <select
                  name="isDeleted"
                  value={String(formData.isDeleted)}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-500 focus:border-orange-500 duration-150 ease-in-out"
                >
                  <option value="false">Hoạt động</option>
                  <option value="true">Xóa</option>
                </select>
              </div>
            </div>

            {/* Cột bên phải */}
            <div className="space-y-6">
              {/* Mô tả */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <FaFileAlt className="mr-2 text-orange-500" /> Mô Tả
                  </span>
                </label>
                <textarea
                  name="areaDescription"
                  value={formData.areaDescription}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out h-24"
                />
              </div>
              {/* Danh mục */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <FaTag className="mr-2 text-orange-500" /> Danh Mục
                  </span>
                </label>
                <select
                  name="areaCategory"
                  value={String(formData.areaCategory)}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-500 focus:border-orange-500 duration-150 ease-in-out"
                >
                  <option value="1">Khu vực cá nhân</option>
                  <option value="2">Khu vực nhóm</option>
                </select>
              </div>
              {/* Hình ảnh */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <FaImage className="mr-2 text-orange-500" /> Hình Ảnh
                  </span>
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out"
                />
                {formData.images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative w-20 h-20">
                        <img
                          src={`/assets/${img}`}
                          alt={`img-${index}`}
                          className="w-full h-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
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

          {/* Nút Quay lại và Cập nhật */}
          <div className="mt-8 flex justify-between gap-4">
            <button
              type="button"
              className="flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out"
              onClick={() => {
                console.log("Navigating to /dashboard/areaType");
                navigate("/dashboard/areaType");
              }}
            >
              <ArrowLeft className="mr-2" /> Quay Lại
            </button>
            <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300 disabled:cursor-not-allowed transition duration-150 ease-in-out"
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
                  <FaCheck className="mr-2" /> Cập Nhật
                </>
              )}
            </button>
            <Link 
              to={`/dashboard/${selectedAreaType.areaTypeId}/addFacility`}
              disabled={loading}
              className="flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              <span>Thêm Cơ Sở Vật Chất</span>
            </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAreaType;