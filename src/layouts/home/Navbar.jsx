import { History, Menu, Moon, Sun, User, X,  } from "lucide-react";
import { useState } from "react";
import logo from "../../assets/logo_images.png";
import { navItems } from "../../constants";
import { useTheme } from "../../hooks/use-theme";
import { Link } from "react-router-dom";
import { ConnectWallet, useAddress } from "@thirdweb-dev/react";

const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const address = useAddress();

  const handleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  return (
    <nav className="sticky top-0 z-50 py-2 backdrop-blur-lg border-b border-neutral-700/80">
      <div className="container px-4 mx-auto relative text-sm flex justify-between items-center">
        <div className="flex items-center flex-shrink-0">
          <img className="h-30 w-35" src={logo} alt="logo" />
        </div>

        <ul className="hidden lg:flex ml-14 space-x-12 text-xl">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link to={item.href}>{item.label}</Link>
            </li>
          ))}
          {address && (
            <li>
              <Link to="/rooms">Dịch vụ</Link>
            </li>
          )}
        </ul>

        <div className="hidden lg:flex justify-center space-x-6 items-center">
          {address ? (
            <div className="relative">
              {/* <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}> */}
                <ConnectWallet size={16} />
              {/* </button> */}
              {/* {isDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${theme === "dark" ? "bg-neutral-900" : "bg-slate-100"}`}>
                  <ul className="py-2">
                    <li className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-700">
                      <Link to="/profile" className="flex items-center gap-2 w-full">
                        <User size={16} /> Hồ sơ
                      </Link>
                    </li>
                    <li className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-700 border-t">
                      <Link to="/booked-history" className="flex items-center gap-2 w-full">
                        <History size={16} /> Lịch sử
                      </Link>
                    </li>
                  </ul>
                </div>
              )} */}
            </div>
          ) : (
            <ConnectWallet />
          )}

          <button
            className="p-2 ml-5 border rounded-md transition-colors"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>

        <div className="lg:hidden flex">
          <button onClick={handleMobileDrawer} className="p-2 border rounded-md">
            {mobileDrawerOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <div className={`fixed top-0 left-0 h-screen z-20 transition-transform duration-300 w-4/5 max-w-sm flex flex-col ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"} ${mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <ConnectWallet theme="dark" className="w-full bg-orange-500 text-white py-2 px-3 rounded-md" />
          <button onClick={handleMobileDrawer} className="p-2">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ul className="flex flex-col py-2">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link to={item.href} onClick={() => setMobileDrawerOpen(false)} className="block px-4 py-3 hover:bg-gray-200 dark:hover:bg-gray-800">
                  {item.label}
                </Link>
              </li>
            ))}

            {address && (
              <li>
                <Link to="/rooms" onClick={() => setMobileDrawerOpen(false)} className="block px-4 py-3 hover:bg-gray-200 dark:hover:bg-gray-800">
                  Dịch vụ
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div className="border-t p-4 text-xs text-gray-500 dark:text-gray-400 dark:border-gray-700">
          <p>© 2025 DXLAB</p>
          <p>All rights reserved.</p>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
