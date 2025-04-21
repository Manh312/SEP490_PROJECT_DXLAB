import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFacilitiesByAreaId,
  fetchAllFacilities,
  addFacilityToArea,
  removeFacilityFromArea,
  removeAllFacilitiesFromArea,
} from "../../redux/slices/Area";
import { toast } from "react-toastify";
import { Search, Plus, X, ArrowLeft, Trash2 } from "lucide-react";
import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";

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
    removeAllFacilitiesLoading,
  } = useSelector((state) => state.areas);

  const [showModal, setShowModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState(null);
  const [deleteQuantity, setDeleteQuantity] = useState("");
  const [deleteStatus, setDeleteStatus] = useState("1"); // Default status: Đã sử dụng
  const [deleteAllModal, setDeleteAllModal] = useState(false);

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

  const handleNumberChange = (e) => {
    const value = e.target.value;
    // Chỉ chấp nhận số nguyên dương
    if (value === "" || /^[0-9]+$/.test(value)) {
      setDeleteQuantity(value);
    }
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Chỉ chấp nhận số nguyên dương
    if (value === "" || /^[0-9]+$/.test(value)) {
      setQuantity(value);
    }
  };

  const handleAddFacility = async () => {
    if (!selectedFacility || !quantity) {
      toast.error("Vui lòng chọn thiết bị và nhập số lượng!");
      return;
    }

    const quantityToAdd = parseInt(quantity);
    if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
      toast.error("Số lượng phải là một số dương!");
      return;
    }

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
    const facilityStatus = selectedFacility.status;

    try {
      const res = await dispatch(
        addFacilityToArea({ id: areaId, data: body, status: facilityStatus })
      ).unwrap();
      toast.success(res.message || "Thêm thiết bị thành công!");
      setShowModal(false);
      setSelectedFacility(null);
      setQuantity("");
      setSearchTerm("");
      await dispatch(fetchFacilitiesByAreaId(areaId)).unwrap();
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
    const currentFacility = facilities.find((f) => f.facilityId === facilityToDelete.facilityId);
    const currentQuantity = currentFacility ? currentFacility.quantity : 0;

    if (quantityToDelete > currentQuantity) {
      toast.error(`Số lượng xóa vượt quá số lượng hiện có (${currentQuantity})!`);
      return;
    }

    const body = {
      areaId: parseInt(areaId),
      facilityId: facilityToDelete.facilityId,
      quantity: quantityToDelete,
      status: parseInt(deleteStatus), // Use selected status
    };

    try {
      const res = await dispatch(removeFacilityFromArea(body)).unwrap();
      toast.success(res.message || "Xóa thiết bị thành công!");
      await dispatch(fetchFacilitiesByAreaId(areaId)).unwrap();
      setDeleteModal(false);
      setFacilityToDelete(null);
      setDeleteQuantity("");
      setDeleteStatus("1"); // Reset status
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteAllFacilities = async () => {
    try {
      const res = await dispatch(removeAllFacilitiesFromArea(areaId)).unwrap();
      toast.success(res.message || "Đã xóa tất cả thiết bị trong khu vực!");
      await dispatch(fetchFacilitiesByAreaId(areaId)).unwrap();
      setDeleteAllModal(false);
    } catch (err) {
      toast.error(err || "Lỗi khi xóa tất cả thiết bị!");
    }
  };

  const filteredFacilities = allFacilities.filter(
    (faci) =>
      faci.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faci.quantity > 0
  );

  return (
    <div className="py-4 px-4 sm:px-6 lg:px-8 mb-10 bg-gray-100 min-h-screen">
      <div className="w-full max-w-6xl mx-auto rounded-2xl border bg-white shadow-lg p-4 sm:p-6 lg:p-8 transition-all duration-300">
        {/* Header Section with Back Button, Add Facility, and Delete All Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <Link
            to={{
              pathname: `/dashboard/room/update/${id}`,
              state: { activeTab: "manage-areas" },
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all shadow-md w-full sm:w-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm sm:text-base">Quay Lại</span>
          </Link>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all shadow-md w-full sm:w-auto"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm sm:text-base">Thêm Thiết Bị</span>
            </button>
            <button
              onClick={() => setDeleteAllModal(true)}
              disabled={facilities.length === 0 || removeAllFacilitiesLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-all shadow-md w-full sm:w-auto"
            >
              <Trash2 className="w-5 h-5" />
              <span className="text-sm sm:text-base">Xóa Tất Cả</span>
            </button>
          </div>
        </div>

        {/* Facilities List Title */}
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
            Danh Sách Cơ Sở Vật Chất Sử Dụng Trong Phòng
          </h2>
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
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
              <table className="w-full divide-y divide-gray-200 table-auto">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Tên Thiết Bị
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Lô
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Số Lượng
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Ngày Nhập
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Hành Động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {facilities.map((item, index) => (
                    <tr key={item.usingFacilityId} className="hover:bg-gray-50 transition duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {item.facilityTitle || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.batchNumber || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.quantity || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {format(new Date(item.importDate), "dd/MM/yyyy HH:mm:ss")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setFacilityToDelete(item);
                            setDeleteModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors text-sm font-medium"
                        >
                          <Trash2 size={16} />
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4">
              {facilities.map((item, index) => (
                <div
                  key={item.usingFacilityId}
                  className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm text-gray-700">
                        #{index + 1}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Tên Thiết Bị:</span>{" "}
                      <span className="font-semibold text-gray-900">{item.facilityTitle || "N/A"}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Lô:</span>{" "}
                      {item.batchNumber || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Số Lượng:</span>{" "}
                      {item.quantity || 0}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Ngày Nhập:</span>{" "}
                      {item.importDate
                        ? format(new Date(item.importDate), "dd/MM/yyyy HH:mm:ss")
                        : "N/A"}
                    </p>
                    <div className="flex justify-center mt-3">
                      <button
                        onClick={() => {
                          setFacilityToDelete(item);
                          setDeleteModal(true);
                        }}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors text-sm font-medium"
                      >
                        <Trash2 size={16} />
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Delete Facility Modal with Status Selection */}
        {deleteModal && facilityToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-11/12 max-w-md space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-red-600">Xóa Thiết Bị</h2>
                <button
                  onClick={() => {
                    setDeleteModal(false);
                    setFacilityToDelete(null);
                    setDeleteQuantity("");
                    setDeleteStatus("1");
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
              <div>
                <label className="block mb-1 font-medium text-sm text-gray-700">
                  Chọn trạng thái khi xóa:
                </label>
                <select
                  value={deleteStatus}
                  onChange={(e) => setDeleteStatus(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="1">Đã sử dụng</option>
                  <option value="2">Hỏng</option>
                </select>
              </div>
              <input
                type="number"
                name="quantity"
                min={1}
                max={facilityToDelete.quantity || 0}
                value={deleteQuantity}
                onChange={handleNumberChange}
                placeholder="VD: 10"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                step="1"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setDeleteModal(false);
                    setFacilityToDelete(null);
                    setDeleteQuantity("");
                    setDeleteStatus("1");
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

        {/* Delete All Confirmation Modal */}
        {deleteAllModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-11/12 max-w-md space-y-4">
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
            <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 w-11/12 max-w-4xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">
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
                  <X size={20} />
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
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>

              {allFacilitiesLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : allFacilitiesError ? (
                <p className="text-center text-red-500 bg-red-50 p-4 rounded-lg">
                  {allFacilitiesError}
                </p>
              ) : filteredFacilities.length === 0 ? (
                <p className="text-center text-gray-500 bg-gray-50 p-4 rounded-lg">
                  Không tìm thấy thiết bị nào.
                </p>
              ) : (
                <>
                  {/* Desktop Table View in Modal */}
                  <div className="hidden sm:block bg-white shadow-lg rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tên Thiết Bị
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lô
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Số Lượng Khả Dụng
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ngày Nhập
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trạng Thái
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredFacilities.map((faci) => (
                          <tr
                            key={`${faci.facilityId}-${faci.batchNumber}-${faci.importDate}-${faci.status}`}
                            onClick={() => setSelectedFacility(faci)}
                            className={`cursor-pointer hover:bg-orange-50 transition ${selectedFacility?.facilityId === faci.facilityId &&
                                selectedFacility?.batchNumber === faci.batchNumber &&
                                selectedFacility?.importDate === faci.importDate &&
                                selectedFacility?.status === faci.status
                                ? "bg-orange-100"
                                : ""
                              }`}
                          >
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {faci.facilityName}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {faci.batchNumber}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {faci.quantity}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(faci.importDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {faci.status === 0 ? "Chưa sử dụng" : "Đã sử dụng"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View in Modal */}
                  <div className="block sm:hidden space-y-4">
                    {filteredFacilities.map((faci) => (
                      <div
                        key={`${faci.facilityId}-${faci.batchNumber}-${faci.importDate}-${faci.status}`}
                        onClick={() => setSelectedFacility(faci)}
                        className={`border rounded-lg p-4 shadow-sm hover:bg-orange-50 transition-colors cursor-pointer ${selectedFacility?.facilityId === faci.facilityId &&
                            selectedFacility?.batchNumber === faci.batchNumber &&
                            selectedFacility?.importDate === faci.importDate &&
                            selectedFacility?.status === faci.status
                            ? "bg-orange-100"
                            : ""
                          }`}
                      >
                        <div className="flex flex-col gap-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Tên Thiết Bị:</span>{" "}
                            {faci.facilityName}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Lô:</span> {faci.batchNumber}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Số Lượng Khả Dụng:</span>{" "}
                            {faci.quantity}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Ngày Nhập:</span>{" "}
                            {new Date(faci.importDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Trạng Thái:</span>{" "}
                            {faci.status === 0 ? "Chưa sử dụng" : "Đã sử dụng"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
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
                    onChange={handleQuantityChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="VD: 10"
                    step="1"
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
                  {addFacilityLoading
                    ? "Đang thêm..."
                    : `Thêm vào ${entityType === "area" ? "khu vực" : "phòng"}`}
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