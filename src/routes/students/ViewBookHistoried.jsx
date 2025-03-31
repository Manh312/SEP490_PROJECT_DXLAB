import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Pagination from "../../hooks/use-pagination";
import { fetchBookingHistory } from "../../redux/slices/Booking";

const ITEMS_PER_PAGE = 6;

const ViewBookingHistory = () => {
  const dispatch = useDispatch();
  const { bookings, error } = useSelector((state) => state.booking);
  console.log("Bookings:", bookings);

  // Fetch data only once when component mounts if bookings is empty
  useEffect(() => {
    if (!bookings?.data) {
      dispatch(fetchBookingHistory());
    }
  }, [dispatch, bookings]);

  // Use useMemo to memoize transactions and prevent unnecessary recalculations
  const transactions = useMemo(() => {
    if (!bookings || !Array.isArray(bookings.data)) {
      return [];
    }
  
    return bookings.data.map((booking) => ({
      id: booking.bookingId, // Fix: Use bookingID
      date: booking.bookingCreatedDate,
      amount: booking.totalPrice,
      status: bookings.statusCode === 200 ? "Thành công" : "Không thành công", // Fix: Use booking status
      totalDetail: booking.totalBookingDetail, // This might not exist in the response; verify with backend
    }));
  }, [bookings]);

  console.log("Transactions:", transactions);

  // Filter state
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter transactions whenever filter criteria change
  useEffect(() => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const filtered = transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      const isAfterStart = start ? txDate >= start : true;
      const isBeforeEnd = end ? txDate <= end : true;
      const matchesSearch = search ? String(tx.id).includes(search) : true; // Fix: Filter by id
      return isAfterStart && isBeforeEnd && matchesSearch;
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset to first page when filters change
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

  // Display error if fetching fails
  if (error) {
    return (
      <div className="p-4 mt-10 mb-20 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Lịch sử giao dịch</h2>
        <p className="text-center text-red-500">
          Đã có lỗi xảy ra khi tải dữ liệu: {error.message || error}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 mt-10 mb-20 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Lịch sử giao dịch</h2>

      {/* Filter area */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
        <div className="flex flex-col">
          <label htmlFor="startDate" className="text-sm font-semibold mb-1">
            Từ ngày
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded p-2"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="endDate" className="text-sm font-semibold mb-1">
            Đến ngày
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded p-2"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="searchId" className="text-sm font-semibold mb-1">
            Mã giao dịch
          </label>
          <input
            id="searchId"
            type="text"
            placeholder="Nhập mã giao dịch"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded p-2 mt-1"
          />
        </div>
      </div>

      {/* Transaction table */}
      <div className="overflow-x-auto border rounded">
        <table className="w-full text-left border rounded-lg overflow-hidden shadow">
          <thead>
            <tr>
              <th className="p-3 border-b">Mã Giao Dịch</th>
              <th className="p-3 border-b">Ngày Đặt</th>
              <th className="p-3 border-b">Số Tiền</th>
              <th className="p-3 border-b">Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-orange-500 border-b">
                  Không có lịch sử giao dịch nào
                </td>
              </tr>
            ) : (
              currentItems.map((tx) => (
                <tr key={tx.id}>
                  <td className="p-3 border-b">
                    <Link to={`/booked-history/${tx.id}`} className="hover:text-orange-600">
                      {tx.id}
                    </Link>
                  </td>
                  <td className="p-3 border-b">
                    {new Date(tx.date).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td className="p-3 border-b">
                    {tx.amount.toLocaleString("vi-VN")} DXLAB Coin
                  </td>
                  <td className="p-3 border-b">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                        tx.status === "Thành công"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};

export default ViewBookingHistory;