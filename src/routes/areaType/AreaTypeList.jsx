import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { fetchAreaTypes, deleteAreaType } from "../../redux/slices/AreaType";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
  Eye,
  PencilLine,
  Trash2,
  PlusCircle,
  Map,
  Filter,
  Search,
} from "lucide-react";
import { Tooltip } from "react-tooltip";
import { FaSpinner } from "react-icons/fa";

const AreaTypeList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { areaTypes, loading } = useSelector((state) => state.areaTypes);

  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const areaTypesPerPage = 5;

  // Lọc danh sách loại khu vực theo trạng thái và từ khóa tìm kiếm
  const filteredAreaTypes = useMemo(() => {
    if (!Array.isArray(areaTypes)) return [];
    return areaTypes.filter(
      (type) =>
        (statusFilter === "All"
          ? true
          : type.isDeleted === (statusFilter === "Đã xóa")) &&
        type.areaTypeName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [areaTypes, statusFilter, searchQuery]);

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredAreaTypes.length / areaTypesPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Lấy danh sách loại khu vực hiện tại theo trang
  const currentAreaTypes = filteredAreaTypes.slice(
    (currentPage - 1) * areaTypesPerPage,
    currentPage * areaTypesPerPage
  );

  useEffect(() => {
    dispatch(fetchAreaTypes());
  }, [dispatch]);

  // Xử lý xóa loại khu vực
  const handleDelete = async (areaTypeId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa loại khu vực này?")) {
      try {
        await dispatch(deleteAreaType(areaTypeId)).unwrap();
        toast.success("Xóa loại khu vực thành công");
        dispatch(fetchAreaTypes());
      } catch (err) {
        toast.error("Lỗi khi xóa loại khu vực: " + err);
      }
    }
  };

  // Chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  
    // hiển thị thông báo tạo thành công
    const location = useLocation();
    useEffect(() => {
      if (location.state?.successMessage) {
        toast.success(location.state.successMessage);
  
        // Xóa state sau khi hiển thị toast để tránh hiển thị lại khi refresh
        window.history.replaceState({}, document.title);
      }
    }, [location]);

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <Tooltip id="action-tooltip" />
      <div className="w-full border border-gray-600 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <Map className="h-6 w-6 text-blue-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Danh Sách Loại Khu Vực
            </h2>
          </div>
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            onClick={() => navigate("/dashboard/areaType/create")}
          >
            <PlusCircle className="h-5 w-5" />
            <span>Thêm Loại Khu Vực</span>
          </button>
        </div>

        {/* Search & Filter Section */}
        <div className="mb-6 flex justify-between items-center rounded-lg shadow shadow-gray-400 p-4">
          {/* Search Input */}
          <div className="relative w-full sm:w-1/2 lg:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên"
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2  text-sm sm:text-base shadow-sm"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-500" />
            <span className="font-medium text-sm sm:text-base">
              Lọc theo trạng thái
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-300 bg-gray-100 text-gray-800"
            >
              <option value="All">Tất Cả</option>
              <option value="Hoạt động">Hoạt Động</option>
              <option value="Đã xóa">Đã Xóa</option>
            </select>
          </div>
        </div>

        {/* Hiển thị danh sách loại khu vực */}
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <FaSpinner className="animate-spin text-blue-500 w-6 h-6 mr-2" />
            <p className="text-blue-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b bg-blue-500 text-white">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Tên Loại</th>
                    <th className="p-3">Hình Ảnh</th>
                    <th className="p-3">Giá</th>
                    <th className="p-3 text-center">Trạng Thái</th>
                    <th className="p-3 text-center">Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAreaTypes.map((type, index) => (
                    <tr
                      key={type.areaTypeId}
                      className="border-b hover:bg-gray-100"
                    >
                      <td className="p-3">
                        {(currentPage - 1) * areaTypesPerPage + index + 1}
                      </td>
                      <td className="p-3">{type.areaTypeName}</td>
                      <td className="p-3 flex gap-2 items-center">
                        {type.images?.slice(0, 3).map((img, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={`/assets/${img}`}
                            alt={`Image ${imgIndex + 1}`}
                            className="w-14 h-14 object-cover rounded-md shadow"
                          />
                        ))}
                        {type.images?.length > 3 && (
                          <span className="text-gray-500">
                            + {type.images.length - 3} ảnh
                          </span>
                        )}
                      </td>
                      <td className="p-3">{type.price} VNĐ</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            type.isDeleted
                              ? "bg-red-200 text-red-700"
                              : "bg-green-200 text-green-700"
                          }`}
                        >
                          {type.isDeleted ? "Không hoạt động" : "Đang hoạt động"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center items-center gap-x-3">
                          <button
                            onClick={() =>
                              navigate(`/dashboard/areaType/${type.areaTypeId}`)
                            }
                            className="text-blue-500 hover:text-blue-700 transition"
                          >
                            <Eye size={22} />
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/areaType/update/${type.areaTypeId}`
                              )
                            }
                            className="text-yellow-500 hover:text-yellow-700 transition"
                          >
                            <PencilLine size={22} />
                          </button>
                          <button
                            onClick={() => handleDelete(type.areaTypeId)}
                            className="text-red-500 hover:text-red-700 transition"
                          >
                            <Trash2 size={22} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 mx-1 bg-gray-300 rounded"
              >
                &laquo;
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-4 py-2 mx-1 ${
                    currentPage === i + 1
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 mx-1 bg-gray-300 rounded"
              >
                &raquo;
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AreaTypeList;
