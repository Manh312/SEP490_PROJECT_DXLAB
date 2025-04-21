import { about } from "../../constants";
import images3 from "../../assets/dxlab_images3.jpg";
import images4 from "../../assets/dxlab_images4.jpg";
import { motion } from "framer-motion"; // For animations

const About = () => {
  // Animation variants for smooth transitions
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 md:p-12">
      {/* Hero Section */}
      <motion.div
        className="max-w-7xl mx-auto py-20 flex flex-col md:flex-row items-center gap-12"
        initial="hidden"
        whileInView="visible"
        variants={fadeIn}
        viewport={{ once: true }}
      >
        <div className="md:w-1/2 px-6">
          <img
            src={images4}
            alt="Không gian DXLAB"
            className="w-full rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="md:w-1/2 px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Hệ thống không gian Học Tập, Làm Việc & Khởi Nghiệp tại DXLAB
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            <span className="font-semibold text-orange-500">DXLAB</span> - Không gian làm việc chung sáng tạo dành cho sinh viên và giảng viên tại FPT University, mang đến môi trường hiện đại, tiện nghi và kết nối.
          </p>
        </div>
      </motion.div>

      {/* Mission & Vision Section */}
      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-16"
        initial="hidden"
        whileInView="visible"
        variants={fadeIn}
        viewport={{ once: true }}
      >
        <div className="px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Sứ Mệnh Của Chúng Tôi</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Chúng tôi cam kết mang đến không gian học tập và làm việc lý tưởng, hỗ trợ tối đa cho quá trình nghiên cứu, phát triển dự án và sáng tạo của sinh viên.
          </p>
        </div>
        <img
          src={images3}
          alt="About Us"
          className="rounded-2xl shadow-2xl w-full transform hover:scale-105 transition-transform duration-300"
        />
      </motion.div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto py-20">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12"
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          viewport={{ once: true }}
        >
          Dịch Vụ Tại DXLAB
        </motion.h2>
        {about.map((service, index) => (
          <motion.div
            key={index}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12 ${
              index % 2 === 0 ? "" : "lg:flex-row-reverse"
            }`}
            initial="hidden"
            whileInView="visible"
            variants={fadeIn}
            viewport={{ once: true }}
          >
            <img
              src={service.image}
              alt={service.title}
              className="rounded-2xl shadow-2xl w-full transform hover:scale-105 transition-transform duration-300"
            />
            <div className="px-6">
              <h5 className="text-2xl font-semibold text-orange-500 mb-4">{service.title}</h5>
              <p className="text-lg text-gray-600 leading-relaxed">{service.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default About;