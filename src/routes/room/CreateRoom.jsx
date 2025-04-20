import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createRoom } from "../../redux/slices/Room";
import { fetchAreaTypes } from "../../redux/slices/AreaType";
import { Home, X, ArrowLeft, Plus, Users, Map, FileText, Image, PlusCircle } from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const CreateRoom = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.rooms);
  const { areaTypes } = useSelector((state) => state.areaTypes);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const [roomData, setRoomData] = useState({
    roomName: "",
    roomDescription: "",
    capacity: "",
    isDeleted: false,
    images: [],
    areaAddDTO: [{ areaTypeId: "", areaName: "" }],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [failedImages, setFailedImages] = useState(new Set());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchAreaTypes("1"));
  }, [dispatch]);

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
    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setRoomData((prevData) => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index),
    }));
    setFailedImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleImageError = (index) => {
    setFailedImages((prev) => new Set(prev).add(index));
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
      toast.error(error.message || "Lỗi khi thêm phòng!");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen py-4 px-3 sm:px-6 lg:px-8 overflow-x-hidden">
      <motion.div
        className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header với gradient */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-700 p-4 sm:p-6">
          <div className="flex flex-row justify-center items-center p-4 gap-2">
            <PlusCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <h2 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-white text-center">
              Thêm Phòng Mới
            </h2>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Tên Phòng */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300 min-h-[120px]"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3 h-full">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Home className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                      Tên Phòng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="roomName"
                      value={roomData.roomName}
                      onChange={handleChange}
                      placeholder="Nhập tên phòng"
                      className="w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out"
                      required
                    />
                    {errors.roomName && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.roomName}</p>}
                  </div>
                </div>
              </motion.div>

              {/* Sức Chứa */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300 min-h-[120px]"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3 h-full">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                      Sức Chứa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={roomData.capacity}
                      min={1}
                      onChange={handleNumberChange}
                      placeholder="Nhập sức chứa"
                      className="w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out"
                      required
                    />
                    {errors.capacity && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.capacity}</p>}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Mô Tả */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300 min-h-[120px]"
                variants={itemVariants}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                      Mô Tả <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      ref={textareaRef}
                      name="roomDescription"
                      value={roomData.roomDescription}
                      onChange={handleChange}
                      placeholder="Nhập mô tả phòng"
                      className="w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out min-h-[50px] max-h-[80px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                      required
                    />
                    {errors.roomDescription && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.roomDescription}</p>}
                  </div>
                </div>
              </motion.div>

              {/* Hình Ảnh */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300 min-h-[120px]"
                variants={itemVariants}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Image className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                      Hình Ảnh <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col gap-2 sm:gap-3 mt-2 max-h-[80px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {imagePreviews.length > 0 &&
                          imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={
                                  failedImages.has(index)
                                    ? "/placeholder-image.jpg"
                                    : preview
                                }
                                alt={`Room preview ${index}`}
                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg shadow-sm"
                                onError={() => handleImageError(index)}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition"
                              >
                                <X size={12} className="sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          ))}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current.click()}
                          className="w-16 h-16 sm:w-20 sm:h-20 border-dashed border-2 border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-all"
                        >
                          <Plus size={20} className="sm:w-6 sm:h-6" />
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          multiple
                          className="hidden"
                        />
                      </div>
                      {errors.images && <p className="text-red-500 text-xs sm:text-sm">{errors.images}</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Khu Vực - Đặt bên ngoài grid để chiếm toàn bộ chiều rộng và ở giữa */}
          <motion.div
            className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300 mt-6"
            variants={itemVariants}
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="bg-orange-100 rounded-full p-2">
                <Map className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                  Khu Vực <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3 mt-2">
                  {roomData.areaAddDTO.map((area, index) => (
                    <div
                      key={index}
                      className={`flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center ${
                        index < roomData.areaAddDTO.length - 1 ? "border-b border-gray-200 pb-3" : ""
                      }`}
                    >
                      <select
                        value={area.areaTypeId}
                        onChange={(e) => handleAreaTypeChange(index, e.target.value)}
                        className="w-full max-w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out"
                      >
                        <option value="">-- Chọn loại --</option>
                        {areaTypes.map((type) => (
                          <option key={type.areaTypeId} value={type.areaTypeId}>
                            {type.areaTypeName} (Size: {type.size}, Loại: {type.areaCategory === 1 ? "Cá nhân" : "Nhóm"})
                          </option>
                        ))}
                      </select>
                      <div className="w-full flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Tên khu vực"
                          value={area.areaName}
                          onChange={(e) => handleAreaNameChange(index, e.target.value)}
                          className="w-full max-w-full flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveArea(index)}
                          className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition duration-150 ease-in-out flex-shrink-0"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addArea}
                    className="w-full mt-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white px-4 sm:px-6 py-1 sm:py-2 rounded-lg flex items-center justify-center gap-x-2 hover:from-orange-600 hover:to-orange-800 transition-all shadow-md text-sm sm:text-base font-normal"
                  >
                    + Thêm khu vực
                  </button>
                </div>
                {errors.areaAddDTO && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.areaAddDTO}</p>}
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8"
            variants={itemVariants}
          >
            <button
              type="button"
              onClick={() => navigate("/dashboard/room")}
              className="w-full sm:w-auto bg-gray-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-x-2 hover:bg-gray-600 transition-all shadow-md text-sm sm:text-base font-normal"
              disabled={loading}
            >
              <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> Quay Lại
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-x-2 hover:from-orange-600 hover:to-orange-800 transition-all shadow-md disabled:bg-orange-300 disabled:cursor-not-allowed text-sm sm:text-base font-normal"
            >
              {loading ? (
                <svg
                  className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <>
                  <Home size={14} className="sm:w-4 sm:h-4" /> Thêm Phòng
                </>
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateRoom;