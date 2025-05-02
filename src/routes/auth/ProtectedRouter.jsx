import PropTypes from "prop-types";
import { useEffect, useMemo, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAddress, useConnectionStatus } from "@thirdweb-dev/react";
import { fetchRoleByID } from "../../redux/slices/Authentication";
import NotAuthorization from "../../layouts/home/NotAuthorization";
import NotAuthenticate from "../../layouts/home/NotAuthenticate";
import { FaSpinner } from "react-icons/fa";
import { HomeContent } from "../../App";

// Component Loading riêng biệt để tái sử dụng
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-6 mt-30 mb-80">
    <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
    <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const address = useAddress();
  const status = useConnectionStatus();
  const dispatch = useDispatch();

  // Lấy dữ liệu từ Redux một cách chọn lọc
  const { user, loading, roleName, isLoggingOut } = useSelector(
    (state) => ({
      user: state.auth.user,
      loading: state.auth.loading,
      roleName: state.auth.roleName,
      isLoggingOut: state.auth.isLoggingOut,
    }),
    // So sánh shallow để tránh re-render không cần thiết
    (prev, next) => 
      prev.user === next.user && 
      prev.loading === next.loading && 
      prev.roleName === next.roleName &&
      prev.isLoggingOut === next.isLoggingOut
  );

  // Chỉ fetch role khi cần thiết
  useEffect(() => {
    if (
      status === "connected" &&
      address &&
      user?.roleId &&
      !roleName &&
      !loading
    ) {
      dispatch(fetchRoleByID(user.roleId)).catch((error) => {
        console.error("Failed to fetch role:", error);
      });
    }
  }, [status, address, user, roleName, loading, dispatch]);

  // Tối ưu các điều kiện render
  const isAuthLoading = useMemo(
    () =>
      loading ||
      status === "connecting" ||
      (!roleName && !!user && !!address && status === "connected"),
    [loading, status, roleName, user, address]
  );

  const isDisconnected = useMemo(
    () => !address || status === "disconnected",
    [address, status]
  );

  const isUnauthorized = useMemo(
    () => roleName && !allowedRoles.includes(roleName),
    [roleName, allowedRoles]
  );

  // Prioritize isLoggingOut and home page
  if (isLoggingOut || location.pathname === "/") return <HomeContent />;
  if (isAuthLoading) return <LoadingSpinner />;
  if (isDisconnected) return <NotAuthenticate />;
  if (isUnauthorized) return <NotAuthorization />;

  return children;
};

// Định nghĩa propTypes
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

// Sử dụng React.memo để tránh re-render không cần thiết
export default memo(ProtectedRoute, (prevProps, nextProps) => {
  return (
    prevProps.children === nextProps.children &&
    prevProps.allowedRoles.join() === nextProps.allowedRoles.join()
  );
});