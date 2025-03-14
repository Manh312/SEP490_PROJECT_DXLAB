import { FaExclamationTriangle } from 'react-icons/fa'; // Import icon từ react-icons
import { Link } from 'react-router-dom';

const NotAuthorization = () => {
  return (
    <div className="flex items-center justify-center bg-gradient-to-b font-sans mt-20 mb-20">
      <div className="text-center p-8 sm:p-12 rounded-2xl shadow-xl max-w-md w-full mx-4 transform transition-all hover:shadow-2xl bg-gray-200">
        {/* Icon cảnh báo */}
        <div className="text-7xl flex justify-center items-center text-orange-500 mb-6 animate-pulse">
          <FaExclamationTriangle />
        </div>

        {/* Tiêu đề */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          Truy Cập Bị Từ Chối
        </h1>

        {/* Thông điệp */}
        <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8">
          Bạn không được phép truy cập trang này. Vui lòng kiểm tra lại quyền
          truy cập của bạn hoặc liên hệ với quản trị viên để được hỗ trợ nếu
          có thắc mắc.
        </p>

        {/* Nút hành động */}
        <Link to={'/'}
          className="px-6 py-3 bg-orange-500 text-white text-base font-semibold rounded-lg hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50"
        >
          Quay Lại trang chủ
        </Link>
      </div>
    </div>
  );
};

export default NotAuthorization;