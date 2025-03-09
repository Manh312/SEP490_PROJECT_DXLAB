import { LogOut, LucideHistory, Menu, Moon, Sun, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import logo from "../../assets/logo_images.png";
import { navItems } from "../../constants";
import { useTheme } from "../../hooks/use-theme";
import { Link } from "react-router-dom";
import { ConnectWallet, useAddress, useAuth, useDisconnect } from "@thirdweb-dev/react";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthData } from "../../redux/slices/Authentication";
import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const address = useAddress();
  const dispatch = useDispatch();
  const disconnect = useDisconnect();
  const profileRef = useRef(null);
  const dropdownRef = useRef(null);
  const user = useSelector((state) => state.auth.user);

  const getAuthToken = useAuth(); 
  console.log("getAuthToken:", getAuthToken);
  const getUser = useAuth();
  console.log("getUser:", getUser);
  
  
    // useEffect(() => {
    //   const fetchToken = async () => {
    //     const token = await getAuthToken();
    //     console.log("Fetched ID Token:", token);
    //   };
    //   if (address) fetchToken();
    // }, [address, getAuthToken]);
  

  const handleDisconnect = async () => {
    try {
      console.log("Attempting to disconnect...");
      await disconnect();
      dispatch(clearAuthData());
      setDropdownOpen(false);
      console.log("Disconnected and auth cleared, address:", address);
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  };

  const handleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleProfileClick = () => {
    if (address) {
      setDropdownOpen(!dropdownOpen);
      console.log("Profile clicked, dropdownOpen:", dropdownOpen);
    }
  };

  useEffect(() => {
    if (!address) {
      setDropdownOpen(false);
      console.log("Address changed to:", address);
    }
  }, [address]);

  return (
    <nav className="sticky top-0 z-50 py-2 backdrop-blur-lg border-b border-neutral-700/80">
      <div className="container px-4 mx-auto relative text-sm flex justify-between items-center">
        <div className="flex items-center flex-shrink-0">
          <img className="h-30 w-35" src={logo} alt="logo" />
        </div>

        <ul className="hidden lg:flex space-x-12 text-xl">
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

        <div className="hidden lg:flex justify-center space-x-6 items-center relative z-10">
          {address ? (
            <div ref={profileRef} className="relative">
              <FaUserCircle
                className="h-10 w-10 rounded-full cursor-pointer"
                onClick={handleProfileClick}
              />
              {dropdownOpen && (
                <div
                  ref={dropdownRef}
                  className={`absolute right-0 top-12 w-80 ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"} p-4 rounded-lg shadow-lg z-50`}
                >
                  <span className="block mb-2">{user.storedToken.authDetails.email}</span>
                  <div className="mb-4">
                    <ConnectWallet
                      btnTitle="Manage Wallet"
                      modalSize="wide"
                      hideTestnetFaucet
                      hideBuyButton
                      hideDisconnect
                      style={{ width: "100%" }}
                    />
                  </div>
                  <ul className="space-y-2">
                    <li>
                      <Link to={"/booked-history"}>
                        <button className="flex items-center w-full h-10 text-left hover:bg-gray-500 rounded">
                          <span className="ml-2">Lịch sử giao dịch</span>
                          <LucideHistory size={20} className="ml-2" />
                        </button>
                      </Link>
                    </li>
                    <li className="flex items-center">
                      <button
                        className="flex items-center w-full h-10 text-left hover:bg-gray-500 rounded"
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                      >
                        <span className="ml-2">Màu nền</span>
                        {theme === "dark" ? <Moon size={20} className="ml-2" /> : <Sun size={20} className="ml-2" />}
                      </button>
                    </li>
                    <li className="flex items-center">
                      <button
                        className="flex items-center w-full h-10 text-left hover:bg-gray-500 rounded"
                        onClick={handleDisconnect}
                      >
                        <span className="ml-2">Đăng xuất</span>
                        <LogOut size={20} className="ml-2" />
                      </button>
                    </li>

                  </ul>
                </div>
              )}
            </div>
          ) : (
            <>
              <ConnectWallet
                btnTitle={"Đăng nhập"}
                auth={{ loginOptional: false }}
                modalSize="wide"
              />
              <button
                className="p-2 border rounded-md transition-colors ml-5"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </>
          )}
        </div>

        <div className="lg:hidden flex">
          <button onClick={handleMobileDrawer} className="p-2 border rounded-md">
            {mobileDrawerOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 left-0 h-screen z-20 transition-transform duration-300 w-4/5 max-w-sm flex flex-col ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"} ${mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b relative z-10">
          <div className="flex items-center space-x-4">
            {address && (
              <div>
                <FaUserCircle
                  className="h-8 w-8 rounded-full cursor-pointer"
                />
                <span className="text-sm">{user?.storedToken?.authDetails?.email || "Guest"}</span>
              </div>
            )}
          </div>
          <button onClick={handleMobileDrawer} className="p-2">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {address ? (
              <ConnectWallet
                btnTitle="Manage Wallet"
                modalSize="wide"
                hideTestnetFaucet
                hideBuyButton
                hideDisconnect
                style={{ width: "100%" }}
              />
            ) : (
              <ConnectWallet
                btnTitle="Đăng nhập"
                modalSize="wide"
              />
            )}
          </div>
          <ul className="flex flex-col py-2 border-t">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  className="block px-4 py-3 dark:hover:bg-gray-500"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {address && (
              <>
                <li>
                  <Link
                    to="/rooms"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="block px-4 py-3 dark:hover:bg-gray-500"
                  >
                    Dịch vụ
                  </Link>
                </li>
                <li>
                  <Link to={"/booked-history"}>
                    <button className="flex items-center w-full h-10 text-left hover:bg-gray-500 rounded">
                      <span className="ml-4">Lịch sử giao dịch</span>
                      <LucideHistory size={20} className="ml-2" />
                    </button>
                  </Link>
                </li>
              </>
            )}
          </ul>

          <li className="flex items-center">
            <button
              className="flex items-center w-full h-10 text-left hover:bg-gray-500 rounded"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <span className="ml-4">Màu nền</span>
              {theme === "dark" ? <Moon size={20} className="ml-2" /> : <Sun size={20} className="ml-2" />}
            </button>
          </li>
          {address && (
            <div className="flex flex-col mt-5 border-t border-b">
              <button
                className="flex items-center w-full h-10 text-left hover:bg-gray-500"
                onClick={handleDisconnect}
              >
                <span className="ml-4">Đăng xuất</span>
                <LogOut size={20} className="ml-2" />
              </button>
            </div>
          )}
        </div>

        <div className="border-t p-4 text-xs">
          <p>© 2025 DXLAB Co-Working Space</p>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;