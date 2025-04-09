import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

const ReportDetail = () => {
  const { id } = useParams(); // Lấy ID báo cáo từ URL
  const { staffReport, loading, error } = useSelector((state) => state.reports); // Lấy staffReport từ Redux
  const [report, setReport] = useState(null);

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

  // Lọc báo cáo từ staffReport dựa trên reportId
  useEffect(() => {
    if (staffReport) {
      const selectedReport = staffReport.find((r) => r.reportId === parseInt(id));
      if (selectedReport) {
        setReport(selectedReport);
      } else {
        toast.error("Không tìm thấy báo cáo với ID này!");
      }
    }
  }, [id, staffReport]);

  if (loading) return <p className="text-center text-lg font-bold">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-red-500 text-center">Lỗi: {error}</p>;
  if (!report) return <p className="text-red-500 text-center">Không tìm thấy báo cáo!</p>;

  return (
    <div
      className="flex justify-center items-center mb-20 p-6"
    >
      <div
        className={`w-full max-w-2xl border p-6 rounded-lg shadow-lg `}
      >
        {/* Header */}
        <h2 className="text-3xl font-bold mb-6 text-center">Chi Tiết Báo Cáo RP-{report.reportId}</h2>

        {/* Thông tin báo cáo */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 border-b border-gray-300 pb-2">
            Thông Tin Báo Cáo
          </h3>
          <div className="text-md space-y-2">
            <p>
              <strong>Mã Báo Cáo:</strong> RP-{report.reportId}
            </p>
            <p>
              <strong>Tên Nhân Viên:</strong> {report.staffName || "N/A"}
            </p>
            <p>
              <strong>Ngày Tạo:</strong> {formatDate(report.createdDate)}
            </p>
          </div>
        </div>

        {/* Thông tin liên quan */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 border-b border-gray-300 pb-2">
            Thông Tin Liên Quan
          </h3>
          <div className="text-md space-y-2">
            <p>
              <strong>Mã Đặt Chỗ:</strong> DXL-{report.bookingDetailId || "N/A"}
            </p>
            <p>
              <strong>Vị Trí:</strong> {report.position || "N/A"}
            </p>
            <p>
              <strong>Khu Vực:</strong> {report.areaName || "N/A"}
            </p>
            {/* <p>
              <strong>Loại Khu Vực:</strong> {report.areaType || "N/A"}
            </p> */}
          </div>
        </div>

        {/* Nút Quay lại */}
        <div className="flex justify-end mt-6">
          <Link
            to="/manage/reports"
            className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Quay Lại
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;