import { useParams, Link } from "react-router-dom";
import { bookingDetailData, slots, areas } from "../../../constants";
import { useTheme } from "../../../hooks/use-theme";

const BookingDetail = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const theme = useTheme();
  
  const booking = bookingDetailData.find((b) => b.bookingId === id);
  const slot = slots.find((s) => s.id === booking.slotId);
  const area = areas.find((a) => a.id === booking.areaId);

  if (!booking) {
    return <p className="text-red-500 text-center">Không tìm thấy chi tiết đặt chỗ!</p>;
  }

  return (
    <div className={`flex justify-center items-center min-h-screen p-6 ${theme === "dark" ? "bg-black text-white" : ""}`}>
      <div className="w-full max-w-2xl border p-6 rounded-lg shadow-lg bg-white dark:bg-gray-900">
        
        {/* Header */}
        <h2 className="text-2xl font-bold mb-4 text-center">Chi tiết đặt chỗ</h2>

        {/* User Info */}
        <div className="flex items-center gap-4 mb-6">
          <img src={booking.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
          <div>
            <p className="text-lg font-bold">{booking.fullName}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Số điện thoại: {booking.phoneNumber}</p>
          </div>
        </div>

        {/* Booking Info */}
        <div className="text-sm space-y-2">
          <p><strong>Mã Booking:</strong> {booking.bookingId}</p>
          <p><strong>Mã Chi Tiết:</strong> {booking.bookingDetailId}</p>
          <p><strong>User ID:</strong> {booking.userId}</p>
          <p><strong>Check-in:</strong> {booking.checkinTime}</p>
          <p><strong>Check-out:</strong> {booking.checkoutTime}</p>
          <p><strong>Giá:</strong> ${booking.price}</p>

          {/* Slot, Position, Area, Room */}
          <p><strong>Slot:</strong> {slot ? slot.name : "Unknown Slot"}</p>
          <p><strong>Position:</strong> {booking.positionName}</p>
          <p><strong>Area:</strong> {area ? area.name : "Unknown Area"}</p>
          <p><strong>Room:</strong> {booking.roomName} (ID: {booking.roomId})</p>

          {/* Status */}
          <p>
            <strong>Trạng thái:</strong>{" "}
            <span
              className={`px-3 py-1 rounded-lg text-white text-sm ${
                booking.status === "Confirmed"
                  ? "bg-green-500"
                  : booking.status === "Pending"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            >
              {booking.status}
            </span>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <Link to="/manage" className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Quay lại
          </Link>
          <div className="flex gap-4">
            {booking.status === "Confirmed" ? (
              <>
                <button className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                  Check-in
                </button>
                <button className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                  Check-out
                </button>
              </>
            ) : booking.status === "Pending" ? (
              <button className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg">
                Xác nhận đơn đặt
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
