import { useParams } from 'react-router-dom';
import { blogPosts } from '../../constants';

const BlogDetail = () => {
  const { id } = useParams();

  const post = blogPosts.find(blog => blog.id === id);

  if (!post) {
    return <div className="text-center text-xl mt-10 mb-100">Bài viết không tồn tại.</div>;
  }

  return (
    <div className="min-h-screen p-6 flex justify-center">
      <div className="max-w-4xl w-full p-6">
        <h1 className="text-sm text-orange-500 mb-4">DXLAB Blog</h1>
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-500 mb-6">Ngày đăng: {post.date}</p>
        <img src={post.image} alt={post.title} className="w-full rounded-lg shadow-lg mb-6 object-cover" />
        <p className="text-lg text-justify">{post.content}</p>
        <img src={post.images} alt={''} className="w-full rounded-lg shadow-lg mb-6 object-cover" />
        <p className="text-lg text-justify">{post.contents}</p>
      </div>
    </div>
  );
};

export default BlogDetail;
