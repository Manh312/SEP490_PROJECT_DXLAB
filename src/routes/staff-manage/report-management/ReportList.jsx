import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Eye, ClipboardList } from "lucide-react";
import debounce from "lodash/debounce";
import { useDispatch, useSelector } from "react-redux";
import { fetchStaffReport, resetReports } from "../../../redux/slices/Report";
import { FaSpinner } from "react-icons/fa";
import Pagination from "../../../hooks/use-pagination";

const ReportList = () => {
  const dispatch = useDispatch();
  const { staffReport, loading, error } = useSelector((state) => state.reports);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const reportsPerPage = 5; // Number of reports displayed per page

  // Debounce search
  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300);

  // Fetch staff reports via API
  useEffect(() => {
    dispatch(fetchStaffReport());

    // Reset state when component unmounts
    return () => {
      dispatch(resetReports());
    };
  }, [dispatch]);

  // Filter reports based on search term
  const filteredReports = useMemo(() => {
    let result = Array.isArray(staffReport) ? staffReport : [];
    if (error || !staffReport) {
      return []; // Return empty array if there's an error or no data
    }
    if (searchTerm) {
      result = result.filter((report) =>
        (report.reportId || "")
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (report.bookingDetailId || "")
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (report.areaName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.staffName || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [staffReport, searchTerm, error]);

  // Reset currentPage when the report list is empty or invalid
  useEffect(() => {
    if (filteredReports.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    } else if (currentPage > Math.ceil(filteredReports.length / reportsPerPage)) {
      setCurrentPage(Math.max(1, Math.ceil(filteredReports.length / reportsPerPage)));
    }
  }, [filteredReports, currentPage, reportsPerPage]);

  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const displayedReports = filteredReports.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="py-4 px-4 sm:px-6 lg:px-8 mb-10 bg-gray-100 min-h-screen">
      <div className="w-full max-w-6xl mx-auto border border-gray-200 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 bg-white">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <ClipboardList className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
              Danh Sách Báo Cáo Nhân Viên
            </h2>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 p-4 rounded-lg shadow-sm bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo ID, mã đặt chỗ, khu vực, hoặc tên nhân viên"
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base shadow-sm transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
            <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Eye className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm
                ? `Không tìm thấy báo cáo nào khớp với tìm kiếm`
                : `Không có báo cáo nào của nhân viên`}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block border rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-xs sm:text-sm uppercase tracking-wide text-center text-gray-700">#</th>
                    <th className="px-4 py-3 font-semibold text-xs sm:text-sm uppercase tracking-wide text-center text-gray-700">Mã Báo Cáo</th>
                    <th className="px-4 py-3 font-semibold text-xs sm:text-sm uppercase tracking-wide text-center text-gray-700">Mã Đặt Chỗ</th>
                    <th className="px-4 py-3 font-semibold text-xs sm:text-sm uppercase tracking-wide text-center text-gray-700">Khu Vực</th>
                    <th className="px-4 py-3 font-semibold text-xs sm:text-sm uppercase tracking-wide text-center text-gray-700">Tên Nhân Viên</th>
                    <th className="px-4 py-3 font-semibold text-xs sm:text-sm uppercase tracking-wide text-center text-gray-700">Ngày Tạo</th>
                    <th className="px-4 py-3 font-semibold text-xs sm:text-sm uppercase tracking-wide text-center text-gray-700">Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedReports.map((report, index) => (
                    <tr
                      key={report.reportId}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-center text-sm">
                        {(currentPage - 1) * reportsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                          RP-{report.reportId}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        DXL-{report.bookingDetailId || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {report.areaName || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {report.staffName || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {formatDate(report.createdDate)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          to={`/manage/reports/${report.reportId}`}
                          className="inline-flex items-center justify-center bg-orange-100 text-orange-700 hover:bg-orange-200 p-2 rounded-lg transition-colors w-10 h-10"
                        >
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4">
              {displayedReports.map((report, index) => (
                <div
                  key={report.reportId}
                  className="border rounded-lg p-4 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-sm text-gray-700">
                        #{(currentPage - 1) * reportsPerPage + index + 1}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">ID Báo Cáo:</span>{" "}
                        RP-{report.reportId}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Mã Đặt Chỗ:</span>{" "}
                      DXL-{report.bookingDetailId || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Khu Vực:</span>{" "}
                      {report.areaName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Tên Nhân Viên:</span>{" "}
                      {report.staffName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Ngày Tạo:</span>{" "}
                      {formatDate(report.createdDate)}
                    </p>
                    <div className="flex justify-center mt-2">
                      <Link
                        to={`/manage/reports/${report.reportId}`}
                        className="bg-orange-100 text-orange-700 hover:bg-orange-200 p-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                      >
                        <Eye className="w-4 h-4" /> Xem
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportList;