import PropTypes from "prop-types";
import NotAuthorization from "../../layouts/home/NotAuthorization";
import NotAuthenticate from "../../layouts/home/NotAuthenticate";
import { FaSpinner } from "react-icons/fa";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAddress, useConnectionStatus } from "@thirdweb-dev/react";
import { fetchRoleByID } from "../../redux/slices/Authentication";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const address = useAddress();
  const status = useConnectionStatus();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [roleName, setRoleName] = useState(null);

  const cachedRoleName = user?.roleName || null;

  useEffect(() => {
    const checkUserRole = async () => {
      // Nếu không có address, không kết nối hoặc không có user, dừng lại
      if (!address || status !== "connected" || !user) {
        setIsLoading(false);
        return;
      }

      // Nếu đã có cachedRoleName, sử dụng nó và dừng lại
      if (cachedRoleName) {
        setRoleName(cachedRoleName);
        setIsLoading(false);
        return;
      }

      // Chỉ gọi API nếu có roleId và chưa có roleName
      const roleId = user?.roleId;
      if (roleId && !roleName && !loading) {
        try {
          const fetchedRole = await dispatch(fetchRoleByID(roleId)).unwrap();
          setRoleName(fetchedRole);
        } catch (error) {
          console.error("Failed to fetch role:", error);
        }
      }
      setIsLoading(false);
    };

    setIsLoading(true);
    checkUserRole();

    // Chỉ依赖 các giá trị cần thiết, không bao gồm roleName
  }, [status, address, user, loading, dispatch]); // Loại bỏ roleName và cachedRoleName

  const isAuthLoading = useMemo(() => {
    return isLoading || loading || status === "connecting";
  }, [isLoading, loading, status]);

  const isDisconnected = useMemo(() => {
    return !address || status === "disconnected";
  }, [address, status]);

  const isUnauthorized = useMemo(() => {
    return !roleName || (allowedRoles && !allowedRoles.includes(roleName));
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