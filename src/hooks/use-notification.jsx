import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  markAsRead,
  clearNotification,
  markAllAsRead,
  clearAllNotifications,
} from "../redux/slices/Notification";
import { Bell, CheckCircle, XCircle, Trash2, FileText, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Notification = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.notifications);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [menuOpen, setMenuOpen] = useState(null); // Trạng thái menu cho mỗi thông báo
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false); // Trạng thái menu ba chấm ở header
  const menuRefs = useRef({}); // Ref cho các menu thông báo
  const headerMenuRef = useRef(null); // Ref cho menu header
  const dropdownRef = useRef(null); // Ref cho dropdown

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
        return <FileText className="w-6 h-6 text-orange-500" />;
    }
  };

  // Count unread notifications với kiểm tra an toàn
  const unreadCount = notifications?.filter((notif) => !notif.isRead)?.length || 0;

  // Lọc thông báo theo tab với kiểm tra an toàn
  const filteredNotifications =
    activeTab === "all"
      ? notifications || []
      : (notifications || []).filter((notif) => !notif.isRead);

  // Sắp xếp thông báo chỉ theo thời gian (mới nhất lên trên)
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  // Xử lý khi nhấp vào thông báo
  const handleNotificationClick = (notifId, isRead) => {
    if (!isRead) {
      dispatch(markAsRead(notifId));
    }
    setMenuOpen(null); // Đóng menu khi nhấp vào thông báo
  };

  // Xử lý khi nhấp vào menu thông báo
  const handleMenuClick = (notifId, action) => {
    if (action === "markAsRead") {
      dispatch(markAsRead(notifId));
    } else if (action === "delete") {
      dispatch(clearNotification(notifId));
    }
    setMenuOpen(null); // Đóng menu sau khi chọn
  };

  // Xử lý khi nhấp vào menu header
  const handleHeaderMenuClick = (action) => {
    if (action === "markAllAsRead" && unreadCount > 0) {
      dispatch(markAllAsRead());
    } else if (action === "clearAll" && notifications.length > 0) {
      dispatch(clearAllNotifications());
    }
    setHeaderMenuOpen(false); // Đóng menu header
  };

  // Đóng dropdown và menu khi nhấp ra ngoài
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     // Kiểm tra nhấp ra ngoài dropdown
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       setIsOpen(false);
  //     }
  //     // Kiểm tra nhấp ra ngoài menu header
  //     if (
  //       headerMenuRef.current &&
  //       !headerMenuRef.current.contains(event.target)
  //     ) {
  //       setHeaderMenuOpen(false);
  //     }
  //     // Kiểm tra nhấp ra ngoài các menu thông báo
  //     if (
  //       menuOpen &&
  //       !Object.values(menuRefs.current).some(
  //         (ref) => ref && ref.contains(event.target)
  //       )
  //     ) {
  //       setMenuOpen(null);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, [menuOpen]);

  // Animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
        title="Thông báo"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto overflow-x-hidden"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  Thông báo
                </h3>
                <div className="flex items-center gap-3">
                  {/* Nút ba chấm ở header */}
                  <div className="relative">
                    <button
                      onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
                      className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200 focus:outline-none"
                    >
                      <MoreHorizontal className="w-5 h-5 text-gray-500" />
                    </button>
                    {headerMenuOpen && (
                      <div
                        ref={headerMenuRef}
                        className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                      >
                        <button
                          onClick={() => handleHeaderMenuClick("markAllAsRead")}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            unreadCount > 0
                              ? "text-gray-700 hover:bg-gray-100"
                              : "text-gray-400 cursor-not-allowed"
                          } transition-colors duration-150`}
                          disabled={unreadCount === 0}
                        >
                          Đánh dấu tất cả là đã đọc
                        </button>
                        <button
                          onClick={() => handleHeaderMenuClick("clearAll")}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            notifications.length > 0
                              ? "text-red-600 hover:bg-gray-100"
                              : "text-gray-400 cursor-not-allowed"
                          } transition-colors duration-150`}
                          disabled={notifications.length === 0}
                        >
                          Xóa tất cả thông báo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                    activeTab === "all"
                      ? "bg-orange-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } focus:outline-none`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setActiveTab("unread")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                    activeTab === "unread"
                      ? "bg-orange-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } focus:outline-none`}
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
              <ul className="divide-y divide-gray-100">
                {sortedNotifications.map((notif) => (
                  <motion.li
                    key={notif.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className={`relative flex items-start gap-3 p-4 transition-colors duration-200 cursor-pointer ${
                      notif.isRead ? "bg-white" : "bg-orange-50"
                    } hover:bg-gray-50`}
                  >
                    {/* Avatar/Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div
                      className="flex-1"
                      onClick={() => handleNotificationClick(notif.id, notif.isRead)}
                    >
                      <p
                        className={`text-sm whitespace-normal break-words ${
                          notif.isRead
                            ? "text-gray-600"
                            : "text-gray-900 font-medium"
                        }`}
                      >
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimestamp(notif.timestamp)}
                      </p>
                    </div>

                    {/* Điểm đánh dấu chưa đọc */}
                    {!notif.isRead && (
                      <span className="flex-shrink-0 w-2 h-2 bg-orange-600 rounded-full mt-2" />
                    )}

                    {/* Menu ba chấm */}
                    <div
                      className="flex-shrink-0 relative"
                      onClick={(e) => e.stopPropagation()} // Ngăn sự kiện lan truyền
                    >
                      <button
                        onClick={() =>
                          setMenuOpen(menuOpen === notif.id ? null : notif.id)
                        }
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200 focus:outline-none"
                      >
                        <MoreHorizontal className="w-5 h-5 text-gray-500" />
                      </button>
                      {menuOpen === notif.id && (
                        <div
                          ref={(el) => (menuRefs.current[notif.id] = el)}
                          className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                        >
                          <button
                            onClick={() =>
                              handleMenuClick(notif.id, "markAsRead")
                            }
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                          >
                            {notif.isRead
                              ? "Đánh dấu chưa đọc"
                              : "Đánh dấu đã đọc"}
                          </button>
                          <button
                            onClick={() => handleMenuClick(notif.id, "delete")}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors duration-150"
                          >
                            Xóa thông báo
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notification;