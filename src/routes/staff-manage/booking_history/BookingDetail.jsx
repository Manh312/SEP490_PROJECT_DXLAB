import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../../hooks/use-theme";
import { fetchBookingDetailById } from "../../../redux/slices/BookingHistory";

const BookingDetail = () => {
  const { id } = useParams();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { bookingDetail: booking, loading, error } = useSelector((state) => state.bookingHistory);

  useEffect(() => {
    dispatch(fetchBookingDetailById(id));
    // return () => {
    //   dispatch(clearBookingDetail());
    // };
  }, [dispatch, id]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

  if (loading) return <p className="text-center text-gray-500">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-red-500 text-center">Lỗi: {error}</p>;
  if (!booking) return <p className="text-red-500 text-center">Không tìm thấy chi tiết đặt chỗ!</p>;

  return (
    <div className={`flex justify-center items-center min-h-screen p-6 ${theme === "dark" ? "bg-black text-white" : ""}`}>
      <div className="w-full max-w-3xl border p-6 rounded-lg shadow-lg dark:bg-gray-900">
        <h2 className="text-2xl font-bold mb-4 text-center">Chi tiết đặt chỗ</h2>

        <div className="mb-6">
          <p><strong>Mã Booking:</strong> {booking.bookingId}</p>
          <p><strong>Tên người đặt:</strong> {booking.userName}</p>
          <p><strong>Email:</strong> {booking.userEmail} </p>
          <p><strong>Ngày đặt:</strong> {formatDateTime(booking.bookingCreatedDate)}</p>
          <p><strong>Tổng tiền:</strong> ${booking.totalPrice}</p>
        </div>

        <h3 className="text-lg font-bold mb-2">Chi tiết các slot:</h3>
        <div className="space-y-4">
          {booking.details.map((detail) => (
            <div key={detail.bookingDetailId} className="border p-4 rounded-lg bg-white dark:bg-gray-800">
              <p><strong>Chi tiết ID:</strong> {detail.bookingDetailId}</p>
              <p><strong>Slot:</strong> {detail.slotNumber}</p>
              <p><strong>Thời gian cần Check-in:</strong> {formatDateTime(detail.checkinTime)}</p>
              <p><strong>Thời gian cần Check-out:</strong> {formatDateTime(detail.checkoutTime)}</p>
              <p><strong>Vị trí:</strong> {detail.position}</p>
              <p><strong>Khu vực:</strong> {detail.areaName} - {detail.areaTypeName}</p>
              <p><strong>Phòng:</strong> {detail.roomName}</p>
              <p><strong>Trạng thái:</strong> {detail.status === 0 ? "Chưa xử lý" : "Đã xử lý"}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/manage"
            className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Quay lại
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
