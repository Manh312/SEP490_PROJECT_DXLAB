import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkinBookingDetail, checkoutBookingDetail, fetchBookingDetailById } from "../../../redux/slices/BookingHistory";
import { createReport } from "../../../redux/slices/Report";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from "date-fns";

const BookingDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookingDetail: booking, loading } = useSelector((state) => state.bookingHistory);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingDetailId, setSelectedBookingDetailId] = useState(null);
  const [reportDescription, setReportDescription] = useState("");
  const [facilityQuantity, setFacilityQuantity] = useState(0);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchBookingDetailById(id));
  }, [dispatch, id]);

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
        bookingDetailId: selectedBookingDetailId,
        reportDescription,
        facilityQuantity,
      };

      await dispatch(createReport(reportData)).unwrap();
      toast.success("Tạo báo cáo thành công!");
      setIsModalOpen(false);
      setSelectedBookingDetailId(null);
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
              <p className="text-lg font-medium">{format(new Date(booking.bookingCreatedDate), "dd/MM/yyyy HH:mm:ss")}</p>
            </div>
            <div>
              <p className="text-sm">Tổng Tiền</p>
              <p className="text-lg font-medium">{booking.totalPrice} DXL</p>
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
                  <p className="text-base font-medium">{format(new Date(detail.checkinTime), "dd/MM/yyyy HH:mm:ss")}</p>
                </div>
                <div>
                  <p className="text-sm">Thời Gian Check-out</p>
                  <p className="text-base font-medium">{format(new Date(detail.checkoutTime), "dd/MM/yyyy HH:mm:ss")}</p>
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
              <div className="flex justify-end mt-4 space-x-2">
                {/* Check-in button for unprocessed slots */}
                {detail.status === 0 && (
                  <button
                    onClick={() => handleCheckin(detail.bookingDetailId)}
                    className="bg-orange-500 hover:bg-orange-600 cursor-pointer text-white px-5 py-2 rounded-lg transition-all"
                  >
                    Check-in
                  </button>
                )}
                {/* Check-out button for checked-in slots */}
                {detail.status === 1 && (
                  <button
                    onClick={() => handleCheckout(detail.bookingDetailId)}
                    className="bg-green-500 hover:bg-green-600 cursor-pointer text-white px-5 py-2 rounded-lg transition-all"
                  >
                    Check-out
                  </button>
                )}
                {/* Tạo báo cáo button for checked-out slots */}
                {detail.status === 2 && (
                  <button
                    onClick={() => {
                      setSelectedBookingDetailId(detail.bookingDetailId);
                      setIsModalOpen(true);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base transition-all"
                  >
                    Tạo báo cáo
                  </button>
                )}
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
        </div>
      </div>

      {/* Modal Tạo Báo Cáo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 backdrop-blur-xs bg-white/20 flex items-center justify-center px-4">
          <div className="w-full bg-gray-400 max-w-lg rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Tạo Báo Cáo</h3>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
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
                      Mã Báo Cáo
                    </label>
                    <div className="p-3 bg-gray-100 rounded-lg text-sm text-gray-800">
                      #{selectedBookingDetailId}
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
                      setSelectedBookingDetailId(null);
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