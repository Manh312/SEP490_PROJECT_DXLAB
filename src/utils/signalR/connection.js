import { HubConnectionBuilder, LogLevel, HttpTransportType } from "@microsoft/signalr";
import { signalRConfig } from "./config";

// Lưu trữ các kết nối theo hubName
const connections = {};

const getSignalRUrl = (hubName) => {
  if (!signalRConfig.hubs[hubName]) {
    throw new Error(`Hub ${hubName} is not defined in signalRConfig`);
  }
  return `${signalRConfig.baseUrl}/${signalRConfig.hubs[hubName]}`;
};

// Retry logic với exponential backoff
const retryWithBackoff = async (operation, maxAttempts, baseDelay) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (err) {
      if (attempt === maxAttempts) {
        throw err;
      }
      const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
      console.warn(`Attempt ${attempt} failed. Retrying after ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export const startSignalRConnection = async (hubName, accessToken) => {
  // Kiểm tra hubName
  if (!signalRConfig.hubs[hubName]) {
    throw new Error(`Invalid hubName: ${hubName}`);
  }

  // Nếu đã có kết nối và đang chạy
  if (connections[hubName] && connections[hubName].state === "Connected") {
    console.log(`SignalR already connected to ${hubName}!`);
    return connections[hubName];
  }

  // Kiểm tra accessToken
  if (!accessToken) {
    throw new Error("Access token is required for SignalR connection");
  }

  // Tạo kết nối mới
  const connection = new HubConnectionBuilder()
    .withUrl(getSignalRUrl(hubName), {
      accessTokenFactory: () => {
        console.log(`Using access token for SignalR (${hubName}):`, accessToken);
        return accessToken;
      },
      withCredentials: true,
      transport: HttpTransportType.WebSockets | HttpTransportType.ServerSentEvents | HttpTransportType.LongPolling,
    })
    .configureLogging(LogLevel.Information)
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext) => {
        return Math.min(30000, 1000 * Math.pow(2, retryContext.previousRetryCount));
      },
    })
    .build();

  // Đăng ký sự kiện onclose
  connection.onclose((error) => {
    console.log(`SignalR Connection Closed (${hubName}):`, error || "No error details");
    delete connections[hubName]; // Xóa kết nối khi đóng
  });

  // Lưu kết nối
  connections[hubName] = connection;

  // Thử kết nối với retry
  try {
    await retryWithBackoff(
      () => connection.start(),
      signalRConfig.retry.maxAttempts,
      signalRConfig.retry.baseDelay
    );
    console.log(`SignalR Connected to ${hubName}! Connection ID:`, connection.connectionId || "Unknown");
    return connection;
  } catch (err) {
    console.error(`SignalR Connection Error (${hubName}):`, err);
    delete connections[hubName];
    throw new Error(`Failed to connect to ${hubName}: ${err.message}`);
  }
};

export const stopSignalRConnection = async (hubName) => {
  const connection = connections[hubName];
  if (!connection) {
    console.log(`No active SignalR connection for ${hubName}.`);
    return;
  }

  if (connection.state !== "Disconnected") {
    try {
      await connection.stop();
      console.log(`SignalR Disconnected from ${hubName}!`);
    } catch (err) {
      console.error(`SignalR Stop Error (${hubName}):`, err);
    } finally {
      delete connections[hubName];
    }
  } else {
    console.log(`SignalR connection for ${hubName} is already disconnected.`);
    delete connections[hubName];
  }
};

export const getSignalRConnection = (hubName) => {
  if (!signalRConfig.hubs[hubName]) {
    console.error(`Invalid hubName: ${hubName}`);
    return null;
  }
  return connections[hubName] || null;
};