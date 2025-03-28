import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/use-theme';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminApprovedBlogs } from '../../redux/slices/Blog';

const Blog = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { approvedBlogs, adminLoading, adminError } = useSelector((state) => state.blogs);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const postsPerPage = 6;

  // Gọi API để lấy danh sách approved blogs khi component được mount
  useEffect(() => {
    dispatch(fetchAdminApprovedBlogs());
  }, [dispatch]);

  // Xử lý approvedBlogs để đảm bảo là mảng
  const blogList = useMemo(() => {
    let result = approvedBlogs;
    if (!result) return [];
    if (Array.isArray(result)) return result;
    return Array.isArray(result.data) ? result.data : [];
  }, [approvedBlogs]);

  // Lọc blog theo searchTerm
  const filteredPosts = useMemo(() => {
    let result = blogList;
    result = result.filter((blog) => blog && typeof blog === 'object' && blog.blogTitle);

    if (searchTerm) {
      result = result.filter((blog) =>
        blog.blogTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [blogList, searchTerm]);

  // Phân trang
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  // Định nghĩa animation variants cho card
  const cardVariants = {
    rest: {
      scale: 1,
      y: 0,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    hover: {
      scale: 1.05,
      y: -10,
      boxShadow: '0 10px 15px rgba(0, 0, 0, 0.2)',
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  if (adminLoading) {
    return <p className="text-center">Đang tải...</p>;
  }

  if (adminError) {
    return <p className="text-center text-red-500">Lỗi: {adminError}</p>;
  }

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-black text-white' : ''}`}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-3xl text-orange-500 text-center mb-6">DXLAB Blog</h1>
        <p className="text-center text-4xl font-bold mb-10">
          Bài viết mới nhất tại DXLAB Co-working Space
        </p>

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
              <motion.div
                key={post.blogId}
                className="border rounded-lg shadow-lg bg-white dark:bg-gray-800"
                variants={cardVariants}
                initial="rest"
                whileHover="hover"
              >
                <img
                  src={`https://localhost:9999${post.images?.[0]}`}
                  alt={post.blogTitle}
                  className="rounded-t-lg mb-4 w-full h-48 object-cover"
                />
                <div className="p-5">
                  <h1 className="text-sm text-orange-500 mb-2">DXLAB Blog</h1>
                  <h2 className="text-xl font-semibold mb-2">{post.blogTitle}</h2>
                  <p className="text-sm text-gray-400">
                    Ngày đăng: {new Date(post.blogCreatedDate).toLocaleString() || 'Không xác định'}
                  </p>
                  <p className="mt-2 mb-4">
                    {post.blogContent?.slice(0, 100) || 'Nội dung không có'}...
                  </p>
                  <Link
                    to={`/blog/${post.blogId}`}
                    className="flex items-center text-orange-500 px-4 py-2 rounded-lg group"
                  >
                    <span className="relative group-hover:text-orange-600">Xem thêm</span>
                    <motion.div
                      className="ml-2"
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ type: 'tween', duration: 0.2 }}
                    >
                      <ArrowRight
                        size={20}
                        className="group-hover:translate-x-1 transition-transform duration-200"
                      />
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
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
                className={`mx-1 px-4 py-2 rounded-lg ${
                  currentPage === index + 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-black'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;