import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CreateBlog = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null); // Lưu userId của người dùng

  useEffect(() => {
    // Giả sử userId được lưu trong localStorage khi đăng nhập
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10)); // Chuyển thành số nguyên
    } else {
      toast.error("Không tìm thấy thông tin người dùng!");
    }
  }, []);

  const [newBlog, setNewBlog] = useState({
    title: "",
    content: "",
    createdDate: new Date().toISOString(),
    status: "Pending",
  });

  const handleSubmitApproval = async () => {
    if (!newBlog.title || !newBlog.content) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (!userId) {
      toast.error("Không xác định được User ID!");
      return;
    }

    const blogData = {
      ...newBlog,
      userId, // Thêm userId vào dữ liệu gửi lên backend
    };

    try {
      const response = await fetch("http://localhost:5000/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogData),
      });

      if (!response.ok) throw new Error("Lỗi khi tạo bài viết!");

      toast.success("Bài viết đã được gửi!");
      navigate("/manage/blog");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Tạo Blog Mới</h2>
      <input
        className="w-full p-2 border rounded mb-3"
        placeholder="Tiêu đề"
        value={newBlog.title}
        onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
      />
      <textarea
        className="w-full p-2 border rounded mb-3"
        placeholder="Nội dung"
        rows={5}
        value={newBlog.content}
        onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
      />
      <p className="text-sm text-gray-600 mb-4">User ID: {userId ?? "Chưa đăng nhập"}</p>
      <div className="flex gap-4">
        <button
          onClick={handleSubmitApproval}
          className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
        >
          Gửi yêu cầu duyệt
        </button>
        <button
          onClick={() => navigate("/manage/blog")}
          className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
        >
          Hủy
        </button>
      </div>
    </div>
  );
};

export default CreateBlog;
