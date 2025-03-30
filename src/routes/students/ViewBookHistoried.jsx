import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Pagination from "../../hooks/use-pagination"; 
import { fetchBookingHistory } from "../../redux/slices/Booking";

const ITEMS_PER_PAGE = 6;

const ViewBookingHistory = () => {
  const dispatch = useDispatch(); 
  const { bookings } = useSelector((state) => state.booking);

  useEffect(() => {
    if (!bookings.length) {
      dispatch(fetchBookingHistory());
    }
  }, [dispatch, bookings]);

  const transactions = bookings.data.map((booking) => ({
    id: booking.bookingId,
    // position: booking.details.positionId,
    date: booking.bookingCreatedDate, 
    amount: booking.totalPrice, 
    status: bookings.statusCode === 200 ? "Thành công" : "Không thành công", 
  }));
  

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = () => {
    const newFiltered = transactions.filter((tx) => {
      const matchId = tx.id.toLowerCase().includes(search.toLowerCase());
      const txDate = new Date(tx.date);

      const isAfterStart = start ? txDate >= start : true;
      const isBeforeEnd = end ? txDate <= end : true;

      return matchId && isAfterStart && isBeforeEnd;
    });
    setFilteredTransactions(newFiltered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  // Điều chỉnh currentPage khi totalPages thay đổi
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
    <div className="p-4 mt-10 mb-20 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Lịch sử giao dịch</h2>

      {/* Khu vực bộ lọc */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
        {/* Từ ngày */}
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

        {/* Đến ngày */}
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

        {/* Tìm kiếm theo Mã Giao Dịch */}
        <div className="flex flex-col">
          <input
            id="searchId"
            type="text"
            placeholder="Nhập mã giao dịch"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded p-2 mt-6"
          />
        </div>

        <button
          onClick={handleSearch}
          className="mt-2 sm:mt-6 bg-orange-500 text-white font-semibold py-2 px-4 rounded hover:bg-orange-700 transition"
        >
          Tìm kiếm
        </button>
      </div>

      {/* Bảng lịch sử giao dịch */}
      <div className="overflow-x-auto border rounded">
        <table className="w-full text-left border rounded-lg overflow-hidden shadow">
          <thead>
            <tr>
              <th className="p-3 border-b">Mã Giao Dịch</th>
              {/* <th className="p-3 border-b">Slot đặt</th> */}
              <th className="p-3 border-b">Vị trí</th>
              <th className="p-3 border-b">Ngày Đặt</th>
              <th className="p-3 border-b">Số Tiền</th>
              <th className="p-3 border-b">Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-4 text-center text-orange-500 border-b"
                >
                  Không tìm thấy giao dịch nào.
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
                  {/* <td></td> */}
                  <td className="p-3 border-b">{tx.position}</td>
                  <td className="p-3 border-b">
                    {new Date(tx.date).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",                   })}
                  </td>
                  <td className="p-3 border-b">
                    {tx.amount.toLocaleString("vi-VN")} DXLAB Coin
                  </td>
                  <td className="p-3 border-b">
                  <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                  tx.status
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

      {/* Phân trang sử dụng component Pagination */}
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