import { Link } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen -mt-20 -mb-20">
      <div className="p-10 rounded-2xl border shadow-xl flex flex-col items-center text-center">
        <FaExclamationTriangle className="text-orange-500 text-7xl mb-4 animate-bounce" />
        <h1 className="text-6xl font-extrabold ">404</h1>
        <p className="text-xl mt-2">Oops! Không tìm thấy trang.</p>
        <p className="text-md mt-1">
          Trang bạn tìm kiếm có thể đã bị xóa hoặc tạm thời không có sẵn.
        </p>
        <Link 
          to="/" 
          className="mt-6 px-6 py-3 bg-orange-500 text-white font-semibold text-lg rounded-lg shadow-lg hover:bg-orange-600 transition-all duration-300"
        >
          Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
