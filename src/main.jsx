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
} from "@thirdweb-dev/react";
import App from "./App.jsx";
import { store, persistor } from "./redux/Store.jsx";
import "./styles.css";
import { toast, ToastContainer } from "react-toastify";
import { clearAuthData, fetchRoleByID, setAuthData } from "./redux/slices/Authentication.jsx";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "./utils/axios.js";

const activeChain = "sepolia";

// Tách riêng logic xử lý roleId 3 khỏi quá trình đăng nhập chính
const handleRoleSpecificActions = async (userData) => {
  if (userData.user && userData.user.roleId === 3) {
    try {
      console.log("Processing post-auth actions for roleId 3");
      // Các tác vụ đặc biệt có thể được thực hiện ở đây
    } catch (error) {
      console.error("Error in post-authentication processing:", error);
    }
  }
};

const sendUserDataToBackend = async (user, walletAddress, dispatch, walletType, isNewLogin = false) => {
  try {
    let loadingToastId;
    if (isNewLogin) {
      loadingToastId = toast.loading("Đang xác thực tài khoản...", { toastId: "auth-loading" });
    }

    const userEmail =
      walletType === "embeddedWallet"
        ? user?.storedToken?.authDetails?.email || user?.email || "unknown@example.com"
        : `${walletAddress}@metamask.default`;

    const payload = {
      userId: 0,
      email: userEmail,
      fullName: "unknown",
      walletAddress,
      status: true,
      roleId: 3,
    };

    const response = await axiosInstance.post("/user/verifyuser?skipMinting=true", payload);
    const result = response.data;

    if (!result.data?.token) {
      throw new Error("Invalid or missing token from backend.");
    }

    const { roleId } = result.data.user || {};

    dispatch(setAuthData({ token: result.data.token, user: result.data.user }));

    if (roleId) {
      dispatch(fetchRoleByID(roleId));
    }

    if (isNewLogin && loadingToastId) {
      toast.update(loadingToastId, {
        render: walletType === "metamask"
          ? "Đăng nhập MetaMask thành công!"
          : walletType === "embeddedWallet"
            ? "Đăng nhập Google thành công!"
            : "Đăng nhập ví thành công!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
    }

    setTimeout(() => handleRoleSpecificActions(result.data), 100);

    return result.data;
  } catch (error) {
    console.error("Backend error:", error.message);
    toast.error(
      error.response?.status === 404
        ? "Backend server không khả dụng."
        : error.message || "Lỗi đăng nhập. Vui lòng thử lại.",
      { toastId: "login-error" }
    );
    throw error;
  }
};

const AppWithWallet = React.memo(() => {
  const walletAddress = useAddress();
  const disconnect = useDisconnect();
  const dispatch = useDispatch();
  const wallet = useWallet();
  const [isValidUser, setIsValidUser] = useState(false);

  const connectionStatus = useConnectionStatus();

  const chainId = useChainId();
  const walletType = useMemo(() => wallet?.walletId, [wallet]);

  const validateUser = useCallback(async () => {
    if (!walletAddress || !walletType || chainId !== "sepolia") {
      setIsValidUser(false);
      return;
    }

    const authState = store.getState().auth;
    const user = authState.user;
    const token = authState.token;

    if (token && user && user.walletAddress === walletAddress) {
      setIsValidUser(true);
      return;
    }

    const userEmail = user?.storedToken?.authDetails?.email || user?.email;

    if (walletType === "embeddedWallet" && !userEmail) {
      disconnect();
      dispatch(clearAuthData());
      setIsValidUser(false);
    } else {
      try {
        await sendUserDataToBackend(user || {}, walletAddress, dispatch, walletType, false);
        setIsValidUser(true);
      } catch (error) {
        console.error("Error validating user:", error.message);
        setIsValidUser(false);
        disconnect();
      }
    }
  }, [walletAddress, walletType, chainId, disconnect, dispatch]);

  useEffect(() => {
    if (connectionStatus === "connected") {
      validateUser();
    } else if (connectionStatus === "disconnected") {
      setIsValidUser(false);
    }
  }, [connectionStatus, validateUser]);

  // if (isConnecting) {
  //   return (
  //     <div className="flex items-center justify-center py-6 mt-50">
  //       <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
  //       <p className="text-orange-500 text-base sm:text-lg font-medium">Đang tải dữ liệu...</p>
  //     </div>
  //   );
  // }

  return <App walletAddress={isValidUser ? walletAddress : null} />;
});

AppWithWallet.displayName = "AppWithWallet";

const RootApp = () => {
  const dispatch = useDispatch();

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
      <ThirdwebProvider
        activeChain={activeChain}
        clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID}
        supportedWallets={[
          metamaskWallet({ recommended: true }),
          walletConnect(),
          coinbaseWallet(),
          trustWallet(),
          embeddedWallet({
            auth: { options: ["google"] },
            onAuthSuccess: async (user) => {
              const userEmail = user.email || user.storedToken?.authDetails?.email;
              if (!userEmail) {
                toast.error("Bạn cần sử dụng email được cấp quyền để đăng nhập.", {
                  toastId: "invalid-email",
                });
                throw new Error("Email không hợp lệ");
              }
              const walletAddress = user.walletDetails?.walletAddress;
              if (!walletAddress) {
                toast.error("Không thể lấy địa chỉ wallet. Vui lòng thử lại.");
                throw new Error("Wallet address không hợp lệ");
              }
              await sendUserDataToBackend(user, walletAddress, dispatch, "embeddedWallet", true);
            },
          }),
        ]}
      >
        <PersistGate loading={null} persistor={persistor}>
          <AppWithWallet />
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