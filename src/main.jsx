import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ThirdwebProvider, metamaskWallet, walletConnect, coinbaseWallet, trustWallet, embeddedWallet } from "@thirdweb-dev/react"; // Import từ 
import App from "./App.jsx";
import { store, persistor } from "./redux/Store.jsx";
import "./styles.css";
import { toast } from "react-toastify";

const activeChain = "sepolia"; 

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
            loginMethods: ["google", "facebook"], 
          },
          onAuthSuccess: () => {
            toast.success("Login and wallet connected successfully!");
          },
        }),
      ]}
    >
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <App />
        </PersistGate>
      </Provider>
    </ThirdwebProvider>
);
