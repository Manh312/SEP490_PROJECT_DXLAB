import { Bell, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import logo from "../assets/logo.png"
import { navItems } from "../constants";
import { useTheme } from "../hooks/use-theme";
import profileImg from "../assets/profile-image.jpg";

const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };
  return (
    <nav className="sticky top-0 z-50 py-3 backdrop-blur-lg border-b border-neutral-700/80">
      <div className="container px-4 mx-auto relative text-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-shrink-0">
            <img className="h-10 w-10 mr-2" src={logo} alt="logo" />
            <span className="text-xl tracking-tight">DXLAB Co-working Space</span>
          </div>
          <ul className="hidden lg:flex ml-14 space-x-12 ">
            {navItems.map((item, index) => (
              <li key={index}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
          <div className="hidden lg:flex justify-center space-x-6 items-center">
            <a href="#" className="py-2 px-3 border rounded-md">
              Đăng nhập
            </a>
            <a href="#" className="bg-gradient-to-r from-orange-500 to-orange-800 py-2 px-3 rounded-md">
              Tạo tài khoản
            </a>
            <div className="flex items-center gap-x-3">
              <button
                className="p-2 border rounded-md transition-colors"
                onClick={() => {
                  const newTheme = theme === "light" ? "dark" : "light";
                  setTheme(newTheme);
                }}
              >
                {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <button className="p-2 border rounded-md">
                <Bell size={20} />
              </button>
              <button>
                <img src={profileImg} className="w-10 h-10 rounded-full size-full object-cover" alt="" />
              </button>

            </div>
          </div>
          <div className="lg:hidden md:flex flex-col justify-end">
            <button onClick={handleMobileDrawer}>
              {mobileDrawerOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {
          mobileDrawerOpen && (
            <div
              className={`fixed right-0 z-20 w-full p-12 flex flex-col justify-center items-center lg:hidden 
              ${theme === "light" ? "bg-white" : "bg-neutral-900"} transition-colors`}
            >
              <div className="flex flex-col md:flex-row h-85 p-6 gap-6 -mt-10">
                <div className="flex-1 flex flex-col items-center gap-6">
                  <ul className="space-y-4">
                    {navItems.map((item, index) => (
                      <li key={index} className="text-lg">
                        <a href={item.href}>{item.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex-1 flex flex-col items-center gap-4">
                  <a href="#" className="w-full text-center py-2 px-3 border rounded-md">Đăng nhập</a>
                  <a href="#" className="w-full text-center py-2 px-3 rounded-md bg-gradient-to-r from-orange-500 to-orange-800">
                    Tạo tài khoản
                  </a>
                  <div className="flex items-center gap-4 mt-4">
                    <button
                      className="p-2 border rounded-md transition-colors"
                      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    >
                      {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    <button className="p-2 border rounded-md">
                      <Bell size={20} />
                    </button>
                    <button className="w-10 h-10 rounded-full overflow-hidden">
                      <img src={profileImg} className="size-full object-cover" alt="Profile" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </nav>
  );
}

export default Navbar;
