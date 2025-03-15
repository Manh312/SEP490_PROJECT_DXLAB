import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchFacilities, addFacility, moveToStorage } from "../../redux/slices/Facilities";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const FacilitiesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { facilities, loading } = useSelector((state) => state.facilities);
  const [loadingId, setLoadingId] = useState(null); // Theo dõi mục nào đang loading

  useEffect(() => {
    dispatch(fetchFacilities());
  }, [dispatch]);

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const res = await dispatch(addFacility(file)).unwrap();
      toast.success(res.message || "Nhập file Excel thành công! ✅");
      dispatch(fetchFacilities());
    } catch (err) {
      console.error("Lỗi khi nhập file Excel:", err);
      toast.error(err?.message || "Có lỗi xảy ra khi nhập file Excel! ❌");
    }
  };

  const handleSoftDelete = async (id) => {
    try {
      await dispatch(moveToStorage(id)).unwrap();
      toast.success("Đã chuyển vào thùng rác! 🗑");
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      toast.error(err?.message || "Có lỗi xảy ra khi xóa!");
    }
  };
  

  return (
    <div className="relative p-6 shadow-xl rounded-lg bg-white max-w-5xl mx-auto">
      <ToastContainer />
      <div className="absolute top-4 right-4 flex space-x-2">
        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">
          📥 Thêm từ Excel
          <input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} className="hidden" />
        </label>
        <button
          onClick={() => navigate("/dashboard/facilities/storage")}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition"
        >
          🗑 Thùng rác
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-4">🏢 Danh Sách Cơ Sở Vật Chất</h2>

      {loading && <p className="text-blue-500">Đang tải dữ liệu...</p>}

      <div className="mt-4">
        <h3 className="text-lg font-semibold">Tổng số: {facilities.length} mục</h3>
        <div className="border rounded-lg mt-2 max-h-80 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Tên</th>
                <th className="px-4 py-2">Số Lượng</th>
                <th className="px-4 py-2">Trạng Thái</th>
                <th className="px-4 py-2">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((facility, index) => (
                <tr key={facility.id} className="border-t">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{facility.name}</td>
                  <td className="px-4 py-2">{facility.quantity}</td>
                  <td className="px-4 py-2">{facility.status}</td>
                  <td className="px-4 py-2 flex space-x-2">
                    <button
                      onClick={() => handleSoftDelete(facility.id)}
                      disabled={loadingId === facility.id}
                      className={`px-3 py-1 rounded-lg ${
                        loadingId === facility.id
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      🗑 {loadingId === facility.id ? "Đang xử lý..." : "Xóa"}
                    </button>
                    <Link
                      to={`/dashboard/facilities/update/${facility.id}`}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
                    >
                      ✏️ Cập Nhật
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FacilitiesList;
