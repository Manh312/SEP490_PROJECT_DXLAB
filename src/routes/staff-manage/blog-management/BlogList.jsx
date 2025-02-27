import { Link, NavLink } from "react-router-dom";
import { PencilLine, Trash, PlusCircle } from "lucide-react";
import { blogData } from "../../../constants";
import { useTheme } from "../../../hooks/use-theme";

const BlogList = () => {
  const theme = useTheme();

  return (
    <div className="mr-3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Danh sách Blog</h2>
        <Link
          to="/manage/blog/create"
          className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <PlusCircle size={18} />
          Tạo Blog
        </Link>
      </div>

      <div
        className={`card col-span-1 md:col-span-2 lg:col-span-3 mt-5 mb-10 ${
          theme === "dark" ? "bg-black text-white" : ""
        }`}
      >
        <div className="card-body p-0">
          <div className="relative max-h-[500px] overflow-auto rounded">
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
                {blogData.map((blog, index) => (
                  <tr key={blog.id} className="table-row">
                    <td className="table-cell">{index + 1}</td>
                    <td className="table-cell">{blog.title}</td>
                    <td className="table-cell">{blog.author}</td>
                    <td className="table-cell">{blog.createdDate}</td>
                    <td className="table-cell">
                      <span
                        className={`px-3 py-1 rounded-lg text-white text-sm ${
                          blog.status === "Published"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      >
                        {blog.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-x-4">
                        <NavLink
                          to={`${blog.id}`}
                          className="text-blue-500 dark:text-blue-600"
                        >
                          <PencilLine size={20} />
                        </NavLink>
                        <button className="text-red-500">
                          <Trash size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogList;
