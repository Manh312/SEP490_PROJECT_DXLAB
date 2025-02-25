import { Banknote, History, LogOut, LogOutIcon, Menu, Moon, Sun, User, Wallet, X } from "lucide-react";
import { useState } from "react";
import logo from "../../assets/logo_images.png";
import { navItems } from "../../constants";
import { useTheme } from "../../hooks/use-theme";
import { Link, useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useSelector, useDispatch } from "react-redux";
import { logout, setWalletAddress } from "../../redux/slices/Authentication";
import { ethers } from "ethers";
import { toast } from "react-toastify";

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

  const walletAddress = useSelector((state) => state.auth.walletAddress);
  const handleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  // Kết nối ví
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        console.log("Connected address:", address);
        dispatch(setWalletAddress(address));
        toast.success("Kết nối ví thành công");
      } catch (error) {
        console.error("Connect wallet error:", error);
        toast.error("Kết nối ví thất bại");
      }
    } else {
      alert("Bạn cần cài đặt MetaMask để kết nối ví!");
    }
  };

  const shortenAddress = (address) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
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
          {isLoggedIn && (
            <li>
              <Link to="/areas">Dịch vụ</Link>
            </li>
          )}
        </ul>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex justify-center space-x-6 items-center">
          {isLoggedIn ? (
            <>
              <div className="relative">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <img
                    src={user?.photoURL}
                    alt="Avatar"
                    className="w-10 h-10 mt-1.5 rounded-full cursor-pointer"
                  />
                </button>
                {isDropdownOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${theme === "dark" ? "bg-neutral-900" : "bg-slate-100"
                      }`}
                  >
                    <ul className="py-2">
                      <li
                        className={`px-4 py-2 flex items-center gap-2 cursor-pointer ${theme === "dark"
                          ? "hover:bg-gray-700"
                          : "hover:bg-slate-300"
                          } w-full`}
                      >
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 w-full"
                        >
                          <User size={16} /> Hồ sơ
                        </Link>
                      </li>
                      <li
                        className={`px-4 py-2 ${theme === "dark"
                          ? "hover:bg-gray-700"
                          : "hover:bg-slate-300"
                          } flex items-center gap-2 cursor-pointer w-full border-t border-t-gray-400`}
                      >
                        <Link
                          to={"/booked-history"}
                          className="flex items-center gap-2 w-full"
                        >
                          <History size={16} /> Lịch sử
                        </Link>
                      </li>
                      {walletAddress ? (
                        <>
                          <li className=" border-t border-t-gray-400">
                            <Link
                              to={`/wallet`}
                              onClick={() => {
                                setMobileDrawerOpen(false);
                              }}
                              className={`block px-4 py-3 ${theme === "dark"
                                ? "hover:bg-gray-700"
                                : "hover:bg-slate-300"
                                }`}
                            >
                              <div className="flex items-center gap-2">
                                <Banknote size={18} />  Ví: {shortenAddress(walletAddress)}
                              </div>
                            </Link>
                          </li>
                        </>
                      ) : (
                        <li className=" border-t border-t-gray-400">
                          <Link
                            onClick={() => {
                              connectWallet();
                              setMobileDrawerOpen(false);
                            }}
                            className="block px-4 py-3 hover:bg-gray-200"
                          >
                            <div className="flex items-center gap-2">
                              <Wallet size={18} />Kết nối ví
                            </div>
                          </Link>
                        </li>
                      )}
                      <li
                        className={`px-4 py-2 ${theme === "dark"
                          ? "hover:bg-gray-700"
                          : "hover:bg-slate-300"
                          } flex items-center gap-2 cursor-pointer w-full border-t border-t-gray-400`}
                        onClick={() => {
                          dispatch(logout());
                          setIsDropdownOpen(false);
                        }}
                      >
                        <Link
                          onClick={() => dispatch(logout())}
                          className="flex items-center gap-2 w-full"
                        >
                          <LogOut size={16} />
                          Đăng xuất
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </>
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
      <div
        className={`fixed top-0 left-0 h-screen z-20 
          ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"} 
          transition-transform duration-300 
          w-4/5 max-w-sm
          flex flex-col
          ${mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header của menu (Avatar, user info) */}
        <div className="flex items-center p-4 border-b">
          {isLoggedIn && user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-12 h-12 rounded-full mr-3"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300 mr-3" />
          )}
          <div className="flex flex-col">
            {isLoggedIn ? (
              <>
                <span className="font-semibold">
                  {user?.displayName || "User"}
                </span>
                <span className="text-sm text-gray-500">{user?.email}</span>
              </>
            ) : (
              <span className="font-semibold">Khách</span>
            )}
          </div>
        </div>

        {/* Danh sách item menu */}
        <div className="flex-1 overflow-y-auto">
          <ul className="flex flex-col py-2">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  className="block px-4 py-3 hover:bg-gray-200 dark:hover:bg-gray-800"
                >
                  {item.label}
                </Link>
              </li>
            ))}

            {/* Nếu đã đăng nhập, thêm item "Dịch vụ" */}
            {isLoggedIn && (
              <li>
                <Link
                  to="/areas"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="block px-4 py-3 hover:bg-gray-200"
                >
                  Dịch vụ
                </Link>
              </li>
            )}

            {/* Kết nối ví */}
            {isLoggedIn && (
              <>
                {walletAddress ? (
                  <>
                    <li className=" border-t">
                      <Link
                        onClick={() => {
                          setMobileDrawerOpen(false);
                        }}
                        className="block px-4 py-3 hover:bg-gray-200 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center gap-2">
                          <Banknote size={18} />  Ví: {shortenAddress(walletAddress)}
                        </div>
                      </Link>
                    </li>
                  </>
                ) : (
                  <li className=" border-t">
                    <Link
                      onClick={() => {
                        connectWallet();
                        setMobileDrawerOpen(false);
                      }}
                      className="block px-4 py-3 hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center gap-2">
                        <Wallet size={18} />Kết nối ví
                      </div>
                    </Link>
                  </li>
                )}
              </>
            )}

            {/* Lịch sử, Hồ sơ (nếu cần) */}
            {isLoggedIn && (
              <>
                <li>
                  <Link
                    to="/profile"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="block px-4 py-3 hover:bg-gray-200 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      Hồ sơ
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/booked-history"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="block px-4 py-3 hover:bg-gray-200 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      <History size={16} />
                      Lịch sử
                    </div>
                  </Link>
                </li>
              </>
            )}
            {/* Đăng xuất / Đăng nhập */}
            <li className="border-t">
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    dispatch(logout());
                    setMobileDrawerOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 hover:bg-gray-200 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <LogOutIcon size={16} />Đăng xuất
                  </div>
                </button>
              ) : (
                !isLoginPage && (
                  <Link
                    to="/login"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="block px-4 py-3 hover:bg-gray-200 dark:hover:bg-gray-800"
                  >
                    Đăng nhập
                  </Link>
                )
              )}
            </li>
            {/* Chuyển theme */}
            <li className=" flex items-center gap-3 px-4 py-3">
              <span>Màu nền:</span>
              <button
                onClick={() => {
                  setTheme(theme === "light" ? "dark" : "light");
                }}
                className="p-2 border rounded-md transition-colors"
              >
                {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </li>
          </ul>
        </div>

        {/* Footer của menu */}
        <div className="border-t p-4 text-xs text-gray-500 dark:text-gray-400 dark:border-gray-700">
          <p>© 2025 DXLAB</p>
          <p>All rights reserved.</p>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
