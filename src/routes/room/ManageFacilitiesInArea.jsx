import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFacilitiesByAreaId,
  fetchAllFacilities,
  addFacilityToArea,
  removeFacilityFromArea,
  removeAllFacilitiesFromArea, // Import the new thunk
} from "../../redux/slices/Area";
import { toast } from "react-toastify";
import { Search, Plus, X, ArrowLeft, Trash2 } from "lucide-react"; // Add Trash2 icon for "Delete All"
import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";

const ManageFacilitiesInArea = ({ entityType = "area" }) => {
  const dispatch = useDispatch();
  const {
    facilities,
    facilitiesLoading,
    facilitiesError,
    allFacilities,
    allFacilitiesLoading,
    allFacilitiesError,
    addFacilityLoading,
    removeFacilityLoading,
    removeAllFacilitiesLoading, // Add loading state for delete all
  } = useSelector((state) => state.areas);

  const [showModal, setShowModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState(null);
  const [deleteQuantity, setDeleteQuantity] = useState("");
  const [deleteAllModal, setDeleteAllModal] = useState(false); // State for "Delete All" confirmation modal

  const { id, areaId } = useParams();

  useEffect(() => {
    if (areaId) {
      dispatch(fetchFacilitiesByAreaId(areaId));
    }
  }, [dispatch, areaId]);

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
      const res = await dispatch(addFacilityToArea({ id: areaId, data: body })).unwrap();
      toast.success(res.message || "Thêm thiết bị thành công!");
      await dispatch(fetchFacilitiesByAreaId(areaId)).unwrap();
      setShowModal(false);
      setSelectedFacility(null);
      setQuantity("");
      setSearchTerm("");
    } catch (error) {
      toast.error(error || "Lỗi khi thêm thiết bị!");
    }
  };

  const handleDeleteFacility = async () => {
    if (!facilityToDelete || !deleteQuantity) {
      toast.error("Vui lòng nhập số lượng muốn xóa!");
      return;
    }

    const quantityToDelete = parseInt(deleteQuantity);
    const currentFacility = facilities.find((f) => f.usingFacilityId === facilityToDelete.usingFacilityId);
    const currentQuantity = currentFacility ? currentFacility.quantity : 0;

    if (quantityToDelete > currentQuantity) {
      toast.error(`Số lượng xóa vượt quá số lượng hiện có (${currentQuantity})!`);
      return;
    }

    const body = {
      areaId: parseInt(areaId),
      facilityId: facilityToDelete.usingFacilityId,
      quantity: quantityToDelete,
      status: 2,
    };

    try {
      const res = await dispatch(removeFacilityFromArea(body)).unwrap();
      toast.success(res.message || "Xóa thiết bị thành công!");
      await dispatch(fetchFacilitiesByAreaId(areaId)).unwrap();
      setDeleteModal(false);
      setFacilityToDelete(null);
      setDeleteQuantity("");
    } catch (err) {
      toast.error(err || "Lỗi khi xóa thiết bị!");
    }
  };

  // New handler for "Delete All"
  const handleDeleteAllFacilities = async () => {
    try {
      const res = await dispatch(removeAllFacilitiesFromArea(areaId)).unwrap();
      toast.success(res.message || "Đã xóa tất cả thiết bị trong khu vực!");
      await dispatch(fetchFacilitiesByAreaId(areaId)).unwrap(); // Refresh the facilities list
      setDeleteAllModal(false);
    } catch (err) {
      toast.error(err || "Lỗi khi xóa tất cả thiết bị!");
    }
  };

  const filteredFacilities = allFacilities.filter((faci) =>
    faci.facilityName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 mb-10 bg-gray-100 min-h-screen">
      <div className="w-full max-w-6xl mx-auto rounded-2xl border bg-white shadow-lg p-8 transition-all duration-300">
        {/* Header Section with Back Button, Add Facility, and Delete All Button */}
        <div className="flex justify-between items-center mb-6">
          <Link
            to={{
              pathname: `/dashboard/room/update/${id}`,
              state: { activeTab: "manage-areas" },
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Quay Lại</span>
          </Link>
          <div className="flex gap-3">
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all shadow-md"
            >
              <Plus className="w-5 h-5" />
              Thêm Thiết Bị
            </button>
            {/* New "Delete All" Button */}
            <button
              onClick={() => setDeleteAllModal(true)}
              disabled={facilities.length === 0 || removeAllFacilitiesLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-all shadow-md"
            >
              <Trash2 className="w-5 h-5" />
              Xóa Tất Cả
            </button>
          </div>
        </div>

        {/* Facilities List */}
        {facilitiesLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : facilitiesError ? (
          <p className="text-center text-red-500 bg-red-50 p-4 rounded-lg">{facilitiesError}</p>
        ) : facilities.length === 0 ? (
          <p className="text-center text-gray-500 bg-gray-50 p-4 rounded-lg">
            Không có thiết bị nào trong {entityType === "area" ? "khu vực" : "phòng"} này.
          </p>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <table className="w-full divide-y divide-gray-200 table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">
                    Tên Thiết Bị
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                    Lô
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                    Số Lượng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">
                    Ngày Nhập
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {facilities.map((item, index) => (
                  <tr key={item.usingFacilityId} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.facilityTitle || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.batchNumber || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity || 0}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.importDate ? new Date(item.importDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end">
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

        {/* Delete Facility Modal */}
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
                  disabled={removeFacilityLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition"
                >
                  {removeFacilityLoading ? "Đang xóa..." : "Xóa"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New "Delete All" Confirmation Modal */}
        {deleteAllModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-red-600">Xóa Tất Cả Thiết Bị</h2>
                <button
                  onClick={() => setDeleteAllModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-700">
                Bạn có chắc chắn muốn xóa tất cả thiết bị trong khu vực này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteAllModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteAllFacilities}
                  disabled={removeAllFacilitiesLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition"
                >
                  {removeAllFacilitiesLoading ? "Đang xóa..." : "Xóa Tất Cả"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Facility Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-orange-600">
                  Thêm Thiết Bị Vào {entityType === "area" ? "Khu Vực" : "Phòng"}
                </h2>
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
                  {addFacilityLoading ? "Đang thêm..." : `Thêm vào ${entityType === "area" ? "khu vực" : "phòng"}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ManageFacilitiesInArea.propTypes = {
  entityType: PropTypes.string,
};

export default ManageFacilitiesInArea;