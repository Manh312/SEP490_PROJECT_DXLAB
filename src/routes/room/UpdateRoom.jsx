import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getRoomById,
  updateRoom,
  updateRoomImages,
  deleteRoomImage,
} from "../../redux/slices/Room";
import { fetchAreaInRoomForManagement, addAreaToRoom } from "../../redux/slices/Area";
import {
  fetchAreaTypes,
  toggleAreaSelection,
  setAllAreaSelections,
  clearAreaSelections,
} from "../../redux/slices/AreaType";
import { toast } from "react-toastify";
import { Building, Image, FileText, Check, X, ArrowLeft, Plus } from "lucide-react";

const BACKEND_URL = "https://localhost:9999";

const UpdateRoom = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const { selectedRoom, loading, error } = useSelector((state) => state.rooms);
  const { areaInRoom, areaInRoomLoading, areaInRoomError } = useSelector(
    (state) => state.areas || {}
  );
  const { areaTypes, selectedAreaIds } = useSelector((state) => state.areaTypes);

  const [formData, setFormData] = useState({
    roomName: "",
    roomDescription: "",
    isDeleted: false,
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
        isDeleted: selectedRoom.isDeleted !== undefined ? selectedRoom.isDeleted : false,
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
      [name]: name === "isDeleted" ? (value === "true" ? true : false) : value,
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
        toast.success("Xóa ảnh thành công!");
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

      if (hasImageChange && newFiles.length > 0) {
        await dispatch(
          updateRoomImages({
            roomId: parseInt(id),
            files: newFiles,
          })
        ).unwrap();
        toast.success("Cập nhật ảnh thành công!");
      }

      if (!hasDetailsChange && !hasImageChange && imagesToDelete.length === 0) {
        toast.info("Không có thay đổi nào để cập nhật!");
        return;
      }

      await dispatch(getRoomById(parseInt(id))).unwrap();
      navigate("/dashboard/room", { state: { successMessage: "Cập nhật phòng thành công!" } });
    } catch (err) {
      const errorMessage = err.message || "Lỗi khi cập nhật phòng";
      toast.error(errorMessage);
      console.error("Update error:", err);
    }
  };

  const handleAddAreaToRoom = async () => {
    if (selectedAreaIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một khu vực để thêm!");
      return;
    }

    try {
      const roomId = parseInt(id);
      // Map selectedAreaIds to an array of area objects with areaTypeId and areaName
      const areasToAdd = selectedAreaIds.map((areaTypeId) => {
        const areaType = areaTypes.find((at) => at.areaTypeId === areaTypeId);
        return {
          areaTypeId: areaTypeId,
          areaName: areaType ? `${areaType.areaTypeName} - Room ${roomId}` : `Area ${areaTypeId}`,
        };
      });

      await dispatch(
        addAreaToRoom({
          roomId,
          areas: areasToAdd,
        })
      ).unwrap();

      toast.success("Thêm khu vực vào phòng thành công!");
      setIsModalOpen(false);
      dispatch(clearAreaSelections());
      dispatch(fetchAreaInRoomForManagement(roomId));
    } catch (err) {
      const errorMessage = err.message || "Lỗi khi thêm khu vực vào phòng";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-600 text-lg animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
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
    <div className="py-12 px-4 sm:px-6 lg:px-8 mb-10 bg-gray-100 min-h-screen">
      <div className="w-full max-w-5xl mx-auto rounded-2xl border bg-white shadow-lg p-8 transition-all duration-300">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <Building className="h-8 w-8 text-orange-600" />
            <h2 className="text-3xl font-semibold text-gray-800">Quản Lý Phòng {id}</h2>
          </div>
          <button
            onClick={() => navigate("/dashboard/room")}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-md"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline font-medium">Quay Lại</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-4 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab("update")}
              className={`relative py-4 px-6 text-sm font-medium transition-all duration-300 ${
                activeTab === "update"
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
              className={`relative py-4 px-6 text-sm font-medium transition-all duration-300 ${
                activeTab === "manage-areas"
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
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Room Name */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    <span className="flex items-center">
                      <Building className="mr-2 h-5 w-5 text-orange-500" /> Tên Phòng{" "}
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="roomName"
                    value={formData.roomName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50 text-gray-800 placeholder-gray-400"
                    placeholder="Nhập tên phòng"
                    required
                  />
                </div>

                {/* Status */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    <span className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-orange-500" /> Trạng Thái
                    </span>
                  </label>
                  <select
                    name="isDeleted"
                    value={formData.isDeleted}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50 text-gray-800"
                  >
                    <option value={false}>Hoạt động</option>
                    <option value={true}>Đã xóa</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                {/* Description */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    <span className="flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-orange-500" /> Mô Tả{" "}
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <textarea
                    name="roomDescription"
                    value={formData.roomDescription}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50 text-gray-800 placeholder-gray-400 min-h-[120px]"
                    placeholder="Nhập mô tả phòng"
                    required
                  />
                </div>

                {/* Images */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    <span className="flex items-center">
                      <Image className="mr-2 h-5 w-5 text-orange-500" /> Hình Ảnh
                    </span>
                  </label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      {imagePreviews.length > 0 &&
                        imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={
                                failedImages.has(index)
                                  ? "/placeholder-image.jpg"
                                  : preview
                              }
                              alt={`Room preview ${index}`}
                              className="w-24 h-24 object-cover rounded-lg shadow-md transition-all duration-300 group-hover:shadow-lg"
                              onError={() => handleImageError(index)}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="border-dashed border-2 border-gray-300 rounded-lg p-4 text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-all duration-300 flex items-center justify-center w-24 h-24"
                      >
                        <span className="text-sm font-medium">Chọn tệp</span>
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
            <div className="mt-10 flex justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate("/dashboard/room")}
                className="w-full py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300 disabled:cursor-not-allowed transition-all duration-300"
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
                    <Check className="mr-2 h-5 w-5" /> Cập Nhật
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {activeTab === "manage-areas" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Danh Sách Khu Vực</h3>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-md"
              >
                <Plus size={20} />
                <span className="font-medium">Thêm Khu Vực</span>
              </button>
            </div>
            {areaInRoomLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500 text-lg animate-pulse">Đang tải dữ liệu...</p>
              </div>
            ) : areaInRoomError ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-red-500 text-lg">{areaInRoomError}</p>
              </div>
            ) : Array.isArray(areaInRoom) && areaInRoom.length > 0 ? (
              <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        STT
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        Tên Khu Vực
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        Loại Khu Vực
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        Danh Mục
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        Số Lượng Thiết Bị
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        Kích Thước
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        Trạng Thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {areaInRoom.map((area, index) => (
                      <tr
                        key={area.areaId}
                        className={`transition-colors duration-200 ${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } hover:bg-orange-50`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {area.areaName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {area.areaTypeName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {area.categoryId === 1 ? "Khu vực cá nhân" : "Khu vực nhóm"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {area.faciAmount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {area.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              area.isAvail
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {area.isAvail ? "Có sẵn" : "Không có sẵn"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500 text-lg">Không có khu vực nào trong phòng này.</p>
              </div>
            )}
          </div>
        )}

        {/* Modal for Adding Areas */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Thêm Khu Vực Vào Phòng</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <X size={24} />
                </button>
              </div>

              {Array.isArray(areaTypes) && areaTypes.length > 0 ? (
                <div className="space-y-4">
                  {/* Select All Checkbox */}
                  <div className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                    <input
                      type="checkbox"
                      id="select-all"
                      checked={
                        areaTypes.length > 0 &&
                        areaTypes.every((area) => selectedAreaIds.includes(area.areaTypeId))
                      }
                      onChange={() => {
                        if (
                          areaTypes.every((area) => selectedAreaIds.includes(area.areaTypeId))
                        ) {
                          dispatch(setAllAreaSelections([]));
                        } else {
                          dispatch(setAllAreaSelections(areaTypes.map((area) => area.areaTypeId)));
                        }
                      }}
                      className="h-5 w-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <label
                      htmlFor="select-all"
                      className="ml-4 text-sm font-medium text-gray-900 cursor-pointer"
                    >
                      Chọn tất cả
                    </label>
                  </div>

                  {/* Individual Area Checkboxes */}
                  {areaTypes.map((area) => (
                    <div
                      key={area.areaTypeId}
                      className={`flex items-center p-4 rounded-lg border transition-all duration-200 ${
                        selectedAreaIds.includes(area.areaTypeId)
                          ? "border-orange-500 bg-orange-50 shadow-sm"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        id={`area-${area.areaTypeId}`}
                        checked={selectedAreaIds.includes(area.areaTypeId)}
                        onChange={() => dispatch(toggleAreaSelection(area.areaTypeId))}
                        className="h-5 w-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <label
                        htmlFor={`area-${area.areaTypeId}`}
                        className="ml-4 flex-1 cursor-pointer"
                      >
                        <p className="text-sm font-medium text-gray-900">{area.areaTypeName}</p>
                        <p className="text-sm text-gray-500">Loại: {area.areaTypeName}</p>
                        <p className="text-sm text-gray-500">Danh mục: {area.areaCategory}</p>
                        <p className="text-sm text-gray-500">Kích thước: {area.size}</p>
                        <p className="text-sm">
                          Trạng thái:{" "}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              area.isDeleted === false
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {area.isDeleted === false ? "Có sẵn" : "Không có sẵn"}
                          </span>
                        </p>
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-6">
                  <p className="text-gray-500 text-lg">Không có khu vực nào để thêm.</p>
                </div>
              )}

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
      </div>
    </div>
  );
};

export default UpdateRoom;