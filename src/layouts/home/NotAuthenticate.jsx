import { Link } from "react-router-dom";
import { FaLock } from "react-icons/fa";

const NotAuthenticate = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen -mt-20 -mb-20">
      <div className="border p-10 rounded-2xl shadow-xl flex flex-col items-center text-center">
        <FaLock className="text-orange-500 text-6xl mb-4 animate-pulse" />
        <h1 className="text-5xl font-extrabold">403</h1>
        <p className="text-lg mt-2">
          Bạn chưa đăng nhập! Vui lòng đăng nhập để tiếp tục.
        </p>
        <Link 
          to="/login"
          className="mt-6 px-6 py-3 bg-orange-500 text-white font-semibold text-lg rounded-lg shadow-lg hover:bg-orange-600 transition-all duration-300"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}

export default NotAuthenticate;
