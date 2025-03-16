import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { PlusCircle, Filter, Search, Edit } from "lucide-react";
import { useTheme } from "../../../hooks/use-theme";
import Pagination from "../../../hooks/use-pagination";
import debounce from "lodash/debounce";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogsByStatus, setStatusFilter } from "../../../redux/slices/Blog";

const BlogList = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { blogs, loading, statusFilter } = useSelector((state) => state.blogs);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const blogsPerPage = 5;

  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300);

  useEffect(() => {
    const status = statusFilter;
    dispatch(fetchBlogsByStatus(status));
    console.log("Fetching blogs with status:", status);
  }, [dispatch, statusFilter]);

  const filteredBlogs = useMemo(() => {
    let result = blogs;
    if (searchTerm) {
      result = result.filter((blog) =>
        (blog.blogTitle || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [blogs, searchTerm]);

  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const displayedBlogs = filteredBlogs.slice(
    (currentPage - 1) * blogsPerPage,
    currentPage * blogsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const getStatusDisplayName = (status) => {
    switch (status) {
      case 1:
        return "Đã xuất bản";
      case 2:
        return "Đang chờ";
      case 3:
        return "Bản nháp";
      default:
        return "Không xác định";
    }
  };

  const getFilterBgClass = () => {
    switch (statusFilter) {
      case "1":
        return "bg-green-100 text-green-800";
      case "2":
        return "bg-yellow-100 text-yellow-800";
      case "3":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEmptyStateMessage = () => {
    return searchTerm
      ? `Không tìm thấy blog nào với trạng thái "${getStatusDisplayName(Number(statusFilter))}" khớp với tìm kiếm`
      : `Không có blog nào với trạng thái "${getStatusDisplayName(Number(statusFilter))}"`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 1:
        return "bg-green-100 text-green-800";
      case 2:
        return "bg-yellow-100 text-yellow-800";
      case 3:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <div
        className={`w-full border mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 ${
          theme === "dark" ? "bg-black text-white" : "bg-white text-gray-800"
        }`}
      >
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <PlusCircle className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Danh Sách Blog
            </h2>
          </div>
          <NavLink
            to="create"
            className="bg-orange-500 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <PlusCircle className="h-5 w-5" />
            <span className="hidden sm:inline">Tạo Blog</span>
          </NavLink>
        </div>

        <div className="mb-6 p-4 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề"
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-5 w-5 text-orange-500" />
              <span className="font-medium text-sm sm:text-base">Lọc theo trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                className={`w-full sm:w-auto px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base ${getFilterBgClass()} shadow-sm`}
              >
                <option value="1">Đã xuất bản</option>
                <option value="2">Đang chờ</option>
                <option value="3">Bản nháp</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <span className="animate-spin text-orange-500 w-6 h-6 mr-2">⏳</span>
            <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <PlusCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">{getEmptyStateMessage()}</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block border rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b bg-gray-400">
                  <tr>
                    <th className="px-3 py-3 font-semibold text-lg uppercase tracking-wide text-center">#</th>
                    <th className="px-3 py-3 font-semibold text-lg uppercase tracking-wide text-center">Ảnh</th>
                    <th className="px-3 py-3 font-semibold text-lg uppercase tracking-wide text-center">Tiêu đề</th>
                    <th className="px-3 py-3 font-semibold text-lg uppercase tracking-wide text-center">Nội dung</th>
                    <th className="px-3 py-3 font-semibold text-lg uppercase tracking-wide text-center">Ngày tạo</th>
                    <th className="px-3 py-3 font-semibold text-lg uppercase tracking-wide text-center">Trạng thái</th>
                    <th className="px-3 py-3 font-semibold text-lg uppercase tracking-wide text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedBlogs.map((blog, index) => (
                    <tr key={blog.id || blog.blogId} className="border-b hover:bg-gray-400 transition-colors">
                      <td className="px-3 py-4 text-center">
                        {(currentPage - 1) * blogsPerPage + index + 1}
                      </td>
                      <td className="px-3 py-4 text-center flex justify-center items-centerr">
                        {blog.images && (
                          <img
                            src={blog.images}
                            alt={""}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                      </td>
                      <td className="px-3 py-4 text-center">
                        <Link to={`/manage/blog/${blog.id || blog.blogId}`} className="hover:text-neutral-300">
                          {blog.blogTitle}
                        </Link>
                      </td>
                      <td className="px-3 py-4 text-center">{blog.content || blog.blogContent}</td>
                      <td className="px-3 py-4 text-center">
                        {new Date(blog.createdDate || blog.blogCreatedDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-normal text-xs md:text-sm ${getStatusClass(
                            blog.status || blog.blogStatus
                          )}`}
                        >
                          {getStatusDisplayName(blog.status || blog.blogStatus)}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-center align-middle">
                        <Link
                          to={`/manage/blog/update/${blog.id || blog.blogId}`}
                          className="inline-flex items-center justify-center bg-yellow-100 text-yellow-700 hover:bg-yellow-400 p-2 rounded-lg transition-colors cursor-pointer w-10 h-10"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="block md:hidden space-y-4">
              {displayedBlogs.map((blog, index) => (
                <div
                  key={blog.id || blog.blogId}
                  className="border rounded-lg p-3 sm:p-4 shadow-sm hover:bg-gray-500 transition-colors"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-sm">
                        #{(currentPage - 1) * blogsPerPage + index + 1}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal ${getStatusClass(
                          blog.status || blog.blogStatus
                        )}`}
                      >
                        {getStatusDisplayName(blog.status || blog.blogStatus)}
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Tiêu đề:</span> {blog.blogTitle}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Ngày tạo:</span>{" "}
                      {new Date(blog.createdDate || blog.blogCreatedDate).toLocaleDateString()}
                    </p>
                    <Link
                      to={`/manage/blog/update/${blog.id || blog.blogId}`}
                      className="bg-yellow-100 text-yellow-700 hover:bg-yellow-400 p-2 rounded-lg flex items-center justify-center w-10 h-10 mt-2"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

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

export default BlogList;