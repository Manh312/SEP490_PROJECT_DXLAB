import { useParams, useNavigate } from 'react-router-dom';
import images1 from '../../assets/images1.png';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Giả định danh sách bài viết
  const blogPosts = [
    {
      id: "1",
      title: "Không gian làm việc hiện đại tại DXLAB",
      date: "20/02/2025",
      image: images1,
      content: "DXLAB mang đến không gian làm việc linh hoạt, sáng tạo, phù hợp cho cá nhân và nhóm. Hãy khám phá sự tiện nghi mà chúng tôi cung cấp."
    },
    {
      id: "2",
      title: "Lợi ích của co-working space đối với freelancer",
      date: "18/02/2025",
      image: images1,
      content: "Freelancer có thể tận hưởng môi trường làm việc chuyên nghiệp, kết nối với cộng đồng và tăng năng suất khi làm việc tại DXLAB."
    }
  ];

  const post = blogPosts.find(blog => blog.id === id);

  if (!post) {
    return <div className="text-center text-xl mt-10 mb-100">Bài viết không tồn tại.</div>;
  }

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-4 text-orange-600">&larr; Quay lại</button>
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-500 mb-6">Ngày đăng: {post.date}</p>
      <img src={post.image} alt={post.title} className="rounded-lg shadow-lg mb-6" />
      <p className="text-lg">{post.content}</p>
    </div>
  );
};

export default BlogDetail;
