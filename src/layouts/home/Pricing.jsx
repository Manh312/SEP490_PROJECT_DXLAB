import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import images4 from "../../assets/dxlab_images4.jpg";
import images3 from "../../assets/about_images.png";

const Pricing = () => {
  // Animation variants
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

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-7xl mx-auto flex flex-col gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* First Section - "Khơi nguồn sáng tạo tại DXLAB" */}
        <motion.div
          className="bg-white rounded-3xl p-8 relative overflow-hidden"
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
              <h2 className="text-3xl sm:text-5xl lg:text-6xl text-gray-900 mb-6">
                Khơi nguồn sáng 
                <span className="bg-gradient-to-r from-orange-500 to-orange-800 text-transparent bg-clip-text">
                {" "} tạo tại DXLAB
                </span>
              </h2>
              <p className="text-md text-neutral-500 leading-relaxed mb-8">
                DXLAB Coworking Space là không gian lý tưởng dành cho sinh viên Đại học FPT, nơi bạn có thể học tập, làm việc nhóm, phát triển dự án và nghiên cứu. Với cơ sở vật chất hiện đại và môi trường mở, DXLAB mang đến không gian thoải mái để bạn thỏa sức sáng tạo và đạt hiệu quả cao nhất trong học tập. Dù bạn cần một góc yên tĩnh để tập trung hay một không gian năng động để thảo luận nhóm, DXLAB luôn sẵn sàng hỗ trợ bạn trên hành trình chinh phục tri thức.
              </p>
              <Link
                to={`/rooms`}
                className="inline-flex justify-center items-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition duration-200"
              >
                KHÁM PHÁ DỊCH VỤ
              </Link>
            </div>
            {/* Image */}
            <div className="flex-1">
              <img
                src={images4}
                alt="Students working at DXLAB"
                className="w-full h-80 object-cover rounded-xl"
              />
            </div>
          </div>
        </motion.div>

        {/* Second Section - "Kết nối cộng đồng sinh viên FPT" */}
        <motion.div
          className="bg-gray-900 text-white rounded-3xl p-8 relative overflow-hidden"
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
                src={images3}
                alt="DXLAB coworking space"
                className="w-full h-64 object-cover rounded-xl"
              />
            </div>
            {/* Text */}
            <div className="flex-1 order-0 lg:order-1">
              <h2 className="text-3xl sm:text-5xl lg:text-6xl mb-6">
                Kết nối cộng đồng 
                <span className="bg-gradient-to-r from-orange-500 to-orange-800 text-transparent bg-clip-text">
                {" "} sinh viên FPT
                </span>
              </h2>
              <p className="text-md text-neutral-500 leading-relaxed mb-8">
                DXLAB không chỉ là nơi học tập mà còn là cầu nối để sinh viên Đại học FPT gắn kết với nhau. Tại đây, bạn có thể gặp gỡ những người bạn cùng chí hướng, chia sẻ ý tưởng và cùng nhau thực hiện các dự án sáng tạo. Với không gian được thiết kế để khuyến khích sự hợp tác, DXLAB giúp bạn mở rộng mạng lưới quan hệ, học hỏi từ cộng đồng và phát triển kỹ năng cần thiết cho tương lai.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Pricing;