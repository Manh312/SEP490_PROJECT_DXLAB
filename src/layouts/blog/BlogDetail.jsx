import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminBlogById } from '../../redux/slices/Blog';
import { motion } from 'framer-motion';

const BlogDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { adminSelectedBlog, adminLoading, adminError } = useSelector((state) => state.blogs);

  useEffect(() => {
    dispatch(fetchAdminBlogById(id));
  }, [dispatch, id]);

  if (adminLoading) {
    return <div className="text-center text-xl mt-10">Đang tải...</div>;
  }

  if (adminError) {
    return <div className="text-center text-xl mt-10 text-red-500">Lỗi: {adminError}</div>;
  }

  const post = adminSelectedBlog;

  // Chia nội dung thành các đoạn khoảng 4 dòng (~320 ký tự), không ngắt từ
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

      // Tìm khoảng trắng gần nhất trước khi cắt để không ngắt từ
      while (end > start && content[end] !== ' ') {
        end--;
      }
      if (end === start) end = start + chunkSize; // Nếu không tìm thấy khoảng trắng, cắt luôn

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

  // Hiệu ứng animation cho ảnh
  const imageVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
  };

  return (
    <div className="min-h-screen p-6 flex justify-center">
      <div className="max-w-4xl w-full p-6">
        <h1 className="text-sm text-orange-500 mb-4">DXLAB Blog</h1>
        <h1 className="text-3xl font-bold mb-4">{post.blogTitle}</h1>
        <p className="text-gray-500 mb-6">
          Ngày đăng: {new Date(post.blogCreatedDate).toLocaleString() || 'Không xác định'}
        </p>

        {/* Hiển thị ảnh trước, sau đó là nội dung */}
        {contentChunks.length > 0 || images.length > 0 ? (
          contentChunks.map((chunk, index) => (
            <div key={index} className="mb-6">
              {/* Hiển thị ảnh trước với animation */}
              {images[index] && (
                <motion.img
                  src={`https://localhost:9999/${images[index]}`}
                  alt={`Image ${index + 1} for ${post.blogTitle}`}
                  className="w-full rounded-lg shadow-lg mb-6 object-cover"
                  onError={(e) => (e.target.src = '/placeholder-image.jpg')}
                  variants={imageVariants}
                  initial="hidden"
                  animate="visible"
                />
              )}
              {/* Hiển thị nội dung sau ảnh */}
              <p className="text-lg text-justify">{chunk}</p>
            </div>
          ))
        ) : (
          <p className="text-lg text-gray-500">Không có nội dung hoặc ảnh để hiển thị.</p>
        )}

        {/* Hiển thị ảnh còn lại nếu có */}
        {images.length > contentChunks.length && (
          <div className="mb-6">
            {images.slice(contentChunks.length).map((image, index) => (
              <motion.img
                key={index}
                src={`https://localhost:9999/${image}`}
                alt={`Additional Image ${index + contentChunks.length + 1} for ${post.blogTitle}`}
                className="w-full rounded-lg shadow-lg mb-6 object-cover"
                onError={(e) => (e.target.src = '/placeholder-image.jpg')}
                variants={imageVariants}
                initial="hidden"
                animate="visible"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDetail;