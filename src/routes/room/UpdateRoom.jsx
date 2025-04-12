import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getRoomById,
  updateRoom,
  updateRoomImages,
  deleteRoomImage,
} from "../../redux/slices/Room";
import { toast } from "react-toastify";
import { Building, Image, FileText, Check, X, ArrowLeft, Users } from "lucide-react";

const BACKEND_URL = "https://localhost:9999"; // Define your backend URL

const UpdateRoom = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const { selectedRoom, loading, error } = useSelector((state) => state.rooms);

  // Form state
  const [formData, setFormData] = useState({
    roomName: "",
    roomDescription: "",
    capacity: "",
    isDeleted: false,
    areaAddDTO: "[]",
    images: [], // New images to upload
  });

  const [hasDetailsChange, setHasDetailsChange] = useState(false);
  const [hasImageChange, setHasImageChange] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [failedImages, setFailedImages] = useState(new Set());

  // Fetch room data
  useEffect(() => {
    // Ensure id is a number for comparison
    const roomId = parseInt(id);

    // If selectedRoom is not available or doesn't match the current id, fetch it
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
        capacity: selectedRoom.capacity || "",
        isDeleted: selectedRoom.isDeleted !== undefined ? selectedRoom.isDeleted : false,
        areaAddDTO: selectedRoom.areaAddDTO
          ? JSON.stringify(selectedRoom.areaAddDTO)
          : "[]",
        images: [],
      });

      setExistingImages(existing);
      setImagePreviews(existing);
    }
  }, [selectedRoom, dispatch, id]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "isDeleted" ? (value === "true" ? true : false) : value,
    }));
    setHasDetailsChange(true);
  };

  // Handle file input change
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

  // Handle image removal
  const handleRemoveImage = (index) => {
    const isExistingImage = index < existingImages.length;
    let updatedPreviews = [...imagePreviews];
    let updatedImages = [...formData.images];
    let updatedExistingImages = [...existingImages];

    if (isExistingImage) {
      let imageUrl = existingImages[index];

      // Normalize the imageUrl for backend
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
  };

  // Handle image load errors
  const handleImageError = (index) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
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
      // Step 1: Delete images marked for deletion
      if (imagesToDelete.length > 0) {
        for (const imageUrl of imagesToDelete) {
          await dispatch(
            deleteRoomImage({
              roomId: parseInt(id),
              imageUrl,
            })
          ).unwrap();
        }
        toast.success("Xóa ảnh thành công!");
        setImagesToDelete([]);
      }

      // Step 2: Update room details if changed
      if (hasDetailsChange) {
        // Create JSON Patch document
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
        if (selectedRoom.isDeleted !== formData.isDeleted) {
          patchDoc.push({ op: "replace", path: "isDeleted", value: formData.isDeleted });
        }

        if (patchDoc.length > 0) {
          await dispatch(
            updateRoom({
              roomId: parseInt(id),
              patchDoc,
            })
          ).unwrap();
          toast.success("Cập nhật thông tin phòng thành công!");
        }
      }

      // Step 3: Update new images if changed
      if (hasImageChange && newFiles.length > 0) {
        await dispatch(
          updateRoomImages({
            roomId: parseInt(id),
            files: newFiles,
          })
        ).unwrap();
        toast.success("Cập nhật ảnh thành công!");
      }

      // If no changes, inform user
      if (!hasDetailsChange && !hasImageChange && imagesToDelete.length === 0) {
        toast.info("Không có thay đổi nào để cập nhật!");
        return;
      }

      // Refresh room data and navigate back
      await dispatch(getRoomById(parseInt(id))).unwrap();
      navigate("/dashboard/room", { state: { successMessage: "Cập nhật phòng thành công!" } });
    } catch (err) {
      const errorMessage = err.message || "Lỗi khi cập nhật phòng";
      toast.error(errorMessage);
      console.error("Update error:", err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-600 text-lg animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  // If selectedRoom is not available, show loading (this should be handled by the useEffect)
  if (!selectedRoom) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-600 text-lg animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 mb-10">
      <div className="w-full max-w-4xl mx-auto rounded-xl border shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <Building className="h-6 w-6 text-orange-500" />
            <h2 className="text-3xl font-bold text-gray-800">Cập Nhật Phòng {id}</h2>
          </div>
          <button
            onClick={() => navigate("/dashboard/room")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all shadow-md"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Quay Lại</span>
          </button>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Room Name */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <Building className="mr-2 text-orange-500" /> Tên Phòng{" "}
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="roomName"
                  value={formData.roomName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out h-12"
                  placeholder="Nhập tên phòng"
                  required
                />
              </div>

              {/* Capacity (Read-only) */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <Users className="mr-2 text-orange-500" /> Sức Chứa
                  </span>
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  readOnly
                  className="w-full px-4 py-3 rounded-lg border bg-gray-100 text-gray-500 h-12"
                />
              </div>

              {/* Status */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <Check className="mr-2 text-orange-500" /> Trạng Thái
                  </span>
                </label>
                <select
                  name="isDeleted"
                  value={formData.isDeleted}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-500 focus:border-orange-500 duration-150 ease-in-out h-12"
                >
                  <option value={false}>Hoạt động</option>
                  <option value={true}>Đã xóa</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Description */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <FileText className="mr-2 text-orange-500" /> Mô Tả{" "}
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                <textarea
                  name="roomDescription"
                  value={formData.roomDescription}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out min-h-[100px]"
                  placeholder="Nhập mô tả phòng"
                  required
                />
              </div>

              {/* Areas (Read-only) */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <Building className="mr-2 text-orange-500" /> Khu Vực
                  </span>
                </label>
                <div className="w-full px-4 py-3 rounded-lg border bg-gray-100 text-gray-700 max-h-40 overflow-y-auto space-y-1">
                  {selectedRoom.area_DTO && selectedRoom.area_DTO.length > 0 ? (
                    selectedRoom.area_DTO.map((area, index) => (
                      <p key={index} className="text-sm">
                        {area.areaName} -{" "}
                        <span className="text-gray-600">Loại: {area.areaTypeName}</span>
                      </p>
                    ))
                  ) : (
                    <span className="text-gray-500">Không có khu vực</span>
                  )}
                </div>
              </div>

              {/* Images */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  <span className="flex items-center">
                    <Image className="mr-2 text-orange-500" /> Hình Ảnh
                  </span>
                </label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4 flex-wrap">
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
                            className="w-24 h-24 object-cover rounded-lg shadow-sm"
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
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="border-dashed border-2 border-gray-400 rounded-lg p-4 text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-all"
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
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
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
                  <Check className="mr-2" /> Cập Nhật
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