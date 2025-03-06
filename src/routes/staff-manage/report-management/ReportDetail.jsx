import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTheme } from "../../../hooks/use-theme";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ReportDetail = () => {
  const { id } = useParams(); // Lấy ID báo cáo từ URL
  const theme = useTheme();
  const [report, setReport] = useState(null);
  const [user, setUser] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchReportDetail = async () => {
      try {
        // 🟢 1. Fetch report
        const reportRes = await fetch(`http://localhost:5000/reports/${id}`);
        const reportData = await reportRes.json();
        if (!reportData) throw new Error("Không tìm thấy báo cáo!");

        setReport(reportData);

        // 🟢 2. Fetch user (người gửi báo cáo)
        const userRes = await fetch(`http://localhost:5000/users/${reportData.userId}`);
        const userData = await userRes.json();
        setUser(userData);

        // 🟢 3. Fetch booking (liên quan đến báo cáo)
        const bookingRes = await fetch(`http://localhost:5000/bookings/${reportData.bookingId}`);
        const bookingData = await bookingRes.json();
        setBooking(bookingData);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu báo cáo:", error);
        toast.error("Không thể tải dữ liệu báo cáo!");
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetail();
  }, [id]);

  if (loading) return <p className="text-center text-lg font-bold">Đang tải dữ liệu...</p>;
  if (!report) return <p className="text-red-500 text-center">Không tìm thấy báo cáo!</p>;

  return (
    <div className={`flex justify-center items-center min-h-screen p-6 ${theme === "dark" ? "bg-black text-white" : ""}`}>
      <ToastContainer />
      <div className="w-full max-w-2xl border p-6 rounded-lg shadow-lg dark:bg-gray-900">
        
        {/* Header */}
        <h2 className="text-2xl font-bold mb-4 text-center">Chi tiết báo cáo</h2>

        {/* Người báo cáo */}
        <div className="flex items-center gap-4 mb-6">
          <img src={user?.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
          <div>
            <p className="text-lg font-bold">{user?.fullName || "Unknown"}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Email: {user?.email || "N/A"}</p>
          </div>
        </div>

        {/* Thông tin báo cáo */}
        <div className="text-sm space-y-2">
          <p><strong>Mã Báo Cáo:</strong> {report.id}</p>
          <p><strong>Mô Tả:</strong> {report.reportDescription || "Không có mô tả"}</p>
          <p><strong>Ngày Tạo:</strong> {new Date(report.createdDate).toLocaleDateString("vi-VN")}</p>

          {/* Thông tin đặt chỗ */}
          {booking && (
            <>
              <h3 className="text-lg font-bold mt-4">Thông tin đặt chỗ</h3>
              <p><strong>Mã Đặt Chỗ:</strong> {booking.id}</p>
              <p><strong>Ngày Đặt:</strong> {new Date(booking.createdDate).toLocaleDateString("vi-VN")}</p>
              <p><strong>Giá:</strong> ${booking.price}</p>
            </>
          )}
        </div>

        {/* Nút Quay lại */}
        <div className="flex justify-between mt-6">
          <Link to="/manage/reports" className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Quay lại
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
