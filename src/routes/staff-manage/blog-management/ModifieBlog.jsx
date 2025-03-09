import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

const ModifieBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editedBlog, setEditedBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch blog data from API
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`http://localhost:5000/blogs/${id}`);
        if (!response.ok) throw new Error("Không tìm thấy bài viết!");
        const data = await response.json();
        setEditedBlog({
          title: data.title,
          content: data.content,
          author: data.author,
          status: "Pending Approval",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  // Handle update blog
  const handleUpdateBlog = async () => {
    if (!editedBlog.title || !editedBlog.content) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/blogs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedBlog),
      });

      if (!response.ok) throw new Error("Lỗi khi cập nhật bài viết!");
      alert("Bài viết đã được cập nhật và gửi yêu cầu duyệt!");
      navigate("/manage/blog");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p className="text-center">Đang tải...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

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

      <p className="text-sm text-gray-600 mb-4">Tác giả: {editedBlog.author}</p>
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
