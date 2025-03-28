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

  // Animation variants cho ảnh khi hover
  const imageVariants = {
    rest: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    hover: {
      scale: 1.05, // Phóng to nhẹ khi hover
      opacity: 0.9, // Giảm opacity một chút
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  if (adminLoading) {
    return <div className="text-center text-xl mt-10">Đang tải...</div>;
  }

  if (adminError) {
    const errorMessage = typeof adminError === 'string' 
      ? adminError 
      : 'Đã xảy ra lỗi không xác định';
    return <div className="text-center text-xl mt-10 text-red-500">Lỗi: {errorMessage}</div>;
  }

  const post = adminSelectedBlog;

  if (!post) {
    return <div className="text-center text-xl mt-10 text-gray-500">Không tìm thấy bài viết.</div>;
  }

  // Chia nội dung thành các đoạn (~365 ký tự), không ngắt từ
  const splitContent = (content, chunkSize = 365) => {
    if (!content) return [];
    const chunks = [];
    let start = 0;

    while (start < content.length) {
      let end = start + chunkSize;
      if (end >= content.length) {
        chunks.push(content.slice(start));
        break;
      }

      while (end > start && content[end] !== ' ') {
        end--;
      }
      if (end === start) end = start + chunkSize;

      chunks.push(content.slice(start, end).trim());
      start = end + 1;
    }
    return chunks;
  };

  const contentChunks = splitContent(post.blogContent);
  const images = Array.isArray(post.images) ? post.images : [];

  // Debug dữ liệu
  console.log("Blog Detail Data:", post);
  console.log("Content Chunks:", contentChunks);
  console.log("Images:", images);

  return (
    <div className="min-h-screen p-6 flex justify-center bg-gray-100 dark:bg-black">
      <div className="max-w-4xl w-full border rounded-lg shadow-lg bg-white dark:bg-gray-800">
        {/* Ảnh đầu tiên */}
        {images.length > 0 && (
          <motion.img
            src={`https://localhost:9999${images[0]}`}
            alt={post.blogTitle}
            className="rounded-t-lg mb-4 w-full h-48 object-cover cursor-pointer"
            onError={(e) => (e.target.src = '/placeholder-image.jpg')}
            variants={imageVariants}
            initial="rest"
            whileHover="hover" // Hiệu ứng khi di chuột vào
          />
        )}

        <div className="p-5">
          <h1 className="text-sm text-orange-500 mb-2">DXLAB Blog</h1>
          <h2 className="text-xl font-semibold mb-2">{post.blogTitle}</h2>
          <p className="text-sm text-gray-400 mb-4">
            Ngày đăng:{' '}
            {post.blogCreatedDate
              ? new Date(post.blogCreatedDate).toLocaleString()
              : 'Không xác định'}
          </p>

          {/* Nội dung và ảnh */}
          {contentChunks.length > 0 ? (
            contentChunks.map((chunk, index) => (
              <div key={index} className="mb-6">
                <p className="text-lg text-justify">{chunk}</p>
                {/* Hiển thị ảnh tương ứng nếu có */}
                {images[index + 1] && (
                  <motion.img
                    src={`https://localhost:9999${images[index + 1]}`}
                    alt={`Image ${index + 2} for ${post.blogTitle}`}
                    className="w-full rounded-lg shadow-lg mt-4 object-cover cursor-pointer"
                    onError={(e) => (e.target.src = '/placeholder-image.jpg')}
                    variants={imageVariants}
                    initial="rest"
                    whileHover="hover" // Hiệu ứng khi di chuột vào
                  />
                )}
              </div>
            ))
          ) : (
            <p className="text-lg text-gray-500">Không có nội dung để hiển thị.</p>
          )}

          {/* Nút quay lại */}
          <Link
            to="/blog"
            className="flex items-center text-orange-500 px-4 py-2 rounded-lg group mt-6"
          >
            <span className="relative group-hover:text-orange-600">Quay lại danh sách</span>
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
      </div>
    </div>
  );
};

export default BlogDetail;