import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  markAsRead,
  markAllAsRead,
} from "../redux/slices/Notification";
import { Bell, CheckCircle, XCircle, Trash2, FileText } from "lucide-react";

// Tạo một instance của Audio để phát âm thanh thông báo
const notificationSound = new Audio(
  "https://www.soundjay.com/buttons/sounds/button-13.mp3"
);

const Notification = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.notifications);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [prevNotificationCount, setPrevNotificationCount] = useState(0); // Khởi tạo với 0

  // Kiểm tra dữ liệu notifications
  useEffect(() => {
    console.log("Notifications:", notifications); // Kiểm tra dữ liệu
  }, [notifications]);

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ`;
    const diffInDays = Math.floor(diffInSeconds / 86400);
    return `${diffInDays} ngày`;
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "error":
      case "warning":
        return <XCircle className="w-6 h-6 text-red-500" />;
      case "delete":
        return <Trash2 className="w-6 h-6 text-red-500" />;
      case "info":
      default:
        return <FileText className="w-6 h-6 text-blue-500" />;
    }
  };

  // Count unread notifications
  const unreadCount = notifications.filter((notif) => !notif.isRead).length;

  // Lọc thông báo theo tab
  const filteredNotifications = activeTab === "all"
    ? notifications
    : notifications.filter((notif) => !notif.isRead);

  // Sắp xếp thông báo: thông báo chưa đọc lên trên, sau đó theo thời gian giảm dần
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1;
    }
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  // Xử lý khi nhấp vào thông báo
  const handleNotificationClick = (notifId, isRead) => {
    if (!isRead) {
      dispatch(markAsRead(notifId));
    }
  };

  // Phát âm thanh khi có thông báo mới
  useEffect(() => {
    if (notifications.length > prevNotificationCount) {
      // Chỉ phát âm thanh nếu đã có tương tác người dùng
      const playSound = async () => {
        try {
          await notificationSound.play();
        } catch (error) {
          console.log("Lỗi phát âm thanh:", error);
        }
      };
      playSound();
    }
    setPrevNotificationCount(notifications.length);
  }, [notifications, prevNotificationCount]);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
        title="Thông báo"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 max-h-[80vh] overflow-y-auto overflow-x-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-gray-900">Thông báo</h3>
              <Link
                to="/notifications"
                className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-full transition-colors duration-200"
              >
                Xem tất cả
              </Link>
            </div>
            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                  activeTab === "all"
                    ? "bg-white text-gray-900 border border-gray-300"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActiveTab("unread")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                  activeTab === "unread"
                    ? "bg-white text-gray-900 border border-gray-300"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                Chưa đọc
              </button>
            </div>
          </div>

          {/* Notification List */}
          {sortedNotifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Không có thông báo nào
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {sortedNotifications.map((notif) => (
                <li
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif.id, notif.isRead)}
                  className={`flex items-start gap-3 p-3 transition-colors duration-200 cursor-pointer ${
                    notif.isRead ? "bg-white" : "bg-blue-50"
                  } hover:bg-gray-100`}
                >
                  {/* Avatar/Icon */}
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-x-hidden">
                    <p
                      className={`text-sm whitespace-normal break-words ${
                        notif.isRead ? "text-gray-900" : "text-gray-900 font-semibold"
                      }`}
                    >
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatTimestamp(notif.timestamp)}
                    </p>
                  </div>

                  {/* Điểm đánh dấu chưa đọc */}
                  {!notif.isRead && (
                    <span className="flex-shrink-0 w-3 h-3 bg-blue-600 rounded-full mt-2" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Notification;