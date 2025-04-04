// ✅ AreaDetail.jsx - Chuẩn hóa hoàn chỉnh với Redux Toolkit

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, X } from "lucide-react";
import {
  fetchFacilitiesByAreaId,
  fetchAllFacilities,
  addFacilityToArea,
  removeFacilityFromArea,
} from "../../redux/slices/Area";
import { toast } from "react-toastify";

const ManageAreaDetail = () => {
  const { areaId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
  
  const [deleteModal, setDeleteModal] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState(null);
  const [deleteQuantity, setDeleteQuantity] = useState("");

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
    if (!selectedFacility || !quantity) return;
  
    const body = {
      facilityId: selectedFacility.facilityId,
      batchNumber: selectedFacility.batchNumber,
      importDate: selectedFacility.importDate,
      quantity: parseInt(quantity),
    };
  
    try {
      const res = await dispatch(addFacilityToArea({ areaId, data: body })).unwrap();
      toast.success(res.message);
      dispatch(fetchFacilitiesByAreaId(areaId));
      setShowModal(false);
      setSelectedFacility(null);
      setQuantity("");
    } catch (error) {
      toast.error( error.message);
    }
  };  

  const handleDeleteFacility = async () => {
    if (!facilityToDelete || !deleteQuantity) return;

    const body = {
      areaId: parseInt(areaId),
      facilityId: facilityToDelete.facilityId,
      quantity: parseInt(deleteQuantity),
      status: 2,
    };

    try {
      const res = await dispatch(removeFacilityFromArea(body)).unwrap();
      toast.success(res.message);
      dispatch(fetchFacilitiesByAreaId(areaId));
      setDeleteModal(false);
      setFacilityToDelete(null);
      setDeleteQuantity("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 mb-20 px-4">
      <div className="mt-6 mb-4 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-orange-500 mb-6 text-center">
          Thiết Bị Trong Khu Vực #{areaId}
        </h2>
        <button
          onClick={openModal}
          className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
        >
          + Thêm Thiết Bị
        </button>
      </div>

      {facilitiesLoading ? (
        <p className="text-center text-orange-500">Đang tải thiết bị...</p>
      ) : facilitiesError ? (
        <p className="text-center text-red-500">{facilitiesError}</p>
      ) : facilities.length === 0 ? (
        <p className="text-center text-gray-500">
          Không có thiết bị nào trong khu vực này.
        </p>
      ) : (
        <ul className="list-disc list-inside space-y-2 border p-4 rounded-lg shadow-md">
          {facilities.map((item) => (
            <li key={item.facilityId} className=" font-medium">
              <span>{item.facilityTitle}</span>
              <button
                onClick={() => {
                  setFacilityToDelete(item);
                  setDeleteModal(true);
                }}
                data-tooltip-id="action-tooltip"
                data-tooltip-content="Xóa thiết bị"
                className="bg-red-100 text-red-700 hover:bg-red-400 p-1.5 ml-2 md:p-2 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
        >
          <ArrowLeft size={20} /> Quay lại danh sách khu vực
        </button>
      </div>

      {/* Modal xóa */}
      {deleteModal && facilityToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs bg-white/20">
          <div className="rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4 bg-gray-100">
            <h2 className="text-xl font-bold text-red-500 text-center">
              Xóa Thiết Bị Khỏi Khu Vực
            </h2>
            <p className="text-center text-gray-700">
              Thiết bị: <strong>{facilityToDelete.facilityTitle}</strong>
            </p>
            <input
              type="number"
              min={1}
              value={deleteQuantity}
              onChange={(e) => setDeleteQuantity(e.target.value)}
              placeholder="Nhập số lượng muốn xóa"
              className="w-full px-4 py-2 border rounded-md shadow-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setDeleteModal(false);
                  setFacilityToDelete(null);
                  setDeleteQuantity("");
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteFacility}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* modal thêm */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs bg-white/20">
          <div className=" rounded-2xl shadow-xl p-6 w-full max-w-3xl space-y-4 max-h-[90vh] overflow-y-auto bg-gray-100">
            <h2 className="text-2xl font-bold text-orange-500 text-center mb-4">
              Chọn Thiết Bị Thêm Vào Khu Vực
            </h2>

            {allFacilitiesLoading ? (
              <p>Đang tải danh sách thiết bị...</p>
            ) : allFacilitiesError ? (
              <p className="text-red-500">{allFacilitiesError}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allFacilities.map((faci) => {
                  return (
                    <div
                      key={faci.facilityId}
                      onClick={() => setSelectedFacility(faci)}
                      className={`border rounded-lg p-4 cursor-pointer transition shadow-sm hover:shadow-md ${
                        selectedFacility?.facilityId === faci.facilityId
                          ? "bg-orange-100 border-orange-500 ring-2 ring-orange-400"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <p className="font-semibold text-lg text-black">{faci.facilityName}</p>
                      <p className="text-sm text-gray-600">Lô: {faci.batchNumber}</p>
                      <p className="text-sm text-gray-600">
                        SL: {faci.quantity} | Ngày Nhập: {new Date(faci.importDate).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedFacility && (
              <div className="mt-4">
                <label className="block mb-1 font-medium text-sm">
                  Nhập số lượng muốn thêm:
                </label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md shadow-sm"
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
                }}
                className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
              >
                Hủy
              </button>

              <button
                disabled={!selectedFacility || !quantity || addFacilityLoading}
                onClick={handleAddFacility}
                className="px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-300"
              >
                {addFacilityLoading ? "Đang thêm..." : "Thêm vào khu vực"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAreaDetail;
