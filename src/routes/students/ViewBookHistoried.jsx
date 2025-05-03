import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Pagination from "../../hooks/use-pagination";
import { fetchBookingHistory } from "../../redux/slices/Booking";
import { Search, Filter, Users } from "lucide-react";
import { Tooltip } from "react-tooltip";
import debounce from "lodash/debounce";


const ITEMS_PER_PAGE = 6;

const ViewBookingHistory = () => {
  const dispatch = useDispatch();
  const { bookings } = useSelector((state) => state.booking);

  // Fetch data only once when component mounts if bookings is empty
  useEffect(() => {
    if (!bookings?.data) {
      dispatch(fetchBookingHistory());
    }
  }, [dispatch, bookings]);

  useEffect(() => {
    dispatch(fetchBookingHistory());
  }, [dispatch]);

  // Use useMemo to memoize transactions and prevent unnecessary recalculations
  const transactions = useMemo(() => {
    if (!bookings || !Array.isArray(bookings.data)) {
      return [];
    }

    return bookings.data.map((booking) => ({
      id: booking.bookingId,
      date: booking.bookingCreatedDate,
      amount: booking.totalPrice,
      status: bookings.statusCode === 200 ? "Thành công" : "Không thành công",
      totalDetail: booking.totalBookingDetail,
    }));
  }, [bookings]);

  // Filter state
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounced search function
  const debouncedSearch = debounce((value) => {
    setSearch(value);
    setCurrentPage(1);
  }, 300);

  // Filter transactions whenever filter criteria change
  const filteredTransactions = useMemo(() => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      // Chuẩn hóa ngày để bỏ qua giờ, phút, giây
      const txDateOnly = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());
      const startDateOnly = start ? new Date(start.getFullYear(), start.getMonth(), start.getDate()) : null;
      const endDateOnly = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate()) : null;

      // So sánh ngày
      const isAfterStart = startDateOnly ? txDateOnly >= startDateOnly : true;
      const isBeforeEnd = endDateOnly ? txDateOnly <= endDateOnly : true;
      const matchesSearch = search ? String(tx.id).includes(search) : true;

      return isAfterStart && isBeforeEnd && matchesSearch;
    });
  }, [transactions, search, startDate, endDate]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  // Adjust currentPage if it exceeds totalPages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const currentItems = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <Tooltip id="action-tooltip" />
      <div className="w-full border border-gray-600 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Lịch Sử Giao Dịch</h2>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-6 p-4 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã giao dịch"
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 text-sm sm:text-base shadow-sm"
              />
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-5 w-5 text-orange-500" />
              <span className="font-medium text-sm sm:text-base">Lọc theo ngày:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded p-2 text-sm sm:text-base shadow-sm bg-gray-400"
              />
              <span className="text-gray-500">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded p-2 text-sm sm:text-base shadow-sm bg-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Loading or Empty State */}
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">
              {search || startDate || endDate
                ? "Không tìm thấy giao dịch nào khớp với bộ lọc"
                : "Hiện tại không có giao dịch nào"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block border rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b items-center bg-gray-400">
                  <tr>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">#</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Mã Giao Dịch</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Ngày Đặt</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Số Tiền</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Trạng Thái</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((tx, index) => (
                    <tr key={tx.id} className="border-b hover:bg-gray-400 transition-colors">
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">DXL-{tx.id}</td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {new Date(tx.date).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {tx.amount.toLocaleString("vi-VN")} DXL
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-normal text-xs md:text-sm ${
                            tx.status === "Thành công" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-2 py-3 md:px-4 md:py-4 flex justify-center gap-2">
                        <Link
                          to={`/booked-history/${tx.id}`}
                          data-tooltip-id="action-tooltip"
                          data-tooltip-content="Xem chi tiết"
                          className="bg-orange-100 text-orange-700 hover:bg-orange-400 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <Users className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4">
              {currentItems.map((tx, index) => (
                <div
                  key={tx.id}
                  className="border rounded-lg p-3 sm:p-4 shadow-sm hover:bg-gray-500 transition-colors"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-sm">#{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal ${
                          tx.status === "Thành công" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Mã Giao Dịch:</span> DXL-{tx.id}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Ngày Đặt:</span>{" "}
                      {new Date(tx.date).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Số Tiền:</span> {tx.amount.toLocaleString("vi-VN")} DXL
                    </p>
                    <div className="flex justify-center gap-4 mt-2">
                      <Link
                        to={`/booked-history/${tx.id}`}
                        className="bg-orange-100 text-orange-500 hover:bg-orange-700 p-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                      >
                        <Users className="w-4 h-4" /> Xem Chi Tiết
                      </Link>
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

export default ViewBookingHistory;