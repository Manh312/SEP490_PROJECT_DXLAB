import { useEffect, useState } from "react";
import { Search, Eye } from "lucide-react";
import { NavLink } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 5; // Số báo cáo hiển thị trên mỗi trang

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportRes, userRes, bookingRes] = await Promise.all([
          fetch("http://localhost:5000/reports"),
          fetch("http://localhost:5000/users"),
          fetch("http://localhost:5000/bookings"),
        ]);

        const [reportData, userData, bookingData] = await Promise.all([
          reportRes.json(),
          userRes.json(),
          bookingRes.json(),
        ]);

        // Sắp xếp theo ngày tạo (mới nhất trước)
        reportData.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

        setReports(reportData);
        setUsers(userData);
        setBookings(bookingData);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        toast.error("Không thể tải danh sách báo cáo!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lọc danh sách báo cáo theo tìm kiếm
  const filteredReports = reports.filter((report) => {
    const user = users.find((u) => u.id === report.userId);
    const booking = bookings.find((b) => b.id === report.bookingId);

    return (
      (report.id && report.id.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user?.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking?.id && booking.id.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      (report.reportDescription && report.reportDescription.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Phân trang
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  if (loading) return <p className="text-center text-lg font-bold">Đang tải dữ liệu...</p>;

  return (
    <div>
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">Danh sách báo cáo</h2>

      {/* Thanh tìm kiếm */}
      <div className="mb-4 flex items-center border p-2 rounded-md shadow-sm">
        <Search className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Tìm kiếm báo cáo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 outline-none"
        />
      </div>

      <div className="card mt-5 mb-10">
        <div className="card-body p-0">
          <div className="relative max-h-[500px] overflow-auto rounded">
            <table className="table min-w-full border-collapse">
              <thead className="table-header">
                <tr className="table-row text-white bg-blue-500">
                  <th className="table-head sticky top-0">#</th>
                  <th className="table-head sticky top-0">ID Báo Cáo</th>
                  <th className="table-head sticky top-0">Người Báo Cáo</th>
                  <th className="table-head sticky top-0">Mã Booking</th>
                  <th className="table-head sticky top-0">Mô tả</th>
                  <th className="table-head sticky top-0">Ngày Tạo</th>
                  <th className="table-head sticky top-0">Thao tác</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {currentReports.map((report, index) => {
                  const user = users.find((u) => u.id === report.userId);
                  const booking = bookings.find((b) => b.id === report.bookingId);

                  return (
                    <tr key={report.id} className="table-row">
                      <td className="table-cell">{indexOfFirstReport + index + 1}</td>
                      <td className="table-cell">{report.id}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <img
                            src={user?.avatar}
                            alt={user?.fullName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span>{user?.fullName || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="table-cell">{booking ? booking.id : "N/A"}</td>
                      <td className="table-cell">{report.reportDescription || "Không có mô tả"}</td>
                      <td className="table-cell">
                        {new Date(report.createdDate).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-x-2">
                          <NavLink to={`${report.id}`} className="text-blue-500">
                            <Eye size={20} />
                          </NavLink>
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

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 mx-1 rounded"
            disabled={currentPage === 1}
          >
            <span aria-hidden="true">&laquo;</span>
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 mx-1 rounded text-black ${
                currentPage === index + 1 ? "bg-blue-500 " : "bg-gray-300 hover:bg-gray-400"
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 mx-1 rounded"
            disabled={currentPage === totalPages}
          >
            <span aria-hidden="true">&raquo;</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportList;
