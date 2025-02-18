import { Link } from 'react-router-dom';
import images1 from '../../assets/images1.png';
import { useTheme } from '../../hooks/use-theme';

const Blog = () => {
  const theme = useTheme();

  return (
    <div>
      <div className={`min-h-screen p-6 ${theme === "dark" ? "bg-black text-white" : ""}`}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">DXLAB Blog</h1>
          <p className="text-center text-lg mb-10">Khám phá không gian làm việc lý tưởng với DXLAB Blog</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="border rounded-lg p-4 shadow-lg hover:shadow-xl transition">
                <img src={images1} alt="Blog Thumbnail" className="rounded-lg mb-4" />
                <h2 className="text-xl font-semibold mb-2">Bài viết {index + 1}</h2>
                <p className="text-sm text-gray-400">Ngày đăng: 20/02/2025</p>
                <p className="mt-2 mb-4">Mô tả ngắn gọn về bài viết. Khám phá không gian làm việc chung...</p>
                <Link to={`/blog/${index + 1}`} className="mt-20 bg-orange-600 text-white px-4 py-2 rounded-lg">Đọc tiếp</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Blog;
