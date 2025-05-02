import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import images3 from "../../assets/dxlab_images3.jpg";
import images4 from "../../assets/dxlab_images4.jpg";

// Placeholder for icons (since we don't have the actual icons)
const placeholderIcon = "https://via.placeholder.com/50?text=Icon";

const About = () => {
  // Animation variants for smooth transitions
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  // Data for the three-column section
  const benefits = [
    {
      icon: placeholderIcon,
      title: "Không gian học tập hiện đại",
      description:
        "DXLAB cung cấp không gian học tập và làm việc hiện đại, tiện nghi, giúp sinh viên FPT tối ưu hóa hiệu quả học tập và nghiên cứu, với cơ sở vật chất hỗ trợ tối đa cho các dự án nhóm và cá nhân.",
    },
    {
      icon: placeholderIcon,
      title: "Cộng đồng sinh viên sáng tạo",
      description:
        "Kết nối với các sinh viên FPT cùng chí hướng, chia sẻ ý tưởng và hợp tác trong các dự án sáng tạo, xây dựng một cộng đồng học tập năng động và hỗ trợ lẫn nhau.",
    },
    {
      icon: placeholderIcon,
      title: "Hỗ trợ phát triển kỹ năng",
      description:
        "DXLAB tạo điều kiện để sinh viên phát triển kỹ năng mềm và chuyên môn thông qua các hoạt động nhóm, nghiên cứu và làm việc thực tế, chuẩn bị cho tương lai nghề nghiệp.",
    },
  ];

  // Data for the three-image section
  const services = [
    {
      image: images3,
      caption: "Hỗ trợ học tập và nghiên cứu",
    },
    {
      image: images4,
      caption: "Không gian làm việc nhóm hiệu quả",
    },
    {
      image: "https://via.placeholder.com/400x300?text=DXLAB+Facility",
      caption: "Cơ sở vật chất hiện đại",
    },
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 mt-5">
      {/* Header Section */}
      <motion.div
        className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Image with Red Curved Background */}
        <motion.div
          className="lg:w-1/2 relative"
          variants={itemVariants}
        >
          <div
            className="absolute top-0 left-0 w-3/4 h-full bg-orange-500 rounded-full opacity-50"
            style={{ transform: 'translate(-30%, -30%)' }}
          ></div>
          <img
            src={images4}
            alt="DXLAB coworking space"
            className="w-full h-96 object-cover rounded-xl relative z-10 shadow-xl"
          />
        </motion.div>
        {/* Text */}
        <motion.div
          className="lg:w-1/2 flex flex-col justify-center"
          variants={itemVariants}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Hệ sinh thái Học tập, Làm việc & Sáng tạo DXLAB
          </h1>
          <p className="text-base sm:text-lg leading-relaxed mb-4">
            DXLAB là không gian lý tưởng dành cho sinh viên Đại học FPT, nơi bạn có thể học tập, làm việc nhóm, phát triển dự án và nghiên cứu. Chúng tôi mang đến môi trường hiện đại, tiện nghi và sáng tạo, giúp bạn tối ưu hóa hiệu quả học tập và phát triển kỹ năng.
          </p>
          <p className="text-base sm:text-lg leading-relaxed">
            Hệ sinh thái DXLAB hỗ trợ sinh viên trong mọi giai đoạn, từ học tập cá nhân, nghiên cứu chuyên sâu đến các dự án nhóm sáng tạo, tạo điều kiện để bạn kết nối và phát triển toàn diện.
          </p>
        </motion.div>
      </motion.div>

      {/* Individual and Group Areas Section */}
      <motion.div
        className="max-w-7xl mx-auto flex flex-col gap-8 py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Individual Area */}
        <motion.div
          className="bg-white rounded-3xl p-8 relative overflow-hidden shadow-lg"
          variants={itemVariants}
        >
          {/* Pink Curved Shape in Bottom-Left */}
          <div
            className="absolute bottom-0 left-0 w-64 h-64 bg-pink-100 rounded-full opacity-50"
            style={{ transform: 'translate(-50%, 50%)' }}
          ></div>

          {/* Content - Single Row */}
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
            {/* Text */}
            <div className="flex-1">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Khu vực Cá nhân tại DXLAB
              </h2>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-8">
                Khu vực Cá nhân tại DXLAB Coworking Space là không gian lý tưởng dành cho sinh viên Đại học FPT, nơi bạn có thể tập trung học tập, nghiên cứu và phát triển các dự án cá nhân. Với cơ sở vật chất hiện đại và môi trường yên tĩnh, khu vực này giúp bạn đạt hiệu quả cao nhất trong học tập. DXLAB luôn sẵn sàng hỗ trợ bạn trên hành trình chinh phục tri thức.
              </p>
            </div>
            {/* Image */}
            <div className="flex-1">
              <img
                src={images3}
                alt="Individual area at DXLAB"
                className="w-full h-64 object-cover rounded-xl shadow-md"
              />
            </div>
          </div>
        </motion.div>

        {/* Group Area */}
        <motion.div
          className="bg-gray-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-lg"
          variants={itemVariants}
        >
          {/* Pink Curved Shape in Top-Left */}
          <div
            className="absolute top-0 left-0 w-64 h-64 bg-pink-100 rounded-full opacity-50"
            style={{ transform: 'translate(-50%, -50%)' }}
          ></div>

          {/* Content - Single Row */}
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
            {/* Image */}
            <div className="flex-1 order-1 lg:order-0">
              <img
                src={images4}
                alt="Group area at DXLAB"
                className="w-full h-64 object-cover rounded-xl shadow-md"
              />
            </div>
            {/* Text */}
            <div className="flex-1 order-0 lg:order-1">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Khu vực Nhóm tại DXLAB
              </h2>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-8">
                Khu vực Nhóm tại DXLAB không chỉ là nơi học tập mà còn là cầu nối để sinh viên Đại học FPT gắn kết với nhau. Tại đây, bạn có thể gặp gỡ những người bạn cùng chí hướng, thảo luận ý tưởng và cùng nhau thực hiện các dự án sáng tạo. Với không gian được thiết kế để khuyến khích sự hợp tác, DXLAB giúp bạn mở rộng mạng lưới quan hệ và phát triển kỹ năng nhóm.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Three-Column Section */}
      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300"
            variants={itemVariants}
          >
            <img
              src={benefit.icon}
              alt="Icon"
              className="w-12 h-12 mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {benefit.title}
            </h3>
            <p className="text-gray-600 text-base leading-relaxed">
              {benefit.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Three-Image Section */}
      <motion.div
        className="max-w-7xl mx-auto py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-3xl sm:text-4xl font-bold  mb-12 text-center"
          variants={itemVariants}
        >
          Hỗ trợ sinh viên trên hành trình học tập và sáng tạo
        </motion.h2>
        <div className="bg-gray-900 rounded-3xl p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center"
                variants={itemVariants}
              >
                <img
                  src={service.image}
                  alt={service.caption}
                  className="w-full h-48 object-cover rounded-xl mb-4 shadow-md"
                />
                <p className="text-white text-base font-medium text-center">
                  {service.caption}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About;