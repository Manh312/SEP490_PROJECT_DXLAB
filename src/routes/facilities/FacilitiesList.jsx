import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import { fetchFacilities, addFacilityFromExcel, moveToStorage } from "../../redux/slices/Facilities";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FaPlus, FaFileExcel, FaFilter } from "react-icons/fa";
import { Edit, Search, Trash2 } from "lucide-react";
import { MdChair } from "react-icons/md";
import { format } from "date-fns";
import debounce from "lodash/debounce";
import Pagination from "../../hooks/use-pagination";

const FacilitiesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { facilities, loading } = useSelector((state) => state.facilities);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    importDateStart: "",
    importDateEnd: "",
    expiredDateStart: "",
    expiredDateEnd: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const postsPerPage = 6;

  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300);

  const filteredFacilities = useMemo(() => {
    let result = facilities || [];
    if (searchTerm) {
      result = result.filter((facility) =>
        facility.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filters.importDateStart) {
      result = result.filter(
        (facility) => new Date(facility.importDate) >= new Date(filters.importDateStart)
      );
    }
    if (filters.importDateEnd) {
      result = result.filter(
        (facility) => new Date(facility.importDate) <= new Date(filters.importDateEnd)
      );
    }
    if (filters.expiredDateStart) {
      result = result.filter(
        (facility) => new Date(facility.expiredTime) >= new Date(filters.expiredDateStart)
      );
    }
    if (filters.expiredDateEnd) {
      result = result.filter(
        (facility) => new Date(facility.expiredTime) <= new Date(filters.expiredDateEnd)
      );
    }
    return result;
  }, [facilities, searchTerm, filters]);

  const totalAccounts = Math.ceil(filteredFacilities.length / postsPerPage);
  const currentPosts = useMemo(
    () =>
      filteredFacilities.slice(
        (currentPage - 1) * postsPerPage,
        currentPage * postsPerPage
      ),
    [filteredFacilities, currentPage, postsPerPage]
  );

  useEffect(() => {
    if (currentPage > totalAccounts && totalAccounts > 0) setCurrentPage(totalAccounts);
    else if (totalAccounts === 0) setCurrentPage(1);
  }, [totalAccounts, currentPage]);

  useEffect(() => {
    dispatch(fetchFacilities());
  }, [dispatch]);

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return toast.error("Vui lòng chọn file Excel!");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await dispatch(addFacilityFromExcel(formData)).unwrap();
      toast.success(res.message || "Nhập file Excel thành công!");
      dispatch(fetchFacilities());
      event.target.value = null;
    } catch (err) {
      toast.error(err?.message || "Có lỗi xảy ra khi nhập file Excel!");
    }
  };

  const handleSoftDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn chuyển vào thùng rác?")) return;
    try {
      await dispatch(moveToStorage(id)).unwrap();
      toast.success("Đã chuyển vào thùng rác!");
      dispatch(fetchFacilities());
    } catch (err) {
      toast.error(err?.message || "Có lỗi xảy ra khi xóa!");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ importDateStart: "", importDateEnd: "", expiredDateStart: "", expiredDateEnd: "" });
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="p-4 sm:p-6 shadow-xl border rounded-lg transition-all mt-10 mb-20 mr-0 sm:mr-10">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <MdChair className="h-6 w-6 text-orange-500" />
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Danh Sách Cơ Sở Vật Chất</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="cursor-pointer bg-orange-500 text-white px-3 py-2 rounded-lg shadow hover:bg-orange-700 transition flex items-center">
            <FaFileExcel className="mr-2" /> Thêm từ Excel
            <input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} className="hidden" />
          </label>
          <button
            onClick={() => navigate("/dashboard/facilities/storage")}
            className="bg-gray-600 text-white px-3 py-2 rounded-lg shadow hover:bg-gray-700 transition flex items-center"
          >
            <Trash2 className="mr-2" /> Thùng rác
          </button>
          <button
            onClick={() => navigate("/dashboard/facilities/create")}
            className="bg-yellow-600 text-white px-3 py-2 rounded-lg shadow hover:bg-yellow-700 transition flex items-center"
          >
            <FaPlus className="mr-2" /> Thêm mới
          </button>
        </div>
      </div>

      <div className="mb-6 p-4 rounded-lg shadow-sm">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative w-full sm:w-1/2 lg:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo số lô"
              value={searchTerm}
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 text-gray-400 text-sm sm:text-base shadow-sm"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <FaFilter className="mr-2" /> {isFilterOpen ? "Ẩn" : "Hiện"} bộ lọc
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="mb-6 p-4 border rounded-lg transition-all duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label>Ngày nhập từ:</label>
              <input
                type="date"
                name="importDateStart"
                value={filters.importDateStart}
                onChange={handleFilterChange}
                className="mt-1 px-4 py-2 border rounded-lg w-full bg-gray-400 "
              />
            </div>
            <div>
              <label>Đến:</label>
              <input
                type="date"
                name="importDateEnd"
                value={filters.importDateEnd}
                onChange={handleFilterChange}
                className="mt-1 px-4 py-2 border rounded-lg w-full bg-gray-400 "
              />
            </div>
            <div>
              <label>Ngày hết hạn từ:</label>
              <input
                type="date"
                name="expiredDateStart"
                value={filters.expiredDateStart}
                onChange={handleFilterChange}
                className="mt-1 px-4 py-2 border rounded-lg w-full bg-gray-400 "
              />
            </div>
            <div>
              <label>Đến:</label>
              <input
                type="date"
                name="expiredDateEnd"
                value={filters.expiredDateEnd}
                onChange={handleFilterChange}
                className="mt-1 px-4 py-2 border rounded-lg w-full bg-gray-400 "
              />
            </div>
          </div>
          <button
            onClick={resetFilters}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(postsPerPage)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 animate-pulse rounded"></div>
          ))}
        </div>
      ) : filteredFacilities.length === 0 ? (
        <p className="text-center text-gray-500 py-4">Không có dữ liệu để hiển thị</p>
      ) : (
        <>
          <p className="text-lg font-semibold text-gray-500 mb-4">
            Tổng số: {filteredFacilities.length} mục (Hiển thị {currentPosts.length} mục)
          </p>

          {/* Bảng cho desktop */}
          <div className="hidden md:block overflow-x-auto border rounded-lg">
            <table className="w-full text-left">
              <thead className="bg-gray-400 sticky top-0">
                <tr>
                  <th className="px-3 py-3 font-semibold text-lg uppercase tracking-wide text-center">#</th>
                  <th className="px-3 py-3 font-semibold text-lg uppercase tracking-wide text-center">Số lô</th>
                  <th className="px-3 py-3 font-semibold text-lg uppercase tracking-wide text-center">Mô tả</th>
                  <th className="px-3 py-3 font-semibold text-lg uppercase tracking-wide text-center">Giá</th>
                  <th className="px-3 py-3 font-semibold text-lg uppercase tracking-wide text-center">Ngày nhập</th>
                  <th className="px-3 py-3 font-semibold text-lg uppercase tracking-wide text-center">Số lượng</th>
                  <th className="px-3 py-3 font-semibold text-lg uppercase tracking-wide text-center">Ngày hết hạn</th>
                  <th className="px-3 py-3 font-semibold text-lg uppercase tracking-wide text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentPosts.map((facility, index) => (
                  <tr key={facility.id} className="border-t hover:bg-gray-400 transition-colors">
                    <td className="px-3 py-4 text-center">
                      {(currentPage - 1) * postsPerPage + index + 1}
                    </td>
                    <td className="px-3 py-4 text-center">
                      <Link
                        to={`/dashboard/facilities/${facility.facilityId}`}
                        className="hover:text-neutral-300  transition-colors"
                      >
                        {facility.batchNumber}
                      </Link>
                    </td>
                    <td className="px-3 py-4 text-center">{facility.facilityDescription}</td>
                    <td className="px-3 py-4 text-center">{facility.cost}</td>
                    <td className="px-3 py-4 text-center">
                      {format(new Date(facility.importDate), "dd/MM/yyyy")}
                    </td>
                    <td className="px-3 py-4 text-center">{facility.quantity}</td>
                    <td className="px-3 py-4 text-center">
                      {format(new Date(facility.expiredTime), "dd/MM/yyyy")}
                    </td>
                    <td className="px-3 py-4 flex justify-center gap-2">
                      <button
                        onClick={() => handleSoftDelete(facility.id)}
                        className="bg-red-100 text-red-700 hover:bg-red-400 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <Link
                        to={`/dashboard/facilities/update/${facility.id}`}
                        className="bg-yellow-100 text-yellow-700 hover:bg-yellow-400 p-2 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card view cho mobile */}
          <div className="md:hidden space-y-4">
            {currentPosts.map((facility, index) => (
              <div
                key={facility.id}
                className="border rounded-lg p-4 bg-white shadow-sm hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">
                    #{(currentPage - 1) * postsPerPage + index + 1}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSoftDelete(facility.id)}
                      className="bg-red-100 text-red-700 hover:bg-red-400 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <Link
                      to={`/dashboard/facilities/update/${facility.id}`}
                      className="bg-yellow-100 text-yellow-700 hover:bg-yellow-400 p-2 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
                <div className="mt-2">
                  <p>
                    <strong>Số lô:</strong>{" "}
                    <Link
                      to={`/dashboard/facilities/${facility.facilityId}`}
                      className="hover:text-gray-400 transition-colors"
                    >
                      {facility.batchNumber}
                    </Link>
                  </p>
                  <p><strong>Mô tả:</strong> {facility.facilityDescription}</p>
                  <p><strong>Giá:</strong> {facility.cost}</p>
                  <p><strong>Ngày nhập:</strong> {format(new Date(facility.importDate), "dd/MM/yyyy")}</p>
                  <p><strong>Số lượng:</strong> {facility.quantity}</p>
                  <p><strong>Ngày hết hạn:</strong> {format(new Date(facility.expiredTime), "dd/MM/yyyy")}</p>
                </div>
              </div>
            ))}
          </div>

          {totalAccounts > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalAccounts}
              setCurrentPage={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default FacilitiesList;