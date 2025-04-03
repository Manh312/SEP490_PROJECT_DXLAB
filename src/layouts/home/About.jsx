import { about } from "../../constants";
import images3 from "../../assets/dxlab_images3.jpg";
// import images2 from "../../assets/dxlab_images2.jpg"
import images4 from "../../assets/dxlab_images4.jpg"


const About = () => {
  return (
    <div className="min-h-screen p-6 mb-20">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto py-16 flex flex-col md:flex-row items-center">
      <div className="md:w-1/2 px-4">
          <img
            src= {images4}
            alt="Không gian DXLAB"
            className="w-full rounded-lg shadow-lg"
          />
        </div>
        <div className="md:w-1/2 px-4">
          <h1 className="text-3xl md:text-3xl font-bold mb-6">
            Hệ thống không gian Học Tập, Làm Việc - Khởi Nghiệp tại DXLAB
          </h1>
          <p className="text-lg">
            <span className="font-semibold">DXLAB</span> - Không gian làm việc chung sáng tạo dành cho sinh viên
            và giảng viên tại FPT University, mang đến môi trường hiện đại, tiện nghi và kết nối.
          </p>
        </div>
      </div>

      {/* Sứ Mệnh & Tầm Nhìn */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">Sứ Mệnh Của Chúng Tôi</h2>
          <p className="text-lg">
            Chúng tôi cam kết mang đến không gian học tập và làm việc lý tưởng, hỗ trợ tối đa cho quá trình nghiên cứu, phát triển dự án và sáng tạo của sinh viên.
          </p>
        </div>
        <img src={images3} alt="About Us" className="rounded-lg shadow-xl" />
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
