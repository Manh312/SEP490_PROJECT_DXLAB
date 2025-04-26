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
import { clearAuthData, fetchRoleByID, setAuthData, setIsAuthenticating } from "./redux/slices/Authentication.jsx";
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
    padding: "0",
    border: "none",
    borderRadius: "12px",
    width: "400px",
    maxWidth: "90%",
    background: "linear-gradient(145deg, #ffffff, #f0f4f8)",
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

// Hàm giả lập logic mint
const triggerMining = async (walletAddress) => {
  console.log(`Triggering mining for wallet: ${walletAddress}`);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return { success: true, message: "Token minted successfully!" };
};

const sendUserDataToBackend = async (
  user,
  walletAddress,
  dispatch,
  walletType,
  isNewLogin = false,
  setIsExist,
  setModalState
) => {
  try {
    console.log("sendUserDataToBackend inputs:", { user, walletAddress, walletType, isNewLogin });
    dispatch(setIsAuthenticating(true)); // Set isAuthenticating to true

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

    const response = await axiosInstance.post("/user/verifyuser", payload);
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

    if (isNewLogin) {
      setTimeout(() => {
        setModalState({ isOpen: true, isLoading: true, isMining: false, message: "Xác thực tài khoản hoàn tất..." });
      }, 1000);

      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Success message for all roleIds
      const successMessage = walletType === "metamask"
        ? "Đăng nhập MetaMask thành công!"
        : walletType === "embeddedWallet"
          ? "Đăng nhập Google thành công!"
          : "Đăng nhập ví thành công!";

      setModalState({
        isOpen: true,
        isLoading: false,
        isMining: false,
        message: successMessage,
      });

      // For roleId === 3, show mintStatus after 3 seconds
      if (roleId === 3) {
        setTimeout(() => {
          dispatch(setIsAuthenticating(false));
          setModalState({ isOpen: true, isLoading: false, isMining: false, message: `${result.data.mintStatus}` });
        }, 3000);
      } else {
        // For roleId !== 3, show "Hoàn tất xác thực" with success message, then close
        setTimeout(() => {
          setModalState({ isOpen: true, isLoading: false, isMining: false, message: successMessage });
          dispatch(setIsAuthenticating(false));
          setTimeout(() => {
            setModalState({ isOpen: false, isLoading: false, isMining: false, message: "" });
          }, 3000);
        }, 3000);
      }
    }    

    setTimeout(() => handleRoleSpecificActions(result.data), 100);

    return result.data;
  } catch (error) {
    console.error("Backend error:", error.message, error.response?.data);
    setIsExist({ isExist: false });
    const errorMessage =
      error.response?.status === 404
        ? "Backend server không khả dụng."
        : error.response?.status === 401
          ? "Tài khoản không tồn tại trong hệ thống. Vui lòng thử lại."
          : error.message || "Lỗi đăng nhập. Vui lòng thử lại.";

    toast.error(errorMessage, { toastId: "login-error" });
    setModalState({ isOpen: false, isLoading: false, isMining: false, message: "" });
    throw error;
  }
};

const AppWithWallet = React.memo(({ isExist, setModalState }) => {
  const walletAddress = useAddress();
  const disconnect = useDisconnect();
  const dispatch = useDispatch();
  const wallet = useWallet();
  const { user: walletUser } = useUser();
  const [isValidUser, setIsValidUser] = useState(false);
  const [authHandled, setAuthHandled] = useState(false);
  const [isMinted, setIsMinted] = useState(false);
  const [isMining, setIsMining] = useState(false);
  const connectionStatus = useConnectionStatus();
  const chainId = useChainId();
  const walletType = useMemo(() => wallet?.walletId, [wallet]);

  const handleMint = async () => {
    if (!walletAddress) {
      toast.error("Vui lòng kết nối ví trước khi cấp tiền!", { toastId: "no-wallet" });
      return;
    }

    if (isMining || isMinted) {
      toast.info("Token đã được cấp!", { toastId: "already-minted" });
      return;
    }

    try {
      setIsMining(true);
      setModalState({ isOpen: true, isLoading: false, isMining: true, message: "Đang cấp tiền..." });

      const miningResult = await triggerMining(walletAddress);
      if (miningResult.success) {
        setIsMining(false);
        setIsMinted(true);
        setModalState({ isOpen: true, isLoading: false, isMining: false, message: "Cấp tiền thành công!" });
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setModalState({
          isOpen: true,
          isLoading: false,
          isMining: false,
          message: walletType === "metamask"
            ? "Đăng nhập MetaMask thành công!"
            : walletType === "embeddedWallet"
              ? "Đăng nhập Google thành công!"
              : "Đăng nhập ví thành công!",
        });
        setTimeout(() => setModalState({ isOpen: false, isLoading: false, isMining: false, message: "" }), 3000);
      } else {
        throw new Error("Mining failed");
      }
    } catch (error) {
      console.error("Minting error:", error);
      setIsMining(false);
      setModalState({ isOpen: false, isLoading: false, isMining: false, message: "" });
      toast.error("Lỗi khi cấp tiền: " + error.message, { toastId: "mint-error" });
    }
  };

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
    console.log("Stored user and token:", { authState });

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
      setIsMinted(false);
      setIsMining(false);
      dispatch(clearAuthData());
    }
  }, [connectionStatus, validateUser, dispatch, authHandled]);

  return (
    <App
      walletAddress={isValidUser && isExist && isMinted ? walletAddress : null}
      handleMint={handleMint}
      isMining={isMining}
      isMinted={isMinted}
    />
  );
});

AppWithWallet.displayName = "AppWithWallet";

const ThirdwebWrapper = ({ isExist, setModalState }) => {
  const dispatch = useDispatch();
  const connectionStatus = useConnectionStatus();
  const wallet = useWallet();

  useEffect(() => {
    if (connectionStatus === "connecting" && wallet?.walletId === "embeddedWallet") {
      console.log("Embedded wallet authentication started, setting isAuthenticating to true");
      dispatch(setIsAuthenticating(true));
    }

    if (connectionStatus === "connected" && wallet?.walletId === "embeddedWallet") {
      const attemptCloseModal = () => {
        document.dispatchEvent(new Event("thirdwebModalClose"));
        const selectors = [
          ".tw-connect-wallet__modal",
          "[data-testid='connect-wallet-modal']",
          ".wallet-modal",
        ];
        let modalClosed = false;
        selectors.forEach((selector) => {
          const modal = document.querySelector(selector);
          if (modal && modal.style.display !== "none") {
            modal.style.display = "none";
            console.log(`Manually closed Thirdweb modal using selector: ${selector}`);
            modalClosed = true;
          }
        });
        const iframes = document.querySelectorAll("iframe");
        iframes.forEach((iframe) => {
          if (iframe.src.includes("google") || iframe.src.includes("thirdweb")) {
            iframe.style.display = "none";
            console.log("Manually closed Thirdweb iframe");
            modalClosed = true;
          }
        });
        return modalClosed;
      };

      const timer1 = setTimeout(() => {
        const closed = attemptCloseModal();
        if (!closed) {
          console.log("First attempt to close Thirdweb modal failed, scheduling second attempt");
          const timer2 = setTimeout(attemptCloseModal, 1000);
          return () => clearTimeout(timer2);
        }
      }, 500);

      return () => clearTimeout(timer1);
    }
  }, [connectionStatus, wallet, dispatch]);

  return <AppWithWallet isExist={isExist} setModalState={setModalState} />;
};

const RootApp = () => {
  const dispatch = useDispatch();
  const [isExist, setIsExist] = useState({ isExist: true });
  const [modalState, setModalState] = useState({ isOpen: false, isLoading: false, isMining: false, message: "" });

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
        onRequestClose={() => {
          if (!modalState.isLoading && !modalState.isMining) {
            setModalState({ isOpen: false, isLoading: false, isMining: false, message: "" });
          }
        }}
        style={modalStyles}
        contentLabel="Authentication Modal"
        shouldCloseOnOverlayClick={!modalState.isLoading && !modalState.isMining}
        shouldCloseOnEsc={!modalState.isLoading && !modalState.isMining}
      >
        <div className="p-6 flex flex-col items-center transition-all duration-300">
          <h2 className={`text-xl font-semibold ${modalState.isLoading || modalState.isMining ? "text-gray-700" : "text-orange-600"} mb-3`}>
            {modalState.isLoading ? "Xác thực tài khoản" : modalState.isMining ? "Đang cấp tiền" : "Hoàn tất xác thực"}
          </h2>
          <div className="flex items-center mb-4">
            {!modalState.isLoading && !modalState.isMining && (
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
          {(modalState.isLoading || modalState.isMining) && (
            <div className="loader mb-4 w-10 h-10 border-4 border-t-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
          )}
          {!modalState.isLoading && !modalState.isMining && (
            <button
              onClick={() => {
                dispatch(setIsAuthenticating(false));
                setModalState({ isOpen: false, isLoading: false, isMining: false, message: "" });
              }}
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
                dispatch(setIsAuthenticating(true)); // Set isAuthenticating for MetaMask
                await sendUserDataToBackend({}, walletAddress, dispatch, "metamask", true, setIsExist, setModalState);
              } catch (error) {
                console.error("MetaMask login failed:", error);
                walletDetails.disconnect();
                dispatch(setIsAuthenticating(false)); // Reset on failure
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
                dispatch(setIsAuthenticating(true)); // Set isAuthenticating when Google auth starts
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
                dispatch(setIsAuthenticating(false)); // Reset on failure
                user.disconnect?.();
              }
            },
          }),
        ]}
      >
        <PersistGate loading={null} persistor={persistor}>
          <ThirdwebWrapper isExist={isExist.isExist} setModalState={setModalState} />
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