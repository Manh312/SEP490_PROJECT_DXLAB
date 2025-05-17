import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminApprovedBlogs } from '../../redux/slices/Blog';
import { format, parseISO } from 'date-fns';
import { FaSpinner } from 'react-icons/fa';

const Blog = () => {
  const dispatch = useDispatch();
  const { approvedBlogs, adminLoading } = useSelector((state) => state.blogs);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const postsPerPage = 6;

  useEffect(() => {
    dispatch(fetchAdminApprovedBlogs());
  }, [dispatch]);

  const blogList = useMemo(() => {
    if (!approvedBlogs) return [];
    if (Array.isArray(approvedBlogs)) return approvedBlogs;
    if (approvedBlogs.data && Array.isArray(approvedBlogs.data)) return approvedBlogs.data;
    return [];
  }, [approvedBlogs]);

  const filteredPosts = useMemo(() => {
    const validBlogs = blogList.filter(
      (blog) => blog && typeof blog === 'object' && blog.blogTitle && blog.blogId
    );
    if (searchTerm) {
      return validBlogs.filter((blog) =>
        blog.blogTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return validBlogs;
  }, [blogList, searchTerm]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const cardVariants = {
    rest: {
      scale: 1,
      y: 0,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    hover: {
      scale: 1.03,
      y: -5,
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không xác định';
    try {
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy HH:mm:ss');
    } catch (error) {
      console.warn(`Error parsing date string: ${dateString}`, error);
      return 'Không xác định';
    }
  };

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center py-12 min-h-screen bg-gray-100">
        <FaSpinner className="animate-spin text-orange-500 w-8 h-8 mr-3" />
        <p className="text-orange-500 text-lg font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 mb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            DXLAB Blog
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto">
            Khám phá những bài viết mới nhất về học tập, sáng tạo và cộng đồng tại DXLAB Coworking Space.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="relative max-w-md mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </motion.div>

        {/* Blog Cards */}
        {currentPosts.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2 },
              },
            }}
          >
            {currentPosts.map((post) => (
              <motion.div
                key={post.blogId}
                className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col"
                variants={cardVariants}
                initial="rest"
                whileHover="hover"
              >
                <img
                  src={`http://dxlab.edu.vn${post.images?.[0] || '/default-image.jpg'}`}
                  alt={post.blogTitle}
                  className="w-full h-56 object-cover"
                  onError={(e) => (e.target.src = '/default-image.jpg')}
                />
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-sm text-orange-500 font-medium mb-2">
                    DXLAB Blog
                  </span>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {post.blogTitle}
                  </h2>
                  <p className="text-sm text-gray-500 mb-3">
                    Ngày đăng: {formatDate(post.blogCreatedDate)}
                  </p>
                  <p className="text-gray-600 text-base leading-relaxed mb-4 line-clamp-3">
                    {post.blogContent || 'Nội dung không có'}...
                  </p>
                  <div className="mt-auto">
                    <Link
                      to={`/blog/${post.blogId}`}
                      className="inline-flex items-center text-orange-500 font-medium hover:text-orange-600 transition-colors duration-200"
                    >
                      Xem thêm
                      <motion.div
                        className="ml-2"
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                        transition={{ type: 'tween', duration: 0.2 }}
                      >
                        <ArrowRight size={20} />
                      </motion.div>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.p
            className="text-center text-xl text-orange-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Hiện chưa có bài viết nào.
          </motion.p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            className="flex justify-center mt-12 space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                  currentPage === index + 1
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-orange-50 hover:border-orange-500'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Blog;