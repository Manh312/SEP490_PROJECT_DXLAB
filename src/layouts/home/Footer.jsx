import { Phone, MapPin, Mail } from "lucide-react";
import { useTheme } from "../../hooks/use-theme";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";


const Footer = () => {
  const theme = useTheme();
  return (
    <footer className={`py-10 px-6 border-t border-neutral-700/80 ${theme === "dark" ? "bg-black text-white" : ""}`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Cột 1: Giới thiệu */}
        <div>
          <div>
            <h2 className="text-xl font-extrabold bg-gradient-to-r from-orange-500 to-yellow-400 text-transparent bg-clip-text">
              DIGITAL TRANSFORMATION <span className="block text-xl ml-18">LABORATORY</span>
            </h2>
          </div>

          <div className="flex space-x-6 mt-4 ml-10">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook className=" hover:text-blue-500 text-2xl" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram className=" hover:text-pink-500 text-2xl" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              <FaYoutube className=" hover:text-red-500 text-2xl" />
            </a>
          </div>
        </div>

        {/* Cột 2: Kênh truyền thông */}
        <div>
          <h3 className="text-orange-500 text-lg font-semibold mb-4">Dịch vụ</h3>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <Link to={'/about'}>Chỗ ngồi cá nhân</Link>
            </li>
            <li className="flex items-center space-x-2">
              <Link to={'/about'}>Chỗ ngồi theo nhóm</Link>
            </li>
          </ul>
        </div>

        {/* Cột 3: Đối tác liên kết */}
        <div>
          <h3 className="text-orange-500 text-lg font-semibold mb-4">Khám phá</h3>
          <ul className="space-y-2">
            <li className="hover:text-gray-400">
              <Link to={'/'}>Trang chủ</Link>
            </li>
            <li className="hover:text-gray-400">
              <Link to={'/blog'}>DXLAB Blog</Link>
            </li>
            <li className="hover:text-gray-400">
              <Link to={'/about'}>Về DXLAB</Link>
            </li>
          </ul>
        </div>

        {/* Cột 4: Liên hệ */}
        <div>
          <h3 className="text-orange-500 text-lg font-semibold mb-4">Liên hệ DXLAB</h3>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <Phone className="text-orange-500" />
              <span>0976852120</span>
            </li>
            <li className="flex items-center space-x-2">
              <MapPin size={24} className="text-orange-500 flex-shrink-0" />
              <span className="flex-1">Hoa Lac Hi-tech Park, km 29 Đại lộ, Thăng Long, Hà Nội, Vietnam</span>
            </li>

            <li className="flex items-center space-x-2">
              <Mail className="text-orange-500" />
              <span>dxlab@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
