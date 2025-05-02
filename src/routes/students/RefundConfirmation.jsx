import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookingHistoryDetail } from "../../redux/slices/Booking";
import { ArrowLeft } from "lucide-react";
import { FaUndo } from "react-icons/fa";

const RefundConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { bookingDetail } = useSelector((state) => state.booking);
  console.log(bookingDetail);


  // Fetch booking details
  useEffect(() => {
    dispatch(fetchBookingHistoryDetail({ id }));
  }, [dispatch, id]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "Không xác định";
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleRefund = () => {
    // Navigate back to booking history after refund
    navigate("/booking-history");
  };


  // Loading or no data state
  if (!bookingDetail || !bookingDetail.data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Chi tiết giao dịch</h2>
          <p className="text-orange-500">
            Không tìm thấy giao dịch với mã: <span className="font-mono">{id}</span>
          </p>
          <button
            onClick={() => navigate("/booked-history")}
            className="mt-6 inline-flex items-center text-orange-600 hover:text-orange-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mt-20 mb-20">
      <div className="w-full max-w-2xl border border-gray-600 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex items-center space-x-2 mb-6">
          <FaUndo className="h-6 w-6 text-orange-500" />
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Xác Nhận Hoàn Tiền</h2>
        </div>

        {/* Booking Details */}
        <div className="border rounded-lg p-4 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Thông Tin Giao Dịch</h3>
          <p className="text-sm mb-2">
            <span className="font-medium">Mã Giao Dịch:</span> DXL-{bookingDetail.data.bookingId}
          </p>
          <p className="text-sm mb-2">
            <span className="font-medium">Ngày Đặt:</span>{" "}
            {formatDateTime(bookingDetail.data.bookingCreatedDate)}
          </p>
          <p className="text-sm mb-2">
            <span className="font-medium">Số Tiền:</span>{" "}
            {(bookingDetail.data.totalPrice || 0).toLocaleString("vi-VN")} DXL
          </p>
          <p className="text-sm mb-2">
            <span className="font-medium">Trạng Thái:</span>{" "}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full font-normal text-xs md:text-sm ${bookingDetail.data.details.some((detail) => detail.status === 0 || detail.status === 1 || detail.status === 2)
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
                }`}
            >
              {bookingDetail.data.details.some((detail) => detail.status === 0 || detail.status === 1 || detail.status === 2)
                ? "Thành công"
                : "Không thành công"}
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => navigate("/booked-history")}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm transition-colors"
          >
            Quay lại
          </button>
          <button
            onClick={handleRefund}
            className={`px-4 py-2 rounded-lg text-sm transition-colors bg-orange-500 hover:bg-orange-600 text-white`}
          >
            Xác Nhận Hoàn Tiền
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefundConfirmation;