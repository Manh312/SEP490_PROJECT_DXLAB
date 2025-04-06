import { useNavigate } from "react-router-dom";
import { MapPin, PlusCircle, Search, Filter, PencilLine, Trash2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import debounce from "lodash/debounce";
import Pagination from "../../hooks/use-pagination";
import { useDispatch, useSelector } from "react-redux"; // Import Redux hooks
import { fetchAllAreaTypeCategories } from "../../redux/slices/AreaCategory"; // Adjust the path to your slice file

const AreaList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get data from Redux store
  const { areaTypeCategories, loading, error } = useSelector((state) => state.areaCategory);


  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const areasPerPage = 5;

  // Fetch area type categories on component mount
  useEffect(() => {
    dispatch(fetchAllAreaTypeCategories());
  }, [dispatch]);

  // Debounced search function
  const debouncedSearch = debounce((value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, 300);

  // Filter and search the list of area type categories
  const filteredAreas = useMemo(() => {
    if (!Array.isArray(areaTypeCategories)) return [];

    let result = areaTypeCategories.filter((area) => {
      if (!area || typeof area !== "object" || !area.categoryId || !area.title) return false;
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Hoạt động" && area.status === 1) || // Adjust `Room` to `status` or the correct field
        (statusFilter === "Không hoạt động" && area.status === 0);
      return matchesStatus;
    });

    if (searchQuery) {
      result = result.filter((area) =>
        area.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [areaTypeCategories, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredAreas.length / areasPerPage);

  const currentAreas = filteredAreas.slice(
    (currentPage - 1) * areasPerPage,
    currentPage * areasPerPage
  );

  const getEmptyStateMessage = () => {
    if (statusFilter === "All") {
      return searchQuery
        ? "Không tìm thấy khu vực nào khớp với tìm kiếm"
        : "Hiện tại không có khu vực nào";
    }
    return searchQuery
      ? `Không tìm thấy khu vực nào thuộc trạng thái "${statusFilter}" khớp với tìm kiếm`
      : `Không có khu vực nào thuộc trạng thái "${statusFilter}"`;
  };

  const getFilterBgClass = () => {
    switch (statusFilter) {
      case "All":
        return "bg-gray-100 text-gray-800";
      case "Hoạt động":
        return "bg-green-100 text-green-800";
      case "Không hoạt động":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <div className="w-full border border-gray-600 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <MapPin className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Danh Sách Loại Khu Vực
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/dashboard/area/create")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              <PlusCircle size={20} />
              <span className="hidden sm:inline">Thêm Loại Khu Vực</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 p-4 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên khu vực"
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 text-sm sm:text-base shadow-sm"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-5 w-5 text-orange-500" />
              <span className="font-medium text-sm sm:text-base">Lọc theo trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full sm:w-auto px-3 py-2 border rounded-lg text-sm sm:text-base ${getFilterBgClass()} shadow-sm`}
              >
                <option value="All">Tất cả</option>
                <option value="Hoạt động">Hoạt động</option>
                <option value="Không hoạt động">Không hoạt động</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading, Error, or Table/Empty State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 text-lg">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        ) : filteredAreas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">{getEmptyStateMessage()}</p>
          </div>
        ) : (
          <>
            {/* Table for Desktop */}
            <div className="hidden md:block border rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b items-center bg-gray-400">
                  <tr>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">#</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Ảnh</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide w-60">Tên Loại Khu Vực</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Mô tả</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide w-50">Trạng Thái</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide w-50">Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAreas.map((area, index) => (
                    <tr key={area.categoryId} className="border-b hover:bg-gray-400 transition-colors">
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {(currentPage - 1) * areasPerPage + index + 1}
                      </td>
                      <td className="px-2 py-3 text-center">
                        {Array.isArray(area.images?.data) && area.images.data.length >= 0 ? (
                          <img src={area.images.data[0]} alt="Ảnh khu vực" className="h-12 w-12 object-cover mx-auto rounded" />
                        ) : (
                          "Không có ảnh"
                        )}
                      </td>

                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">{area.title}</td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">{area.categoryDescription.slice(0, 100)}...</td>
                      <td className="px-2 py-3 md:px-4 md:py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-normal text-xs md:text-sm ${area.status === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                        >
                          {area.status === 1 ? "Hoạt động" : "Không hoạt động"}
                        </span>
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center flex justify-center mt-2 gap-2">
                      <button
                          onClick={() => navigate(`/dashboard/area/update/${area.categoryId}`)}
                          data-tooltip-id="action-tooltip"
                          data-tooltip-content="Cập nhật"
                          className="bg-yellow-100 text-yellow-700 hover:bg-yellow-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <PencilLine className="w-4 h-4" />
                        </button>
                        <button
                          // onClick={() => handleDelete(type.areaTypeId)}
                          data-tooltip-id="action-tooltip"
                          data-tooltip-content="Xóa"
                          className="bg-red-100 text-red-700 hover:bg-red-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="block md:hidden space-y-4">
              {currentAreas.map((area, index) => (
                <div
                  key={area.categoryId}
                  className="border rounded-lg p-3 sm:p-4 shadow-sm hover:bg-gray-500 transition-colors"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-sm">
                        #{(currentPage - 1) * areasPerPage + index + 1}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal ${area.status === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                      >
                        {area.status === 1 ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Tên Loại Khu Vực:</span> {area.title}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Mô tả:</span> {area.categoryDescription.slice(0, 100)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AreaList;