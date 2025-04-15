import { useEffect, useState } from "react";
import { Calendar, Eye, Search } from "lucide-react";
import { useTheme } from "../../../hooks/use-theme";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookingHistory } from "../../../redux/slices/BookingHistory";
import { Tooltip } from "react-tooltip";
import debounce from "lodash/debounce";
import { FaSpinner } from "react-icons/fa";
import Pagination from "../../../hooks/use-pagination"; // Import Pagination component

const BookingList = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { data: bookings, loading, error } = useSelector((state) => state.bookingHistory);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Debounced search function
  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300);

  useEffect(() => {
    dispatch(fetchBookingHistory());
  }, [dispatch]);

  // Use an empty array as a fallback if bookings is null or undefined
  const filteredBookings = (bookings || []).filter((booking) =>
    booking.bookingId.toString().includes(searchTerm.toLowerCase()) ||
    booking.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset currentPage khi danh sách bookings trống hoặc không hợp lệ
  useEffect(() => {
    if (filteredBookings.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    } else if (currentPage > Math.ceil(filteredBookings.length / itemsPerPage)) {
      setCurrentPage(Math.max(1, Math.ceil(filteredBookings.length / itemsPerPage)));
    }
  }, [filteredBookings, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const currentBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getEmptyStateMessage = () => {
    return searchTerm
      ? "Không tìm thấy đặt chỗ nào khớp với tìm kiếm"
      : "Hiện tại không có đặt chỗ nào";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 mt-50 mb-200">
        <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
        <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) return <p className="text-red-500">Lỗi: {error}</p>;

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <Tooltip id="action-tooltip" />
      <div className={`w-full border border-gray-600 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 ${theme === "dark" ? "bg-black text-white" : ""}`}>
        {/* Header Section */}
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <Calendar className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Lịch Sử Đặt Chỗ</h2>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-6 p-4 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo ID hoặc người đặt"
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 text-sm sm:text-base shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Table or Empty State */}
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Eye className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">{getEmptyStateMessage()}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block border rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b items-center bg-gray-400">
                  <tr>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">#</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Mã Đặt Chỗ</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Người Đặt</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Ngày Đặt</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Tổng Giá</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Tổng Chi Tiết Đơn</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBookings.map((booking, index) => (
                    <tr key={booking.bookingId} className="border-b hover:bg-gray-400 transition-colors">
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">DXL-{booking.bookingId}</td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">{booking.userName}</td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {new Intl.DateTimeFormat("vi-VN").format(new Date(booking.bookingCreatedDate))}
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">{booking.totalPrice} DXLAB Coin</td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">{booking.totalBookingDetail}</td>
                      <td className="px-2 py-3 md:px-4 md:py-4 flex justify-center gap-2">
                        <NavLink
                          to={`booking-history/${booking.bookingId}`}
                          data-tooltip-id="action-tooltip"
                          data-tooltip-content="Xem chi tiết"
                          className="bg-orange-100 text-orange-700 hover:bg-orange-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </NavLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4">
              {currentBookings.map((booking, index) => (
                <div
                  key={booking.bookingId}
                  className="border rounded-lg p-3 sm:p-4 shadow-sm hover:bg-gray-500 transition-colors"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-sm">#{(currentPage - 1) * itemsPerPage + index + 1}</span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Booking ID:</span> DXL-{booking.bookingId}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Người Đặt:</span> {booking.userName}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Ngày Đặt:</span>{" "}
                      {new Intl.DateTimeFormat("vi-VN").format(new Date(booking.bookingCreatedDate))}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Tổng Giá:</span> {booking.totalPrice} DXLAB Coin
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Tổng Chi Tiết Đơn:</span> {booking.totalBookingDetail}
                    </p>
                    <div className="flex justify-center mt-2">
                      <NavLink
                        to={`booking-history/${booking.bookingId}`}
                        className="bg-orange-100 text-orange-700 hover:bg-orange-400 p-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                      >
                        <Eye className="w-4 h-4" /> Xem
                      </NavLink>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BookingList;