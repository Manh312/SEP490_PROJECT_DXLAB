import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import { fetchFacilities, addFacilityFromExcel, moveToStorage } from "../../redux/slices/Facilities";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaFileExcel, FaFilter, FaSpinner } from "react-icons/fa";
import { Eye, Package, PlusCircle, Search, Trash2 } from "lucide-react";
import { format } from "date-fns";
import debounce from "lodash/debounce";
import Pagination from "../../hooks/use-pagination";
import { Tooltip } from "react-tooltip"; // Import react-tooltip

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
  const [fileInputKey, setFileInputKey] = useState(Date.now());
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
      setFileInputKey(Date.now());
    } catch (err) {
      toast.error(err?.message);
      setFileInputKey(Date.now());
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

  // Function to determine quality status based on remainingValue
  const getQualityStatus = (facility) => {
    const remainingValue = facility.remainingValue || 0;
    const originalValue = facility.quantity;
    const threshold = originalValue / 10;

    if (remainingValue === 0) {
      return { status: "Hết hạn", class: "bg-red-100 text-red-800" };
    } else if (remainingValue <= threshold) {
      return { status: "Sắp hết hạn", class: "bg-yellow-100 text-yellow-800" };
    } else {
      return { status: "Bình thường", class: "bg-green-100 text-green-800" };
    }
  };

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <div className="w-full border border-gray-600 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <Package className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Danh Sách Cơ Sở Vật Chất
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="relative cursor-pointer bg-orange-500 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
              <FaFileExcel className="h-5 w-5" />
              <span className="hidden sm:inline">Thêm từ Excel</span>
              <input
                key={fileInputKey}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImportExcel}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
            <button
              onClick={() => navigate("/dashboard/facilities/create")}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-md"
            >
              <PlusCircle className="h-5 w-5" />
              <span className="hidden sm:inline">Thêm mới</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 p-4 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo số lô"
                value={searchTerm}
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 text-sm sm:text-base shadow-sm"
              />
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition"
            >
              <FaFilter className="h-5 w-5 mr-2" /> {isFilterOpen ? "Ẩn" : "Hiện"} bộ lọc
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
                  className="mt-1 px-4 py-2 border rounded-lg w-full"
                />
              </div>
              <div>
                <label>Đến:</label>
                <input
                  type="date"
                  name="importDateEnd"
                  value={filters.importDateEnd}
                  onChange={handleFilterChange}
                  className="mt-1 px-4 py-2 border rounded-lg w-full"
                />
              </div>
              <div>
                <label>Ngày hết hạn từ:</label>
                <input
                  type="date"
                  name="expiredDateStart"
                  value={filters.expiredDateStart}
                  onChange={handleFilterChange}
                  className="mt-1 px-4 py-2 border rounded-lg w-full"
                />
              </div>
              <div>
                <label>Đến:</label>
                <input
                  type="date"
                  name="expiredDateEnd"
                  value={filters.expiredDateEnd}
                  onChange={handleFilterChange}
                  className="mt-1 px-4 py-2 border rounded-lg w-full"
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

        {/* Loading or Empty State */}
        {loading ? (
          <div className="flex items-center justify-center py-6 mb-200">
            <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
            <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : filteredFacilities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">Không có dữ liệu để hiển thị</p>
          </div>
        ) : (
          <>
            <p className="text-lg font-semibold text-gray-500 mb-4">
              Tổng số: {filteredFacilities.length} mục (Hiển thị {currentPosts.length} mục)
            </p>

            {/* Table for Desktop */}
            <div className="hidden md:block border rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b items-center bg-gray-400">
                  <tr>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">#</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Số lô</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Tiêu đề</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Giá</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Ngày nhập</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Số lượng</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Ngày hết hạn</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Giá trị còn lại</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Chất lượng</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPosts.map((facility, index) => {
                    const { status, class: statusClass } = getQualityStatus(facility);
                    return (
                      <tr key={facility.id} className="border-b hover:bg-gray-400 transition-colors">
                        <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                          {(currentPage - 1) * postsPerPage + index + 1}
                        </td>
                        <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                          {facility.batchNumber}
                        </td>
                        <td className="px-2 py-3 md:px-3 md:py-4 text-center">{facility.facilityTitle}</td>
                        <td className="px-2 py-3 md:px-3 md:py-4 text-center">{facility.cost}</td>
                        <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                          {format(new Date(facility.importDate), "dd/MM/yyyy")}
                        </td>
                        <td className="px-2 py-3 md:px-3 md:py-4 text-center">{facility.quantity}</td>
                        <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                          {format(new Date(facility.expiredTime), "dd/MM/yyyy")}
                        </td>
                        <td className="px-2 py-3 md:px-3 md:py-4 text-center">{facility.remainingValue || 0}</td>
                        <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full font-normal text-sm ${statusClass}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                          <button
                            onClick={() => navigate(`/dashboard/facilities/${facility.facilityId}`)}
                            data-tooltip-id="action-tooltip"
                            data-tooltip-content="Xem chi tiết cơ sở vật chất"
                            className="bg-orange-100 text-orange-700 ml-2 hover:bg-orange-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Card View for Mobile */}
            <div className="block md:hidden space-y-4">
              {currentPosts.map((facility, index) => {
                const { status, class: statusClass } = getQualityStatus(facility);
                return (
                  <div
                    key={facility.id}
                    className="border rounded-lg p-3 sm:p-4 shadow-sm hover:bg-gray-500 transition-colors"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-sm">
                          #{(currentPage - 1) * postsPerPage + index + 1}
                        </span>
                      </div>
                      <p className="text-sm">
                        <span className="font-medium">Số lô:</span>{" "}
                        <Link
                          to={`/dashboard/facilities/${facility.facilityId}`}
                          className="hover:text-gray-400 transition-colors"
                        >
                          {facility.batchNumber}
                        </Link>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Mô tả:</span> {facility.facilityDescription}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Giá:</span> {facility.cost}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Ngày nhập:</span>{" "}
                        {format(new Date(facility.importDate), "dd/MM/yyyy")}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Số lượng:</span> {facility.quantity}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Ngày hết hạn:</span>{" "}
                        {format(new Date(facility.expiredTime), "dd/MM/yyyy")}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Giá trị còn lại:</span> {facility.remainingValue || 0}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Chất lượng:</span>{" "}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full font-normal text-sm ${statusClass}`}>
                          {status}
                        </span>
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        <button
                          onClick={() => handleSoftDelete(facility.id)}
                          className="bg-red-500 text-white hover:bg-red-400 p-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                        >
                          <Trash2 className="w-4 h-4" /> Xóa mềm
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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

      {/* Add the Tooltip component */}
      <Tooltip id="action-tooltip" />
    </div>
  );
};

export default FacilitiesList;