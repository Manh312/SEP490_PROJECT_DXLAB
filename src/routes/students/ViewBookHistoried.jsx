import { useState } from "react";
import { mockTransactions } from "../../constants";
import { Link } from "react-router-dom";

const ITEMS_PER_PAGE = 6;

const ViewBookingHistory = () => {
  const [transactions] = useState(mockTransactions);
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
              <th className="p-3 border-b ">Phòng</th>
              <th className="p-3 border-b">Ngày Đặt</th>
              <th className="p-3 border-b ">Số Tiền</th>
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
                    {tx.amount.toLocaleString("vi-VN")} VND
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
