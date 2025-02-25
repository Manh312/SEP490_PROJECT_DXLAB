import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CreateBlog = () => {
  const navigate = useNavigate();
  const [newBlog, setNewBlog] = useState({
    title: "",
    content: "",
    author: "",
    status: "Pending Approval", // Mặc định là "Chờ duyệt"
  });

  // Hàm gửi yêu cầu duyệt
  const handleSubmitApproval = () => {
    if (!newBlog.title || !newBlog.content || !newBlog.author) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    toast.success("Yêu cầu duyệt blog đã được gửi. Vui lòng chờ Admin xác nhận!");
    console.log("Blog đã gửi yêu cầu duyệt:", newBlog);
    navigate("/manage/blog"); // Điều hướng về danh sách blog
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
      <input
        className="w-full p-2 border rounded mb-3"
        placeholder="Tác giả"
        value={newBlog.author}
        onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })}
      />
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
