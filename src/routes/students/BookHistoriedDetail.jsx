import { Link, useParams } from "react-router-dom";
import { mockTransactions } from "../../constants";

const BookHistoriedDetail = () => {
  const { id } = useParams();

  const transaction = mockTransactions.find(
    (tx) => tx.id?.toLowerCase() === id?.toLowerCase()
  );

  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold mb-4">Chi tiết giao dịch</h2>
        <p>Không tìm thấy giao dịch với mã: {id}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center mt-30 mb-30 p-4">
      <div className="max-w-md w-full border rounded p-4 shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Chi tiết giao dịch</h2>

        <p className="mb-2">
          <span className="font-semibold">Mã giao dịch:</span> {transaction.id}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Phòng:</span> {transaction.room}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Ngày đặt:</span>{" "}
          {new Date(transaction.date).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Số tiền:</span>{" "}
          {transaction.amount.toLocaleString("vi-VN")} VND
        </p>
        <p className="mb-2">
          <span className="font-semibold">Trạng thái:</span>{" "}
          {transaction.status === "Thành công" ? (
            <span className="text-green-600 font-semibold">
              {transaction.status}
            </span>
          ) : (
            <span className="text-red-600 font-semibold">
              {transaction.status}
            </span>
          )}
        </p>
        <p>
        <span className="font-semibold">Xem vị trí của bạn: </span> {" "}
          <Link to={"/booked-seats"} className="mb-2 hover:text-orange-500">
            Nhấp vào đây
          </Link>
        </p>
      </div>
    </div>
  );
};

export default BookHistoriedDetail;
