import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { fetchAreaTypes, deleteAreaType } from "../../redux/slices/AreaType";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Eye,
  PencilLine,
  Trash2,
  PlusCircle,
  Map,
  Filter,
  Search,
  Tag,
} from "lucide-react";
import { Tooltip } from "react-tooltip";
import { FaSpinner } from "react-icons/fa";
import Pagination from "../../hooks/use-pagination"; // Giả sử bạn có hook này
import debounce from "lodash/debounce";

const AreaTypeList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { areaTypes, loading } = useSelector((state) => state.areaTypes);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const areaTypesPerPage = 5;

  // Debounced search function
  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300);

  // Lọc danh sách loại khu vực theo trạng thái và từ khóa tìm kiếm
  const filteredAreaTypes = useMemo(() => {
    if (!Array.isArray(areaTypes)) return [];

    let result = areaTypes.filter((type) => {
      if (!type || typeof type !== "object" || !type.areaTypeId || !type.areaTypeName) return false;
      return statusFilter === "All" ? true : (type.isDeleted === (statusFilter === "Đã xóa"));
    });

    if (searchTerm) {
      result = result.filter((type) =>
        type.areaTypeName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return result;
  }, [areaTypes, statusFilter, searchTerm]);

  const totalPages = Math.ceil(filteredAreaTypes.length / areaTypesPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const currentAreaTypes = filteredAreaTypes.slice(
    (currentPage - 1) * areaTypesPerPage,
    currentPage * areaTypesPerPage
  );

  useEffect(() => {
    dispatch(fetchAreaTypes("0"));
  }, [dispatch]);

  // Xử lý xóa loại khu vực
  const handleDelete = async (areaTypeId) => {
    if (!areaTypeId) {
      toast.error("Không thể xóa: ID không hợp lệ!");
      return;
    }
    if (window.confirm("Bạn có chắc chắn muốn xóa loại khu vực này?")) {
      try {
        const res = await dispatch(deleteAreaType(areaTypeId)).unwrap();
        toast.success(res.message || "Xóa loại khu vực thành công");
        dispatch(fetchAreaTypes());
      } catch (err) {
        toast.error(err?.message || "Lỗi khi xóa loại khu vực");
      }
    }
  };

  // Hiển thị thông báo tạo thành công
  const location = useLocation();
  useEffect(() => {
    if (location.state?.successMessage) {
      toast.success(location.state.successMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const getEmptyStateMessage = () => {
    if (statusFilter === "All") {
      return searchTerm
        ? "Không tìm thấy loại khu vực nào khớp với tìm kiếm"
        : "Hiện tại không có loại khu vực nào";
    }
    return searchTerm
      ? `Không tìm thấy loại khu vực nào thuộc trạng thái "${statusFilter}" khớp với tìm kiếm`
      : `Không có loại khu vực nào thuộc trạng thái "${statusFilter}"`;
  };

  const getFilterBgClass = () => {
    switch (statusFilter) {
      case "All":
        return "bg-gray-100 text-gray-800";
      case "Hoạt động":
        return "bg-green-100 text-green-800";
      case "Đã xóa":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <Tooltip id="action-tooltip" />
      <div className="w-full border border-gray-600 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <Tag className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Danh Sách Loại Khu Vực
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/dashboard/areaType/create")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              <PlusCircle className="h-5 w-5" />
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
                placeholder="Tìm kiếm theo tên loại khu vực"
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
                <option value="Đã xóa">Đã xóa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading or Empty State */}
        {loading ? (
          <div className="flex items-center justify-center py-6 mb-200">
            <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
            <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : filteredAreaTypes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Tag className="h-12 w-12 text-gray-400 mb-4" />
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
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Hình Ảnh</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Tên Loại Khu Vực</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Phân Loại</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Giá</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Trạng Thái</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide min-w-[150px]">
                      Hành Động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentAreaTypes.map((type, index) => (
                    <tr key={type.areaTypeId} className="border-b hover:bg-gray-400 transition-colors">
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {(currentPage - 1) * areaTypesPerPage + index + 1}
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center flex justify-center gap-2">
                        {type.images?.slice(0, 3).map((img, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={`https://localhost:9999${img}`}
                            alt={`Image ${imgIndex + 1}`}
                            className="w-32 h-32 object-cover rounded-md shadow"
                          />
                        ))}
                        {type.images?.length > 3 && (
                          <span className="text-gray-500">
                            + {type.images.length - 3} ảnh
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        <Link to={`/dashboard/areaType/${type.areaTypeId}`}>{type.areaTypeName || "N/A"}</Link>
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {`${type.areaCategory === 1 ? "Khu vực cá nhân" : "Khu vực nhóm"}`}
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {`${type.price} DXLAB Coin`}
                      </td>
                      <td className="px-2 py-3 md:px-4 md:py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-normal text-xs md:text-sm ${
                            type.isDeleted ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {type.isDeleted ? "Đã xóa" : "Hoạt động"}
                        </span>
                      </td>
                      <td className="px-2 py-3 md:px-4 md:py-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => navigate(`/dashboard/areaType/update/${type.areaTypeId}`)}
                          data-tooltip-id="action-tooltip"
                          data-tooltip-content="Cập nhật"
                          className="bg-yellow-100 text-yellow-700 hover:bg-yellow-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer flex justify-center"
                        >
                          <PencilLine className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(type.areaTypeId)}
                          data-tooltip-id="action-tooltip"
                          data-tooltip-content="Xóa"
                          className="bg-red-100 text-red-700 hover:bg-red-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="block md:hidden space-y-4">
              {currentAreaTypes.length > 0 ? (
                currentAreaTypes.map((type, index) => (
                  <div
                    key={type.areaTypeId || index}
                    className="border rounded-lg p-3 sm:p-4 shadow-sm hover:bg-gray-500 transition-colors"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-sm">
                          #{(currentPage - 1) * areaTypesPerPage + index + 1}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal ${
                            type.isDeleted ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {type.isDeleted ? "Đã xóa" : "Hoạt động"}
                        </span>
                      </div>
                      <p className="text-sm">
                        <span className="font-medium">Tên Loại:</span> {type.areaTypeName || "N/A"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Giá:</span> {type.price ? `${type.price} VNĐ` : "N/A"}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        <button
                          onClick={() => navigate(`/dashboard/areaType/${type.areaTypeId}`)}
                          className="bg-blue-100 text-blue-700 hover:bg-blue-400 p-2 rounded-lg flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                        >
                          <Eye className="w-4 h-4" /> Xem
                        </button>
                        <button
                          onClick={() => navigate(`/dashboard/areaType/update/${type.areaTypeId}`)}
                          className="bg-yellow-100 text-yellow-700 hover:bg-yellow-400 p-2 rounded-lg flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                        >
                          <PencilLine className="w-4 h-4" /> Cập nhật
                        </button>
                        <button
                          onClick={() => handleDelete(type.areaTypeId)}
                          className="bg-red-100 text-red-700 hover:bg-red-400 p-2 rounded-lg flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                        >
                          <Trash2 className="w-4 h-4" /> Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Map className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">{getEmptyStateMessage()}</p>
                </div>
              )}
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

export default AreaTypeList;