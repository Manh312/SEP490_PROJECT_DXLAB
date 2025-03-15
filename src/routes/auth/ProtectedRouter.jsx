import PropTypes from "prop-types";
import NotAuthorization from "../../layouts/home/NotAuthorization";
import NotAuthenticate from "../../layouts/home/NotAuthenticate";
import { FaSpinner } from "react-icons/fa";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAddress, useConnectionStatus } from "@thirdweb-dev/react";
import { fetchRoleByID } from "../../redux/slices/Authentication";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const address = useAddress();
  const status = useConnectionStatus();
  const dispatch = useDispatch();
  const { user, loading, roleName } = useSelector((state) => state.auth); // Lấy roleName từ Redux state

  useEffect(() => {
    const checkUserRole = async () => {
      if (!address || status !== "connected" || !user) {
        return;
      }

      // Nếu roleName đã có trong Redux state, không cần fetch lại
      if (roleName) {
        return;
      }

      const roleId = user?.roleId;
      if (roleId && !roleName && !loading) {
        try {
          await dispatch(fetchRoleByID(roleId)).unwrap();
        } catch (error) {
          console.error("Failed to fetch role:", error);
        }
      }
    };

    checkUserRole();
  }, [status, address, user, roleName, loading, dispatch]);

  // Dùng useMemo để tối ưu hóa điều kiện render
  const isAuthLoading = useMemo(() => {
    // Đang tải nếu: Redux đang loading, hoặc status đang connecting, hoặc chưa có roleName nhưng user và address tồn tại
    return (
      loading ||
      status === "connecting" ||
      (!roleName && !!user && !!address && status === "connected")
    );
  }, [loading, status, roleName, user, address]);

  const isDisconnected = useMemo(() => {
    return !address || status === "disconnected";
  }, [address, status]);

  const isUnauthorized = useMemo(() => {
    return roleName && allowedRoles && !allowedRoles.includes(roleName);
  }, [roleName, allowedRoles]);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center py-6 mt-30 mb-80">
        <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
        <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (isDisconnected) {
    return <NotAuthenticate />;
  }

  if (isUnauthorized) {
    return <NotAuthorization />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

ProtectedRoute.defaultProps = {
  allowedRoles: [],
};

export default ProtectedRoute;