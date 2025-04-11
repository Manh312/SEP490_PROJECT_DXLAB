import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

// URL của SignalR Hub dựa trên cấu hình backend
const signalRUrl = "https://localhost:9999/chatHub"; // Điều chỉnh cổng nếu cần

let connection = null;

export const startSignalRConnection = async (accessToken = null) => {
  // Nếu đã có kết nối và đang chạy, trả về kết nối hiện tại
  if (connection && connection.state === "Connected") {
    console.log("SignalR already connected!");
    return connection;
  }

  // Tạo kết nối mới với SignalR
  connection = new HubConnectionBuilder()
    .withUrl(signalRUrl, {
      // Thêm token JWT nếu backend yêu cầu xác thực
      accessTokenFactory: () => accessToken,
    })
    .configureLogging(LogLevel.Information)
    .withAutomaticReconnect() // Tự động kết nối lại khi mất kết nối
    .build();

  try {
    await connection.start();
    console.log("SignalR Connected!");
  } catch (err) {
    console.error("SignalR Connection Error:", err);
    throw err; // Ném lỗi để xử lý bên ngoài nếu cần
  }

  // Xử lý sự kiện khi kết nối bị đóng
  connection.onclose((error) => {
    console.log("SignalR Connection Closed:", error || "No error details");
  });

  return connection;
};

export const stopSignalRConnection = async () => {
  if (connection && connection.state !== "Disconnected") {
    try {
      await connection.stop();
      console.log("SignalR Disconnected!");
    } catch (err) {
      console.error("SignalR Stop Error:", err);
    } finally {
      connection = null;
    }
  } else {
    console.log("No active SignalR connection to stop.");
  }
};

export const getSignalRConnection = () => connection;

// Hàm tiện ích để đăng ký sự kiện từ Hub
export const registerSignalREvent = (eventName, callback) => {
  if (connection) {
    connection.on(eventName, callback);
  } else {
    console.error("SignalR connection not established. Cannot register event:", eventName);
  }
};

// Hàm tiện ích để gửi tin nhắn tới Hub
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