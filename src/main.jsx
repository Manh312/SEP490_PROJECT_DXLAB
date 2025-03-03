import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ThirdwebProvider, metamaskWallet, walletConnect, coinbaseWallet, trustWallet, embeddedWallet } from "@thirdweb-dev/react";
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
            options: ["google"],
            
          },
          onAuthSuccess: (user) => {  
            console.log("Thirdweb User Info:", user); 
            toast.success("Đăng nhập thành công!");
          },
        }),
      ]}
      // authConfig={{
      //   domain: "http://localhost:5173",
      //   authUrl: "http://localhost:9999/api", 
      // }}
    >
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <App />
        </PersistGate>
      </Provider>
    </ThirdwebProvider>
);
