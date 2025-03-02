import { FaLock } from "react-icons/fa";
import { ConnectWallet } from "@thirdweb-dev/react";

const NotAuthenticate = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 -mt-30 -mb-30">
      <div className="border p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl flex flex-col items-center text-center w-full max-w-md sm:max-w-lg">
        <FaLock className="text-orange-500 text-6xl mb-4 animate-pulse" />
        <h1 className="text-4xl sm:text-5xl font-extrabold">403</h1>
        <p className="text-base sm:text-lg mt-2 leading-relaxed">
          Bạn chưa đăng nhập! Vui lòng ấn nút đăng nhập dưới đây <br />
          hoặc nhấn nút đăng nhập ở góc bên phải trên cùng để tiếp tục.
        </p>
        <ConnectWallet btnTitle="Đăng nhập ngay" style={{ marginTop: "1rem", backgroundColor: "tan", color: "black" }}/>
      </div>
    </div>
  );
}

export default NotAuthenticate;
