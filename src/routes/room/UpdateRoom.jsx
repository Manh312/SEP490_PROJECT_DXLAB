import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getRoomById, updateRoom } from "../../redux/slices/Room";
import { toast } from "react-toastify";
import { FaBuilding, FaFileAlt, FaUsers, FaImage, FaCheck, FaTag } from "react-icons/fa";
import { X } from "lucide-react";

const UpdateRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedRoom, loading } = useSelector((state) => state.rooms);
  const textareaRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: "",
    isDeleted: "",
    images: [],
  });

  const [hasImageChange, setHasImageChange] = useState(false);

  useEffect(() => {
    dispatch(getRoomById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedRoom) {
      setFormData({
        name: selectedRoom.roomName || "",
        description: selectedRoom.roomDescription || "",
        capacity: selectedRoom.capacity || "",
        isDeleted: selectedRoom.isDeleted,
        images: Array.isArray(selectedRoom.images) ? selectedRoom.images : [],
      });
    }
  }, [selectedRoom]);

  useEffect(() => {
    if (textareaRef.current) {
      if (!formData.description.trim()) {
        textareaRef.current.style.height = "50px";
      } else {
        textareaRef.current.style.height = "50px";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }
  }, [formData.description]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "capacity" ? (value === "" ? "" : parseInt(value)) : value });
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
    if (formData.name !== selectedRoom.roomName) {
      updates.push({ operationType: 0, path: "roomName", op: "replace", value: formData.name });
    }
    if (formData.description !== selectedRoom.roomDescription) {
      updates.push({ operationType: 0, path: "roomDescription", op: "replace", value: formData.description });
    }
    if (formData.capacity !== selectedRoom.capacity) {
      updates.push({ operationType: 0, path: "capacity", op: "replace", value: formData.capacity });
    }
    if (formData.isDeleted !== selectedRoom.isDeleted) {
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
      const res = await dispatch(updateRoom({ roomId: id, updates })).unwrap();
      navigate("/dashboard/room", { state: { successMessage: res.message } });
    } catch (error) {
      const errorMessage = error.message || "Unknown error";
      toast.error(`Lỗi khi cập nhật phòng: ${errorMessage}`);
      console.error("Update error:", error);
    }
  };

  if (loading || !selectedRoom) {
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
          <h2 className="text-3xl font-bold text-center text-orange-500">Cập Nhật Phòng</h2>
          <p className="mt-2 text-sm text-center text-gray-600">Chỉnh sửa thông tin phòng #{id}</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột bên trái */}
            <div className="space-y-6">
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium flex items-center">
                  <FaBuilding className="mr-2 text-orange-500" /> Tên Phòng
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 h-12 transition duration-150 ease-in-out"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium flex items-center">
                  <FaUsers className="mr-2 text-orange-500" /> Sức Chứa
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 h-12 transition duration-150 ease-in-out"
                  min={1}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium flex items-center">
                  <FaTag className="mr-2 text-orange-500" /> Trạng Thái
                </label>
                <select
                  name="isDeleted"
                  value={String(formData.isDeleted)}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-500 focus:border-orange-500 h-12 transition duration-150 ease-in-out"
                >
                  <option value="false">Hoạt động</option>
                  <option value="true">Xóa</option>
                </select>
              </div>
            </div>
            {/* Cột bên phải */}
            <div className="space-y-6">
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium flex items-center">
                  <FaFileAlt className="mr-2 text-orange-500" /> Mô Tả
                </label>
                <textarea
                  ref={textareaRef}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 min-h-[50px] transition duration-150 ease-in-out"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium flex items-center">
                  <FaBuilding className="mr-2 text-orange-500" /> Khu Vực (Chỉ đọc)
                </label>
                <div className="w-full px-4 py-3 rounded-lg border bg-gray-100 text-gray-700 h-12 flex items-center">
                  {selectedRoom.area_DTO && selectedRoom.area_DTO.length > 0 ? (
                    selectedRoom.area_DTO.map((area, index) => (
                      <span key={index} className="truncate">
                        {area.areaName} - <span className="text-gray-600">Loại: {area.areaTypeName}</span>
                        {index < selectedRoom.area_DTO.length - 1 && ", "}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">Không có khu vực</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium flex items-center">
                  <FaImage className="mr-2 text-orange-500" /> Hình Ảnh
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out h-12"
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
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition duration-150 ease-in-out"
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
              onClick={() => navigate("/dashboard/room")}
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
                  <FaCheck className="mr-2" /> Cập Nhật
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateRoom;