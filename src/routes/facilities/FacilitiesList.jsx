import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchFacilities, addFacilityFromExcel, moveToStorage } from "../../redux/slices/Facilities";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FaPlus, FaFileExcel } from "react-icons/fa";
import { Edit, Trash2 } from "lucide-react";
import { MdChair } from 'react-icons/md';
import { Tooltip } from "react-tooltip";

const FacilitiesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { facilities, loading } = useSelector((state) => state.facilities);
  const [loadingId, setLoadingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const totalAccounts = Math.ceil((facilities || []).length / postsPerPage);

  useEffect(() => {
    if (currentPage > totalAccounts && totalAccounts > 0) {
      setCurrentPage(totalAccounts);
    } else if (totalAccounts === 0) {
      setCurrentPage(1);
    }
  }, [totalAccounts, currentPage]);

  const currentPosts = (facilities || []).slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  useEffect(() => {
    dispatch(fetchFacilities());
  }, [dispatch]);

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast.error("Vui lòng chọn file Excel!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await dispatch(addFacilityFromExcel(formData)).unwrap();
      toast.success(res.message || "Nhập file Excel thành công!");
      dispatch(fetchFacilities());
      event.target.value = null;
    } catch (err) {
      console.error("Lỗi khi nhập file Excel:", err);
      toast.error(err?.message || "Có lỗi xảy ra khi nhập file Excel!");
    }
  };

  const handleSoftDelete = async (id) => {
    setLoadingId(id);
    try {
      await dispatch(moveToStorage(id)).unwrap();
      toast.success("Đã chuyển vào thùng rác!");
      dispatch(fetchFacilities());
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      toast.error(err?.message || "Có lỗi xảy ra khi xóa!");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="p-6 shadow-xl border rounded-lg transition-all mt-10 mb-20 mr-10">
      <ToastContainer position="top-right" autoClose={3000} />
      <Tooltip id="action-tooltip" />
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2 mb-4 sm:mb-0">
          <MdChair className="h-6 w-6 text-orange-500" />
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Danh Sách Cơ Sở Vật Chất</h2>
        </div>
        <div className="flex space-x-3">
          <label className="cursor-pointer bg-orange-500 text-white px-4 py-2 rounded-lg shadow hover:bg-orange-700 transition flex items-center">
            <FaFileExcel className="mr-2" /> Thêm từ Excel
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleImportExcel}
              className="hidden"
            />
          </label>
          <button
            onClick={() => navigate("/dashboard/facilities/storage")}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition flex items-center"
          >
            <Trash2 className="mr-2" /> Thùng rác
          </button>
          <button
            onClick={() => navigate("/dashboard/facilities/create")}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-700 transition flex items-center"
          >
            <FaPlus className="mr-2" /> Thêm mới
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <p className="text-orange-500">Đang tải dữ liệu...</p>
        </div>
      ) : (facilities || []).length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Không có dữ liệu để hiển thị</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-500">
              Tổng số: {(facilities || []).length} mục
            </p>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="border-b items-center bg-gray-500">
                <tr>
                  <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">#</th>
                  <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Số lô</th>
                  <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Mô tả cơ sở vật chất</th>
                  <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Giá</th>
                  <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Ngày hết hạn</th>
                  <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Số lượng</th>
                  <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Ngày nhập</th>
                  <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {currentPosts.map((facility, index) => (
                  <tr
                    key={facility.id}
                    className="border-t hover:bg-gray-500 transition-colors"
                  >
                    <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                      {(currentPage - 1) * postsPerPage + index + 1}
                    </td>
                    <td className="px-2 py-3 md:px-4 md:py-4 text-center">
                      <Link
                        to={`/dashboard/facilities/${facility.facilityId}`}
                        className="hover:text-gray-400 transition-colors inline-block"
                      >
                        {facility.batchNumber}
                      </Link>
                    </td>
                    <td className="px-2 py-3 md:px-4 md:py-4 text-center">{facility.facilityDescription}</td>
                    <td className="px-2 py-3 md:px-4 md:py-4 text-center">{facility.cost}</td>
                    <td className="px-2 py-3 md:px-4 md:py-4 text-center">{new Date(facility.expiredTime).toLocaleDateString("vi-VN")}</td>
                    <td className="px-2 py-3 md:px-4 md:py-4 text-center">{facility.quantity}</td>
                    <td className="px-2 py-3 md:px-4 md:py-4 text-center">{new Date(facility.importDate).toLocaleDateString("vi-VN")}</td>
                    <td className="px-2 py-3 justify-center md:px-4 md:py-4 flex gap-2">
                      <button
                        onClick={() => handleSoftDelete(facility.id)}
                        data-tooltip-id="action-tooltip"
                        data-tooltip-content="Xóa mềm"
                        className="bg-red-100 text-red-700 hover:bg-red-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/dashboard/facilities/update/${facility.id}`}
                        data-tooltip-id="action-tooltip"
                        data-tooltip-content="Cập nhật"
                        className="bg-yellow-100 text-yellow-700 hover:bg-yellow-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalAccounts > 1 && (
            <div className="flex justify-center mt-6 flex-wrap gap-2">
              {[...Array(totalAccounts)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 rounded-lg text-sm ${currentPage === index + 1
                    ? "bg-orange-500 text-white"
                    : "bg-gray-200 text-black"
                    }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FacilitiesList;