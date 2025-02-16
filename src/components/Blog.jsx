import { CheckCircle2 } from 'lucide-react';
import images1 from '../assets/images1.png';
import { checklistItems } from '../constants';
import { useTheme } from '../hooks/use-theme';

const Blog = () => {
  const theme = useTheme();

  return (
    <div className='mt-20'>
      <h2 className='text-3xl sm:text-5xl lg:text-6xl text-centet mt-6 tracking-wide'>
        Bài viết giới thiệu
        <span className='bg-gradient-to-r from-orange-500 to-orange-800 text-transparent bg-clip-text'>
          {" "}về không gian DXLAB
        </span>
      </h2>
      <div className='flex flex-wrap justify-center'>
        <div className='py-6 w-full lg:w-1/2'>
          <img src={images1} alt="images" />
        </div>
        <div className='pt-12 w-full lg:w-1/2'>
          {checklistItems.map((item, index) => (
            <div key={index} className='flex mb-12'>
              <div className='text-green-500 mx-6  h-10 w-10 p-2 justify-center items-center rounded-full'>
                <CheckCircle2 />
              </div>
              <div>
                <h5 className='mt-1 mb-2 text-xl'>{item.title}</h5>
                <p className='text-md text-neutral-500'>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`min-h-screen p-6 ${theme === "dark" ? "bg-black text-white" : ""}`}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">DXLAB Blog</h1>
          <p className="text-center text-lg mb-10">Khám phá không gian làm việc lý tưởng với DXLAB Blog</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="border rounded-lg p-4 shadow-lg hover:shadow-xl transition">
                <img src={`https://source.unsplash.com/400x250/?workspace,office`} alt="Blog Thumbnail" className="rounded-lg mb-4" />
                <h2 className="text-xl font-semibold mb-2">Bài viết {index + 1}</h2>
                <p className="text-sm text-gray-400">Ngày đăng: 20/02/2025</p>
                <p className="mt-2">Mô tả ngắn gọn về bài viết. Khám phá không gian làm việc chung...</p>
                <button className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg">Đọc tiếp</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Blog;
