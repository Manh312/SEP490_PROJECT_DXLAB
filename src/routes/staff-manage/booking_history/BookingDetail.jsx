import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookingDetailById } from "../../../redux/slices/BookingHistory";

const BookingDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { bookingDetail: booking, loading, error } = useSelector((state) => state.bookingHistory);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 min-h-screen">
        <p className="text-orange-500 font-medium text-lg">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-6 min-h-screen">
        <p className="text-red-500 text-lg">Lỗi: {error}</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center py-6 min-h-screen">
        <p className="text-red-500 text-lg">Không tìm thấy chi tiết đặt chỗ!</p>
      </div>
    );
  }

  return (
    <div className={`py-6 px-4 sm:px-6 lg:px-8 min-h-screen`}>
      <div className="max-w-3xl mx-auto border rounded-xl shadow-lg p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl sm:text-3xl font-bold">Chi Tiết Đặt Chỗ #{booking.bookingId}</h2>
          </div>
        </div>

        {/* Booking Overview */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 ">Thông Tin Đặt Chỗ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg">
            <div>
              <p className="text-sm ">Tên Người Đặt</p>
              <p className="text-lg font-medium">{booking.userName}</p>
            </div>
            <div>
              <p className="text-sm">Email</p>
              <p className="text-lg font-medium">{booking.userEmail}</p>
            </div>
            <div>
              <p className="text-sm">Ngày Đặt</p>
              <p className="text-lg font-medium">{formatDateTime(booking.bookingCreatedDate)}</p>
            </div>
            <div>
              <p className="text-sm">Tổng Tiền</p>
              <p className="text-lg font-medium text-green-500 dark:text-green-400">{booking.totalPrice} DXLAB Coin</p>
            </div>
          </div>
        </div>

        {/* Booking Slots */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Chi Tiết Slot</h3>
          {booking.details.map((detail) => (
            <div
              key={detail.bookingDetailId}
              className="mb-6 p-4 rounded-lg shadow-sm border"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-medium">Slot #{detail.slotNumber}</h4>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                    detail.status === 0 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {detail.status === 0 ? "Chưa xử lý" : "Đã xử lý"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm">Thời Gian Check-in</p>
                  <p className="text-base font-medium">{formatDateTime(detail.checkinTime)}</p>
                </div>
                <div>
                  <p className="text-sm">Thời Gian Check-out</p>
                  <p className="text-base font-medium">{formatDateTime(detail.checkoutTime)}</p>
                </div>
                <div>
                  <p className="text-sm">Vị Trí</p>
                  <p className="text-base font-medium">{detail.position}</p>
                </div>
                <div>
                  <p className="text-sm">Khu Vực</p>
                  <p className="text-base font-medium">{detail.areaName} - {detail.areaTypeName}</p>
                </div>
                <div>
                  <p className="text-sm">Phòng</p>
                  <p className="text-base font-medium">{detail.roomName}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-8 flex justify-center">
          <Link
            to="/manage"
            className="bg-orange-500 hover:bg-orange-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <span>Quay Lại</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;