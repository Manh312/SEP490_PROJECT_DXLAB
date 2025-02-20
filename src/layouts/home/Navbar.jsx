import { LogOut, Menu, Moon, Sun, User, X } from "lucide-react";
import { useState } from "react";
import logo from "../../assets/logo_images.png";
import { navItems } from "../../constants";
import { useTheme } from "../../hooks/use-theme";
import { Link, useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/Authentication";


const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);

  const auth = getAuth();
  const user = auth.currentUser;
  console.log("User Info:", user);


  const handleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };


  return (
    <nav className="sticky top-0 z-50 py-2 backdrop-blur-lg border-b border-neutral-700/80">
      <div className="container px-4 mx-auto relative text-sm flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <img className="h-30 w-35" src={logo} alt="logo" />
        </div>

        {/* Desktop Navigation */}
        <ul className="hidden lg:flex ml-14 space-x-12 text-xl">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link to={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex justify-center space-x-6 items-center">
          {isLoggedIn ? (
            <div className="relative">
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <img
                  src={user?.photoURL}
                  alt="Avatar"
                  className="w-10 h-10 mt-1.5 rounded-full border border-gray-500 cursor-pointer"
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${theme === "dark" ? "bg-neutral-900" : "bg-slate-100"}`}>
                  <ul className="py-2">
                    <li className={`px-4 py-2 flex items-center gap-2 cursor-pointer ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-slate-300"} w-full`}>
                      <Link to="/profile" className="flex items-center gap-2 w-full">
                        <User size={16} /> Hồ sơ
                      </Link>
                    </li>
                    <li
                      className={`px-4 py-2 ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-slate-300"}  flex items-center gap-2 cursor-pointer w-full`}
                      onClick={() => {
                        dispatch(logout());
                        setIsDropdownOpen(false);
                      }}
                    >
                      <Link onClick={() => dispatch(logout())} className="flex items-center gap-2 w-full">
                        <LogOut size={16} />
                        Đăng xuất
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            !isLoginPage && (
              <Link
                to="/login"
                className="bg-orange-500 text-white py-2 px-3 rounded-md"
              >
                Đăng nhập
              </Link>
            )
          )}
          <button
            className="p-2 border rounded-md transition-colors"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex">
          <button onClick={handleMobileDrawer} className="p-2 border rounded-md">
            {mobileDrawerOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileDrawerOpen && (
        <div className={`fixed right-0 z-20 w-full p-12 flex flex-col justify-center items-center lg:hidden ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"} transition-colors`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md text-center">
            <ul className={`${theme === "dark" ? "text-white" : "text-black"} text-lg space-y-4`}>
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link to={item.href} onClick={handleMobileDrawer}>{item.label}</Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-col items-center space-y-4">
              {isLoggedIn ? (
                <>
                  <div className="flex flex-row gap-4">
                    <Link to={"/profile"}>
                      {user && user.photoURL && (
                        <img src={user.photoURL} alt="Avatar" className="w-12 h-12 rounded-full" />
                      )}
                    </Link>
                    <button
                      className={`p-2 border rounded-md ${theme === "dark" ? "text-white" : "text-black"}`}
                      onClick={() => {
                        setTheme(theme === "light" ? "dark" : "light");
                        handleMobileDrawer();
                      }}
                    >
                      {theme === "dark" ? <Moon size={24} /> : <Sun size={24} />}
                    </button>
                  </div>
                  <Link
                    onClick={() => {
                      dispatch(logout());
                      handleMobileDrawer();
                    }}
                    className="bg-orange-500 py-2 px-4 rounded-md"
                  >
                    Đăng xuất
                  </Link>
                </>
              ) : (
                !isLoginPage && (
                  <Link
                    to="/login"
                    className="bg-orange-600 text-white py-2 px-4 rounded-md w-full"
                    onClick={handleMobileDrawer}
                  >
                    Đăng nhập
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
