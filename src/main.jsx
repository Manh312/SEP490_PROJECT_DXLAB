import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ThirdwebProvider, metamaskWallet, walletConnect, coinbaseWallet, trustWallet, embeddedWallet } from "@thirdweb-dev/react";
import App from "./App.jsx";
import { store, persistor } from "./redux/Store.jsx";
import "./styles.css";
import { toast } from "react-toastify";

const activeChain = "sepolia";

const sendUserDataToBackend = async (user) => {

  try {
    console.log("Thirdweb User Info:", user);

    const response = await fetch("http://localhost:9999/api/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${user.storedToken.jwtToken}`,
      },
      body: JSON.stringify({
        walletAddress: user.walletDetails.walletAddress,
        email: user.storedToken.authDetails.email,
        // walletId: user.storedToken.authDetails.userWalletId,
        // provider: user.storedToken.authProvider,
        // token: user.storedToken.jwtToken,
      }),
    });

    const result = await response.json();
    console.log("Kết quả từ backend:", result);
  } catch (error) {
    console.error("Lỗi khi gửi dữ liệu về backend:", error);
  }
};


// const sendUserDataToBackend = async (user) => {
//   try {
//     const res = await fetch("http://localhost:9999/api/authenticate", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ payload: user }),
//     });

//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message);
    
//     toast.success("Đăng nhập thành công!");
//   } catch (error) {
//     toast.error(error.message);
//   }
// };
createRoot(document.getElementById("root")).render(
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
          await sendUserDataToBackend(user);
          toast.success("Đăng nhập thành công!");
        },
      }),
    ]}
    authConfig={{
      domain: "localhost:5173",
      // authUrl: "http://localhost:9999/api",
    }}
  >
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </ThirdwebProvider>
);
