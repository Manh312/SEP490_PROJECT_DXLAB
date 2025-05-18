import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminBlogById } from '../../redux/slices/Blog';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const BlogDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { adminSelectedBlog, adminLoading, adminError } = useSelector((state) => state.blogs);

  useEffect(() => {
    dispatch(fetchAdminBlogById(id));
  }, [dispatch, id]);

  // Animation variants for image hover
  const imageVariants = {
    rest: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    hover: {
      scale: 1.05,
      opacity: 0.9,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  if (adminLoading) {
    return <div className="text-center text-xl mt-10">Đang tải...</div>;
  }

  if (adminError) {
    const errorMessage = typeof adminError === 'string' ? adminError : 'Đã xảy ra lỗi không xác định';
    return <div className="text-center text-xl mt-10 text-red-500">Lỗi: {errorMessage}</div>;
  }

  const post = adminSelectedBlog;

  if (!post) {
    return <div className="text-center text-xl mt-10 text-gray-500">Không tìm thấy bài viết.</div>;
  }

  // Function to format date as DD/MM/YYYY HH:mm:ss
  const formatDate = (dateString) => {
    if (!dateString) return 'Không xác định';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
            return 'Không xác định';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  // Split content into chunks (~385 characters), without breaking words
  const splitContent = (content, chunkSize = 450) => {
    if (!content) return [];
    const cleanedContent = content.replace(/\n+/g, ' ').trim();
    const chunks = [];
    let start = 0;

    while (start < cleanedContent.length) {
      let end = start + chunkSize;
      if (end >= cleanedContent.length) {
        chunks.push(cleanedContent.slice(start));
        break;
      }

      while (end > start && cleanedContent[end] !== ' ') {
        end--;
      }
      if (end === start) end = start + chunkSize;

      chunks.push(cleanedContent.slice(start, end).trim());
      start = end + 1;
    }
    return chunks;
  };

  const contentChunks = splitContent(post.blogContent);
  const images = Array.isArray(post.images) ? post.images : [];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <h1 className="text-sm font-medium uppercase tracking-wider">DXLAB Blog</h1>
          <h2 className="text-3xl font-bold mt-2">{post.blogTitle}</h2>
          <p className="text-sm opacity-80 mt-1">
            Ngày đăng: {formatDate(post.blogCreatedDate)}
          </p>
        </div>
        <div className="mt-10">
            <Link
              to="/blog"
              className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium px-4 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap"
            >
              <motion.div
                initial={{ x: 0 }}
                whileHover={{ x: -5 }}
                transition={{ type: 'tween', duration: 0.2 }}
              >
                <ArrowRight size={20} className="mr-2" />
              </motion.div>
              Quay lại danh sách
            </Link>
          </div>

        {/* Content Section */}
        <div className="p-8 min-w-[320px]">
          {/* Display first image (if available) */}
          {images.length > 0 && (
            <motion.img
              src={`https://dxlab.edu.vn${images[0]}`}
              alt={`Featured image for ${post.blogTitle}`}
              className="w-full h-96 object-cover rounded-lg shadow-md mb-8"
              onError={(e) => (e.target.src = '/placeholder-image.jpg')}
              variants={imageVariants}
              initial="rest"
              whileHover="hover"
            />
          )}

          {/* Content and images interleaved */}
          {contentChunks.length > 0 ? (
            <>
              {contentChunks.map((chunk, index) => {
                if (index < images.length - 1) {
                  // Render chunks with images until images run out
                  return (
                    <div key={index} className="mb-8">
                      <p className="text-lg text-gray-700 leading-relaxed">{chunk}</p>
                      {images[index + 1] && (
                        <motion.img
                          src={`https://dxlab.edu.vn${images[index + 1]}`}
                          alt={`Image ${index + 2} for ${post.blogTitle}`}
                          className="w-full h-64 object-cover rounded-lg shadow-md mt-6"
                          onError={(e) => (e.target.src = '/placeholder-image.jpg')}
                          variants={imageVariants}
                          initial="rest"
                          whileHover="hover"
                        />
                      )}
                    </div>
                  );
                }
                return null; 
              })}
              <div className="mb-8">
                {contentChunks.slice(images.length - 1).map((chunk, index) => (
                  <p key={index} className="text-lg text-gray-700 leading-relaxed">
                    {chunk}
                  </p>
                ))}
              </div>
            </>
          ) : (
            <p className="text-lg text-gray-500">Không có nội dung để hiển thị.</p>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;