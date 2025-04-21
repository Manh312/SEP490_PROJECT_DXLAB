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
  LucideAreaChart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Tooltip } from "react-tooltip";
import { FaSpinner } from "react-icons/fa";
import Pagination from "../../hooks/use-pagination";
import debounce from "lodash/debounce";

const AreaTypeList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { areaTypes, loading } = useSelector((state) => state.areaTypes);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [imageIndices, setImageIndices] = useState({}); // State to track current image index for each area type
  const areaTypesPerPage = 5;
  const baseUrl = "https://localhost:9999"; // Base URL for image paths

  // Debounced search function
  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300);

  // Filter area types based on status and search term
  const filteredAreaTypes = useMemo(() => {
    if (!Array.isArray(areaTypes)) return [];

    let result = areaTypes.filter((type) => {
      if (!type || typeof type !== "object" || !type.areaTypeId || !type.areaTypeName) return false;
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Hoạt động" && type.status === 1) ||
        (statusFilter === "Không hoạt động" && type.status === 0);
      return matchesStatus;
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

  // Handle delete area type
  const handleDelete = async (areaTypeId) => {
    if (!areaTypeId) {
      toast.error("Không thể xóa: ID không hợp lệ!");
      return;
    }
    if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
      try {
        const res = await dispatch(deleteAreaType(areaTypeId)).unwrap();
        toast.success(res.message || "Xóa dịch vụ thành công");
        dispatch(fetchAreaTypes());
      } catch (err) {
        toast.error(err?.message || "Lỗi khi xóa dịch vụ");
      }
    }
  };

  // Show success message if redirected after creation
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
        ? "Không tìm thấy dịch vụ nào khớp với tìm kiếm"
        : "Hiện tại không có dịch vụ nào";
    }
    return searchTerm
      ? `Không tìm thấy dịch vụ nào thuộc trạng thái "${statusFilter}" khớp với tìm kiếm`
      : `Không có dịch vụ nào thuộc trạng thái "${statusFilter}"`;
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

  // Function to render the image carousel
  const renderImages = (images, areaTypeId) => {
    const validImages = Array.isArray(images) && images.length > 0 ? images : [];
    if (!validImages.length) {
      return (
        <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded-lg mx-auto">
          <span className="text-gray-500 text-sm">Không có ảnh</span>
        </div>
      );
    }

    const currentIndex = imageIndices[areaTypeId] || 0;

    const prevImage = () => {
      setImageIndices((prev) => ({
        ...prev,
        [areaTypeId]: (currentIndex - 1 + validImages.length) % validImages.length,
      }));
    };

    const nextImage = () => {
      setImageIndices((prev) => ({
        ...prev,
        [areaTypeId]: (currentIndex + 1) % validImages.length,
      }));
    };

    const imageSrc = validImages[currentIndex];
    const displaySrc =
      typeof imageSrc === "string"
        ? imageSrc.startsWith("http")
          ? imageSrc
          : `${baseUrl}${imageSrc}`
        : "/placeholder-image.jpg";

    return (
      <div className="relative w-32 h-32 mx-auto group">
        <img
          src={displaySrc}
          alt={`Area type image ${currentIndex}`}
          className="w-full h-full object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
          onError={(e) => (e.target.src = "/placeholder-image.jpg")}
        />
        {validImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
              {validImages.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full ${idx === currentIndex ? "bg-white" : "bg-gray-400"
                    }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <Tooltip id="action-tooltip" />
      <div className="w-full border border-gray-600 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <LucideAreaChart className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Danh Sách Kiểu Khu Vực
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/dashboard/areaType/create")}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-md"
            >
              <PlusCircle className="h-5 w-5" />
              <span className="hidden sm:inline">Thêm Kiểu Khu Vực</span>
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
                placeholder="Tìm kiếm theo tên kiểu khu vực"
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

        {/* Loading or Empty State */}
        {loading ? (
          <div className="flex items-center justify-center py-6 mb-200">
            <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
            <p className="text-orange-500 text-base sm:text-lg font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : filteredAreaTypes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Map className="h-12 w-12 text-gray-400 mb-4" />
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
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Tên Kiểu Khu Vực</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Phân Loại</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Giá</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Trạng Thái</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAreaTypes.map((type, index) => (
                    <tr key={type.areaTypeId} className="border-b hover:bg-gray-400 transition-colors">
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {(currentPage - 1) * areaTypesPerPage + index + 1}
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {renderImages(type.images, type.areaTypeId)}
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {type.areaTypeName || "N/A"}
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {`${type.areaCategory === 1 ? "Khu vực cá nhân" : "Khu vực nhóm"}`}
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {`${type.price} DXL`}
                      </td>
                      <td className="px-2 py-3 md:px-4 md:py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-normal text-xs md:text-sm ${type.isDeleted ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                            }`}
                        >
                          {type.isDeleted ? "Không hoạt động" : "Hoạt động"}
                        </span>
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        <div className="flex justify-center items-center gap-2 h-full">
                          <button onClick={() => navigate(`/dashboard/areaType/${type.areaTypeId}`)} data-tooltip-id="action-tooltip" data-tooltip-content="Xem chi tiết kiểu khu vực" className="bg-orange-100 text-orange-700 hover:bg-orange-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/dashboard/areaType/update/${type.areaTypeId}`)}
                            data-tooltip-id="action-tooltip"
                            data-tooltip-content="Cập nhật"
                            className="bg-yellow-100 text-yellow-700 hover:bg-yellow-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                          >
                            <PencilLine className="w-4 h-4" />
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
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal ${type.isDeleted ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                            }`}
                        >
                          {type.isDeleted ? "Đã xóa" : "Hoạt động"}
                        </span>
                      </div>
                      {renderImages(type.images, type.areaTypeId)}
                      <p className="text-sm">
                        <span className="font-medium">Tên Loại:</span>{" "}
                        <Link
                          to={`/dashboard/areaType/${type.areaTypeId}`}
                          className="text-orange-500 hover:text-orange-600"
                        >
                          {type.areaTypeName || "N/A"}
                        </Link>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Phân Loại:</span>{" "}
                        {type.areaCategory === 1 ? "Khu vực cá nhân" : "Khu vực nhóm"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Giá:</span>{" "}
                        {type.price ? `${type.price} DXL` : "N/A"}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        <button
                          onClick={() => navigate(`/dashboard/areaType/${type.areaTypeId}`)}
                          className="bg-blue-100 text-blue-700 hover:bg-blue-400 p-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                        >
                          <Eye className="w-4 h-4" /> Xem
                        </button>
                        <button
                          onClick={() => navigate(`/dashboard/areaType/update/${type.areaTypeId}`)}
                          className="bg-yellow-100 text-yellow-700 hover:bg-yellow-400 p-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                        >
                          <PencilLine className="w-4 h-4" /> Cập nhật
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