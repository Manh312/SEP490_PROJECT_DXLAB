import { useAddress, useConnectionStatus } from "@thirdweb-dev/react";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import NotAuthenticate from "../../layouts/home/NotAuthenticate";

const ProtectedRoute = ({ children }) => {
  const address = useAddress(); // Lấy địa chỉ ví
  const status = useConnectionStatus(); // Kiểm tra trạng thái kết nối
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true); // Khi component mount, luôn đặt loading để đảm bảo không bị flicker

    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Đảm bảo thời gian chờ đủ lâu để tránh nhấp nháy

    return () => clearTimeout(timeout); // Xóa timeout khi component unmount
  }, [status, address]);

  // 🔥 Nếu đang tải, hiển thị "Đang tải..."
  if (isLoading) {
    return <div className="text-center mt-10">Đang tải...</div>;
  }

  // 🔥 Nếu địa chỉ ví không tồn tại và trạng thái là "disconnected", hiển thị NotAuthenticate
  if (!address && status === "disconnected") {
    return <NotAuthenticate />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
