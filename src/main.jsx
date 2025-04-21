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

    // Gọi API trước mà không hiển thị toast loading
    const response = await axiosInstance.post("/user/verifyuser?skipMinting=true", payload);
    const result = response.data;

    if (!result.data?.token) {
      throw new Error("Invalid or missing token from backend.");
    }

    const { roleId } = result.data.user || {};

    // Chỉ hiển thị toast loading nếu API thành công và là đăng nhập mới
    let loadingToastId;
    if (isNewLogin) {
      loadingToastId = toast.loading("Đang xác thực tài khoản...", { toastId: "auth-loading" });
    }

    // Cập nhật trạng thái user trong Redux
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
    const errorMessage =
      error.response?.status === 404
        ? "Backend server không khả dụng."
        : error.response?.status === 401
        ? "Tài khoản không tồn tại trong hệ thống."
        : error.message || "Lỗi đăng nhập. Vui lòng thử lại.";

    // Không cần dismiss toast loading vì toast loading chưa được hiển thị
    toast.error(errorMessage, { toastId: "login-error" });
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
    if (!walletAddress || !walletType || chainId !== 11155111) { // Chain ID của Sepolia
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

    try {
      await sendUserDataToBackend(user || {}, walletAddress, dispatch, walletType, false);
      setIsValidUser(true);
    } catch (error) {
      console.error("Error validating user:", error.message);
      setIsValidUser(false);
      disconnect();
    }
  }, [walletAddress, walletType, chainId, disconnect, dispatch]);

  useEffect(() => {
    if (connectionStatus === "connected") {
      validateUser();
    } else if (connectionStatus === "disconnected") {
      setIsValidUser(false);
    }
  }, [connectionStatus, validateUser]);

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
          metamaskWallet({
            recommended: true,
            onConnect: async (walletDetails) => {
              try {
                const walletAddress = walletDetails.address;
                await sendUserDataToBackend({}, walletAddress, dispatch, "metamask", true);
              } catch (error) {
                // Ngắt kết nối ví nếu xác thực backend thất bại
                walletDetails.disconnect();
                console.error("MetaMask login failed:", error);
              }
            },
          }),
          walletConnect(),
          coinbaseWallet(),
          trustWallet(),
          embeddedWallet({
            auth: { options: ["google"] },
            onAuthSuccess: async (user) => {
              try {
                const userEmail = user.email || user.storedToken?.authDetails?.email;
                if (!userEmail) {
                  throw new Error("Email không hợp lệ");
                }
                const walletAddress = user.walletDetails?.walletAddress;
                if (!walletAddress) {
                  throw new Error("Wallet address không hợp lệ");
                }
                await sendUserDataToBackend(user, walletAddress, dispatch, "embeddedWallet", true);
              } catch (error) {
                // Hiển thị lỗi đã được xử lý trong sendUserDataToBackend
                console.error("Embedded wallet login failed:", error);
                // Ngắt kết nối ví
                user.disconnect?.();
              }
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