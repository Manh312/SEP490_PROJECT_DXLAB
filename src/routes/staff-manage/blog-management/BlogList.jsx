import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { PlusCircle, Eye } from "lucide-react";
import { useTheme } from "../../../hooks/use-theme";

const BlogList = () => {
  const theme = useTheme();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 5; // Số blog hiển thị mỗi trang

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("http://localhost:5000/blogs");
        const data = await response.json();
        // Sắp xếp theo thời gian gần nhất (Mới nhất lên đầu)
        const sortedBlogs = data.sort(
          (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
        );

        setBlogs(sortedBlogs);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Tính toán số trang
  const totalPages = Math.ceil(blogs.length / blogsPerPage);
  const displayedBlogs = blogs.slice(
    (currentPage - 1) * blogsPerPage,
    currentPage * blogsPerPage
  );

  return (
    <div className="mr-3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Danh sách Blog</h2>
        <NavLink
          to="create"
          className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <PlusCircle size={18} />
          Tạo Blog
        </NavLink>
      </div>

      <div
        className={`card col-span-1 md:col-span-2 lg:col-span-3 mt-5 mb-10 ${
          theme === "dark" ? "bg-black text-white" : ""
        }`}
      >
        <div className="card-body p-0">
          <div className="relative max-h-[500px] overflow-auto rounded">
            {loading ? (
              <p className="text-center py-4">Đang tải...</p>
            ) : (
              <>
                <table className="table min-w-full">
                  <thead className="table-header">
                    <tr className="table-row text-white bg-blue-500">
                      <th className="table-head sticky top-0">#</th>
                      <th className="table-head sticky top-0">Tiêu đề</th>
                      <th className="table-head sticky top-0">Tác giả</th>
                      <th className="table-head sticky top-0">Ngày tạo</th>
                      <th className="table-head sticky top-0">Trạng thái</th>
                      <th className="table-head sticky top-0">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {displayedBlogs.map((blog, index) => (
                      <tr key={blog.id} className="table-row">
                        <td className="table-cell">
                          {(currentPage - 1) * blogsPerPage + index + 1}
                        </td>
                        <td className="table-cell">{blog.title}</td>
                        <td className="table-cell">User {blog.userId}</td>
                        <td className="table-cell">
                          {new Date(blog.createdDate).toLocaleDateString()}
                        </td>
                        <td className="table-cell">
                          <span
                            className={`px-3 py-1 rounded-lg text-white text-sm ${
                              blog.status === "Published"
                                ? "bg-green-500"
                                : blog.status === "Pending"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          >
                            {blog.status}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-x-4">
                            <NavLink
                              to={`/manage/blog/${blog.id}`}
                              className="text-blue-500 dark:text-blue-600"
                            >
                              <Eye size={20} />
                            </NavLink>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

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
                      className={`px-3 py-1 rounded ${
                        currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-300"
                      }`}
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogList;
