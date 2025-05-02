import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now().toString(), // Simple unique ID
        message: action.payload.message,
        type: action.payload.type || 'success',
        timestamp: new Date().toISOString(),
        isRead: false,
      });
    },
    markAsRead: (state, action) => {
      state.notifications = state.notifications.map((notif) =>
        notif.id === action.payload ? { ...notif, isRead: true } : notif
      );
    },
    clearNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notif) => notif.id !== action.payload
      );
    },
    markAllAsRead: (state) => {
      state.notifications = state.notifications.map((notif) => ({
        ...notif,
        isRead: true,
      }));
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  addNotification,
  markAsRead,
  clearNotification,
  markAllAsRead,
  clearAllNotifications,
} = notificationSlice.actions;
export default notificationSlice.reducer;