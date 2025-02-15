import logo2 from "../assets/logo2.png";
import { Facebook, Phone, MapPin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Cột 1: Giới thiệu */}
        <div>
          <img className="h-10 mb-4" src={logo2} alt="DXLAB Logo" />
          <p className="text-sm text-gray-400">
            Với mục tiêu tạo ra không gian rộng rãi, cơ sở vật chất tiện tiến phục vụ sinh viên, giảng viên học tập và làm việc hiệu quả.
          </p>
        </div>

        {/* Cột 2: Kênh truyền thông */}
        <div>
          <h3 className="text-orange-500 text-lg font-semibold mb-4">Các kênh truyền thông</h3>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <Facebook className="text-orange-500" />
              <a href="#" className="hover:text-gray-400">DXLAB Co - Working Space</a>
            </li>
          </ul>
        </div>

        {/* Cột 3: Đối tác liên kết */}
        <div>
          <h3 className="text-orange-500 text-lg font-semibold mb-4">Đối tác liên kết</h3>
          <ul className="space-y-2 text-gray-400">
            <li>FPT Telecom</li>
            <li>FPT Group</li>
            <li>FPT Software</li>
          </ul>
        </div>

        {/* Cột 4: Liên hệ */}
        <div>
          <h3 className="text-orange-500 text-lg font-semibold mb-4">Liên hệ DXLAB</h3>
          <ul className="space-y-2 text-gray-400">
            <li className="flex items-center space-x-2">
              <Phone className="text-orange-500" />
              <span>0976852120</span>
            </li>
            <li className="flex items-center space-x-2">
              <MapPin className="text-orange-500" />
              <span>Hoa Lac Hi-tech Park, km 29, Đại lộ, Thăng Long, Hà Nội, Vietnam</span>
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
