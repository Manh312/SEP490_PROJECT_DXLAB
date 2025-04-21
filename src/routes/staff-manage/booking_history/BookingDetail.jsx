import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkinBookingDetail, checkoutBookingDetail, fetchBookingDetailById } from "../../../redux/slices/BookingHistory";
import { createReport } from "../../../redux/slices/Report";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BookingDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookingDetail: booking, loading } = useSelector((state) => state.bookingHistory);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportDescription, setReportDescription] = useState("");
  const [facilityQuantity, setFacilityQuantity] = useState(0);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchBookingDetailById(id));
  }, [dispatch, id]);

  // Định dạng ngày giờ
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

  // Định dạng ngày hiện tại
  const currentDate = new Date().toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Xử lý check-in
  const handleCheckin = async (detailId) => {
    try {
      const res = await dispatch(checkinBookingDetail(detailId)).unwrap();
      toast.success(res.message);
      dispatch(fetchBookingDetailById(id));
    } catch (err) {
      toast.error(err);
      console.error("Lỗi khi check-in:", err);
    }
  };

  // Xử lý check-out
  const handleCheckout = async (detailId) => {
    try {
      const res = await dispatch(checkoutBookingDetail(detailId)).unwrap();
      toast.success(res.message);
      dispatch(fetchBookingDetailById(id));
    } catch (err) {
      toast.error(err);
      console.error("Lỗi khi check-out:", err);
    }
  };

  // Xử lý khi submit form tạo báo cáo
  const handleSubmitReport = async (e) => {
    e.preventDefault();

    if (!reportDescription.trim()) {
      toast.error("Vui lòng nhập mô tả báo cáo!");
      return;
    }

    setReportLoading(true);
    try {
      const reportData = {
        bookingDetailId: id,
        reportDescription,
        facilityQuantity: facilityQuantity,
      };

      await dispatch(createReport(reportData)).unwrap();
      toast.success("Tạo báo cáo thành công!");
      setIsModalOpen(false);
      setReportDescription("");
      setFacilityQuantity(0);
      navigate(`/manage/reports`);
    } catch (error) {
      toast.error(error || "Không thể tạo báo cáo. Vui lòng thử lại!");
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 min-h-screen">
        <p className="text-orange-500 font-medium text-lg">Đang tải dữ liệu...</p>
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
          <div className="flex items-center justify-between space-x-60">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Chi Tiết Đặt Chỗ: DXL-{booking.bookingId}
            </h2>
          </div>

          {/* Nút Tạo báo cáo – chỉ hiển thị nếu tất cả slot đã checkout */}
          {booking.details.every(detail => detail.status === 2) && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base transition-all"
            >
              Tạo báo cáo
            </button>
          )}
        </div>

        {/* Booking Overview */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Thông Tin Đặt Chỗ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg">
            <div>
              <p className="text-sm">Tên Người Đặt</p>
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
              <p className="text-lg font-medium text-green-500 dark:text-green-400">{booking.totalPrice} DXL</p>
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
                <h4 className="text-lg font-medium">Slot {detail.slotNumber}</h4>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium
                    ${detail.status === 0
                      ? "bg-yellow-100 text-yellow-800"
                      : detail.status === 1
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                >
                  {detail.status === 0
                    ? "Chưa xử lý"
                    : detail.status === 1
                      ? "Đã check-in"
                      : "Đã check-out"}
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

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {/* Back Button */}
          <Link
            to="/manage"
            className="bg-gray-500 hover:bg-gray-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <span>Quay Lại</span>
          </Link>

          {/* Check-in nếu có slot cần check-in */}
          {booking.details.some(detail => detail.status === 0) && (
            <button
              onClick={() => {
                const target = booking.details.find(detail => detail.status === 0);
                if (target) handleCheckin(target.bookingDetailId);
              }}
              className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white px-5 py-2 rounded-lg transition-all"
            >
              Check-in
            </button>
          )}

          {/* Check-out nếu có slot cần check-out */}
          {booking.details.some(detail => detail.status === 1) && (
            <button
              onClick={() => {
                const target = booking.details.find(detail => detail.status === 1);
                if (target) handleCheckout(target.bookingDetailId);
              }}
              className="bg-green-500 hover:bg-green-600 cursor-pointer text-white px-5 py-2 rounded-lg transition-all"
            >
              Check-out
            </button>
          )}
        </div>
      </div>

      {/* Modal Tạo Báo Cáo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 backdrop-blur-xs bg-white/20 flex items-center justify-center px-4">
          <div className="w-full bg-gray-400 max-w-lg  rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Tạo Báo Cáo</h3>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 ">
              {/* Thông tin báo cáo */}
              <div className="mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã Đặt Chỗ
                    </label>
                    <div className="p-3 bg-gray-100 rounded-lg text-sm text-gray-800">
                      #{id}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày Tạo
                    </label>
                    <div className="p-3 bg-gray-100 rounded-lg text-sm text-gray-800">
                      {currentDate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitReport}>
                {/* Nội dung báo cáo */}
                <div className="mb-6">
                  <label
                    htmlFor="reportDescription"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nội Dung Báo Cáo <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="reportDescription"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Nhập nội dung báo cáo..."
                    className="w-full p-4 border border-gray-300 rounded-lg text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-y bg-gray-50 text-black"
                    rows="4"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số Lượng Thiết Bị
                  </label>
                  <input
                    id="facilityQuantity"
                    type="number"
                    value={facilityQuantity}
                    onChange={(e) => setFacilityQuantity(e.target.value)}
                    placeholder="Nhập số lượng thiết bị..."
                    className="w-full p-4 border border-gray-300 rounded-lg text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                    min="0"
                    required
                  />
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setReportDescription("");
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm text-gray-800 transition"
                    disabled={reportLoading}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm transition flex items-center gap-2"
                    disabled={reportLoading}
                  >
                    {reportLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Đang tạo...
                      </>
                    ) : (
                      "Gửi Báo Cáo"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetail;