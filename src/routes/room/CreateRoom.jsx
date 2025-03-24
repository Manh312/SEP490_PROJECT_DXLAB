import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createRoom } from "../../redux/slices/Room";
import { X } from "lucide-react"; // Import dấu X
import { toast } from "react-toastify";
import { fetchAreaTypes } from "../../redux/slices/AreaType";

const CreateRoom = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.rooms);
  const { areaTypes } = useSelector((state) => state.areaTypes); // Lấy danh sách areaTypes từ Redux

  useEffect(() => {
    dispatch(fetchAreaTypes()); // Fetch danh sách areaTypes khi component mount
  }, [dispatch]);

  const [roomData, setRoomData] = useState({
    roomName: "",
    roomDescription: "",
    capacity: "", // Giữ rỗng, nếu không nhập sẽ set thành 1
    isDeleted: false,
    images: [],
    area_DTO: [], // Danh sách khu vực
  });

  const [errors, setErrors] = useState({});

  // Kiểm tra tất cả các trường đã nhập chưa
  const validate = () => {
    let newErrors = {};
    if (!roomData.roomName.trim())
      newErrors.roomName = "Tên phòng không được để trống!";
    if (!roomData.roomDescription.trim())
      newErrors.roomDescription = "Mô tả phòng không được để trống!";
    if (!roomData.capacity || roomData.capacity < 1)
      newErrors.capacity = "Sức chứa phải lớn hơn 0!";
    if (roomData.images.length === 0)
      newErrors.images = "Vui lòng chọn ít nhất một hình ảnh!";
    // if (roomData.area_DTO.length === 0)
    //   newErrors.area_DTO = "Vui lòng chọn ít nhất một khu vực!";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý thay đổi input text
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomData({ ...roomData, [name]: value });
  };

  // Xử lý thay đổi input số (capacity), nếu không nhập set mặc định là 1
  const handleNumberChange = (e) => {
    const value = e.target.value.trim();
    setRoomData({ ...roomData, capacity: value === "" ? 1 : parseInt(value) });
  };

  // Xử lý chọn nhiều ảnh từ file input
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileNames = files.map((file) => file.name);

    // Lọc những ảnh chưa có trong danh sách
    const newImages = fileNames.filter(
      (name) => !roomData.images.includes(name)
    );

    if (newImages.length === 0) {
      toast.error("Ảnh đã tồn tại, vui lòng chọn ảnh khác!");
      return;
    }

    setRoomData((prevData) => ({
      ...prevData,
      images: [...prevData.images, ...newImages], // Chỉ thêm ảnh mới
    }));
  };

  // Xóa ảnh khỏi danh sách
  const handleRemoveImage = (index) => {
    setRoomData((prevData) => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index),
    }));
  };

  // Thêm khu vực mới
  const addArea = () => {
    setRoomData((prevData) => ({
      ...prevData,
      area_DTO: [...prevData.area_DTO, { areaTypeId: "", areaName: "" }],
    }));
  };

  // Cập nhật areaTypeId khi chọn dropdown
  const handleAreaTypeChange = (index, areaTypeId) => {
    setRoomData((prevData) => {
      const updatedAreaDTO = [...prevData.area_DTO];
      updatedAreaDTO[index].areaTypeId = areaTypeId;
      return { ...prevData, area_DTO: updatedAreaDTO };
    });
  };

  // Cập nhật areaName khi nhập
  const handleAreaNameChange = (index, areaName) => {
    setRoomData((prevData) => {
      const updatedAreaDTO = [...prevData.area_DTO];
      updatedAreaDTO[index].areaName = areaName;
      return { ...prevData, area_DTO: updatedAreaDTO };
    });
  };

  const handleRemoveArea = (index) => {
    setRoomData((prevData) => {
      if (prevData.area_DTO.length === 1) {
        toast.error("Phải có ít nhất một khu vực.");
        return prevData;
      }

      const updatedAreaDTO = prevData.area_DTO.filter((_, i) => i !== index);
      return { ...prevData, area_DTO: updatedAreaDTO };
    });
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await dispatch(createRoom(roomData)).unwrap();
      console.log(res);
      navigate("/dashboard/room", { state: { successMessage: res.message } });
    } catch (error) {
      toast.error(error.message);
    }
  };

  console.log(roomData.area_DTO.length);
  return (
    <div className="max-w-lg mx-auto mt-10 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-4 text-blue-600">
        Thêm Phòng Mới
      </h2>
      <form onSubmit={handleSubmit}>
        {/* Tên phòng */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Tên Phòng</label>
          <input
            type="text"
            name="roomName"
            value={roomData.roomName}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          {errors.roomName && (
            <p className="text-red-500 text-sm">{errors.roomName}</p>
          )}
        </div>

        {/* Mô tả phòng */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Mô Tả Phòng</label>
          <textarea
            name="roomDescription"
            value={roomData.roomDescription}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          {errors.roomDescription && (
            <p className="text-red-500 text-sm">{errors.roomDescription}</p>
          )}
        </div>

        {/* Số lượng người tối đa (Capacity) */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Sức chứa (Capacity)</label>
          <input
            type="number"
            name="capacity"
            value={roomData.capacity}
            onChange={handleNumberChange}
            min="1"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.capacity && (
            <p className="text-red-500 text-sm">{errors.capacity}</p>
          )}
        </div>

        {/* Chọn areaType */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Khu vực</label>
          <div className="flex flex-col gap-2">
            {roomData.area_DTO.map((area, index) => (
              <div key={index} className="flex flex-wrap gap-2 items-center">
                {/* Dropdown chọn loại khu vực */}
                <select
                  value={area.areaTypeId}
                  onChange={(e) => handleAreaTypeChange(index, e.target.value)}
                  className="border px-2 py-1 rounded w-full md:w-1/2"
                >
                  <option value="">-- Chọn loại --</option>
                  {areaTypes.map((type) => (
                    <option key={type.areaTypeId} value={type.areaTypeId}>
                      {type.areaTypeName} (Size: {type.size})
                    </option>
                  ))}
                </select>

                {/* Input nhập tên khu vực */}
                <input
                  type="text"
                  placeholder="Tên khu vực"
                  value={area.areaName}
                  onChange={(e) => handleAreaNameChange(index, e.target.value)}
                  className="border px-2 py-1 rounded w-full md:w-1/2"
                />

                {/* Nút X để xóa khu vực */}
                <button
                  type="button"
                  onClick={() => handleRemoveArea(index)}
                  className="bg-red-500 text-white px-2 py-1 rounded flex items-center"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Nút thêm khu vực */}
          <button
            type="button"
            onClick={addArea}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded w-full md:w-auto"
          >
            + Thêm khu vực
          </button>
          {errors.area_DTO && (
            <p className="text-red-500 text-sm">{errors.area_DTO}</p>
          )}
        </div>

        {/* Chọn nhiều hình ảnh */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Hình Ảnh</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.images && (
            <p className="text-red-500 text-sm">{errors.images}</p>
          )}

          {/* Hiển thị ảnh đã chọn */}
          <div className="flex flex-wrap gap-2 mt-2">
            {roomData.images.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={`/assets/${img}`}
                  alt={`room-img-${index}`}
                  className="w-20 h-20 object-cover rounded-md shadow-md"
                />
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

        {/* {error && <p className="text-red-500">{error}</p>} */}

        {/* Nút hành động */}
        <div className="flex justify-between">
          <button
            type="button"
            className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
            onClick={() => navigate("/dashboard/room")}
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
            {loading ? "Đang tạo..." : "Thêm Phòng"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRoom;
