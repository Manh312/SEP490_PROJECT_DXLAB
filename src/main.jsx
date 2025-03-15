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
import React from "react";

const activeChain = "sepolia";

const sendUserDataToBackend = async (user, walletAddress, dispatch, walletType) => {
  try {
    const userEmail =
      walletType === "embeddedWallet"
        ? user?.storedToken?.authDetails?.email || user?.email || "unknown@example.com"
        : `${walletAddress}@metamask.default`;

    const payload = {
      userId: 0,
      email: userEmail,
      fullName: "manhmeo",
      walletAddress: walletAddress,
      status: true,
      roleId: 1,
    };

    const response = await fetch("https://localhost:9999/api/user/createuser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("API request failed with status:", response.status, errorData);
      if (response.status === 404) {
        throw new Error("Backend API endpoint not found. Please check the server.");
      }
      throw new Error(`API request failed with status ${response.status}: ${errorData}`);
    }

    const contentType = response.headers.get("Content-Type");
    let result;

    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
      console.log("Kết quả từ backend (JSON):", result);
      if (!result.data || !result.data.token) {
        throw new Error("Token không tồn tại hoặc không đúng định dạng trong response từ backend");
      }
    } else {
      const token = await response.text();
      console.log("Token từ backend (plain text):", token);
      if (!token || token.trim() === "") {
        throw new Error("Token không hợp lệ hoặc rỗng từ backend");
      }
      result = { token };
    }

    const { roleId } = result.data.user || {};
    if (roleId) {
      await dispatch(fetchRoleByID(roleId)).unwrap();
    }

    dispatch(setAuthData({ token: result.data.token, user: result.data.user }));

    if (walletAddress && walletType === "metamask") {
      toast.success("Đăng nhập MetaMask thành công!");
    } else if (walletType === "embeddedWallet") {
      toast.success("Đăng nhập Google thành công!");
    } else {
      toast.success("Đăng nhập ví thành công!");
    }
  } catch (error) {
    console.error("Lỗi khi gửi dữ liệu về backend:", error.message);
    toast.error(
      error.message.includes("404")
        ? "Backend server không khả dụng. Vui lòng kiểm tra lại."
        : "Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau."
    );
    throw error;
  }
};

const AppWithWallet = () => {
  const walletAddress = useAddress();
  const disconnect = useDisconnect();
  const dispatch = useDispatch();
  const wallet = useWallet();

  const [isValidUser, setIsValidUser] = React.useState(false);

  React.useEffect(() => {
    const user = store.getState().auth.user;
    const userEmail = user?.storedToken?.authDetails?.email || user?.email;
    const walletType = wallet?.walletId;

    if (walletAddress && walletType) {
      if (walletType === "embeddedWallet") {
        if (!userEmail || !userEmail.endsWith("@fpt.edu.vn")) {
          disconnect();
          dispatch(clearAuthData());
          setIsValidUser(false);
        } else {
          setIsValidUser(true);
        }
      } else {
        setIsValidUser(true);
      }
    } else {
      setIsValidUser(false);
    }
  }, [walletAddress, disconnect, dispatch, wallet]);

  return <App walletAddress={isValidUser ? walletAddress : null} />;
};

const RootApp = () => {
  const dispatch = useDispatch();

  return (
    <ThirdwebProvider
      activeChain={activeChain}
      clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID}
      supportedWallets={[
        metamaskWallet(),
        walletConnect(),
        coinbaseWallet(),
        trustWallet(),
        embeddedWallet({
          auth: {
            options: ["google"],
          },
          onAuthSuccess: async (user) => {
            const userEmail = user.email || user.storedToken?.authDetails?.email;
            if (!userEmail || !userEmail.endsWith("@fpt.edu.vn")) {
              toast.error("Bạn cần sử dụng email @fpt.edu.vn để đăng nhập.", {
                toastId: "invalid-email",
              });
              throw new Error("Email không hợp lệ");
            }

            const walletAddress = user.walletDetails?.walletAddress;
            await sendUserDataToBackend(user, walletAddress, dispatch, "embeddedWallet");
          },
        }),
      ]}
    >
      <PersistGate loading={null} persistor={persistor}>
        <AppWithWallet />
      </PersistGate>
    </ThirdwebProvider>
  );
};

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RootApp />
  </Provider>
);