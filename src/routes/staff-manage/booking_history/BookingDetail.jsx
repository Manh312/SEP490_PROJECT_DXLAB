import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "../../../hooks/use-theme";
import { toast, ToastContainer } from "react-toastify";

const BookingDetail = () => {
  const { id } = useParams(); // Lấy ID booking từ URL
  const theme = useTheme();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportDescription, setReportDescription] = useState("");

  useEffect(() => {
    const fetchBookingDetail = async () => {
      try {
        // 🟢 1. Fetch `bookings` trước để lấy thông tin cơ bản
        const bookingRes = await fetch(
          `http://localhost:5000/bookings?id=${id}`
        );
        const bookingData = await bookingRes.json();
        if (!bookingData.length) throw new Error("Không tìm thấy Booking!");
        const booking = bookingData[0]; // Lấy phần tử đầu tiên

        // 🟢 2. Fetch `bookingdetails` để lấy thông tin vị trí, khu vực, phòng
        const bookingDetailRes = await fetch(
          `http://localhost:5000/bookingdetails?bookingId=${id}`
        );
        const bookingDetailData = await bookingDetailRes.json();
        const bookingDetail = bookingDetailData.length
          ? bookingDetailData[0]
          : {};

        // 🟢 3. Fetch dữ liệu liên quan (user, slot, position, area, room)
        const [userRes, slotRes, positionRes, areaRes, roomRes] =
          await Promise.all([
            fetch(`http://localhost:5000/users?id=${booking.userId}`).then(
              (res) => res.json()
            ),
            fetch(`http://localhost:5000/slots?id=${booking.slotId}`).then(
              (res) => res.json()
            ),
            fetch(
              `http://localhost:5000/positions?id=${bookingDetail.positionId}`
            ).then((res) => res.json()),
            fetch(
              `http://localhost:5000/areas?id=${bookingDetail.areaId}`
            ).then((res) => res.json()),
            fetch(
              `http://localhost:5000/rooms?id=${bookingDetail.roomId}`
            ).then((res) => res.json()),
          ]);

        // 🟢 4. Xử lý dữ liệu (Nếu có, lấy giá trị, không có thì đặt giá trị mặc định)
        const userInfo = userRes.length ? userRes[0] : {};
        const slotInfo = slotRes.length ? slotRes[0] : {};
        const positionInfo = positionRes.length ? positionRes[0] : {};
        const areaInfo = areaRes.length ? areaRes[0] : {};
        const roomInfo = roomRes.length ? roomRes[0] : {};

        // 🟢 5. Gộp toàn bộ dữ liệu vào `booking`
        setBooking({
          ...booking,
          bookingDetailId: bookingDetail.id || "N/A",
          checkinTime: bookingDetail.checkinTime || null,
          checkoutTime: bookingDetail.checkoutTime || null,

          // User Info
          userName: userInfo.fullName || "Unknown User",
          userAvatar: userInfo.avatar || "https://i.pravatar.cc/150",
          phoneNumber: userInfo.phoneNumber || "N/A",

          // Slot Info
          slotName: slotInfo.name || "Unknown Slot",

          // Position, Area, Room Info
          positionName: positionInfo.name || "Unknown Position",
          areaName: areaInfo.name || "Unknown Area",
          areaType: areaInfo.type || "Unknown Type",
          areaDescription: areaInfo.description || "No Description",
          roomName: roomInfo.name || "Unknown Room",
          roomDescription: roomInfo.description || "No Description",
        });

        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết đặt chỗ:", error);
        setLoading(false);
      }
    };

    fetchBookingDetail();
  }, [id]);

  // 🟢 Hàm cập nhật trạng thái Booking (Pending → Confirmed)
  const handleConfirmBooking = async () => {
    try {
      // Cập nhật trạng thái trên server giả lập
      await fetch(`http://localhost:5000/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Confirmed" }),
      });

      // Cập nhật UI
      setBooking((prev) => ({ ...prev, status: "Confirmed" }));

      // Hiển thị thông báo
      toast.success("Đơn đặt đã được xác nhận!");
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      toast.error("Không thể xác nhận đơn đặt!");
    }
  };

  // 🟢 Hàm xử lý Check-in
  const handleCheckIn = async () => {
    try {
      await fetch(
        `http://localhost:5000/bookingdetails/${booking.bookingDetailId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkinTime: new Date().toISOString() }),
        }
      );

      setBooking((prev) => ({
        ...prev,
        checkinTime: new Date().toISOString(),
      }));
      toast.success("Check-in thành công!");
    } catch (error) {
      console.error("Lỗi khi check-in:", error);
      toast.error("Không thể check-in!");
    }
  };

  // 🟢 Hàm xử lý Check-out
  const handleCheckOut = async () => {
    try {
      await fetch(
        `http://localhost:5000/bookingdetails/${booking.bookingDetailId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkoutTime: new Date().toISOString() }),
        }
      );

      setBooking((prev) => ({
        ...prev,
        checkoutTime: new Date().toISOString(),
      }));
      toast.success("Check-out thành công!");
    } catch (error) {
      console.error("Lỗi khi check-out:", error);
      toast.error("Không thể check-out!");
    }
  };

  // Xử lý tạo báo cáo
  const handleCreateReport = async () => {
    if (!reportDescription.trim()) {
      toast.error("Vui lòng nhập mô tả báo cáo!");
      return;
    }

    try {
      await fetch(`http://localhost:5000/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: booking.userId,
          bookingId: booking.id,
          reportDescription,
          createdDate: new Date().toISOString(),
        }),
      });

      toast.success("Báo cáo đã được gửi!");
      setShowReportForm(false);
      setReportDescription("");
    } catch (error) {
      console.error("Lỗi khi tạo báo cáo:", error);
      toast.error("Không thể gửi báo cáo!");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

  if (loading)
    return <p className="text-center text-gray-500">Đang tải dữ liệu...</p>;
  if (!booking)
    return (
      <p className="text-red-500 text-center">
        Không tìm thấy chi tiết đặt chỗ!
      </p>
    );

  return (
    <div
      className={`flex justify-center items-center min-h-screen p-6 ${
        theme === "dark" ? "bg-black text-white" : ""
      }`}
    >
      <ToastContainer />
      <div className="w-full max-w-2xl border p-6 rounded-lg shadow-lg dark:bg-gray-900">
        {/* Header */}
        <h2 className="text-2xl font-bold mb-4 text-center">
          Chi tiết đặt chỗ
        </h2>

        {/* User Info */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={booking.userAvatar}
            alt="Avatar"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <p className="text-lg font-bold">{booking.userName}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Số điện thoại: {booking.phoneNumber}
            </p>
          </div>
        </div>

        {/* Booking Info */}
        <div className="text-sm space-y-2">
          <p>
            <strong>Mã Booking:</strong> {booking.id}
          </p>
          <p>
            <strong>Mã Chi Tiết:</strong> {booking.bookingDetailId}
          </p>
          <p>
            <strong>Ngày tạo:</strong> {formatDate(booking.createdDate)}
          </p>
          <p>
            <strong>Giá:</strong> ${booking.price}
          </p>
          <p>
            <strong>Check-in:</strong>{" "}
            {booking.checkinTime
              ? formatDate(booking.checkinTime)
              : "Chưa check-in"}
          </p>
          <p>
            <strong>Check-out:</strong>{" "}
            {booking.checkoutTime
              ? formatDate(booking.checkoutTime)
              : "Chưa check-out"}
          </p>

          {/* Slot, Position, Area, Room */}
          <p>
            <strong>Slot:</strong> {booking.slotName}
          </p>
          <p>
            <strong>Position:</strong> {booking.positionName}
          </p>
          <p>
            <strong>Area:</strong> {booking.areaName} ({booking.areaType})
          </p>
          <p>
            <strong>Mô tả khu vực:</strong> {booking.areaDescription}
          </p>
          <p>
            <strong>Room:</strong> {booking.roomName}
          </p>
          <p>
            <strong>Mô tả phòng:</strong> {booking.roomDescription}
          </p>

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
          <Link
            to="/manage"
            className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Quay lại
          </Link>
          <div className="flex gap-4">
            {booking.status === "Pending" && (
              <button
                onClick={handleConfirmBooking}
                className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
              >
                Xác nhận đơn đặt
              </button>
            )}
            {!booking.checkinTime && booking.status === "Confirmed" && (
              <button
                onClick={handleCheckIn}
                className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Check-in
              </button>
            )}
            {booking.checkinTime && !booking.checkoutTime && (
              <button
                onClick={handleCheckOut}
                className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Check-out
              </button>
            )}
          </div>
        </div>

        {/* Hiển thị nút "Tạo Báo Cáo" nếu đã check-out */}
        {booking.checkoutTime && !showReportForm && (
          <div className="mt-6 flex justify-center">
            <button onClick={() => setShowReportForm(true)} className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg">
              Tạo Báo Cáo
            </button>
          </div>
        )}

        {/* Hiển thị form tạo báo cáo nếu nhân viên muốn nhập */}
        {showReportForm && (
          <div className="mt-6 border p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
            <h3 className="text-lg font-bold">Nhập báo cáo</h3>
            <textarea
              className="w-full p-2 border rounded mt-2 text-black"
              rows="4"
              placeholder="Nhập mô tả về cơ sở vật chất hư hỏng..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
            />
            <div className="flex gap-4 mt-3">
              <button onClick={handleCreateReport} className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                Gửi Báo Cáo
              </button>
              <button onClick={() => setShowReportForm(false)} className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
                Hủy
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BookingDetail;
