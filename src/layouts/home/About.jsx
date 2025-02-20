import { CheckCircle2 } from "lucide-react";
import { useTheme } from "../../hooks/use-theme";
import images1 from '../../assets/dxlab_images1.jpg';
import images3 from '../../assets/dxlab_images2.jpg';

const About = () => {
  const theme = useTheme();
  return (
    <div className={`min-h-screen p-6 ${theme === "dark" ? "bg-black text-white" : ""}`}>
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Về Chúng Tôi</h1>
        <p className="text-lg mb-10">DXLAB - Hệ thống không gian phòng LAB hàng đầu tại FPT University</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Sứ Mệnh Của Chúng Tôi</h2>
          <p>DXLAB hướng đến việc cung cấp môi trường làm việc hiện đại, tiện nghi và sáng tạo cho sinh viên và giảng viên.</p>
        </div>
        <img src={images3} alt="About Us" className="rounded-lg shadow-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 max-w-6xl mx-auto">
        {["Không gian hiện đại", "Hỗ trợ tận tình", "Mạng lưới kết nối rộng rãi"].map((item, index) => (
          <div key={index} className="border p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-2">{item}</h3>
            <p>Mô tả ngắn về lợi ích của không gian làm việc DXLAB.</p>
          </div>
        ))}
      </div>

      <div className='mt-20'>
        <h2 className='text-3xl sm:text-5xl lg:text-4xl text-center mt-6 tracking-wide'>
          Thông tin chi tiết về các loại hình dịch vụ của DXLAB
        </h2>
        <div className='flex flex-wrap justify-center'>
          <div className='py-6 w-full lg:w-1/2'>
            <img src={images1} alt="images" className="rounded-lg shadow-lg" />
          </div>
          <div className='pt-12 w-full lg:w-1/2'>
            {[{
              title: "Chỗ ngồi cá nhân cố định",
              description: "Dành cho cá nhân muốn có một không gian làm việc riêng biệt, ổn định và đầy đủ tiện nghi. Bao gồm bàn làm việc, ghế ergonomic, ổ cắm điện riêng và kết nối internet tốc độ cao."
            }, {
              title: "Chỗ ngồi theo nhóm cố định",
              description: "Lý tưởng cho các nhóm làm việc hoặc dự án cần một không gian cố định để cộng tác. Không gian được trang bị bàn nhóm, bảng trắng, thiết bị trình chiếu và các tiện ích hỗ trợ làm việc nhóm."
            }].map((item, index) => (
              <div key={index} className='flex mb-12'>
                <div className='text-green-500 mx-6 h-10 w-10 p-2 justify-center items-center rounded-full'>
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
      </div>
    </div>
  );
};

export default About;
