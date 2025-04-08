import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { fetchBookingHistoryDetail, setSelectedDate, setSelectedSlot } from "../../redux/slices/Booking";
import { ArrowLeftIcon } from "lucide-react";

const BookHistoriedDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { bookingDetail, historyDetailError } = useSelector(
    (state) => state.booking
  );

  useEffect(() => {
    dispatch(fetchBookingHistoryDetail({ id }));
  }, [dispatch, id]);

  useEffect(() => {
    if (bookingDetail?.data) {
      const bookingDate = bookingDetail.data.bookingCreatedDate.split("T")[0];
      const slotNumber = bookingDetail.data.details[0]?.slotNumber;
      dispatch(setSelectedDate(bookingDate));
      dispatch(setSelectedSlot(Number(slotNumber)));
    }
  }, [bookingDetail, dispatch]);

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


  if (historyDetailError) {
    return (
      <div className="min-h-screen  flex items-center justify-center p-6">
        <div className=" rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Lỗi</h2>
          <p className="text-red-600">
            {historyDetailError || "Không thể tải chi tiết giao dịch."}
          </p>
          <Link
            to="/booked-history"
            className="mt-6 inline-flex items-center text-orange-600 hover:text-orange-800"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Quay lại
          </Link>
        </div>
      </div>
    );
  }

  if (!bookingDetail || !bookingDetail.data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className=" rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Chi tiết giao dịch</h2>
          <p className="text-orange-500">
            Không tìm thấy giao dịch với mã: <span className="font-mono">{id}</span>
          </p>
          <Link
            to="/booked-history"
            className="mt-6 inline-flex items-center text-orange-600 hover:text-orange-800"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Quay lại
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-700 p-6">
          <h2 className="text-2xl font-bold text-center text-white">Chi tiết giao dịch</h2>
          <p className=" text-center mt-1 text-sm text-white">
            Mã giao dịch: DXL-{bookingDetail.data.bookingId}
          </p>
        </div>

        {/* Booking Details */}
        <div className="p-6 space-y-6">
          {/* Tổng quan giao dịch */}
          <div className="border-b pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="font-medium ">Số tiền</div>
              <div className="font-medium">
                {(bookingDetail.data.totalPrice || 0).toLocaleString("vi-VN")}{" "}
                <span className="text-sm">DXLAB Coin</span>
              </div>
              <div className="font-medium ">Ngày đặt</div>
              <div className="font-medium">
                {formatDateTime(bookingDetail.data.bookingCreatedDate)}
              </div>
            </div>
          </div>

          {/* Danh sách chi tiết các slot */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Chi tiết các slot đã đặt</h3>
            {bookingDetail.data.details.length === 0 ? (
              <p className="text-orange-500 text-center">Không có chi tiết slot nào.</p>
            ) : (
              bookingDetail.data.details.map((detail, index) => (
                <div
                  key={detail.bookingDetailId || index}
                  className="border rounded-lg p-4 shadow-sm"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="font-medium ">Phòng</div>
                    <div className="font-medium">{detail.roomName || "Không xác định"}</div>

                    <div className="font-medium ">Tên khu vực</div>
                    <div className="font-medium">{detail.areaName || "Không xác định"}</div>

                    <div className="font-medium ">Slot đã đặt</div>
                    <div className="font-medium">Slot {detail.slotNumber || "Không xác định"}</div>

                    <div className="font-medium ">Vị trí</div>
                    <div className="font-medium">{detail.position || "Không xác định"}</div>

                    <div className="font-medium ">Thời gian nhận chỗ</div>
                    <div className="font-medium">{formatDateTime(detail.checkinTime)}</div>

                    <div className="font-medium ">Thời gian trả chỗ</div>
                    <div className="font-medium">{formatDateTime(detail.checkoutTime)}</div>

                    <div className="font-medium ">Trạng thái</div>
                    <div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                          detail.status === 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {detail.status === 0 ? "Thành công" : "Không thành công"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Nút xem vị trí */}
          <div className="border-t pt-4">
            <Link
              to={`/booked-seats/${id}`}
              className="inline-flex items-center justify-center w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors duration-200"
            >
              Xem vị trí của bạn
            </Link>
          </div>
        </div>

        {/* Nút quay lại */}
        <div className="px-6 py-4">
          <Link
            to="/booked-history"
            className="inline-flex items-center text-orange-500 hover:text-orange-700"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Quay lại danh sách giao dịch
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookHistoriedDetail;