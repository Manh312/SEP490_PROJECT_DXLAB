import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { fetchBookingHistoryDetail, setSelectedDate, setSelectedSlot } from "../../redux/slices/Booking";
import { ArrowLeftIcon } from "lucide-react";

const BookHistoriedDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { bookingDetail, historyDetailLoading, historyDetailError } = useSelector(
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
      dispatch(setSelectedSlot(slotNumber));
    }
  }, [bookingDetail, dispatch]);


  if (historyDetailLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Đang tải...</h2>
          <p className="text-gray-600">Vui lòng chờ trong giây lát.</p>
        </div>
      </div>
    );
  }

  if (historyDetailError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Lỗi</h2>
          <p className="text-red-600">
            {historyDetailError || "Không thể tải chi tiết giao dịch."}
          </p>
          <Link
            to="/booked-history"
            className="mt-6 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Quay lại
          </Link>
        </div>
      </div>
    );
  }

  if (!bookingDetail) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Chi tiết giao dịch</h2>
          <p className="text-gray-600">
            Không tìm thấy giao dịch với mã: <span className="font-mono">{id}</span>
          </p>
          <Link
            to="/booked-history"
            className="mt-6 inline-flex items-center text-blue-600 hover:text-blue-800"
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
      <div className="max-w-lg mx-auto rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-700 p-6">
          <h2 className="text-2xl font-bold text-white text-center">Chi tiết giao dịch</h2>
          <p className="text-blue-100 text-center mt-1 text-sm">
            Mã giao dịch: {bookingDetail.data?.bookingId}
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium">Phòng</div>
            <div className="font-medium">{bookingDetail.data?.details[0]?.roomName}</div>
            <div className="font-medium">Tên khu vực</div>
            <div className="font-medium">{bookingDetail.data?.details[0]?.areaName}</div>
            <div className="font-medium">Slot đã đặt</div>
            <div className="font-medium">Slot {bookingDetail.data?.details[0]?.slotNumber}</div>
            <div className="font-medium">Vị trí</div>
            <div className="font-medium">
              {bookingDetail.data?.details[0]?.position || "Không xác định"}
            </div>

            <div className="font-medium">Thời gian nhận chỗ</div>
            <div className="font-medium">
              {bookingDetail.data?.details[0]?.checkinTime
                ? new Date(bookingDetail.data.details[0].checkinTime).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
                : "Không xác định"}
            </div>

            <div className="font-medium">Thời gian trả chỗ</div>
            <div className="font-medium">
              {bookingDetail.data?.details[0]?.checkoutTime
                ? new Date(bookingDetail.data.details[0].checkoutTime).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
                : "Không xác định"}
            </div>

            <div className="font-medium">Số tiền</div>
            <div className="font-medium">
              {(bookingDetail.data?.totalPrice || 0).toLocaleString("vi-VN")}{" "}
              <span className="text-sm">DXLAB Coin</span>
            </div>

            <div className="font-medium">Trạng thái</div>
            <div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${bookingDetail.data?.details[0]?.status === 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                  }`}
              >
                {bookingDetail.data?.details[0]?.status === 0 ? "Thành công" : "Không thành công"}
              </span>
            </div>
          </div>

          <div className="border-t pt-4">
            <Link
              to={`/booked-seats/${id}`}
              className="inline-flex items-center justify-center w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors duration-200"
            >
              Xem vị trí của bạn
            </Link>
          </div>
        </div>

        <div className="px-6 py-4">
          <Link
            to="/booked-history"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
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