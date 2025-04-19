import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Eye, ClipboardList } from "lucide-react";
import debounce from "lodash/debounce";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllReports, resetReports } from "../../redux/slices/Report";
import { addNotification } from "../../redux/slices/Notification"; // Để thêm thông báo
import { FaSpinner } from "react-icons/fa";
import Pagination from "../../hooks/use-pagination";
import { startSignalRConnection, stopSignalRConnection } from "../../utils/signalR/connection";
import {registerSignalREvent, unregisterSignalREvent,} from "../../utils/signalR/event"

// Utility để tránh thông báo trùng lặp
const notificationTracker = new Set();

const ManageReportList = () => {
  const dispatch = useDispatch();
  const { reports, loading, error } = useSelector((state) => state.reports);
  const { token } = useSelector((state) => state.auth); // Lấy token để xác thực SignalR
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [signalRError, setSignalRError] = useState(null);
  const reportsPerPage = 5;

  // Debounce tìm kiếm
  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300);

  // Thiết lập SignalR và lấy danh sách báo cáo ban đầu
  useEffect(() => {
    let mounted = true;

    const setupSignalR = async () => {
      try {
        // Khởi tạo kết nối tới reportHub
        await startSignalRConnection("reportHub", token);

        if (mounted) {
          // Đăng ký sự kiện ReceiveNewReport
          registerSignalREvent("reportHub", "ReceiveNewReport", (report) => {
            const notificationKey = `ReceiveNewReport-${report.reportId}`;
            if (!notificationTracker.has(notificationKey)) {
              notificationTracker.add(notificationKey);
              dispatch(
                addNotification({
                  id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                  message: `Báo cáo mới: "${report.reportId}" từ nhân viên "${report.staffName}"!`,
                  type: "info",
                  timestamp: new Date().toISOString(),
                })
              );
              notificationTracker.delete(notificationKey);
            }
            // Cập nhật danh sách báo cáo
            dispatch(fetchAllReports());
          });

          // Lấy danh sách báo cáo ban đầu
          await Promise.all([
            dispatch(fetchAllReports()).unwrap(),
            new Promise((resolve) => setTimeout(resolve, 500)),
          ]);
        }
      } catch (err) {
        console.error("Failed to setup SignalR:", err);
        if (mounted) {
          setSignalRError(`Không thể kết nối SignalR: ${err.message}`);
        }
      } finally {
        if (mounted) {
          setIsInitialLoading(false);
        }
      }
    };

    setupSignalR();

    // Cleanup
    return () => {
      mounted = false;
      unregisterSignalREvent("reportHub", "ReceiveNewReport");
      stopSignalRConnection("reportHub");
      dispatch(resetReports());
    };
  }, [dispatch, token]);

  // Lọc danh sách báo cáo theo tìm kiếm
  const filteredReports = useMemo(() => {
    let result = Array.isArray(reports) ? reports : [];
    if (error || !reports) {
      return [];
    }
    if (searchTerm) {
      result = result.filter(
        (report) =>
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
  }, [reports, searchTerm, error]);

  // Reset currentPage khi danh sách báo cáo trống hoặc không hợp lệ
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

  // Định dạng ngày
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
    <div className="py-4 px-2 sm:px-4 lg:px-6 xl:px-8 mb-10">
      <div className="w-full border border-gray-600 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <ClipboardList className="w-8 h-8 text-orange-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Quản Lý Danh Sách Báo Cáo
            </h2>
          </div>
        </div>

        {/* SignalR Error */}
        {signalRError && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {signalRError}
          </div>
        )}

        {/* Search */}
        <div className="mb-6 p-4 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo ID, mã đặt chỗ, khu vực, hoặc tên nhân viên"
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm sm:text-base shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {(loading || isInitialLoading) ? (
          <div className="flex items-center justify-center py-6 mb-200">
            <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
            <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm
                ? `Không tìm thấy báo cáo nào khớp với tìm kiếm`
                : `Không có báo cáo nào`}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block border rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b bg-gray-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">
                      #
                    </th>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">
                      Mã Báo Cáo
                    </th>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">
                      Mã Đặt Chỗ
                    </th>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">
                      Vị Trí
                    </th>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">
                      Phòng
                    </th>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">
                      Khu Vực
                    </th>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">
                      dịch vụ
                    </th>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">
                      Tên Nhân Viên
                    </th>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">
                      Ngày Tạo
                    </th>
                    <th className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center text-gray-700">
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedReports.map((report, index) => (
                    <tr
                      key={report.reportId}
                      className="border-b hover:bg-gray-500 transition-colors"
                    >
                      <td className="px-4 py-4 text-center">
                        {(currentPage - 1) * reportsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-4 text-center">RP-{report.reportId || "N/A"}</td>
                      <td className="px-4 py-4 text-center">DXL-{report.bookingDetailId || "N/A"}</td>
                      <td className="px-4 py-4 text-center">{report.position || "N/A"}</td>
                      <td className="px-4 py-4 text-center">{report.roomName || "N/A"}</td>
                      <td className="px-4 py-4 text-center">{report.areaName || "N/A"}</td>
                      <td className="px-4 py-4 text-center">{report.areaTypeName || "N/A"}</td>
                      <td className="px-4 py-4 text-center">{report.staffName || "N/A"}</td>
                      <td className="px-4 py-4 text-center">{formatDate(report.createdDate)}</td>
                      <td className="px-4 py-4 text-center">
                        <Link
                          to={`/dashboard/report/${report.reportId}`}
                          className="inline-flex items-center justify-center bg-orange-100 text-orange-700 hover:bg-orange-200 p-2 rounded-lg transition-colors w-10 h-10"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="block md:hidden space-y-4">
              {displayedReports.map((report, index) => (
                <div
                  key={report.reportId}
                  className="border rounded-lg p-4 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm text-gray-700">
                        #{(currentPage - 1) * reportsPerPage + index + 1}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">ID Báo Cáo:</span>{" "}
                      <Link
                        to={`/dashboard/report/${report.reportId}`}
                        className="text-orange-500 hover:text-orange-600"
                      >
                        {report.reportId}
                      </Link>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Mã Đặt Chỗ:</span>{" "}
                      {report.bookingDetailId || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Vị Trí:</span> {report.position || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Khu Vực:</span> {report.areaName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">dịch vụ:</span>{" "}
                      {report.areaTypeName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Tên Nhân Viên:</span>{" "}
                      {report.staffName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Ngày Tạo:</span>{" "}
                      {formatDate(report.createdDate)}
                    </p>
                    <Link
                      to={`/dashboard/report/${report.reportId}`}
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 p-2 rounded-lg flex items-center justify-center w-10 h-10 mt-2 mx-auto"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
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

export default ManageReportList;