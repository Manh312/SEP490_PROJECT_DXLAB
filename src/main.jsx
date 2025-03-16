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
} from "@thirdweb-dev/react";
import App from "./App.jsx";
import { store, persistor } from "./redux/Store.jsx";
import "./styles.css";
import { toast } from "react-toastify";
import { clearAuthData, fetchRoleByID, setAuthData } from "./redux/slices/Authentication.jsx";
import React, { useCallback, useEffect, useMemo, useState } from "react";

// Cấu hình chain cố định
const activeChain = "sepolia";

// Hàm gửi dữ liệu người dùng về backend
const sendUserDataToBackend = async (user, walletAddress, dispatch, walletType) => {
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
      roleId: 1,
    };

    const response = await fetch("https://localhost:9999/api/user/createuser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("API request failed:", response.status, errorData);
      throw new Error(response.status === 404 ? "Backend API not found." : `API failed: ${errorData}`);
    }

    const contentType = response.headers.get("Content-Type");
    const result = contentType?.includes("application/json")
      ? await response.json()
      : { token: await response.text() };

    if (!result.data?.token) {
      throw new Error("Invalid or missing token from backend.");
    }

    const { roleId } = result.data.user || {};
    if (roleId) {
      await dispatch(fetchRoleByID(roleId)).unwrap();
    }

    dispatch(setAuthData({ token: result.data.token, user: result.data.user }));

    toast.success(
      walletType === "metamask"
        ? "Đăng nhập MetaMask thành công!"
        : walletType === "embeddedWallet"
        ? "Đăng nhập Google thành công!"
        : "Đăng nhập ví thành công!",
      { toastId: `login-${walletType}` }
    );
  } catch (error) {
    console.error("Backend error:", error.message);
    toast.error(
      error.message.includes("404")
        ? "Backend server không khả dụng."
        : "Lỗi đăng nhập. Vui lòng thử lại.",
      { toastId: "login-error" }
    );
    throw error;
  }
};

// Thành phần AppWithWallet tối ưu hóa
const AppWithWallet = React.memo(() => {
  const walletAddress = useAddress();
  const disconnect = useDisconnect();
  const dispatch = useDispatch();
  const wallet = useWallet();
  const [isValidUser, setIsValidUser] = useState(false);

  // Memoize walletType để tránh tính toán lại
  const walletType = useMemo(() => wallet?.walletId, [wallet]);

  // Callback để kiểm tra user hợp lệ
  const validateUser = useCallback(() => {
    const user = store.getState().auth.user;
    const userEmail = user?.storedToken?.authDetails?.email || user?.email;

    if (!walletAddress || !walletType) {
      setIsValidUser(false);
      return;
    }

    if (walletType === "embeddedWallet" && (!userEmail || !userEmail.endsWith("@fpt.edu.vn"))) {
      disconnect();
      dispatch(clearAuthData());
      setIsValidUser(false);
    } else {
      setIsValidUser(true);
    }
  }, [walletAddress, walletType, disconnect, dispatch]);

  useEffect(() => {
    validateUser();
  }, [validateUser]);

  return <App walletAddress={isValidUser ? walletAddress : null} />;
});

AppWithWallet.displayName = "AppWithWallet";

// Thành phần RootApp
const RootApp = () => {
  const dispatch = useDispatch();

  return (
    <ThirdwebProvider
      activeChain={activeChain}
      clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID}
      supportedWallets={[
        metamaskWallet({ recommended: true }), // Đánh dấu ví ưu tiên
        walletConnect(),
        coinbaseWallet(),
        trustWallet(),
        embeddedWallet({
          auth: { options: ["google"] },
          onAuthSuccess: async (user) => {
            const userEmail = user.email || user.storedToken?.authDetails?.email;
            if (!userEmail || !userEmail.endsWith("@fpt.edu.vn")) {
              toast.error("Bạn cần sử dụng email @fpt.edu.vn để đăng nhập.", {
                toastId: "invalid-email",
              });
              throw new Error("Email không hợp lệ");
            }
            await sendUserDataToBackend(user, user.walletDetails?.walletAddress, dispatch, "embeddedWallet");
          },
        }),
      ]}
      autoConnect={true} // Tự động kết nối ví đã dùng trước đó
    >
      <PersistGate loading={null} persistor={persistor}>
        <AppWithWallet />
      </PersistGate>
    </ThirdwebProvider>
  );
};

// Render ứng dụng
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RootApp />
  </Provider>
);