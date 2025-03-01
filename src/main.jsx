import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import App from "./App.jsx";
import { store, persistor } from "./redux/Store.jsx";
import "./styles.css";

const activeChain = "sepolia"; 

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThirdwebProvider activeChain={activeChain}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </ThirdwebProvider>
  </StrictMode>
);
