import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAreaTypeById, updateAreaType } from "../../redux/slices/AreaType";
import {
  fetchFacilitiesByAreaId,
  fetchAllFacilities,
  addFacilityToArea,
  removeFacilityFromArea,
} from "../../redux/slices/Area";
import { toast } from "react-toastify";
import { Building, FileText, Users, Image, Check, Tag, X, ArrowLeft, Search, Plus } from "lucide-react";

const UpdateAreaType = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
  const [imagePreviews, setImagePreviews] = useState([]);
  const [failedImages, setFailedImages] = useState(new Set());
  const fileInputRef = useRef(null);

  // State cho ManageAreaDetail
  const {
    facilities,
    facilitiesLoading,
    facilitiesError,
    allFacilities,
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
  const [facilityQuantities, setFacilityQuantities] = useState(() => {
    const savedQuantities = localStorage.getItem(`facilityQuantities_area_${id}`);
    return savedQuantities ? JSON.parse(savedQuantities) : {};
  });

  // Logic cho UpdateAreaType
  useEffect(() => {
    dispatch(fetchAreaTypeById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedAreaType) {
      const images = Array.isArray(selectedAreaType.images)
        ? selectedAreaType.images.map((img) => `${img.imageUrl || img}`)
        : [];
      setFormData({
        areaTypeName: selectedAreaType.areaTypeName || "",
        areaDescription: selectedAreaType.areaDescription || "",
        price: selectedAreaType.price !== undefined ? String(selectedAreaType.price) : "",
        areaCategory: selectedAreaType.areaCategory || 1,
        size: selectedAreaType.size || "",
        isDeleted: selectedAreaType.isDeleted || false,
        images: images,
      });
      setImagePreviews(images);
    }
  }, [selectedAreaType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value === "" ? "" : parseFloat(value) });
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

  const handleImageError = (index) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  const removeImage = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setHasImageChange(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    if (formData.images.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ảnh!");
      return;
    }

    const updates = [];
    if (formData.areaTypeName !== selectedAreaType.areaTypeName) {
      updates.push({ operationType: 0, path: "areaTypeName", op: "replace", value: formData.areaTypeName });
    }
    if (formData.areaDescription !== selectedAreaType.areaDescription) {
      updates.push({ operationType: 0, path: "areaDescription", op: "replace", value: formData.areaDescription });
    }
    if (formData.price !== String(selectedAreaType.price)) {
      updates.push({ operationType: 0, path: "price", op: "replace", value: parseFloat(formData.price) });
    }
    if (formData.areaCategory !== selectedAreaType.areaCategory) {
      updates.push({ operationType: 0, path: "areaCategory", op: "replace", value: Number(formData.areaCategory) });
    }
    if (formData.size !== selectedAreaType.size) {
      updates.push({ operationType: 0, path: "size", op: "replace", value: parseInt(formData.size) });
    }
    if (formData.isDeleted !== selectedAreaType.isDeleted) {
      updates.push({ operationType: 0, path: "isDeleted", op: "replace", value: formData.isDeleted });
    }
    if (hasImageChange) {
      updates.push({
        operationType: 0,
        path: "images",
        op: "replace",
        value: formData.images.map((img) => ({ imageUrl: typeof img === "string" ? img : img.name })),
      });
    }

    if (updates.length === 0) {
      toast.info("Không có thay đổi nào cần cập nhật!");
      return;
    }

    try {
      await dispatch(updateAreaType({ areaTypeId: id, updatedData: updates })).unwrap();
      toast.success("Cập nhật thành công!");
      navigate("/dashboard/areaType");
    } catch (error) {
      const errorMessage = error.message || "Unknown error";
      toast.error(`Lỗi khi cập nhật loại khu vực: ${errorMessage}`);
      console.error("Update error:", error);
    }
  };

  // Logic cho ManageAreaDetail
  useEffect(() => {
    localStorage.setItem(`facilityQuantities_area_${id}`, JSON.stringify(facilityQuantities));
  }, [facilityQuantities, id]);

  useEffect(() => {
    if (id) {
      dispatch(fetchFacilitiesByAreaId(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    const updatedQuantities = facilities.reduce((acc, item) => {
      if (facilityQuantities[item.facilityId] !== undefined) {
        acc[item.facilityId] = facilityQuantities[item.facilityId];
      }
      return acc;
    }, {});
    setFacilityQuantities(updatedQuantities);
  }, [facilities]);

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
      dispatch(fetchFacilitiesByAreaId(id));

      setFacilityQuantities((prev) => ({
        ...prev,
        [selectedFacility.facilityId]:
          (prev[selectedFacility.facilityId] || 0) + quantityToAdd,
      }));

      setShowModal(false);
      setSelectedFacility(null);
      setQuantity("");
      setSearchTerm("");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteFacility = async () => {
    if (!facilityToDelete || !deleteQuantity) {
      toast.error("Vui lòng nhập số lượng muốn xóa!");
      return;
    }

    const quantityToDelete = parseInt(deleteQuantity);
    const currentQuantity = facilityQuantities[facilityToDelete.facilityId] || 0;
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
      dispatch(fetchFacilitiesByAreaId(id));

      setFacilityQuantities((prev) => {
        const newQuantity = (prev[facilityToDelete.facilityId] || 0) - quantityToDelete;
        if (newQuantity <= 0) {
          const { [facilityToDelete.facilityId]: _, ...rest } = prev;
          return rest;
        }
        return {
          ...prev,
          [facilityToDelete.facilityId]: newQuantity,
        };
      });

      setDeleteModal(false);
      setFacilityToDelete(null);
      setDeleteQuantity("");
    } catch (err) {
      toast.error(err.message);
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
          <button
            onClick={() => navigate("/dashboard/areaType")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Quay Lại</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-4">
            <button
              onClick={() => setActiveTab("update")}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-all duration-150 ease-in-out ${activeTab === "update"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Cập Nhật Loại Khu Vực
            </button>
            <button
              onClick={() => setActiveTab("manageFacilities")}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-all duration-150 ease-in-out ${activeTab === "manageFacilities"
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
                    onChange={handleChange}
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
                      DXLAB Coin
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
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-500 focus:border-orange-500 duration-150 ease-in-out h-12"
                  >
                    <option value="false">Hoạt động</option>
                    <option value="true">Xóa</option>
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-500 focus:border-orange-500 duration-150 ease-in-out h-12"
                  >
                    <option value="1">Khu vực cá nhân</option>
                    <option value="2">Khu vực nhóm</option>
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
                    {imagePreviews.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-3">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative w-24 h-24">
                            <img
                              src={`https://localhost:9999${preview}`}
                              alt={`preview-${index}`}
                              className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm"
                              onError={(e) => (e.target.src = "/placeholder-image.jpg")}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-all duration-150 ease-in-out"
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
            {/* Danh sách thiết bị */}
            {facilitiesLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : facilitiesError ? (
              <p className="text-center text-red-500 bg-red-50 p-4 rounded-lg">{facilitiesError}</p>
            ) : facilities.length === 0 ? (
              <p className="text-center text-gray-500 bg-gray-50 p-4 rounded-lg">
                Không có thiết bị nào trong khu vực này.
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
                        Số Lượng
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành Động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {facilities.map((item) => (
                      <tr key={item.facilityId} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.facilityTitle}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {facilityQuantities[item.facilityId] || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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

            {/* Nút Thêm Thiết Bị */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={openModal}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all shadow-md"
              >
                <Plus className="w-5 h-5" /> Thêm Thiết Bị
              </button>
            </div>

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
                    Thiết bị: <strong>{facilityToDelete.facilityTitle}</strong>
                  </p>
                  <p className="text-gray-700">
                    Số lượng hiện có: <strong>{facilityQuantities[facilityToDelete.facilityId] || 0}</strong>
                  </p>
                  <input
                    type="number"
                    min={1}
                    max={facilityQuantities[facilityToDelete.facilityId] || 0}
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
                              className={`cursor-pointer hover:bg-orange-50 transition ${selectedFacility?.facilityId === faci.facilityId
                                  ? "bg-orange-100"
                                  : ""
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
