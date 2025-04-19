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

  useEffect(() => {
    dispatch(fetchAreaTypes("1"));
  }, [dispatch]);

  const [roomData, setRoomData] = useState({
    roomName: "",
    roomDescription: "",
    capacity: "",
    isDeleted: false,
    images: [], // Will store File objects
    areaAddDTO: [{ areaTypeId: "", areaName: "" }], // Initialized as an array of objects
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (textareaRef.current) {
      if (!roomData.roomDescription.trim()) {
        textareaRef.current.style.height = "50px";
      } else {
        textareaRef.current.style.height = "50px";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }
  }, [roomData.roomDescription]);

  const validate = () => {
    let newErrors = {};
    if (!roomData.roomName.trim()) newErrors.roomName = "Tên phòng không được để trống!";
    if (!roomData.roomDescription.trim()) newErrors.roomDescription = "Mô tả phòng không được để trống!";
    if (!roomData.capacity || roomData.capacity < 1) newErrors.capacity = "Sức chứa phải lớn hơn 0!";
    if (roomData.images.length === 0) newErrors.images = "Vui lòng chọn ít nhất một hình ảnh!";
    if (roomData.areaAddDTO.some((area) => !area.areaTypeId || !area.areaName.trim()))
      newErrors.areaAddDTO = "Vui lòng điền đầy đủ thông tin cho tất cả khu vực!";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomData({ ...roomData, [name]: value });
  };

  const handleNumberChange = (e) => {
    const value = e.target.value.trim();
    setRoomData({ ...roomData, capacity: value === "" ? "" : parseInt(value) });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.filter((file) => !roomData.images.some((existingFile) => existingFile.name === file.name));
    if (newFiles.length === 0) {
      toast.error("Ảnh đã tồn tại, vui lòng chọn ảnh khác!");
      return;
    }
    setRoomData((prevData) => ({
      ...prevData,
      images: [...prevData.images, ...newFiles],
    }));
  };

  const handleRemoveImage = (index) => {
    setRoomData((prevData) => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index),
    }));
  };

  const addArea = () => {
    setRoomData((prevData) => ({
      ...prevData,
      areaAddDTO: [...prevData.areaAddDTO, { areaTypeId: "", areaName: "" }],
    }));
  };

  const handleAreaTypeChange = (index, areaTypeId) => {
    setRoomData((prevData) => {
      const updatedAreaAddDTO = [...prevData.areaAddDTO];
      updatedAreaAddDTO[index].areaTypeId = areaTypeId;
      return { ...prevData, areaAddDTO: updatedAreaAddDTO };
    });
  };

  const handleAreaNameChange = (index, areaName) => {
    setRoomData((prevData) => {
      const updatedAreaAddDTO = [...prevData.areaAddDTO];
      updatedAreaAddDTO[index].areaName = areaName;
      return { ...prevData, areaAddDTO: updatedAreaAddDTO };
    });
  };

  const handleRemoveArea = (index) => {
    setRoomData((prevData) => {
      if (prevData.areaAddDTO.length === 1) {
        toast.error("Phải có ít nhất một khu vực!");
        return prevData;
      }
      const updatedAreaAddDTO = prevData.areaAddDTO.filter((_, i) => i !== index);
      return { ...prevData, areaAddDTO: updatedAreaAddDTO };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Convert areaAddDTO (array of objects) to a JSON string
    const updatedRoomData = {
      ...roomData,
      areaAddDTO: JSON.stringify(
        roomData.areaAddDTO.filter((area) => area.areaTypeId && area.areaName.trim())
      ),
    };

    try {
      const res = await dispatch(createRoom(updatedRoomData)).unwrap();
      toast.success("Tạo phòng thành công!");
      navigate("/dashboard/room", { state: { successMessage: res.message } });
    } catch (error) {
      toast.error(error.message);
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
                  name="roomName"
                  value={roomData.roomName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 h-12 transition duration-150 ease-in-out"
                  required
                />
                {errors.roomName && <p className="text-red-500 text-sm">{errors.roomName}</p>}
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium flex items-center">
                  <FaUsers className="mr-2 text-orange-500" /> Sức Chứa
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={roomData.capacity}
                  min={1}
                  onChange={handleNumberChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 h-12 transition duration-150 ease-in-out"
                  required
                />
                {errors.capacity && <p className="text-red-500 text-sm">{errors.capacity}</p>}
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium flex items-center">
                  <FaMap className="mr-2 text-orange-500" /> Khu Vực
                </label>
                <div className="space-y-2">
                  {roomData.areaAddDTO.map((area, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <select
                        value={area.areaTypeId}
                        onChange={(e) => handleAreaTypeChange(index, e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-500 focus:border-orange-500 h-12 transition duration-150 ease-in-out"
                      >
                        <option value="">-- Chọn loại --</option>
                        {areaTypes.map((type) => (
                          <option key={type.areaTypeId} value={type.areaTypeId}>
                            {type.areaTypeName} (Size: {type.size}, Loại: {type.areaCategory === 1 ? "Cá nhân" : "Nhóm"})
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Tên khu vực"
                        value={area.areaName}
                        onChange={(e) => handleAreaNameChange(index, e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 h-12 transition duration-150 ease-in-out"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveArea(index)}
                        className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition duration-150 ease-in-out self-start sm:self-center"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addArea}
                    className="w-full py-2 px-4 border border-orange-500 rounded-lg text-sm font-medium text-orange-500 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 ease-in-out"
                  >
                    + Thêm khu vực
                  </button>
                </div>
                {errors.areaAddDTO && <p className="text-red-500 text-sm">{errors.areaAddDTO}</p>}
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
                  name="roomDescription"
                  value={roomData.roomDescription}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 min-h-[50px] transition duration-150 ease-in-out"
                  required
                />
                {errors.roomDescription && <p className="text-red-500 text-sm">{errors.roomDescription}</p>}
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium flex items-center">
                  <FaImage className="mr-2 text-orange-500" /> Hình Ảnh
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 rounded-lg border focus:layout-none focus:border-orange-500 duration-150 ease-in-out h-12"
                  required
                />
                {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}
                {roomData.images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {roomData.images.map((file, index) => (
                      <div key={index} className="relative w-20 h-20">
                        <img
                          src={URL.createObjectURL(file)} // Preview the uploaded file
                          alt={`room-img-${index}`}
                          className="w-full h-full object-cover rounded-lg border"
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