import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ThirdwebProvider, metamaskWallet, walletConnect, coinbaseWallet, trustWallet, embeddedWallet } from "@thirdweb-dev/react"; // Import từ 
import App from "./App.jsx";
import { store, persistor } from "./redux/Store.jsx";
import "./styles.css";

const activeChain = "sepolia"; 

createRoot(document.getElementById("root")).render(
  <StrictMode>
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
            loginMethods: ["google", "facebook", "email"], 
            disableEmailLogin: true,
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
  </StrictMode>
);
