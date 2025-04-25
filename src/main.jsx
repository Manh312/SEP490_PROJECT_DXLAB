import { createRoot } from "react-dom/client";
import { Provider, useDispatch } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import {
  ThirdwebProvider,
  metamaskWallet,
  walletConnect,
  coinbaseWallet,
  trustWallet,
  embeddedWallet,
  useAddress,
  useDisconnect,
  useWallet,
  useChainId,
  useConnectionStatus,
  useUser,
} from "@thirdweb-dev/react";
import App from "./App.jsx";
import { store, persistor } from "./redux/Store.jsx";
import "./styles.css";
import { toast, ToastContainer } from "react-toastify";
import { clearAuthData, fetchRoleByID, setAuthData } from "./redux/slices/Authentication.jsx";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "./utils/axios.js";
import Modal from "react-modal";

Modal.setAppElement("#root");

const activeChain = "sepolia";

const modalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    padding: "0", // Remove default padding to control it via Tailwind
    border: "none",
    borderRadius: "12px",
    width: "400px",
    maxWidth: "90%",
    background: "linear-gradient(145deg, #ffffff, #f0f4f8)", // Subtle gradient background
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.15)",
    overflow: "hidden",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 1000,
  },
};

const handleRoleSpecificActions = async (userData) => {
  if (userData?.user && userData.user.roleId === 3) {
    try {
      console.log("Processing post-auth actions for roleId 3");
    } catch (error) {
      console.error("Error in post-authentication processing:", error);
    }
  }
};

const sendUserDataToBackend = async (user, walletAddress, dispatch, walletType, isNewLogin = false, setIsExist, setModalState) => {
  try {
    console.log("sendUserDataToBackend inputs:", { user, walletAddress, walletType, isNewLogin });

    let userEmail;
    if (walletType === "embeddedWallet") {
      userEmail = user?.email || user?.storedToken?.authDetails?.email;
      if (!userEmail) {
        console.warn("Không thể lấy email từ Google authentication, sử dụng email mặc định.");
        userEmail = `${walletAddress}@embeddedwallet.default`;
      }
    } else {
      if (!walletAddress) {
        throw new Error("Địa chỉ ví không hợp lệ.");
      }
      userEmail = `${walletAddress}@metamask.default`;
    }

    const payload = {
      userId: 0,
      email: userEmail,
      fullName: "unknown",
      walletAddress,
      status: true,
      roleId: 3,
    };
    console.log("Sending payload to backend:", payload);

    const response = await axiosInstance.post("/user/verifyuser?skipMinting=true", payload);
    const result = response.data;
    console.log("Backend response:", result);

    if (!result.data?.token || !result.data?.user) {
      result.data = {
        token: "temporary-token",
        user: { email: userEmail, walletAddress, roleId: 3 },
      };
    }

    const { roleId } = result.data.user;

    if (roleId) {
      dispatch(fetchRoleByID(roleId));
    }

    dispatch(setAuthData({ token: result.data.token, user: { ...result.data.user, storedToken: user?.storedToken } }));

    if (roleId) {
      dispatch(fetchRoleByID(roleId));
    }

    if (isNewLogin) {
      if (roleId === 3) {
        // Delay 500ms để đảm bảo modal Thirdweb đóng trước khi hiển thị modal xác thực
        setTimeout(() => {
          setModalState({ isOpen: true, isLoading: true, message: "Đang xác thực tài khoản..." });
        }, 500);
        // Delay 5 giây từ khi gửi request để chuyển modal sang trạng thái thành công
        await new Promise((resolve) => setTimeout(resolve, 5000));
        setModalState({
          isOpen: true,
          isLoading: false,
          message: walletType === "metamask"
            ? "Đăng nhập MetaMask thành công!"
            : walletType === "embeddedWallet"
            ? "Đăng nhập Google thành công!"
            : "Đăng nhập ví thành công!",
        });
        // Tự động đóng modal sau 3 giây
        setTimeout(() => setModalState({ isOpen: false, isLoading: false, message: "" }), 3000);
      } else {
        // Hiển thị toast success ngay lập tức cho các role khác
        toast.success(
          walletType === "metamask"
            ? "Đăng nhập MetaMask thành công!"
            : walletType === "embeddedWallet"
            ? "Đăng nhập Google thành công!"
            : "Đăng nhập ví thành công!",
          {
            toastId: "auth-success",
            autoClose: 3000,
            closeOnClick: true,
          }
        );
      }
    }

    setTimeout(() => handleRoleSpecificActions(result.data), 100);

    return result.data;
  } catch (error) {
    console.error("Backend error:", error.message, error.response?.data);
    setIsExist(false);
    const errorMessage =
      error.response?.status === 404
        ? "Backend server không khả dụng."
        : error.response?.status === 401
        ? "Tài khoản không tồn tại trong hệ thống. Vui lòng thử lại."
        : error.message || "Lỗi đăng nhập. Vui lòng thử lại.";

    toast.error(errorMessage, { toastId: "login-error" });
    // Đóng modal nếu có lỗi
    setModalState({ isOpen: false, isLoading: false, message: "" });
    throw error;
  }
};

const AppWithWallet = React.memo(({ isExist }) => {
  const walletAddress = useAddress();
  const disconnect = useDisconnect();
  const dispatch = useDispatch();
  const wallet = useWallet();
  const { user: walletUser } = useUser();
  const [isValidUser, setIsValidUser] = useState(false);
  const [authHandled, setAuthHandled] = useState(false);

  console.log("isExist", isExist);

  const connectionStatus = useConnectionStatus();
  const chainId = useChainId();
  const walletType = useMemo(() => wallet?.walletId, [wallet]);

  const validateUser = useCallback(() => {
    console.log("validateUser called with:", {
      walletAddress,
      walletType,
      chainId,
      connectionStatus,
      walletUser,
    });

    if (!walletAddress || !walletType || chainId !== 11155111) {
      console.warn("Validation failed:", { walletAddress, walletType, chainId });
      setIsValidUser(false);
      return;
    }

    const authState = store.getState().auth;
    const storedUser = authState.user;
    const token = authState.token;
    console.log("Stored user and token:", { authState});

    if (token && storedUser && storedUser.walletAddress === walletAddress) {
      console.log("User already authenticated, setting isValidUser to true.");
      setIsValidUser(true);
      setAuthHandled(true);
    } else {
      console.log("No valid authentication data, disconnecting wallet.");
      setIsValidUser(false);
      setAuthHandled(false);
      dispatch(clearAuthData());
      console.log("Connection status:", connectionStatus, isExist);
      if (connectionStatus === "connected" && !isExist) {
        console.log("Disconnecting because account does not exist.");
        disconnect();
      }
    }
  }, [walletAddress, walletType, chainId, connectionStatus, walletUser, disconnect, isExist, dispatch]);

  useEffect(() => {
    console.log("useEffect triggered with connectionStatus:", connectionStatus);
    if (connectionStatus === "connected" && !authHandled) {
      validateUser();
    } else if (connectionStatus === "disconnected") {
      console.log("Wallet disconnected, clearing auth data.");
      setIsValidUser(false);
      setAuthHandled(false);
      dispatch(clearAuthData());
    }
  }, [connectionStatus, validateUser, dispatch, authHandled]);

  // Chỉ hiển thị walletAddress nếu isValidUser và isExist đều true
  return <App walletAddress={isValidUser && isExist ? walletAddress : null} />;
});

AppWithWallet.displayName = "AppWithWallet";

// Component mới để xử lý logic đóng modal Thirdweb
const ThirdwebWrapper = ( isExist, setModalState ) => {
  const dispatch = useDispatch();
  const connectionStatus = useConnectionStatus();

  // Đóng modal Thirdweb khi trạng thái kết nối là connected
  useEffect(() => {
    if (connectionStatus === "connected") {
      // Đảm bảo modal Thirdweb đóng bằng cách kích hoạt sự kiện đóng nếu cần
      document.dispatchEvent(new Event("thirdwebModalClose"));
    }
  }, [connectionStatus]);

  return <AppWithWallet isExist={isExist.isExist} />;
};

const RootApp = () => {
  const dispatch = useDispatch();
  const [isExist, setIsExist] = useState({ isExist: true });
  const [modalState, setModalState] = useState({ isOpen: false, isLoading: false, message: "" });

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Modal
        isOpen={modalState.isOpen}
        onRequestClose={() => setModalState({ isOpen: false, isLoading: false, message: "" })}
        style={modalStyles}
        contentLabel="Authentication Modal"
        shouldCloseOnOverlayClick={!modalState.isLoading} // Prevent closing on overlay click during loading
        shouldCloseOnEsc={!modalState.isLoading} // Prevent closing on Escape key during loading
      >
        <div className="p-6 flex flex-col items-center transition-all duration-300">
          {/* Header */}
          <h2 className={`text-xl font-semibold ${modalState.isLoading ? "text-gray-700" : "text-orange-600"} mb-3`}>
            {modalState.isLoading ? "Đang xác thực" : "Xác thực thành công"}
          </h2>

          {/* Message with Icon */}
          <div className="flex items-center mb-4">
            {!modalState.isLoading && (
              <svg
                className="w-6 h-6 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            <p className="text-gray-600 text-center">{modalState.message}</p>
          </div>

          {/* Spinner for Loading State */}
          {modalState.isLoading && (
            <div className="loader mb-4 w-10 h-10 border-4 border-t-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
          )}

          {/* Close Button for Success State */}
          {!modalState.isLoading && (
            <button
              onClick={() => setModalState({ isOpen: false, isLoading: false, message: "" })}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
            >
              Đóng
            </button>
          )}
        </div>
      </Modal>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <ThirdwebProvider
        activeChain={activeChain}
        clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID}
        supportedWallets={[
          metamaskWallet({
            recommended: true,
            onConnect: async (walletDetails) => {
              try {
                const walletAddress = walletDetails.address;
                console.log("MetaMask connected:", walletAddress);
                await sendUserDataToBackend({}, walletAddress, dispatch, "metamask", true, setIsExist, setModalState);
              } catch (error) {
                console.error("MetaMask login failed:", error);
                walletDetails.disconnect();
                toast.error("Đăng nhập MetaMask thất bại: " + error.message);
              }
            },
          }),
          walletConnect(),
          coinbaseWallet(),
          trustWallet(),
          embeddedWallet({
            auth: {
              options: ["google"],
            },
            onAuthSuccess: async (user) => {
              console.log("Embedded wallet auth success:", user);
              try {
                const userEmail = user.email || user.storedToken?.authDetails?.email;
                const walletAddress = user.walletDetails?.walletAddress;
                if (!walletAddress) {
                  throw new Error("Địa chỉ ví không hợp lệ.");
                }
                if (!userEmail) {
                  throw new Error("Email không hợp lệ.");
                }
                await sendUserDataToBackend({ ...user, email: userEmail }, walletAddress, dispatch, "embeddedWallet", true, setIsExist, setModalState);
              } catch (error) {
                console.error("Embedded wallet login failed:", error);
                user.disconnect?.();
              }
            },
          }),
        ]}
      >
        <PersistGate loading={null} persistor={persistor}>
          <ThirdwebWrapper isExist={isExist} setModalState={setModalState} />
        </PersistGate>
      </ThirdwebProvider>
    </>
  );
};

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RootApp />
  </Provider>
);