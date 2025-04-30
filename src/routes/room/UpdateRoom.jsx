import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getRoomById,
  updateRoom,
  updateRoomImages,
  deleteRoomImage,
} from "../../redux/slices/Room";
import { fetchAreaInRoomForManagement, addAreaToRoom, deleteArea } from "../../redux/slices/Area";
import {
  fetchAreaTypes,
  clearAreaSelections,
} from "../../redux/slices/AreaType";
import { toast } from "react-toastify";
import { Image, FileText, Check, X, ArrowLeft, Plus, Trash, PlusCircle, House, Power, Users, Map } from "lucide-react";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

const BACKEND_URL = "https://localhost:9999";

const UpdateRoom = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const { selectedRoom, loading } = useSelector((state) => state.rooms);
  const { areaInRoom, areaInRoomLoading, areaInRoomError } = useSelector(
    (state) => state.areas || {}
  );
  const { areaTypes } = useSelector((state) => state.areaTypes);

  const [formData, setFormData] = useState({
    roomName: "",
    roomDescription: "",
    images: [],
  });

  const [activeTab, setActiveTab] = useState("update");
  const [hasDetailsChange, setHasDetailsChange] = useState(false);
  const [hasImageChange, setHasImageChange] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [failedImages, setFailedImages] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAreaTypeId, setSelectedAreaTypeId] = useState("");
  const [customAreaName, setCustomAreaName] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [areaIdToDelete, setAreaIdToDelete] = useState(null);
  const [areaName, setAreaName] = useState("");
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    const roomId = parseInt(id);
    dispatch(getRoomById(roomId));
  }, [dispatch, id]);

  useEffect(() => {
    const roomId = parseInt(id);

    if (!selectedRoom || selectedRoom.roomId !== roomId) {
      dispatch(getRoomById(roomId));
    } else {
      const images = Array.isArray(selectedRoom.images)
        ? selectedRoom.images
        : [selectedRoom.images].filter(Boolean);

      const existing = images.map((img) =>
        img.startsWith("http") ? img : `${BACKEND_URL}/${img}`
      );

      setFormData({
        roomName: selectedRoom.roomName || "",
        roomDescription: selectedRoom.roomDescription || "",
        images: [],
      });

      setExistingImages(existing);
      setImagePreviews(existing);
    }
  }, [selectedRoom, dispatch, id]);

  useEffect(() => {
    if (activeTab === "manage-areas") {
      const roomId = parseInt(id);
      dispatch(fetchAreaInRoomForManagement(roomId));
    }
  }, [activeTab, dispatch, id]);

  useEffect(() => {
    if (isModalOpen) {
      dispatch(fetchAreaTypes("0"));
      setSelectedAreaTypeId("");
      setCustomAreaName("");
    }
  }, [isModalOpen, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearAreaSelections());
    };
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "status" ? (value === "true" ? true : false) : value,
    }));
    setHasDetailsChange(true);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...files],
      }));
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previews]);
      setHasImageChange(true);
    }
  };

  const handleRemoveImage = (index) => {
    const isExistingImage = index < existingImages.length;
    let updatedPreviews = [...imagePreviews];
    let updatedImages = [...formData.images];
    let updatedExistingImages = [...existingImages];

    if (isExistingImage) {
      let imageUrl = existingImages[index];
      imageUrl = imageUrl.replace(BACKEND_URL, "");
      if (!imageUrl.startsWith("/")) {
        imageUrl = "/" + imageUrl;
      }
      if (!imageUrl.startsWith("/Images/")) {
        const filename = imageUrl.split("/").pop();
        imageUrl = `/Images/${filename}`;
      }

      setImagesToDelete((prev) => [...prev, imageUrl]);
      updatedExistingImages = updatedExistingImages.filter((_, i) => i !== index);
      updatedPreviews = updatedPreviews.filter((_, i) => i !== index);

      setExistingImages(updatedExistingImages);
      setImagePreviews(updatedPreviews);
    } else {
      const fileIndex = index - existingImages.length;
      updatedPreviews = updatedPreviews.filter((_, i) => i !== index);
      updatedImages = updatedImages.filter((_, i) => i !== fileIndex);

      setImagePreviews(updatedPreviews);
      setFormData((prev) => ({
        ...prev,
        images: updatedImages,
      }));
    }

    setHasImageChange(true);
    setFailedImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleImageError = (index) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedRoomName = formData.roomName.trim();
    const trimmedDescription = formData.roomDescription.trim();

    if (!trimmedRoomName) {
      toast.error("Tên phòng là bắt buộc!");
      return;
    }
    if (!trimmedDescription) {
      toast.error("Mô tả là bắt buộc!");
      return;
    }

    const newFiles = formData.images.filter((img) => img instanceof File);

    try {
      if (imagesToDelete.length > 0) {
        for (const imageUrl of imagesToDelete) {
          await dispatch(
            deleteRoomImage({
              roomId: parseInt(id),
              imageUrl,
            })
          ).unwrap();
        }
        setImagesToDelete([]);
      }

      if (hasDetailsChange) {
        const patchDoc = [];
        if (selectedRoom.roomName !== trimmedRoomName) {
          patchDoc.push({ op: "replace", path: "roomName", value: trimmedRoomName });
        }
        if (selectedRoom.roomDescription !== trimmedDescription) {
          patchDoc.push({
            op: "replace",
            path: "roomDescription",
            value: trimmedDescription,
          });
        }

        if (patchDoc.length > 0) {
          await dispatch(
            updateRoom({
              roomId: parseInt(id),
              patchDoc,
            })
          ).unwrap();
        }
      }

      if (hasImageChange && newFiles.length > 0) {
        await dispatch(
          updateRoomImages({
            roomId: parseInt(id),
            files: newFiles,
          })
        ).unwrap();
      }

      if (!hasDetailsChange && !hasImageChange && imagesToDelete.length === 0) {
        toast.info("Không có thay đổi nào để cập nhật!");
        return;
      }

      toast.success("Cập nhật thông tin phòng thành công!");
      await dispatch(getRoomById(parseInt(id))).unwrap();
      navigate("/dashboard/room", { state: { successMessage: "Cập nhật phòng thành công!" } });
    } catch (err) {
      toast.error(err);
    }
  };

  const handleAddAreaToRoom = async () => {
    if (!selectedAreaTypeId) {
      toast.error("Vui lòng chọn một khu vực để thêm!");
      return;
    }

    const trimmedCustomName = customAreaName.trim();
    if (!trimmedCustomName) {
      toast.error("Tên khu vực không được để trống!");
      return;
    }

    try {
      const roomId = parseInt(id);
      const areaToAdd = {
        areaTypeId: parseInt(selectedAreaTypeId),
        areaName: trimmedCustomName,
      };

      await dispatch(
        addAreaToRoom({
          roomId,
          areas: [areaToAdd],
        })
      ).unwrap();

      toast.success("Thêm khu vực vào phòng thành công!");
      setIsModalOpen(false);
      setSelectedAreaTypeId("");
      setCustomAreaName("");
      dispatch(fetchAreaInRoomForManagement(roomId));
    } catch (err) {
      const errorMessage = err.message || "Lỗi khi thêm khu vực vào phòng";
      toast.error(errorMessage);
    }
  };

  const handleEditArea = (areaId) => {
    navigate(`/dashboard/room/update/${id}/addFacilities/${areaId}`);
  };

  const handleOpenDeleteModal = (areaId, areaName) => {
    setAreaIdToDelete(areaId);
    setAreaName(areaName || "N/A");
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setAreaIdToDelete(null);
    setAreaName("");
  };

  const handleDeleteArea = async () => {
    if (!areaIdToDelete) {
      toast.error("Không tìm thấy ID khu vực để xóa!");
      return;
    }
    setLoadingId(areaIdToDelete);
    try {
      await dispatch(deleteArea(areaIdToDelete)).unwrap();
      toast.success("Xóa khu vực thành công!");
      dispatch(fetchAreaInRoomForManagement(parseInt(id)));
    } catch (err) {
      const errorMessage = err?.message || "Lỗi khi xóa khu vực";
      toast.error(errorMessage);
    } finally {
      setLoadingId(null);
      setIsDeleteModalOpen(false);
      setAreaIdToDelete(null);
      setAreaName("");
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

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-600 text-lg animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!selectedRoom) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-600 text-lg animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 mb-10 min-h-screen">
      <div className="w-full max-w-6xl mx-auto rounded-2xl border shadow-lg p-6 sm:p-8 transition-all duration-300">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8">
          <div className="flex flex-row justify-center items-center p-4 gap-2">
            <House className="h-8 w-8 text-orange-600" />
            <h2 className="text-2xl sm:text-3xl font-semibold">Quản Lý Phòng {selectedRoom.roomName}</h2>
          </div>
          <button
            onClick={() => navigate("/dashboard/room")}
            className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-md"
          >
            <ArrowLeft size={20} />
            <span className="text-sm sm:text-base sm:inline font-medium">Quay Lại</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 sm:mb-8">
          <nav className="flex flex-col sm:flex-row sm:space-x-4 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab("update")}
              className={`relative py-3 px-4 sm:py-4 sm:px-6 text-sm font-medium transition-all duration-300 ${activeTab === "update"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Cập Nhật Phòng
              {activeTab === "update" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transition-all duration-300"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("manage-areas")}
              className={`relative py-3 px-4 sm:py-4 sm:px-6 text-sm font-medium transition-all duration-300 ${activeTab === "manage-areas"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Quản Lý Khu Vực Trong Phòng
              {activeTab === "manage-areas" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transition-all duration-300"></span>
              )}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "update" && (
          <div className="min-h-screen py-4 px-3 sm:px-6 lg:px-8 overflow-x-hidden">
            <motion.div
              className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {/* Header với gradient */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-700 p-4 sm:p-6">
                <div className="flex flex-col items-center gap-2">
                  <House className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  <h2 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-white text-center">
                    Cập Nhật Phòng
                  </h2>
                </div>
              </div>

              {/* Form Section */}
              <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left Column */}
                  <div className="space-y-4 sm:space-y-6">
                    {/* Room Name */}
                    <motion.div
                      className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                      variants={itemVariants}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-orange-100 rounded-full p-2">
                          <House className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                            Tên Phòng <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="roomName"
                            value={formData.roomName}
                            onChange={handleInputChange}
                            className="w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out"
                            placeholder="Nhập tên phòng"
                            required
                          />
                        </div>
                      </div>
                    </motion.div>

                    {/* Trạng Thái (Read-only) */}
                    <motion.div
                      className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                      variants={itemVariants}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-orange-100 rounded-full p-2">
                          <Power className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Trạng Thái</p>
                          <span
                            className={`inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-normal text-xs sm:text-sm transition-all duration-300 ${selectedRoom.status === 0 ? "bg-red-100 text-red-800 hover:bg-red-200" : "bg-green-100 text-green-800 hover:bg-green-200"}`}
                          >
                            {selectedRoom.status === 0 ? "Chưa sẵn sàng" : "Sẵn sàng"}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Sức Chứa (Read-only) */}
                    <motion.div
                      className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                      variants={itemVariants}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-orange-100 rounded-full p-2">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Sức Chứa</p>
                          <p className="text-sm sm:text-base font-normal text-gray-800 truncate">{selectedRoom.capacity} người</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4 sm:space-y-6">
                    {/* Description */}
                    <motion.div
                      className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
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
                            name="roomDescription"
                            value={formData.roomDescription}
                            onChange={handleInputChange}
                            className="w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out min-h-[50px] max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                            placeholder="Nhập mô tả phòng"
                            required
                          />
                        </div>
                      </div>
                    </motion.div>

                    {/* Images */}
                    <motion.div
                      className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                      variants={itemVariants}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="bg-orange-100 rounded-full p-2">
                          <Image className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                            Hình Ảnh
                          </label>
                          <div className="flex flex-col gap-2 sm:gap-4 mt-2">
                            <div className="flex flex-wrap gap-2 sm:gap-4">
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
                                onChange={handleFileChange}
                                accept="image/*"
                                multiple
                                className="hidden"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Khu Vực (Read-only) - Đưa ra giữa và kéo dài */}
                <motion.div
                  className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300 mt-4 sm:mt-6"
                  variants={itemVariants}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="bg-orange-100 rounded-full p-2">
                      <Map className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">Khu Vực</p>
                      {selectedRoom.area_DTO && selectedRoom.area_DTO.length > 0 ? (
                        <div className="space-y-2 mt-2">
                          {selectedRoom.area_DTO.map((area, index) => (
                            <div
                              key={index}
                              className={`flex items-center gap-2 text-sm sm:text-base font-normal text-gray-800 ${index < selectedRoom.area_DTO.length - 1 ? "border-b border-gray-200 pb-2" : ""}`}
                            >
                              <span className="text-orange-600">•</span>
                              <p className="truncate">
                                {area.areaName} - Loại: {area.areaTypeName}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm sm:text-base font-normal text-gray-500 truncate mt-2">
                          Không có khu vực
                        </p>
                      )}
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
                  >
                    <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> Quay lại
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
                        <Check size={14} className="sm:w-4 sm:h-4" /> Cập Nhật
                      </>
                    )}
                  </button>
                </motion.div>
              </form>
            </motion.div>
          </div>
        )}

        {activeTab === "manage-areas" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-lg sm:text-xl font-semibold">Danh Sách Khu Vực Trong Phòng</h3>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-md"
              >
                <PlusCircle className="h-5 w-5" />
                <span className="text-sm sm:text-base font-medium">Thêm Khu Vực</span>
              </button>
            </div>
            {areaInRoomLoading ? (
              <div className="flex items-center justify-center py-6 mb-200">
                <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
                <p className="text-orange-500 text-base sm:text-lg font-medium">Đang tải dữ liệu...</p>
              </div>
            ) : areaInRoomError ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-red-500 text-lg">{areaInRoomError}</p>
              </div>
            ) : Array.isArray(areaInRoom) && areaInRoom.length > 0 ? (
              <>
                {/* Table for Desktop */}
                <div className="hidden sm:block shadow-lg rounded-lg border border-gray-200 overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200 table-auto">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          STT
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Tên Khu Vực
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Dịch Vụ
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Danh Mục
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Tổng Kích Thước Bàn
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Số Lượng Ghế
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Kích Thước
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Ngày Hết Hạn
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Trạng Thái
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Hành Động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {areaInRoom.map((area, index) => (
                        <tr
                          key={area.areaId}
                          className={`transition-colors duration-200 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-orange-50`}
                        >
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {area.areaName}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {area.areaTypeName}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {area.categoryId === 1 ? "Khu vực cá nhân" : "Khu vực nhóm"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {area.faciAmount} chỗ
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {area.faciAmountCh} ghế
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {area.size}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(area.expiredDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${area.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}
                            >
                              {area.status ? "Hoạt động" : "Không hoạt động"}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditArea(area.areaId)}
                                className="inline-flex items-center justify-center bg-yellow-200 text-yellow-700 hover:bg-yellow-400 p-2 rounded-lg transition-colors w-10 h-10"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenDeleteModal(area.areaId, area.areaName)}
                                disabled={loadingId === area.areaId}
                                className="inline-flex items-center justify-center bg-red-100 text-red-700 hover:bg-red-200 p-2 rounded-lg transition-colors w-10 h-10 disabled:bg-gray-300 disabled:text-gray-500"
                              >
                                {loadingId === area.areaId ? (
                                  <svg
                                    className="animate-spin h-4 w-4 text-red-700"
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
                                  <Trash className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Card Layout for Mobile */}
                <div className="block sm:hidden space-y-4">
                  {areaInRoom.map((area, index) => (
                    <div
                      key={area.areaId}
                      className="border border-gray-200 rounded-lg p-4 bg-white shadow-md"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {index + 1}. {area.areaName}
                        </h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditArea(area.areaId)}
                            className="inline-flex items-center justify-center bg-yellow-200 text-yellow-700 hover:bg-yellow-400 p-2 rounded-lg transition-colors w-8 h-8"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(area.areaId, area.areaName)}
                            disabled={loadingId === area.areaId}
                            className="inline-flex items-center justify-center bg-red-100 text-red-700 hover:bg-red-200 p-2 rounded-lg transition-colors w-8 h-8 disabled:bg-gray-300 disabled:text-gray-500"
                          >
                            {loadingId === area.areaId ? (
                              <svg
                                className="animate-spin h-4 w-4 text-red-700"
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
                              <Trash className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Dịch Vụ:</span> {area.areaTypeName}
                        </p>
                        <p>
                          <span className="font-medium">Danh Mục:</span>{" "}
                          {area.categoryId === 1 ? "Khu vực cá nhân" : "Khu vực nhóm"}
                        </p>
                        <p>
                          <span className="font-medium">Số Lượng Thiết Bị:</span>{" "}
                          {area.faciAmount}
                        </p>
                        <p>
                          <span className="font-medium">Kích Thước:</span> {area.size}
                        </p>
                        <p>
                          <span className="font-medium">Ngày Hết Hạn:</span> {new Date(area.expiredDate).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium">Trạng Thái:</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${area.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                          >
                            {area.status ? "Hoạt động" : "Không hoạt động"}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500 text-lg">Không có khu vực nào trong phòng này.</p>
              </div>
            )}
          </div>
        )}

        {/* Modal for Adding Areas */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-0">
            <div className="bg-gray-300 rounded-2xl shadow-lg p-6 w-full max-w-md sm:w-full sm:max-w-md h-full sm:h-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Thêm Khu Vực Vào Phòng</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Trường chọn khu vực */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Chọn Khu Vực <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedAreaTypeId}
                    onChange={(e) => setSelectedAreaTypeId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50 text-gray-800"
                  >
                    <option value="">-- Chọn khu vực --</option>
                    {Array.isArray(areaTypes) && areaTypes.length > 0 ? (
                      areaTypes.map((area) => (
                        <option key={area.areaTypeId} value={area.areaTypeId}>
                          {area.areaTypeName} (Danh mục: {area.areaCategory}, Kích thước: {area.size})
                        </option>
                      ))
                    ) : (
                      <option disabled>Không có khu vực nào</option>
                    )}
                  </select>
                </div>

                {/* Trường nhập tên khu vực tùy chỉnh */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Tên Khu Vực <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customAreaName}
                    onChange={(e) => setCustomAreaName(e.target.value)}
                    placeholder="Nhập tên khu vực"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50 text-gray-800 placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddAreaToRoom}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-xl text-sm font-medium hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300"
                >
                  Thêm Khu Vực
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div
            className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleCloseDeleteModal}
          >
            <div
              className="bg-neutral-300 rounded-lg shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 ease-in-out scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-red-600 mb-4">Xác nhận xóa khu vực</h2>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa khu vực <strong>{areaName}</strong> không? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCloseDeleteModal}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
                  disabled={loadingId === areaIdToDelete}
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteArea}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                  disabled={loadingId === areaIdToDelete}
                >
                  {loadingId === areaIdToDelete ? "Đang xóa..." : "Xóa khu vực"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateRoom;