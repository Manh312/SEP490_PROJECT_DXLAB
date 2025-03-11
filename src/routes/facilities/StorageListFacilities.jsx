import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchDeletedFacilities, restoreFacility, deletePermanently } from "../../redux/slices/Facilities";
import { toast, ToastContainer } from "react-toastify";

const StorageListFacilities = () => {
  const dispatch = useDispatch();
  const { deletedFacilities, loading, error } = useSelector((state) => state.facilities);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    dispatch(fetchDeletedFacilities());
  }, [dispatch]);

  const handleRestore = async (facilityId) => {
    setLoadingId(facilityId);
    try {
      await dispatch(restoreFacility(facilityId)).unwrap();
      toast.success("Khôi phục cơ sở vật chất thành công! ✅");
    } catch (err) {
      toast.error("Lỗi khôi phục cơ sở vật chất! ❌");
    }
    setLoadingId(null);
  };

  const handleDeletePermanently = async (facilityId) => {
    setLoadingId(facilityId);
    try {
      await dispatch(deletePermanently(facilityId)).unwrap();
      toast.success("Xóa vĩnh viễn cơ sở vật chất! ❌");
    } catch (err) {
      toast.error("Lỗi xóa vĩnh viễn cơ sở vật chất! ❌");
    }
    setLoadingId(null);
  };

  return (
    <div className="p-6 shadow-xl rounded-lg bg-white max-w-4xl mx-auto">
      <ToastContainer />
      <h2 className="text-2xl font-semibold mb-4">🗑 Danh Sách Cơ Sở Vật Chất Đã Xóa</h2>

      {loading && <p className="text-blue-500">Đang tải dữ liệu...</p>}
      {error && <p className="text-red-500">Lỗi: {error}</p>}

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Tên Cơ Sở</th>
            <th className="px-4 py-2">Vị Trí</th>
            <th className="px-4 py-2">Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {deletedFacilities.length > 0 ? (
            deletedFacilities.map((facility, index) => (
              <tr key={facility.id} className="border-t">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{facility.name}</td>
                <td className="px-4 py-2">{facility.location}</td>
                <td className="px-4 py-2 flex space-x-2">
                  <button
                    onClick={() => handleRestore(facility.id)}
                    disabled={loadingId === facility.id}
                    className={`px-3 py-1 rounded-lg ${
                      loadingId === facility.id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    🔄 {loadingId === facility.id ? "Đang xử lý..." : "Khôi Phục"}
                  </button>
                  <button
                    onClick={() => handleDeletePermanently(facility.id)}
                    disabled={loadingId === facility.id}
                    className={`px-3 py-1 rounded-lg ${
                      loadingId === facility.id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    🗑 {loadingId === facility.id ? "Đang xử lý..." : "Xóa Vĩnh Viễn"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-gray-500 py-4">
                Không có cơ sở vật chất nào bị xóa.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StorageListFacilities;
