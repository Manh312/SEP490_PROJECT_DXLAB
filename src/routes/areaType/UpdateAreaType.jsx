import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAreaTypeById, updateAreaType, updateAreaTypeImages, deleteAreaTypeImage } from "../../redux/slices/AreaType";
import {
  fetchFacilitiesByAreaId,
  fetchAllFacilities,
  fetchFacilitiesList,
  addFacilityToArea,
  removeFacilityFromArea,
} from "../../redux/slices/Area";
import { toast } from "react-toastify";
import { Building, FileText, Users, Image, Check, Tag, X, ArrowLeft, Search, Plus } from "lucide-react";

const BACKEND_URL = "https://localhost:9999"; // Define your backend URL

const UpdateAreaType = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { areaTypeCategories } = useSelector((state) => state.areaCategory);
  console.log("areaTypeCategories", areaTypeCategories);


  // State cho Tabs
  const [activeTab, setActiveTab] = useState("update");

  // State cho UpdateAreaType
  const { selectedAreaType, loading: areaTypeLoading } = useSelector((state) => state.areaTypes);
  const [formData, setFormData] = useState({
    areaTypeName: "",
    areaDescription: "",
    price: "",
    areaCategory: "",
    size: "",
    isDeleted: false,
    images: [],
  });
  const [hasImageChange, setHasImageChange] = useState(false);
  const [hasDetailsChange, setHasDetailsChange] = useState(false); // Track changes in area type details
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // Ảnh hiện có từ backend
  const [imagesToDelete, setImagesToDelete] = useState([]); // New state to track images to delete
  const [failedImages, setFailedImages] = useState(new Set()); // Theo dõi ảnh không tải được
  const fileInputRef = useRef(null);

  // State cho ManageAreaDetail
  const {
    allFacilities,
    facilitiesList,
    facilitiesListLoading,
    facilitiesListError,
    allFacilitiesLoading,
    allFacilitiesError,
    addFacilityLoading,
  } = useSelector((state) => state.areas);
  const [showModal, setShowModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState(null);
  const [deleteQuantity, setDeleteQuantity] = useState("");

  // Logic cho UpdateAreaType
  useEffect(() => {
    dispatch(fetchAreaTypeById(id));
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(fetchFacilitiesList());
  }, [dispatch]);

  // Khởi tạo formData với dữ liệu hiện tại
  useEffect(() => {
    const initializeFormData = async () => {
      if (selectedAreaType) {
        const images = Array.isArray(selectedAreaType.images)
          ? selectedAreaType.images
          : [selectedAreaType.images || ""];

          const existing = images.map((img) =>
            img.startsWith("http") ? img : `${BACKEND_URL}${img}`
          );



        setFormData({
          areaTypeName: selectedAreaType.areaTypeName || "",
          areaDescription: selectedAreaType.areaDescription || "",
          price: selectedAreaType.price !== undefined ? String(selectedAreaType.price) : "",
          areaCategory: selectedAreaType.areaCategory || 1,
          size: selectedAreaType.size || "",
          isDeleted: selectedAreaType.isDeleted || false,
          images: [],
        });

        setExistingImages(existing);
        setImagePreviews(existing);
      }
    };
    initializeFormData();

  }, [selectedAreaType]);


  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "isDeleted" ? parseInt(value) : value,
    }));
    setHasDetailsChange(true); // Mark details as changed
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData((prevData) => ({
        ...prevData,
        images: [...prevData.images, ...files],
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
      // Get the image URL to delete
      let imageUrl = existingImages[index];

      // Normalize the imageUrl for backend (remove BACKEND_URL and ensure correct path)
      imageUrl = imageUrl.replace(BACKEND_URL, "");
      if (!imageUrl.startsWith("/")) {
        imageUrl = "/" + imageUrl;
      }
      if (!imageUrl.startsWith("/Images/")) {
        const filename = imageUrl.split("/").pop();
        imageUrl = `/Images/${filename}`;
      }

      // Add to imagesToDelete
      setImagesToDelete((prev) => [...prev, imageUrl]);

      // Update existingImages and previews
      updatedExistingImages = updatedExistingImages.filter((_, i) => i !== index);
      updatedPreviews = updatedPreviews.filter((_, i) => i !== index);

      setExistingImages(updatedExistingImages);
      setImagePreviews(updatedPreviews);
    } else {
      // Remove new image (not yet uploaded)
      const fileIndex = index - existingImages.length;
      updatedPreviews = updatedPreviews.filter((_, i) => i !== index);
      updatedImages = updatedImages.filter((_, i) => i !== fileIndex);

      setImagePreviews(updatedPreviews);
      setFormData((prev) => ({
        ...prev,
        images: updatedImages,
      }));
    }

    setHasImageChange(true); // Mark images as changed
  };

  const handleImageError = (index) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.areaTypeName.trim()) {
      toast.error("Tên loại khu vực là bắt buộc!");
      return;
    }
    if (!formData.areaDescription.trim()) {
      toast.error("Mô tả là bắt buộc!");
      return;
    }
    if (!formData.size || formData.size <= 0) {
      toast.error("Số ghế phải lớn hơn 0!");
      return;
    }
    if (!formData.price || formData.price < 0) {
      toast.error("Giá phải lớn hơn hoặc bằng 0!");
      return;
    }

    // Separate new files (images to upload) from formData.images
    const newFiles = formData.images.filter((img) => img instanceof File);

    try {
      // Step 1: Delete images marked for deletion
      if (imagesToDelete.length > 0) {
        for (const imageUrl of imagesToDelete) {
          console.log("Deleting image:", imageUrl);
          await dispatch(deleteAreaTypeImage({ areaTypeId: id, imageUrl })).unwrap();
        }
        toast.success("Xóa ảnh thành công!");
        setImagesToDelete([]);
      }

      // Step 2: Update the area type details only if details have changed
      if (hasDetailsChange) {
        // Create a JSON Patch document by comparing selectedAreaType with formData
        const patchDoc = [];
        if (selectedAreaType.areaTypeName !== formData.areaTypeName) {
          patchDoc.push({ op: "replace", path: "areaTypeName", value: formData.areaTypeName });
        }
        if (selectedAreaType.areaDescription !== formData.areaDescription) {
          patchDoc.push({ op: "replace", path: "areaDescription", value: formData.areaDescription });
        }
        if (selectedAreaType.price !== parseFloat(formData.price)) {
          patchDoc.push({ op: "replace", path: "price", value: parseFloat(formData.price) });
        }
        if (selectedAreaType.areaCategory !== Number(formData.areaCategory)) {
          patchDoc.push({ op: "replace", path: "areaCategory", value: Number(formData.areaCategory) });
        }
        if (selectedAreaType.size !== parseInt(formData.size)) {
          patchDoc.push({ op: "replace", path: "size", value: parseInt(formData.size) });
        }
        if (selectedAreaType.isDeleted !== formData.isDeleted) {
          patchDoc.push({ op: "replace", path: "isDeleted", value: formData.isDeleted });
        }

        if (patchDoc.length > 0) {
          console.log("Patch document being sent:", JSON.stringify(patchDoc, null, 2));
          await dispatch(
            updateAreaType({
              areaTypeId: id,
              patchDoc: patchDoc, // Use patchDoc instead of updatedData
            })
          ).unwrap();
          toast.success("Cập nhật thông tin loại khu vực thành công!");
        }
      }

      // Step 3: Update the images only if images have changed
      if (hasImageChange && newFiles.length > 0) {
        await dispatch(
          updateAreaTypeImages({
            areaTypeId: id,
            files: newFiles,
          })
        ).unwrap();
        toast.success("Cập nhật ảnh thành công!");
      }

      // If neither details nor images have changed, show a message
      if (!hasDetailsChange && !hasImageChange && imagesToDelete.length === 0) {
        toast.info("Không có thay đổi nào để cập nhật!");
        return;
      }

      // Navigate back to the dashboard after successful updates
      navigate("/dashboard/areaType");
    } catch (error) {
      const errorMessage = error.message || "Unknown error";
      toast.error(`Lỗi khi cập nhật: ${errorMessage}`);
      console.error("Update error:", error);
    }
  };

  // Logic cho ManageAreaDetail
  useEffect(() => {
    if (id) {
      dispatch(fetchFacilitiesByAreaId(id));
    }
  }, [dispatch, id]);

  const openModal = () => {
    dispatch(fetchAllFacilities());
    setShowModal(true);
  };

  const handleAddFacility = async () => {
    if (!selectedFacility || !quantity) {
      toast.error("Vui lòng chọn thiết bị và nhập số lượng!");
      return;
    }

    const quantityToAdd = parseInt(quantity);
    if (quantityToAdd > selectedFacility.quantity) {
      toast.error(`Số lượng vượt quá số lượng khả dụng (${selectedFacility.quantity})!`);
      return;
    }

    const body = {
      facilityId: selectedFacility.facilityId,
      batchNumber: selectedFacility.batchNumber,
      importDate: selectedFacility.importDate,
      quantity: quantityToAdd,
    };

    try {
      const res = await dispatch(addFacilityToArea({ id, data: body })).unwrap();
      toast.success(res.message);
      await dispatch(fetchFacilitiesList()).unwrap();

      setShowModal(false);
      setSelectedFacility(null);
      setQuantity("");
      setSearchTerm("");
    } catch (error) {
      toast.error(error.message || "Lỗi khi thêm thiết bị!");
    }
  };

  const handleDeleteFacility = async () => {
    if (!facilityToDelete || !deleteQuantity) {
      toast.error("Vui lòng nhập số lượng muốn xóa!");
      return;
    }

    const quantityToDelete = parseInt(deleteQuantity);
    const currentFacility = facilitiesList.find((f) => f.facilityId === facilityToDelete.facilityId);
    const currentQuantity = currentFacility ? currentFacility.quantity : 0;

    if (quantityToDelete > currentQuantity) {
      toast.error(`Số lượng xóa vượt quá số lượng hiện có (${currentQuantity})!`);
      return;
    }

    const body = {
      areaId: parseInt(id),
      facilityId: facilityToDelete.facilityId,
      quantity: quantityToDelete,
      status: 2,
    };

    try {
      const res = await dispatch(removeFacilityFromArea(body)).unwrap();
      toast.success(res.message);
      await dispatch(fetchFacilitiesList()).unwrap();

      setDeleteModal(false);
      setFacilityToDelete(null);
      setDeleteQuantity("");
    } catch (err) {
      toast.error(err.message || "Lỗi khi xóa thiết bị!");
    }
  };

  const filteredFacilities = allFacilities.filter((faci) =>
    faci.facilityName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (areaTypeLoading || !selectedAreaType) {
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
            <h2 className="text-3xl font-bold text-gray-800">Quản Lý Loại Khu Vực {id}</h2>
          </div>
          {/* Nút Thêm Thiết Bị */}
          {activeTab === "manageFacilities" && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={openModal}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all shadow-md"
              >
                <Plus className="w-5 h-5" /> Thêm Thiết Bị
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-4">
            <button
              onClick={() => setActiveTab("update")}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-all duration-150 ease-in-out ${
                activeTab === "update"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Cập Nhật Loại Khu Vực
            </button>
            <button
              onClick={() => setActiveTab("manageFacilities")}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-all duration-150 ease-in-out ${
                activeTab === "manageFacilities"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Quản Lý Trang Thiết Bị
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "update" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cột bên trái */}
              <div className="space-y-6">
                {/* Tên Loại Khu Vực */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-1">
                    <span className="flex items-center">
                      <Building className="mr-2 text-orange-500" /> Tên Loại Khu Vực <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="areaTypeName"
                    value={formData.areaTypeName}
                    onChange={handleNumberChange}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out h-12"
                    placeholder="Nhập tên loại khu vực"
                    required
                  />
                </div>

                {/* Số Ghế */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-1">
                    <span className="flex items-center">
                      <Users className="mr-2 text-orange-500" /> Số Ghế <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    name="size"
                    value={formData.size}
                    min={1}
                    onChange={handleNumberChange}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out h-12"
                    placeholder="Nhập số ghế"
                    required
                  />
                </div>

                {/* Giá */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-1">
                    <span className="flex items-center">
                      <Tag className="mr-2 text-orange-500" /> Giá <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      min={0}
                      step="0.01"
                      onChange={handleNumberChange}
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out h-12"
                      placeholder="Nhập giá"
                      required
                    />
                    <span className="flex items-center gap-1 text-sm text-gray-500 font-medium whitespace-nowrap">
                      DXL
                    </span>
                  </div>
                </div>

                {/* Trạng Thái */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-1">
                    <span className="flex items-center">
                      <Tag className="mr-2 text-orange-500" /> Trạng Thái
                    </span>
                  </label>
                  <select
                    name="isDeleted"
                    value={String(formData.isDeleted)}
                    onChange={handleNumberChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-500 focus:border-orange-500 duration-150 ease-in-out h-12"
                  >
                    <option value="false">Hoạt động</option>
                    <option value="true">Không hoạt động</option>
                  </select>
                </div>
              </div>

              {/* Cột bên phải */}
              <div className="space-y-6">
                {/* Mô Tả */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-1">
                    <span className="flex items-center">
                      <FileText className="mr-2 text-orange-500" /> Mô Tả <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <textarea
                    name="areaDescription"
                    value={formData.areaDescription}
                    onChange={handleNumberChange}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 duration-150 ease-in-out min-h-[50px]"
                    placeholder="Nhập mô tả loại khu vực"
                    required
                  />
                </div>

                {/* Danh Mục */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-1">
                    <span className="flex items-center">
                      <Tag className="mr-2 text-orange-500" /> Danh Mục
                    </span>
                  </label>
                  <select
                    name="areaCategory"
                    value={String(formData.areaCategory)}
                    onChange={handleNumberChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-500 focus:border-orange-500 duration-150 ease-in-out h-12"
                  >
                    {areaTypeCategories.map((category) => (
                      <option key={category.id} value={category.categoryId}>
                        {category.title}
                      </option>
                    ))}
                  
                  </select>
                </div>

                {/* Hình Ảnh */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-1">
                    <span className="flex items-center">
                      <Image className="mr-2 text-orange-500" /> Hình Ảnh <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4 flex-wrap">
                      {imagePreviews.length > 0 &&
                        imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={failedImages.has(index) ? "/placeholder-image.jpg" : preview}
                              alt={`Area preview ${index}`}
                              className="w-24 h-24 object-cover rounded-lg shadow-sm"
                              onError={() => handleImageError(index)}
                            />
                            <button
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
                        onChange={handleImageChange}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nút Hành Động */}
            <div className="mt-8 flex justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate("/dashboard/areaType")}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 ease-in-out"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={areaTypeLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300 disabled:cursor-not-allowed transition duration-150 ease-in-out"
              >
                {areaTypeLoading ? (
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
                    <Check className="mr-2" /> Cập Nhật
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {activeTab === "manageFacilities" && (
          <div>
            {/* Facilities List (Using facilitiesList instead of facilities) */}
            {facilitiesListLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : facilitiesListError ? (
              <p className="text-center text-red-500 bg-red-50 p-4 rounded-lg">{facilitiesListError}</p>
            ) : facilitiesList.length === 0 ? (
              <p className="text-center text-gray-500 bg-gray-50 p-4 rounded-lg">
                Không có thiết bị nào trong khu vực.
              </p>
            ) : (
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 flex-row items-center justify-center">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên Thiết Bị
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lô
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số Lượng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày Nhập
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành Động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 flex-row items-center justify-center">
                    {facilitiesList.map((item, index) => (
                      <tr key={item.usingFacilityId} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.facilityTitle || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.batchNumber || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.importDate ? new Date(item.importDate).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-center">
                          <button
                            onClick={() => {
                              setFacilityToDelete(item);
                              setDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-800 transition"
                          >
                            <X size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button
              onClick={() => navigate("/dashboard/areaType")}
              className="bg-gray-500 mt-20 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Quay Lại</span>
            </button>

            {/* Modal Xóa */}
            {deleteModal && facilityToDelete && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-red-600">Xóa Thiết Bị</h2>
                    <button
                      onClick={() => {
                        setDeleteModal(false);
                        setFacilityToDelete(null);
                        setDeleteQuantity("");
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <p className="text-gray-700">
                    Thiết bị: <strong>{facilityToDelete.facilityTitle || "N/A"}</strong>
                  </p>
                  <p className="text-gray-700">
                    Số lượng hiện có: <strong>{facilityToDelete.quantity || 0}</strong>
                  </p>
                  <input
                    type="number"
                    min={1}
                    max={facilityToDelete.quantity || 0}
                    value={deleteQuantity}
                    onChange={(e) => setDeleteQuantity(e.target.value)}
                    placeholder="Nhập số lượng muốn xóa"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setDeleteModal(false);
                        setFacilityToDelete(null);
                        setDeleteQuantity("");
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleDeleteFacility}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Thêm */}
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-orange-600">Thêm Thiết Bị Vào Khu Vực</h2>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setSelectedFacility(null);
                        setQuantity("");
                        setSearchTerm("");
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Thanh tìm kiếm */}
                  <div className="relative mb-4">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm kiếm thiết bị..."
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  </div>

                  {allFacilitiesLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                  ) : allFacilitiesError ? (
                    <p className="text-center text-red-500 bg-red-50 p-4 rounded-lg">{allFacilitiesError}</p>
                  ) : filteredFacilities.length === 0 ? (
                    <p className="text-center text-gray-500 bg-gray-50 p-4 rounded-lg">
                      Không tìm thấy thiết bị nào.
                    </p>
                  ) : (
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tên Thiết Bị
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Lô
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Số Lượng Khả Dụng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ngày Nhập
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredFacilities.map((faci) => (
                            <tr
                              key={faci.facilityId}
                              onClick={() => setSelectedFacility(faci)}
                              className={`cursor-pointer hover:bg-orange-50 transition ${
                                selectedFacility?.facilityId === faci.facilityId ? "bg-orange-100" : ""
                              }`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {faci.facilityName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {faci.batchNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {faci.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(faci.importDate).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {selectedFacility && (
                    <div className="mt-4">
                      <label className="block mb-1 font-medium text-sm text-gray-700">
                        Nhập số lượng muốn thêm (Tối đa: {selectedFacility.quantity}):
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={selectedFacility.quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="VD: 10"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-6">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setSelectedFacility(null);
                        setQuantity("");
                        setSearchTerm("");
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Hủy
                    </button>
                    <button
                      disabled={!selectedFacility || !quantity || addFacilityLoading}
                      onClick={handleAddFacility}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition"
                    >
                      {addFacilityLoading ? "Đang thêm..." : "Thêm vào khu vực"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateAreaType;