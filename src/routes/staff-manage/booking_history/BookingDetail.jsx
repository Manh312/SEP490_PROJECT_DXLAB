import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../../hooks/use-theme";
import {
  fetchBookingDetailById,
  checkinBookingDetail,
  checkoutBookingDetail,
} from "../../../redux/slices/BookingHistory";
import { toast } from "react-toastify";

const BookingDetail = () => {
  const { id } = useParams();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { bookingDetail: booking, loading } = useSelector((state) => state.bookingHistory);

  useEffect(() => {
    dispatch(fetchBookingDetailById(id));
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 0:
        return <span className="px-2 py-1 text-sm rounded bg-gray-300 text-gray-800">Chưa xử lý</span>;
      case 1:
        return <span className="px-2 py-1 text-sm rounded bg-blue-200 text-blue-800">Đã check-in</span>;
      case 2:
        return <span className="px-2 py-1 text-sm rounded bg-green-200 text-green-800">Đã check-out</span>;
      default:
        return <span className="px-2 py-1 text-sm rounded bg-red-200 text-red-800">Không rõ</span>;
    }
  };

  const handleCheckin = async (detailId) => {
    try {
      const res = await dispatch(checkinBookingDetail(detailId)).unwrap();
      toast.success(res);
      dispatch(fetchBookingDetailById(id));
    } catch (err) {
      toast.error(err);
    }
  };

  const handleCheckout = async (detailId) => {
    try {
      const res = await dispatch(checkoutBookingDetail(detailId)).unwrap();
      toast.success(res);
      dispatch(fetchBookingDetailById(id));
    } catch (err) {
      toast.error(err);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Đang tải dữ liệu...</p>;
  if (!booking) return <p className="text-red-500 text-center">Không tìm thấy chi tiết đặt chỗ!</p>;

  return (
    <div className={`flex justify-center items-center min-h-screen p-6 ${theme === "dark" ? "bg-black text-white" : ""}`}>
      <div className="w-full max-w-4xl border p-6 rounded-lg shadow-lg dark:bg-gray-900 transition-all">
        <h2 className="text-2xl font-bold mb-6 text-center">Chi tiết đặt chỗ</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div><strong>Mã Booking:</strong> {booking.bookingId}</div>
          <div><strong>Tên người đặt:</strong> {booking.userName}</div>
          <div><strong>Ngày đặt:</strong> {formatDateTime(booking.bookingCreatedDate)}</div>
          <div><strong>Email:</strong> {booking.userEmail}</div>
          <div><strong>Tổng tiền:</strong> {booking.totalPrice} đ</div>
        </div>

        <h3 className="text-xl font-semibold mb-4">Chi tiết các slot:</h3>
        <div className="space-y-6">
          {booking.details.map((detail) => (
            <div
              key={detail.bookingDetailId}
              className="p-4 border rounded-lg dark:bg-gray-800 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><strong>Chi tiết ID:</strong> {detail.bookingDetailId}</div>
                <div><strong>Slot:</strong> {detail.slotNumber}</div>
                <div><strong>Thời gian cần Check-in:</strong> {formatDateTime(detail.checkinTime)}</div>
                <div><strong>Thời gian cần Check-out:</strong> {formatDateTime(detail.checkoutTime)}</div>
                <div><strong>Vị trí:</strong> {detail.position}</div>
                <div><strong>Khu vực:</strong> {detail.areaName}</div>
                <div><strong>Phòng:</strong> {detail.roomName}</div>
                <div><strong>Trạng thái:</strong> {getStatusLabel(detail.status)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          {/* Nút check-in (nếu có slot cần checkin) */}
          {booking.details.some(detail => detail.status === 0) && (
            <button
              onClick={() => {
                const target = booking.details.find(detail => detail.status === 0);
                handleCheckin(target.bookingDetailId);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-md"
            >
              Check-in
            </button>
          )}

          {/* Nút check-out (nếu có slot cần checkout) */}
          {booking.details.some(detail => detail.status === 1) && (
            <button
              onClick={() => {
                const target = booking.details.find(detail => detail.status === 1);
                handleCheckout(target.bookingDetailId);
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-md"
            >
              Check-out
            </button>
          )}

          {/* Nút quay lại */}
          <Link
            to="/manage"
            className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-md inline-block"
          >
            Quay lại
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
