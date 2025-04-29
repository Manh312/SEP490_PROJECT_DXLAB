import { LogOut, LucideHistory, Menu, Moon, Sun, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import logo from "../../assets/logo_images.png";
import { navItems } from "../../constants";
import { useTheme } from "../../hooks/use-theme";
import { Link } from "react-router-dom";
import { ConnectWallet, useAddress, useContract, useDisconnect, useTokenBalance } from "@thirdweb-dev/react";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthData, fetchRoleByID, setIsAuthenticating } from "../../redux/slices/Authentication";
import { FaUserCircle } from "react-icons/fa";
import Notification from "../../hooks/use-notification";
import Modal from "react-modal";

const SEPOLIA_CHAIN_ID = 11155111;

const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roleName, setRoleName] = useState(null);
  const { theme, setTheme } = useTheme();
  const address = useAddress();
  const dispatch = useDispatch();
  const disconnect = useDisconnect();
  const profileRef = useRef(null);
  const dropdownRef = useRef(null);
  const { user, isAuthenticating } = useSelector((state) => state.auth);
  const { contract } = useContract("0x004Bbe4D1C9951492336263C8BF96a6E822aeA73");
  const { data: balance } = useTokenBalance(contract, address);

  // Thiết lập app element cho modal
  useEffect(() => {
    Modal.setAppElement("#root");
  }, []);

  // Fetch roleName based on roleId
  useEffect(() => {
    if (user?.roleId) {
      dispatch(fetchRoleByID(user.roleId))
        .unwrap()
        .then((role) => setRoleName(role))
        .catch((error) => console.error("Failed to fetch roleName:", error));
    }
  }, [user, dispatch]);

  // Reset state on disconnect
  useEffect(() => {
    if (!address) {
      setDropdownOpen(false);
      setRoleName(null);
      dispatch(setIsAuthenticating(false)); // Reset isAuthenticating
    }
  }, [address, dispatch]);

  // Handle wallet disconnect
  const handleDisconnect = async () => {
    try {
      await disconnect();
      dispatch(clearAuthData()); // clearAuthData resets isAuthenticating
      setDropdownOpen(false);
      setRoleName(null);
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  };

  const handleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleProfileClick = () => {
    if (address && user) {
      setDropdownOpen(!dropdownOpen);
    }
  };


  // Determine login status
  const isLoggedIn = address && user && (user?.walletType !== "embeddedWallet" || (user?.storedToken?.authDetails?.email || user?.email)?.endsWith("@fpt.edu.vn"));
  const displayName = user?.storedToken?.authDetails?.email || user?.email || "Wallet User";

  return (
    <nav className="sticky top-0 z-50 py-2 backdrop-blur-lg border-b border-neutral-700/80">
      <div className="container px-4 mx-auto relative text-sm flex justify-between items-center">
        <div className="flex items-center flex-shrink-0">
          <img className="h-30 w-35" src={logo} alt="logo" />
        </div>

        {/* Menu for desktop */}
        <ul className="hidden lg:flex space-x-12 text-xl">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link to={item.href}>{item.label}</Link>
            </li>
          ))}
          {isLoggedIn && (
            <>
              {roleName !== "Admin" && roleName !== "Staff" && (
                <li>
                  <Link to="/rooms">Dịch vụ</Link>
                </li>
              )}
              {roleName === "Admin" && (
                <li>
                  <Link to="/dashboard">Bảng điều khiển</Link>
                </li>
              )}
              {roleName === "Staff" && (
                <li>
                  <Link to="/manage">Quản lý</Link>
                </li>
              )}
            </>
          )}
        </ul>

        {/* Desktop actions */}
        <div className="hidden lg:flex justify-center space-x-6 items-center relative z-10">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4" ref={profileRef}>
              {(roleName === "Admin" || roleName === "Staff") && <Notification />}
              <FaUserCircle
                className="h-10 w-10 rounded-full cursor-pointer"
                onClick={handleProfileClick}
              />
              {dropdownOpen && (
                <div
                  ref={dropdownRef}
                  className={`absolute right-0 top-12 w-80 ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"} p-4 rounded-lg shadow-lg z-50`}
                >
                  <span className="block mb-2">{displayName}</span>
                  <div className="mb-4">
                    <ConnectWallet
                      modalSize="wide"
                      hideBuyButton
                      hideDisconnect
                      style={{ width: "100%" }}
                      supportedTokens={{
                        [SEPOLIA_CHAIN_ID]: [
                          {
                            address: "0x004Bbe4D1C9951492336263C8BF96a6E822aeA73",
                            name: "DXLAB Coin",
                            symbol: "DXL",
                            icon: "https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png?1687143508",
                          },
                        ],
                      }}
                    />
                  </div>
                  <span className="ml-2 mb-4">Số dư: {balance?.displayValue} DXL</span>
                  <ul className="space-y-2">
                    {roleName === "Student" && (
                      <li>
                        <Link to="/booked-history">
                          <button className="flex items-center w-full h-10 text-left hover:bg-gray-500 rounded">
                            <span className="ml-2">Lịch sử giao dịch</span>
                            <LucideHistory size={20} className="ml-2" />
                          </button>
                        </Link>
                      </li>
                    )}
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
              {isAuthenticating ? null : (
                <div>
                  <ConnectWallet
                    btnTitle="Đăng nhập"
                    modalSize="wide"
                    showThirdwebBranding={false}
                    hideTestnetFaucet={false}
                    supportedTokens={{
                      [SEPOLIA_CHAIN_ID]: [
                        {
                          address: "0x004Bbe4D1C9951492336263C8BF96a6E822aeA73",
                          name: "DXLAB Coin",
                          symbol: "DXL",
                          icon: "https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens/0xc597d627a7E28B896d43a4eC50703f35Ba259378/logo.png",
                        },
                      ],
                    }}
                  />
                </div>
              )}
              <button
                className="p-2 border rounded-md transition-colors ml-5"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden flex">
          <button onClick={handleMobileDrawer} className="p-2 border rounded-md">
            {mobileDrawerOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 left-0 h-screen z-20 transition-transform duration-300 w-4/5 max-w-sm flex flex-col ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"} ${mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b relative z-10">
          <div className="flex items-center space-x-4">
            {isLoggedIn && (
              <div className="flex items-center space-x-2">
                <FaUserCircle className="h-8 w-8 rounded-full cursor-pointer" />
                <span className="text-sm">{displayName}</span>
              </div>
            )}
          </div>
          <button onClick={handleMobileDrawer} className="p-2">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {isLoggedIn ? (
              <div>
                <div>
                  <ConnectWallet
                    modalSize="wide"
                    hideBuyButton
                    hideDisconnect
                    style={{ width: "100%" }}
                    supportedTokens={{
                      [SEPOLIA_CHAIN_ID]: [
                        {
                          address: "0x004Bbe4D1C9951492336263C8BF96a6E822aeA73",
                          name: "DXLAB Coin",
                          symbol: "DXL",
                          icon: "https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png?1687143508",
                        },
                      ],
                    }}
                  />
                </div>
                <div className="mt-3 ml-1">
                  <span>Số dư: {balance?.displayValue} DXL</span>
                </div>
              </div>
            ) : (
              <div>
                <ConnectWallet
                  btnTitle="Đăng nhập"
                  modalSize="wide"
                  showThirdwebBranding={false}
                  hideTestnetFaucet={false}
                  supportedTokens={{
                    [SEPOLIA_CHAIN_ID]: [
                      {
                        address: "0x004Bbe4D1C9951492336263C8BF96a6E822aeA73",
                        name: "DXLAB Coin",
                        symbol: "DXL",
                        icon: "https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens/0xc597d627a7E28B896d43a4eC50703f35Ba259378/logo.png",
                      },
                    ],
                  }}
                />
              </div>
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
            {isLoggedIn && (
              <>
                {roleName !== "Admin" && roleName !== "Staff" && (
                  <li>
                    <Link
                      to="/rooms"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="block px-4 py-3 dark:hover:bg-gray-500"
                    >
                      Dịch vụ
                    </Link>
                  </li>
                )}
                {(roleName === "Admin" || roleName === "Staff") && (
                  <li className="px-4 py-3">
                    <Notification />
                  </li>
                )}
                {roleName === "Admin" && (
                  <li>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="block px-4 py-3 dark:hover:bg-gray-500"
                    >
                      Bảng điều khiển
                    </Link>
                  </li>
                )}
                {roleName === "Staff" && (
                  <li>
                    <Link
                      to="/manage"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="block px-4 py-3 dark:hover:bg-gray-500"
                    >
                      Quản lý
                    </Link>
                  </li>
                )}
                {roleName === "Student" && (
                  <li>
                    <Link to="/booked-history">
                      <button className="flex items-center w-full h-10 text-left hover:bg-gray-500 rounded">
                        <span className="ml-4">Lịch sử giao dịch</span>
                        <LucideHistory size={20} className="ml-2" />
                      </button>
                    </Link>
                  </li>
                )}
              </>
            )}
            <li className="flex items-center">
              <button
                className="flex items-center w-full h-10 text-left hover:bg-gray-500 rounded"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                <span className="ml-4">Màu nền</span>
                {theme === "dark" ? <Moon size={20} className="ml-2" /> : <Sun size={20} className="ml-2" />}
              </button>
            </li>
            {isLoggedIn && (
              <li className="flex items-center">
                <button
                  className="flex items-center w-full h-10 text-left hover:bg-gray-500 rounded"
                  onClick={handleDisconnect}
                >
                  <span className="ml-4">Đăng xuất</span>
                  <LogOut size={20} className="ml-2" />
                </button>
              </li>
            )}
          </ul>
        </div>

        <div className="border-t p-4 text-xs">
          <p>© 2025 DXLAB Co-Working Space</p>
        </div>
      </div>

      {/* Authentication Modal */}
      <Modal
        isOpen={isAuthenticating}
        contentLabel="Authentication Modal"
        className="fixed inset-0 text-black flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-opacity-60"
      >
        <div className=" p-6 rounded-lg h-42 shadow-xl w-full max-w-sm bg-white">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-semibold">Đang xác thực tài khoản...</p>
          </div>
        </div>
      </Modal>
    </nav>
  );
};

export default Navbar;