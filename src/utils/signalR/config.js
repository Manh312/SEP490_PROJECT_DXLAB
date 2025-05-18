// Lấy baseUrl từ biến môi trường hoặc fallback về localhost
const baseUrl = import.meta.env.VITE_SIGNAL_BASE_URL;

export const signalRConfig = {
  baseUrl,
  hubs: {
    blogHub: "blogHub",
    reportHub: "reportHub",
  },
  // Cấu hình retry
  retry: {
    maxAttempts: 5,
    baseDelay: 1000, // ms
  },
};