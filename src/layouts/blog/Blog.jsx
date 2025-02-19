import { Link } from 'react-router-dom';
import images1 from '../../assets/images1.png';
import { useTheme } from '../../hooks/use-theme';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const Blog = () => {
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const postsPerPage = 6;

  const blogPosts = Array.from({ length: 12 }, (_, index) => ({ id: index + 1, title: `Bài viết ${index + 1}` }));
  const filteredPosts = blogPosts.filter(post => post.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  return (
    <div>
      <div className={`min-h-screen p-6 ${theme === "dark" ? "bg-black text-white" : ""}`}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-3xl text-orange-500 text-center mb-6">DXLAB Blog</h1>
          <p className="text-center text-4xl font-bold mb-10">Bài viết mới nhất tại DXLAB Co-working Space</p>
          
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            className="block w-full max-w-md mx-auto p-2 mb-6 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {currentPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPosts.map((post) => (
                <div key={post.id} className="border rounded-lg shadow-lg hover:shadow-xl transition">
                  <img src={images1} alt="Blog Thumbnail" className="rounded-lg mb-4" />
                  <h1 className="text-sm text-orange-500 mb-2 ml-5">DXLAB Blog</h1>
                  <h2 className="text-xl font-semibold mb-2 ml-5">{post.title}</h2>
                  <p className="text-sm text-gray-400 ml-5">Ngày đăng: 20/02/2025</p>
                  <p className="mt-2 mb-4 ml-5">Mô tả ngắn gọn về bài viết. Khám phá không gian làm việc chung...</p>
                  <Link to={`/blog/${post.id}`} className="flex items-center text-orange-500 px-4 py-2 rounded-lg ml-1 group">
                    <span className="relative group-hover:text-orange-600">Xem thêm</span>
                    <motion.div
                      className="ml-2"
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ type: "tween", duration: 0.2 }}
                    >
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
                    </motion.div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-xl text-gray-500">Không tìm thấy bài viết.</p>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`mx-1 px-4 py-2 rounded-lg ${currentPage === index + 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-black'}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Blog;
