import { useState } from "react";
import { useSelector } from "react-redux"; // Thêm useSelector để lấy bookings
import { Link } from "react-router-dom";

// Bảng ánh xạ positionId với mã ghế (tương tự như trong ViewBookedSeats)
const positionIdToSeatMap = {
  9: { seat: 'A1', area: 'individual' },
  10: { seat: 'A2', area: 'individual' },
  11: { seat: 'A3', area: 'individual' },
  12: { seat: 'A4', area: 'individual' },
  13: { seat: 'A5', area: 'individual' },
  14: { seat: 'A6', area: 'individual' },
  15: { seat: 'B1', area: 'individual' },
  16: { seat: 'B2', area: 'individual' },
  17: { seat: 'B3', area: 'individual' },
  18: { seat: 'B4', area: 'individual' },
  19: { seat: 'G1', area: 'group' },
  20: { seat: 'G2', area: 'group' },
  21: { seat: 'G3', area: 'group' },
  22: { seat: 'G4', area: 'group' },
  23: { seat: 'H1', area: 'group' },
  24: { seat: 'H2', area: 'group' },
  25: { seat: 'H3', area: 'group' },
  26: { seat: 'H4', area: 'group' },
  27: { seat: 'H5', area: 'group' },
  28: { seat: 'H6', area: 'group' },
  29: { seat: 'J1', area: 'group' },
  30: { seat: 'J2', area: 'group' },
  31: { seat: 'J3', area: 'group' },
  32: { seat: 'J4', area: 'group' },
  33: { seat: 'J5', area: 'group' },
  34: { seat: 'J6', area: 'group' },
  35: { seat: 'J7', area: 'group' },
  36: { seat: 'J8', area: 'group' },
  37: { seat: 'I1', area: 'group' },
  38: { seat: 'I2', area: 'group' },
  39: { seat: 'I3', area: 'group' },
  40: { seat: 'I4', area: 'group' },
  41: { seat: 'I5', area: 'group' },
  42: { seat: 'I6', area: 'group' },
  43: { seat: 'I7', area: 'group' },
  44: { seat: 'I8', area: 'group' },
  45: { seat: 'I9', area: 'group' },
  46: { seat: 'I10', area: 'group' },
  47: { seat: 'I11', area: 'group' },
  48: { seat: 'I12', area: 'group' },
};

const ITEMS_PER_PAGE = 6;

const ViewBookingHistory = () => {
  // Lấy bookings từ Redux store
  const { bookings } = useSelector((state) => state.booking);

  // Chuyển đổi bookings thành transactions
  const transactions = bookings.flatMap((booking, bookingIndex) =>
    booking.data.details.map((detail, detailIndex) => {
      const position = positionIdToSeatMap[detail.positionId];
      const seat = position ? position.seat : "Unknown";
      const area = position ? position.area : "Unknown";

      return {
        id: `TX-${booking.userId}-${bookingIndex}-${detailIndex}`, // Tạo mã giao dịch duy nhất
        room: `${seat} (${area})`, // Hiển thị ghế và khu vực (ví dụ: A1 (individual))
        date: detail.checkInTime, // Ngày đặt từ checkInTime
        amount: detail.price, // Số tiền từ price
        status: "Thành công", // Giả định trạng thái (có thể thêm logic nếu cần)
      };
    })
  );

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

  const totalItems = filteredTransactions.length;
  const shouldPaginate = totalItems >= 6;

  const totalPages = shouldPaginate
    ? Math.ceil(totalItems / ITEMS_PER_PAGE)
    : 1;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const currentItems = shouldPaginate
    ? filteredTransactions.slice(startIndex, endIndex)
    : filteredTransactions;

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
              <th className="p-3 border-b">Phòng</th>
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
                  className="p-4 text-center text-gray-500 border-b"
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
                  <td className="p-3 border-b">{tx.room}</td>
                  <td className="p-3 border-b">
                    {new Date(tx.date).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-3 border-b">
                    {tx.amount.toLocaleString("vi-VN")} DXLAB Coin
                  </td>
                  <td className="p-3 border-b">
                    {tx.status === "Thành công" ? (
                      <span className="text-green-600 font-semibold">
                        {tx.status}
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        {tx.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`mx-1 px-4 py-2 rounded-lg ${currentPage === index + 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-black'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewBookingHistory;