import { PencilLine, UserRoundCheck, UserRoundX } from "lucide-react";

import { bookingData, slots } from "../../../constants";
import { useTheme } from "../../../hooks/use-theme";
import { NavLink } from "react-router-dom";

const BookingList = () => {
  const theme = useTheme();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Danh sách đặt chỗ</h2>
      <div
        className={`card col-span-1 md:col-span-2 lg:col-span-3 mt-5 mb-10 ${
          theme === "dark" ? "bg-black text-white" : ""
        }`}
      >
        <div className="card-body p-0">
          <div className="relative max-h-[500px] overflow-auto rounded">
            <table className="table min-w-full border-collapse">
              <thead className="table-header">
                <tr className="table-row text-white bg-blue-500">
                  <th className="table-head sticky top-0">#</th>
                  <th className="table-head sticky top-0">
                    User ID
                  </th>
                  <th className="table-head sticky top-0">
                    Slot ID
                  </th>
                  <th className="table-head sticky top-0">
                    Booking ID
                  </th>
                  <th className="table-head sticky top-0">
                    Ngày đặt
                  </th>
                  <th className="table-head sticky top-0">Giá</th>
                  <th className="table-head sticky top-0">
                    Trạng thái
                  </th>
                  <th className="table-head sticky top-0">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="table-body">
              {bookingData.map((booking, index) => {
                const slot = slots.find((s) => s.id === booking.slotId);
                return (
                  <tr key={booking.id} className="table-row">
                    <td className="table-cell">{index + 1}</td>
                    <td className="table-cell">{booking.userId}</td>
                    <td className="table-cell">{slot ? slot.name : "Unknown Slot"}</td>
                    <td className="table-cell">{booking.bookingId}</td>
                    <td className="table-cell">{booking.bookingCreatedDate}</td>
                    <td className="table-cell">${booking.price}</td>
                    <td className="table-cell">
                      <span
                        className={`px-2 py-1 rounded ${
                          booking.status === "Confirmed"
                            ? "bg-green-500 text-white"
                            : booking.status === "Pending"
                            ? "bg-yellow-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-x-4">
                        <NavLink to={`booking-history/${booking.bookingId}`} className="text-blue-500 dark:text-blue-600">
                          <PencilLine size={20} />
                        </NavLink>
                        <button className="text-green-500 cursor-pointer">
                          <UserRoundCheck size={20}/>
                        </button>
                        <button className="text-red-500 cursor-pointer">
                          <UserRoundX size={20}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingList;
