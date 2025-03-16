import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRoomById, updateRoom } from "../../redux/slices/Room";
import { toast } from "react-toastify";
import { X } from "lucide-react";

const UpdateRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Lấy dữ liệu phòng từ Redux
  const { selectedRoom, loading } = useSelector((state) => state.rooms);

  useEffect(() => {
    dispatch(getRoomById(id));
  }, [dispatch, id]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: "",
    status: "",
    images: [] // Lưu danh sách ảnh
  });

  const [hasImageChange, setHasImageChange] = useState(false); // Kiểm tra có thay đổi ảnh không

  // Cập nhật form khi Redux có dữ liệu
  useEffect(() => {
    if (selectedRoom) {
      setFormData({
        name: selectedRoom.roomName || "",
        description: selectedRoom.roomDescription || "",
        capacity: selectedRoom.capacity || "",
        status: selectedRoom.isDeleted ? "Inactive" : "Active",
        images: Array.isArray(selectedRoom.images) ? selectedRoom.images : []
      });
    }
  }, [selectedRoom]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý thêm ảnh mới (Chỉ lấy tên file & kiểm tra trùng lặp)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const fileNames = files.map((file) => file.name); // Chỉ lấy tên file

    // Kiểm tra trùng lặp
    const duplicateFiles = fileNames.filter((name) => formData.images.includes(name));
    if (duplicateFiles.length > 0) {
      toast.error(`Ảnh sau đã tồn tại: ${duplicateFiles.join(", ")}`);
      return;
    }

    setFormData({ ...formData, images: [...formData.images, ...fileNames] });
    setHasImageChange(true); // Đánh dấu có thay đổi ảnh
  };

  // Xóa ảnh khỏi danh sách
  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setHasImageChange(true); // Đánh dấu có thay đổi ảnh
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mảng cập nhật JSON Patch
    const updates = [];

    if (formData.name !== selectedRoom.roomName) {
      updates.push({ operationType: 0, path: "/name", op: "replace", value: formData.name });
    }
    if (formData.description !== selectedRoom.roomDescription) {
      updates.push({ operationType: 0, path: "/description", op: "replace", value: formData.description });
    }
    if (formData.capacity !== selectedRoom.capacity) {
      updates.push({ operationType: 0, path: "/capacity", op: "replace", value: formData.capacity });
    }
    if (formData.status !== (selectedRoom.isDeleted ? "Inactive" : "Active")) {
      updates.push({ operationType: 0, path: "/status", op: "replace", value: formData.status });
    }
    if (hasImageChange) {
      updates.push({ operationType: 0, path: "/images", op: "replace", value: formData.images });
    }

    if (updates.length === 0) {
      toast.info("Không có thay đổi nào cần cập nhật!");
      return;
    }

    try {
      await dispatch(updateRoom({ roomId: id, updates })).unwrap();
      toast.success("Cập nhật phòng thành công!");
      navigate("/dashboard/room");
    } catch (error) {
      toast.error("Lỗi khi cập nhật phòng: " + error);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-4 text-blue-600">Chỉnh Sửa Phòng</h2>

      {loading ? (
        <p className="text-center text-orange-500">Đang tải dữ liệu...</p>
      ) : !selectedRoom ? (
        <p className="text-red-500 text-center">Không tìm thấy phòng có ID {id}!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Tên Phòng</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Mô Tả</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded-lg" />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Sức Chứa</label>
            <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} className="w-full p-2 border rounded-lg" />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Trạng Thái</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded-lg">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Upload ảnh mới */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">Cập Nhật Hình Ảnh</label>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full p-2 border rounded-lg" />
          </div>

          {/* Hiển thị danh sách ảnh (Chỉ hiện khi có ảnh) */}
          {formData.images.length > 0 && (
            <div className="mb-4">
              <label className="block font-semibold mb-1">{hasImageChange ? "Hình Ảnh Cập Nhật" : "Hình Ảnh Hiện Tại"}</label>
              <div className="flex flex-wrap gap-2">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative w-20 h-20 rounded-lg shadow-md overflow-hidden flex items-center justify-center bg-gray-100">
                    <img src={`/assets/${img}`} alt={`img-${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 flex items-center justify-center"
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
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">Lưu Thay Đổi</button>
            <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition" onClick={() => navigate("/dashboard/room")}>Hủy</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UpdateRoom;
