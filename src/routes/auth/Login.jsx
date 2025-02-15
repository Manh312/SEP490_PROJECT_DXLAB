import logo from "../../assets/logo.png";
import logo2 from "../../assets/logo2.png";

const Login = () => {
  return (
    <div className="border border-neutral-700">
      <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-black text-white p-6">
        <div className="flex flex-col items-center w-full md:w-3/5 mb-6 md:mb-0">
          <img src={logo} alt="DXLAB Logo" className="w-70" />
          <img src={logo2} alt="DXLAB Logo" className="w-32" />
          <p className="text-center text-lg max-w-md mt-4">
            Hệ thống không gian phòng LAB hàng đầu tại FPT University
          </p>
        </div>
        
        <div className="w-full md:w-1/3 bg-neutral-900 p-6 rounded-lg shadow-lg border border-neutral-700">
          <h2 className="text-center text-xl font-semibold mb-4">Đăng nhập</h2>
          <button className="w-full bg-orange-600 text-white font-medium py-2 rounded-lg mb-3">
            Cán bộ, giảng viên, sinh viên Đh-FPT
          </button>
          <button className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white font-medium py-2 rounded-lg">
            <span className="text-lg">G+</span> ĐĂNG NHẬP
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
