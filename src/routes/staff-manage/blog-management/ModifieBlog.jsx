import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { blogData } from "../../../constants";

const ModifieBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Tìm blog theo ID
  const blog = blogData.find((b) => b.id === id);

  if (!blog) {
    return <p className="text-red-500 text-center">Không tìm thấy bài viết!</p>;
  }

  // State để chỉnh sửa nội dung blog
  const [editedBlog, setEditedBlog] = useState({
    title: blog.title,
    content: blog.content,
    author: blog.author,
    status: "Pending Approval", // Khi sửa đổi, luôn giữ trạng thái chờ duyệt
  });

  // Hàm xử lý khi người dùng nhấn "Sửa đổi & Gửi yêu cầu duyệt"
  const handleUpdateBlog = () => {
    if (!editedBlog.title || !editedBlog.content) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    
    console.log("Blog đã được cập nhật:", editedBlog);
    alert("Bài viết đã được cập nhật và gửi yêu cầu duyệt!");

    navigate("/manage/blog"); // Điều hướng về danh sách blog
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Sửa đổi Blog</h2>

      <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
      <input
        className="w-full p-2 border rounded mb-3"
        value={editedBlog.title}
        onChange={(e) => setEditedBlog({ ...editedBlog, title: e.target.value })}
      />

      <label className="block text-sm font-medium text-gray-700">Nội dung</label>
      <textarea
        className="w-full p-2 border rounded mb-3"
        rows={5}
        value={editedBlog.content}
        onChange={(e) => setEditedBlog({ ...editedBlog, content: e.target.value })}
      />

      <p className="text-sm text-gray-600 mb-4">Tác giả: {blog.author}</p>

      <span className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm inline-block mb-4">
        Chờ duyệt
      </span>

      <div className="mt-6 flex gap-4">
        <Link
          to="/manage/blog"
          className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
        >
          Quay lại
        </Link>

        <button
          onClick={handleUpdateBlog}
          className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
        >
          Sửa đổi & Gửi yêu cầu duyệt
        </button>
      </div>
    </div>
  );
};

export default ModifieBlog;
