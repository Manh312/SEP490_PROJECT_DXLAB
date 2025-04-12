import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createRoom } from "../../redux/slices/Room";
import { fetchAreaTypes } from "../../redux/slices/AreaType";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { FaBuilding, FaFileAlt, FaUsers, FaImage, FaCheck, FaMap } from "react-icons/fa";

const CreateRoom = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.rooms);
  const { areaTypes } = useSelector((state) => state.areaTypes);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchAreaTypes("1"));
  }, [dispatch]);

  const [roomData, setRoomData] = useState({
    RoomName: "",
    RoomDescription: "",
    Capacity: "",
    IsDeleted: false,
    Images: [], // Array of File objects
    AreaDTO: "", // Single string (areaTypeId)
  });

  const [imagePreviews, setImagePreviews] = useState([]); // For displaying image previews
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (textareaRef.current) {
      if (!roomData.RoomDescription.trim()) {
        textareaRef.current.style.height = "50px";
      } else {
        textareaRef.current.style.height = "50px";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }
  }, [roomData.RoomDescription]);

  // Clean up object URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const validate = () => {
    let newErrors = {};
    if (!roomData.RoomName.trim()) newErrors.RoomName = "Tên phòng không được để trống!";
    if (!roomData.RoomDescription.trim()) newErrors.RoomDescription = "Mô tả phòng không được để trống!";
    if (!roomData.Capacity || roomData.Capacity < 1) newErrors.Capacity = "Sức chứa phải lớn hơn 0!";
    if (roomData.Images.length === 0) newErrors.Images = "Vui lòng chọn ít nhất một hình ảnh!";
    if (!roomData.AreaAddDTO) newErrors.AreaAddDTO = "Vui lòng chọn loại khu vực!";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomData({ ...roomData, [name]: value });
  };

  const handleNumberChange = (e) => {
    const value = e.target.value.trim();
    setRoomData({ ...roomData, Capacity: value === "" ? "" : parseInt(value) });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check for duplicate files
    const existingFileNames = roomData.Images.map((file) => file.name);
    const newFiles = files.filter((file) => !existingFileNames.includes(file.name));

    if (newFiles.length === 0) {
      toast.error("Ảnh đã tồn tại, vui lòng chọn ảnh khác!");
      return;
    }

    // Create previews for new files
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setRoomData((prevData) => ({
      ...prevData,
      Images: [...prevData.Images, ...newFiles],
    }));
    setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    setRoomData((prevData) => {
      const updatedImages = prevData.Images.filter((_, i) => i !== index);
      return { ...prevData, Images: updatedImages };
    });

    setImagePreviews((prevPreviews) => {
      const updatedPreviews = prevPreviews.filter((_, i) => i !== index);
      // Revoke the object URL for the removed image
      URL.revokeObjectURL(prevPreviews[index]);
      return updatedPreviews;
    });
  };

  const handleAreaTypeChange = (e) => {
    setRoomData({ ...roomData, AreaAddDTO: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await dispatch(createRoom(roomData)).unwrap();
      toast.success("Tạo phòng thành công!");
      navigate("/dashboard/room", { state: { successMessage: res.message } });
    } catch (error) {
      toast.error(error.message || "Lỗi khi tạo phòng!");
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl rounded-xl border shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl">
        <div>
          <h2 className="text-3xl font-bold text-center text-orange-500">Thêm Phòng Mới</h2>
          <p className="mt-2 text-sm text-center text-gray-600">Tạo mới một phòng cho hệ thống</p>
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
                  name="RoomName"
                  value={roomData.RoomName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 h-12 transition duration-150 ease-in-out"
                  required
                />
                {errors.RoomName && <p className="text-red-500 text-sm">{errors.RoomName}</p>}
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium flex items-center">
                  <FaUsers className="mr-2 text-orange-500" /> Sức Chứa
                </label>
                <input
                  type="number"
                  name="Capacity"
                  value={roomData.Capacity}
                  min={1}
                  onChange={handleNumberChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 h-12 transition duration-150 ease-in-out"
                  required
                />
                {errors.Capacity && <p className="text-red-500 text-sm">{errors.Capacity}</p>}
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium flex items-center">
                  <FaMap className="mr-2 text-orange-500" /> Loại Khu Vực
                </label>
                <select
                  name="AreaAddDTO"
                  value={roomData.AreaAddDTO}
                  onChange={handleAreaTypeChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-500 focus:border-orange-500 h-12 transition duration-150 ease-in-out"
                >
                  <option value="">-- Chọn loại khu vực --</option>
                  {areaTypes.map((type) => (
                    <option key={type.areaTypeId} value={type.areaTypeId}>
                      {type.areaTypeName} (Size: {type.size}, Loại: {type.areaCategory === 1 ? "Cá nhân" : "Nhóm"})
                    </option>
                  ))}
                </select>
                {errors.AreaAddDTO && <p className="text-red-500 text-sm">{errors.AreaAddDTO}</p>}
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
                  name="RoomDescription"
                  value={roomData.RoomDescription}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 min-h-[50px] transition duration-150 ease-in-out"
                  required
                />
                {errors.RoomDescription && <p className="text-red-500 text-sm">{errors.RoomDescription}</p>}
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium flex items-center">
                  <FaImage className="mr-2 text-orange-500" /> Hình Ảnh
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out h-12"
                  required
                />
                {errors.Images && <p className="text-red-500 text-sm">{errors.Images}</p>}
                {imagePreviews.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative w-20 h-20">
                        <img
                          src={preview}
                          alt={`room-img-${index}`}
                          className="w-full h-full object-cover rounded-lg border"
                          onError={(e) => (e.target.src = "/placeholder-image.jpg")} // Optional: Add a placeholder image
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
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
                  <FaCheck className="mr-2" /> Thêm Phòng
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoom;