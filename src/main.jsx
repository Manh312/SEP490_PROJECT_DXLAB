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
  useUser,
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

const handleRoleSpecificActions = async (userData) => {
  if (userData?.user && userData.user.roleId === 3) {
    try {
      console.log("Processing post-auth actions for roleId 3");
    } catch (error) {
      console.error("Error in post-authentication processing:", error);
    }
  }
};

const sendUserDataToBackend = async (user, walletAddress, dispatch, walletType, isNewLogin = false, setIsExist) => {
  try {
    console.log("sendUserDataToBackend inputs:", { user, walletAddress, walletType, isNewLogin });

    let userEmail;
    if (walletType === "embeddedWallet") {
      userEmail = user?.email || user?.storedToken?.authDetails?.email;
      if (!userEmail) {
        console.warn("Không thể lấy email từ Google authentication, sử dụng email mặc định.");
        userEmail = `${walletAddress}@embeddedwallet.default`;
      }
    } else {
      if (!walletAddress) {
        throw new Error("Địa chỉ ví không hợp lệ.");
      }
      userEmail = `${walletAddress}@metamask.default`;
    }

    const payload = {
      userId: 0,
      email: userEmail,
      fullName: "unknown",
      walletAddress,
      status: true,
      roleId: 3,
    };
    console.log("Sending payload to backend:", payload);

    const response = await axiosInstance.post("/user/verifyuser?skipMinting=true", payload);
    const result = response.data;
    console.log("Backend response:", result);


    // Kiểm tra nếu backend không trả về token hoặc user
    if (!result.data?.token || !result.data?.user) {
      console.warn("Backend returned empty data. Assuming default token and user for now.");
      result.data = {
        token: "temporary-token",
        user: { email: userEmail, walletAddress, roleId: 3 },
      };
    }

    const { roleId } = result.data.user;

    let loadingToastId;
    if (isNewLogin) {
      loadingToastId = toast.loading("Đang xác thực tài khoản...", { toastId: "auth-loading" });
    }

    dispatch(setAuthData({ token: result.data.token, user: { ...result.data.user, storedToken: user?.storedToken } }));

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
    console.error("Backend error:", error.message, error.response?.data);
    setIsExist(false);
    const errorMessage =
      error.response?.status === 404
        ? "Backend server không khả dụng."
        : error.response?.status === 401
        ? "Tài khoản không tồn tại trong hệ thống. Vui lòng thử lại."
        : error.message || "Lỗi đăng nhập. Vui lòng thử lại.";

    toast.error(errorMessage, { toastId: "login-error" });
    throw error;
  }
};

const AppWithWallet = React.memo((isExist) => {
  const walletAddress = useAddress();
  const disconnect = useDisconnect();
  const dispatch = useDispatch();
  const wallet = useWallet();
  const { user: walletUser } = useUser();
  const [isValidUser, setIsValidUser] = useState(false);
  const [authHandled, setAuthHandled] = useState(false);
  
  console.log("isExist", isExist);
  

  const connectionStatus = useConnectionStatus();
  const chainId = useChainId();
  const walletType = useMemo(() => wallet?.walletId, [wallet]);

  const validateUser = useCallback(() => {
    console.log("validateUser called with:", {
      walletAddress,
      walletType,
      chainId,
      connectionStatus,
      walletUser,
    });

    if (!walletAddress || !walletType || chainId !== 11155111) {
      console.warn("Validation failed:", { walletAddress, walletType, chainId });
      setIsValidUser(false);
      return;
    }

    const authState = store.getState().auth;
    const storedUser = authState.user;
    const token = authState.token;
    console.log("Stored user and token:", { authState});
    

    if (token && storedUser && storedUser.walletAddress === walletAddress) {
          console.log("User already authenticated, setting isValidUser to true.");
          setIsValidUser(true);
          setAuthHandled(true);
        } else {
          console.log("No valid authentication data, disconnecting wallet.");
          setIsValidUser(false);
          setAuthHandled(false);
          dispatch(clearAuthData());
          console.log("Connection status:", connectionStatus, isExist);      
          if (connectionStatus === "connected" && isExist.isExist === false) {
            console.log('123');
            disconnect();
          }
        }
  }, [walletAddress, walletType, chainId, connectionStatus, walletUser, disconnect, isExist, dispatch]);

  useEffect(() => {
    console.log("useEffect triggered with connectionStatus:", connectionStatus);
    if (connectionStatus === "connected" && !authHandled) {
      validateUser();
    } else if (connectionStatus === "disconnected") {
      console.log("Wallet disconnected, clearing auth data.");
      setIsValidUser(false);
      setAuthHandled(false);
      dispatch(clearAuthData());
    }
  }, [connectionStatus, validateUser, dispatch, authHandled]);

  return <App walletAddress={isValidUser ? walletAddress : null} />;
});

AppWithWallet.displayName = "AppWithWallet";

const RootApp = () => {
  const dispatch = useDispatch();
  const [isExist, setIsExist] = useState(true);

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
                console.log("MetaMask connected:", walletAddress);
                await sendUserDataToBackend({}, walletAddress, dispatch, "metamask", true);
                // Đánh dấu auth đã được xử lý
              } catch (error) {
                console.error("MetaMask login failed:", error);
                walletDetails.disconnect();
                toast.error("Đăng nhập MetaMask thất bại: " + error.message);
              }
            },
          }),
          walletConnect(),
          coinbaseWallet(),
          trustWallet(),
          embeddedWallet({
            auth: {
              options: ["google"],
            },
            onAuthSuccess: async (user) => {
              console.log("Embedded wallet auth success:", user);
              try {
                const userEmail = user.email || user.storedToken?.authDetails?.email;
                const walletAddress = user.walletDetails?.walletAddress;
                if (!walletAddress) {
                  throw new Error("Địa chỉ ví không hợp lệ.");
                }
                if (!userEmail) {
                  throw new Error("Email không hợp lệ.");
                }
                await sendUserDataToBackend({ ...user, email: userEmail }, walletAddress, dispatch, "embeddedWallet", true, setIsExist);
              } catch (error) {
                console.error("Embedded wallet login failed:", error);
                user.disconnect?.();
              }
            },
          }),
        ]}
      >
        <PersistGate loading={null} persistor={persistor}>
          <AppWithWallet isExist={isExist}/>
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