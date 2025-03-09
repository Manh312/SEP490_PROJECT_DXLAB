import { createRoot } from "react-dom/client";
import { Provider, useDispatch } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ThirdwebProvider, metamaskWallet, walletConnect, coinbaseWallet, trustWallet, embeddedWallet, useAddress } from "@thirdweb-dev/react";
import App from "./App.jsx";
import { store, persistor } from "./redux/Store.jsx";
import "./styles.css";
import { toast } from "react-toastify";
import { setAuthData } from "./redux/slices/Authentication.jsx";

const activeChain = "sepolia";

const sendUserDataToBackend = async (user, walletAddress, dispatch) => {
  try {
    console.log("Thirdweb User Info:", user);
    console.log("Wallet Address:", walletAddress);

    const userEmail = user?.storedToken?.authDetails?.email || user?.email || "unknown@example.com";

    const payload = {
      userId: 1,
      email: userEmail,
      fullName: "Manh meo",
      walletAddress: walletAddress,
      status: true,
      roleId: 0,
    };

    const response = await fetch("https://localhost:7101/api/User", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("API request failed with status:", response.status, errorData);
      throw new Error(`API request failed with status ${response.status}: ${errorData}`);
    }

    const contentType = response.headers.get("Content-Type");
    let result;

    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
      console.log("Kết quả từ backend (JSON):", result);
      if (!result.token) throw new Error("Token không tồn tại trong response từ backend");
    } else {
      const token = await response.text();
      console.log("Token từ backend (plain text):", token);
      if (!token || token.trim() === "") throw new Error("Token không hợp lệ hoặc rỗng từ backend");
      result = { token };
    }

    dispatch(setAuthData({ token: result.token, user }));
  } catch (error) {
    console.error("Lỗi khi gửi dữ liệu về backend:", error.message);
    toast.error("Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.");
  }
};

// Component con để sử dụng useAddress
const AppWithWallet = () => {
  const walletAddress = useAddress(); // Lấy walletAddress bên trong ThirdwebProvider

  return <App walletAddress={walletAddress} />;
};

// Component RootApp chỉ chứa ThirdwebProvider
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
              toast.error("Bạn cần sử dụng email @fpt.edu.vn để đăng nhập.");
              return;
            }
            const walletAddress = user.walletDetails?.walletAddress; // Lấy từ user nếu có
            await sendUserDataToBackend(user, walletAddress, dispatch);
            toast.success("Đăng nhập thành công!");
          },
        }),
      ]}
      authConfig={{
        domain: "localhost:5173",
        // authUrl: "https://localhost:7101/api",
      }}
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