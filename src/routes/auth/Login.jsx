// import { useDispatch, useSelector } from "react-redux";
import logo from "../../assets/logo_images.png";
import { useTheme } from "../../hooks/use-theme";
// import { loginWithGoogle } from "../../redux/slices/Authentication";

const Login = () => {
  // const dispatch = useDispatch();
  // const { isLoading } = useSelector((state) => state.auth);
  const theme = useTheme();

  // const handleGoogleLogin = () => {
  //   dispatch(loginWithGoogle());
  // };

  return (
    <div className={`flex flex-col md:flex-row items-center justify-center min-h-screen ${theme === "dark" ? "bg-black text-white" : ""}`}>

      <div className="flex flex-col items-center w-full md:w-3/5 mb-6 md:mb-0 relative">
        <div className="relative flex items-center justify-center">
          <img src={logo} alt="DXLAB Logo" className="w-80 md:w-96" />
        </div>

        <p className="text-center text-2xl max-w-md mt-6">
          Hệ thống không gian phòng LAB hàng đầu tại FPT University
        </p>
      </div>

      <div className="w-full md:w-1/3 p-6 rounded-lg shadow-lg border border-neutral-700">
        <h2 className="text-center text-xl mb-4">Đăng nhập</h2>
        <button className="w-full bg-orange-600 text-white font-medium py-2 rounded-lg mb-3">
          Cán bộ, giảng viên, sinh viên Đh-FPT
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white font-medium py-2 rounded-lg">
          <span className="text-lg">G+</span> Đăng nhập
        </button>
      </div>
    </div>
  );
};

export default Login;
