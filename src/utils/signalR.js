import { HubConnectionBuilder, LogLevel, HttpTransportType } from "@microsoft/signalr";

// URL của SignalR Hub dựa trên cấu hình backend
const signalRUrl = "https://localhost:9999/chatHub"; // Sửa từ /chatHub thành /blogHub

let connection = null;

export const startSignalRConnection = async (accessToken = null) => {
  // Nếu đã có kết nối và đang chạy, trả về kết nối hiện tại
  if (connection && connection.state === "Connected") {
    console.log("SignalR already connected!");
    return connection;
  }

  // Kiểm tra accessToken
  if (!accessToken) {
    console.error("No access token provided for SignalR connection");
    throw new Error("Access token is required for SignalR connection");
  }

  // Tạo kết nối mới với SignalR
  connection = new HubConnectionBuilder()
    .withUrl(signalRUrl, {
      accessTokenFactory: () => {
        console.log("Using access token for SignalR:", accessToken);
        return accessToken;
      },
      withCredentials: true, // Đảm bảo gửi credentials nếu cần
      // Thêm tùy chọn transport để thử WebSockets trước, nếu thất bại thì chuyển sang ServerSentEvents hoặc LongPolling
      transport: HttpTransportType.WebSockets | HttpTransportType.ServerSentEvents | HttpTransportType.LongPolling,
    })
    .configureLogging(LogLevel.Information)
    .withAutomaticReconnect()
    .build();

  // Đăng ký sự kiện onclose trước khi bắt đầu kết nối
  connection.onclose((error) => {
    console.log("SignalR Connection Closed:", error || "No error details");
    connection = null; // Đặt lại connection về null khi kết nối đóng
  });

  try {
    await connection.start();
    console.log("SignalR Connected! Connection ID:", connection?.connectionId || "Unknown");
    return connection;
  } catch (err) {
    console.error("SignalR Connection Error:", err);
    connection = null; // Đặt lại connection về null nếu kết nối thất bại
    throw err;
  }
};

export const stopSignalRConnection = async () => {
  if (!connection) {
    console.log("No active SignalR connection to stop.");
    return;
  }

  if (connection.state !== "Disconnected") {
    try {
      await connection.stop();
      console.log("SignalR Disconnected!");
    } catch (err) {
      console.error("SignalR Stop Error:", err);
    } finally {
      connection = null;
    }
  } else {
    console.log("SignalR connection is already disconnected.");
    connection = null;
  }
};

export const getSignalRConnection = () => connection;

export const registerSignalREvent = (eventName, callback) => {
  if (connection) {
    connection.on(eventName, callback);
    console.log(`Registered SignalR event: ${eventName}`);
  } else {
    console.error("SignalR connection not established. Cannot register event:", eventName);
  }
};

export const sendSignalRMessage = async (methodName, ...args) => {
  if (connection && connection.state === "Connected") {
    try {
      await connection.invoke(methodName, ...args);
      console.log(`SignalR Message Sent: ${methodName}`, args);
    } catch (err) {
      console.error(`SignalR Invoke Error (${methodName}):`, err);
    }
  } else {
    console.error("Cannot send message. SignalR connection is not active.");
  }
};