import { about } from "../../constants";
import images2 from "../../assets/dxlab_images2.jpg";

const About = () => {
  return (
    <div className="min-h-screen p-6 mb-20">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto text-center py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Về Chúng Tôi</h1>
        <p className="text-lg max-w-3xl mx-auto">
          <span className="font-semibold">DXLAB</span> - Không gian làm việc chung sáng tạo dành cho sinh viên và giảng viên tại FPT University, mang đến môi trường hiện đại, tiện nghi và kết nối.
        </p>
      </div>

      {/* Sứ Mệnh & Tầm Nhìn */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">Sứ Mệnh Của Chúng Tôi</h2>
          <p className="text-lg">
            Chúng tôi cam kết mang đến không gian học tập và làm việc lý tưởng, hỗ trợ tối đa cho quá trình nghiên cứu, phát triển dự án và sáng tạo của sinh viên.
          </p>
        </div>
        <img src={images2} alt="About Us" className="rounded-lg shadow-xl" />
      </div>

      {/* Dịch Vụ */}
      <div className="max-w-6xl mx-auto mt-20">
        <h2 className="text-3xl text-center font-bold mb-10">Dịch Vụ Tại DXLAB</h2>
        {about.map((service, index) => (
          <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mt-10">
            <img src={service.image} alt={service.title} className="rounded-lg shadow-xl" />
            <div>
              <h5 className="text-3xl font-semibold pb-5 text-orange-500">{service.title}</h5>
              <p className="font-sans">{service.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
