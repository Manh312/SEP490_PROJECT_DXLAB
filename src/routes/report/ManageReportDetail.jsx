import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ClipboardList } from "lucide-react";

const ManageReportDetail = () => {
  const { id } = useParams();
  const { reports, loading, error } = useSelector((state) => state.reports);
  const [report, setReport] = useState(null);

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

  useEffect(() => {
    if (reports) {
      const selectedReport = reports.find((r) => r.reportId === parseInt(id));
      if (selectedReport) {
        setReport(selectedReport);
      }
    }
  }, [id, reports]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen px-4">
        <p className="text-lg sm:text-xl font-semibold text-gray-600 animate-pulse text-center">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen px-4">
        <p className="text-red-500 text-lg sm:text-xl font-semibold text-center">
          Lỗi: {error}
        </p>
      </div>
    );
  if (!report)
    return (
      <div className="flex justify-center items-center h-screen px-4">
        <p className="text-red-500 text-lg sm:text-xl font-semibold text-center">
          Không tìm thấy báo cáo!
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 transform transition-all duration-300 hover:shadow-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-center mb-6 sm:mb-8">
          <ClipboardList className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600 mb-4 sm:mb-0 sm:mr-3" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
            Chi Tiết Báo Cáo RP-{report.reportId}
          </h2>
        </div>

        {/* Report Information */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 border-b border-gray-200 pb-2">
            Thông Tin Báo Cáo
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 text-gray-600 text-sm sm:text-base">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-medium sm:w-36 mb-1 sm:mb-0">Mã Báo Cáo:</span>
              <span>RP-{report.reportId}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-medium sm:w-36 mb-1 sm:mb-0">Tên Nhân Viên:</span>
              <span>{report.staffName || "N/A"}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-medium sm:w-36 mb-1 sm:mb-0">Ngày Tạo:</span>
              <span>{formatDate(report.createdDate)}</span>
            </div>
          </div>
        </div>

        {/* Related Information */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 border-b border-gray-200 pb-2">
            Thông Tin Liên Quan
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 text-gray-600 text-sm sm:text-base">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-medium sm:w-36 mb-1 sm:mb-0">Mã Đặt Chỗ:</span>
              <span>DXL-{report.bookingDetailId || "N/A"}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-medium sm:w-36 mb-1 sm:mb-0">Vị Trí:</span>
              <span>{report.position || "N/A"}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-medium sm:w-36 mb-1 sm:mb-0">Khu Vực:</span>
              <span>{report.areaName || "N/A"}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-medium sm:w-36 mb-1 sm:mb-0">dịch vụ:</span>
              <span>{report.areaTypeName || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-end">
          <Link
            to="/dashboard/report"
            className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 transition-colors duration-200 text-sm sm:text-base"
          >
            Quay Lại
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ManageReportDetail;