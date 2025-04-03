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
  useContract,
  useContractRead,
} from "@thirdweb-dev/react";
import App from "./App.jsx";
import { store, persistor } from "./redux/Store.jsx";
import "./styles.css";
import { toast, ToastContainer } from "react-toastify";
import { clearAuthData, fetchRoleByID, setAuthData } from "./redux/slices/Authentication.jsx";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from "./utils/axios.js";

const activeChain = "sepolia";
const TOKEN_CONTRACT_ADDRESS = "0x3F843d2C1759147eA54F325b1baB3D06AB69178B";

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
      roleId: 3,
    };

    const response = await axiosInstance.post('/user/verifyuser', payload);
    const result = response.data;

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
        : walletType === "embeddedWallet" // Sửa lỗi typo "embeddedAWallet" thành "embeddedWallet"
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

const AppWithWallet = React.memo(() => {
  const walletAddress = useAddress();
  const disconnect = useDisconnect();
  const dispatch = useDispatch();
  const wallet = useWallet();
  const [isValidUser, setIsValidUser] = useState(false);

  const walletType = useMemo(() => wallet?.walletId, [wallet]);

  const { contract } = useContract(TOKEN_CONTRACT_ADDRESS);
  const { data: balance, isLoading: balanceLoading, error: balanceError } = useContractRead(
    contract,
    "balanceOf",
    [walletAddress], // Đảm bảo walletAddress được truyền vào mỗi khi thay đổi
  );

  const validateUser = useCallback(() => {
    const user = store.getState().auth.user;
    const userEmail = user?.storedToken?.authDetails?.email || user?.email;

    if (!walletAddress || !walletType) {
      setIsValidUser(false);
      return;
    }

    if (walletType === "embeddedWallet" && !userEmail) {
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

  const tokenBalance = useMemo(() => {
    if (isValidUser && balance && !balanceLoading && !balanceError) {
      const balanceValue = balance.toString() / 10 ** 18; // Giả sử token có 18 decimals
      console.log("Calculated tokenBalance:", balanceValue.toFixed(2));
      return balanceValue.toFixed(2);
    }
    console.log("tokenBalance is null - isValidUser:", isValidUser, "balance:", balance, "balanceLoading:", balanceLoading, "balanceError:", balanceError);
    return null;
  }, [isValidUser, balance, balanceLoading, balanceError]);

  useEffect(() => {
    if (tokenBalance) {
      toast.info(`Số dư DXLAB Coin của bạn: ${tokenBalance}`, { toastId: "token-balance" });
    } else if (balanceError) {
      console.error("Lỗi khi lấy số dư token:", balanceError);
      toast.error("Không thể lấy số dư DXLAB Coin.", { toastId: "token-balance-error" });
    }
  }, [tokenBalance, balanceError]);

  return <App walletAddress={isValidUser ? walletAddress : null} tokenBalance={tokenBalance} />;
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
              await sendUserDataToBackend(user, user.walletDetails?.walletAddress, dispatch, "embeddedWallet");
            },
          }),
        ]}
        autoConnect={true}
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