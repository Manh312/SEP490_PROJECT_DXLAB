import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAreaTypeById, updateAreaType } from "../../redux/slices/AreaType";
import { X } from "lucide-react";
import { toast } from "react-toastify";

const UpdateAreaType = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Lấy dữ liệu từ Redux
  const { selectedAreaType, loading } = useSelector((state) => state.areaTypes);

  useEffect(() => {
    dispatch(fetchAreaTypeById(id));
  }, [dispatch]);

  const [formData, setFormData] = useState({
    areaTypeName: "",
    areaDescription: "",
    price: "",
    images: [],
    areaCategory: 1,
    size: "",
    isDeleted: false,
  });

  const [hasImageChange, setHasImageChange] = useState(false);

  // Cập nhật form khi Redux có dữ liệu
  useEffect(() => {
    if (selectedAreaType) {
      setFormData({
        areaTypeName: selectedAreaType.areaTypeName || "",
        areaDescription: selectedAreaType.areaDescription || "",
        price:
          selectedAreaType.price !== undefined
            ? String(selectedAreaType.price)
            : "",
        images: Array.isArray(selectedAreaType.images)
          ? selectedAreaType.images
          : [],
        areaCategory: selectedAreaType.areaCategory || 1, // Chỉ hiển thị
        size: selectedAreaType.size || "", // Chỉ hiển thị
        isDeleted: selectedAreaType.isDeleted,
      });
    }
  }, [selectedAreaType]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý toggle trạng thái `isDeleted`
  const handleToggleDelete = () => {
    setFormData((prev) => ({ ...prev, isDeleted: !prev.isDeleted }));
  };

  // Xử lý thêm ảnh mới (Chỉ lấy tên file & kiểm tra trùng lặp)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const fileNames = files.map((file) => file.name);

    // Kiểm tra trùng lặp
    const duplicateFiles = fileNames.filter((name) =>
      formData.images.includes(name)
    );
    if (duplicateFiles.length > 0) {
      toast.error(`Ảnh sau đã tồn tại: ${duplicateFiles.join(", ")}`);
      return;
    }

    setFormData({ ...formData, images: [...formData.images, ...fileNames] });
    setHasImageChange(true);
  };

  // Xóa ảnh khỏi danh sách
  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setHasImageChange(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mảng cập nhật JSON Patch
    const updates = [];

    if (formData.areaTypeName !== selectedAreaType.areaTypeName) {
      updates.push({
        operationType: 0,
        path: "areaTypeName",
        op: "replace",
        value: formData.areaTypeName,
      });
    }
    if (formData.areaDescription !== selectedAreaType.areaDescription) {
      updates.push({
        operationType: 0,
        path: "areaDescription",
        op: "replace",
        value: formData.areaDescription,
      });
    }
    if (formData.price !== String(selectedAreaType.price)) {
      updates.push({
        operationType: 0,
        path: "price",
        op: "replace",
        value: String(formData.price), // ✅ Chuyển về string trước khi gửi
      });
    }
    if (hasImageChange) {
      updates.push({
        operationType: 0,
        path: "images",
        op: "replace",
        value: formData.images.map((img) => ({ imageUrl: img })),
      });
    }

    if (formData.isDeleted !== selectedAreaType.isDeleted) {
      updates.push({
        operationType: 0,
        path: "isDeleted",
        op: "replace",
        value: formData.isDeleted, // ✅ Cập nhật trạng thái
      });
    }

    if (updates.length === 0) {
      toast.info("Không có thay đổi nào cần cập nhật!");
      return;
    }

    try {
      const res = await dispatch(
        updateAreaType({ areaTypeId: id, updatedData: updates })
      ).unwrap();
      navigate("/dashboard/areaType", {
        state: { successMessage: res.message },
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-4 text-blue-600">
        Chỉnh Sửa Loại Khu Vực {id}
      </h2>

      {loading ? (
        <p className="text-center text-orange-500">Đang tải dữ liệu...</p>
      ) : !selectedAreaType ? (
        <p className="text-red-500 text-center">
          Không tìm thấy loại khu vực có ID {id}!
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Tên Loại Khu Vực</label>
            <input
              type="text"
              name="areaTypeName"
              value={formData.areaTypeName}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Mô Tả</label>
            <textarea
              name="areaDescription"
              value={formData.areaDescription}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          {/* Các trường chỉ hiển thị */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">Danh Mục</label>
            <input
              type="text"
              value={
                formData.areaCategory === 1 ? "Khu vực cá nhân" : "Khu vực nhóm"
              }
              className="w-full p-2 border rounded-lg bg-gray-100"
              readOnly
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Số Ghế</label>
            <input
              type="text"
              value={formData.size}
              className="w-full p-2 border rounded-lg bg-gray-100"
              readOnly
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Giá</label>
            <div className="relative w-full">
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 pr-12 border rounded-lg" // 🟢 Thêm padding phải để không bị chữ VND che
                required
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                VND
              </span>
            </div>
          </div>

          {/* Checkbox cập nhật trạng thái */}
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="isDeleted"
              checked={formData.isDeleted}
              onChange={handleToggleDelete}
              className="w-4 h-4 text-red-500 focus:ring-red-400"
            />
            <label htmlFor="isDeleted" className="ml-2 font-medium">
              Đánh dấu đã xóa
            </label>
          </div>

          {/* Upload ảnh mới */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">
              Cập Nhật Hình Ảnh
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Hiển thị danh sách ảnh */}
          {formData.images.length > 0 && (
            <div className="mb-4">
              <label className="block font-semibold mb-1">
                {hasImageChange ? "Hình Ảnh Cập Nhật" : "Hình Ảnh Hiện Tại"}
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.images.map((img, index) => (
                  <div
                    key={index}
                    className="relative w-20 h-20 rounded-lg shadow-md overflow-hidden flex items-center justify-center bg-gray-100"
                  >
                    <img
                      src={`/assets/${img}`}
                      alt={`img-${index}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      onClick={() => removeImage(index)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Lưu Thay Đổi
            </button>
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
              onClick={() => navigate("/dashboard/areaType")}
            >
              Hủy
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UpdateAreaType;
