import { useEffect, useState } from "react";
import { Eye, CheckCircle, XCircle, Search } from "lucide-react";
import { useTheme } from "../../../hooks/use-theme";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BookingList = () => {
  const theme = useTheme();
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingRes, userRes, slotRes] = await Promise.all([
          fetch("http://localhost:5000/bookings"),
          fetch("http://localhost:5000/users"),
          fetch("http://localhost:5000/slots"),
        ]);

        const [bookingData, userData, slotData] = await Promise.all([
          bookingRes.json(),
          userRes.json(),
          slotRes.json(),
        ]);

        setBookings(bookingData);
        setUsers(userData);
        setSlots(slotData);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateBookingStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Cập nhật trạng thái thất bại!");

      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === id ? { ...booking, status: newStatus } : booking
        )
      );

      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      toast.error("Cập nhật thất bại!");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const user = users.find((u) => u.id === booking.userId);
    const slot = slots.find((s) => s.id === booking.slotId);

    return (
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const currentBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <p className="text-center text-lg font-bold">Đang tải dữ liệu...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Danh sách đặt chỗ</h2>

      <div className="mb-4 flex items-center border p-2 rounded-md shadow-sm">
        <Search className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Tìm kiếm đặt chỗ..."
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
                  <th className="table-head sticky top-0">#</th>
                  <th className="table-head sticky top-0">Booking ID</th>
                  <th className="table-head sticky top-0">Người đặt</th>
                  <th className="table-head sticky top-0">Ca</th>
                  <th className="table-head sticky top-0">Ngày đặt</th>
                  <th className="table-head sticky top-0">Giá</th>
                  <th className="table-head sticky top-0">Trạng thái</th>
                  <th className="table-head sticky top-0">Thao tác</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {currentBookings.map((booking, index) => {
                  const user = users.find((u) => u.id === booking.userId);
                  const slot = slots.find((s) => s.id === booking.slotId);

                  return (
                    <tr key={booking.id} className="table-row">
                      <td className="table-cell">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="table-cell">{booking.id}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <img src={user?.avatar} alt={user?.fullName} className="w-8 h-8 rounded-full object-cover" />
                          <span>{user?.fullName || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="table-cell">{slot ? slot.name : "Unknown Slot"}</td>
                      <td className="table-cell">{booking.createdDate}</td>
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
                        <div className="flex items-center gap-x-2">
                          <NavLink to={`booking-history/${booking.id}`} className="text-blue-500">
                            <Eye size={20} />
                          </NavLink>

                          {booking.status === "Pending" && (
                            <>
                              <button
                                className="text-green-500 cursor-pointer"
                                onClick={() => updateBookingStatus(booking.id, "Confirmed")}
                              >
                                <CheckCircle size={20} />
                              </button>
                              <button
                                className="text-red-500 cursor-pointer"
                                onClick={() => updateBookingStatus(booking.id, "Canceled")}
                              >
                                <XCircle size={20} />
                              </button>
                            </>
                          )}
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

      {/* Pagination */}
      <div className="flex justify-center space-x-2 mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          disabled={currentPage === 1}
        >
          <span aria-hidden="true">&laquo;</span>
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
          <span aria-hidden="true">&raquo;</span>
        </button>
      </div>

    </div>
  );
};

export default BookingList;
