import { useEffect, useState } from "react";
import { Eye, Search } from "lucide-react";
import { useTheme } from "../../../hooks/use-theme";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookingHistory } from "../../../redux/slices/BookingHistory";

const BookingList = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const { data: bookings, loading, error } = useSelector((state) => state.bookingHistory);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    dispatch(fetchBookingHistory());
  }, [dispatch]);

  const filteredBookings = bookings.filter((booking) =>
    booking.bookingId.toString().includes(searchTerm.toLowerCase()) ||
    booking.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const currentBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <p className="text-center text-lg font-bold">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-red-500">Lỗi: {error}</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Lịch sử đặt chỗ</h2>

      <div className="mb-4 flex items-center border p-2 rounded-md shadow-sm">
        <Search className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Tìm kiếm theo ID hoặc người đặt..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 outline-none"
        />
      </div>

      <div className={`card col-span-1 md:col-span-2 lg:col-span-3 mt-5 mb-10 ${theme === "dark" ? "bg-black text-white" : ""}`}>
        <div className="card-body p-0">
          <div className="relative max-h-[500px] overflow-auto rounded">
            <table className="table min-w-full border-collapse">
              <thead className="table-header">
                <tr className="table-row text-white bg-blue-500">
                  <th className="table-head sticky top-0 text-center align-middle">#</th>
                  <th className="table-head sticky top-0 text-center align-middle">Booking ID</th>
                  <th className="table-head sticky top-0 text-center align-middle">Người đặt</th>
                  <th className="table-head sticky top-0 text-center align-middle">Ngày đặt</th>
                  <th className="table-head sticky top-0 text-center align-middle">Tổng giá tiền</th>
                  <th className="table-head sticky top-0 text-center align-middle">Chi tiết</th>
                  <th className="table-head sticky top-0 text-center align-middle">Xem</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {currentBookings.map((booking, index) => (
                  <tr key={booking.bookingId} className="table-row">
                    <td className="table-cell text-center align-middle">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="table-cell text-center align-middle">{booking.bookingId}</td>
                    <td className="table-cell text-center align-middle">{booking.userName}</td>
                    <td className="table-cell text-center align-middle">
                    {new Intl.DateTimeFormat("vi-VN").format(new Date(booking.bookingCreatedDate))}
                    </td>
                    <td className="table-cell text-center align-middle">{booking.totalPrice} đ</td>
                    <td className="table-cell text-center align-middle">{booking.totalBookingDetail}</td>
                    <td className="table-cell text-center align-middle">
                      <div className="flex items-center justify-center">
                        <NavLink to={`booking-history/${booking.bookingId}`} className="text-blue-500">
                          <Eye size={20} />
                        </NavLink>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center space-x-2 mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          disabled={currentPage === 1}
        >
          &laquo;
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-300"}`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          disabled={currentPage === totalPages}
        >
          &raquo;
        </button>
      </div>
    </div>
  );
};

export default BookingList;
