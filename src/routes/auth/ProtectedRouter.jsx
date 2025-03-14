import PropTypes from "prop-types";
import NotAuthorization from "../../layouts/home/NotAuthorization";
import NotAuthenticate from "../../layouts/home/NotAuthenticate";
import { FaSpinner } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAddress, useConnectionStatus } from "@thirdweb-dev/react";
import { fetchRoleByID } from "../../redux/slices/Authentication";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const address = useAddress();
  const status = useConnectionStatus();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth); // Xóa role khỏi đây
  const [isLoading, setIsLoading] = useState(true);
  const [roleName, setRoleName] = useState(null); // State cục bộ để lưu roleName

  useEffect(() => {
    const checkUserRole = async () => {
      console.log("Checking user role:", { address, status, user });
      if (address && status === "connected" && user) {
        const roleId = user?.roleId;
        if (roleId && !roleName && !loading) {
          try {
            const fetchedRole = await dispatch(fetchRoleByID(roleId)).unwrap();
            setRoleName(fetchedRole); // Lưu roleName vào state cục bộ
          } catch (error) {
            console.error("Failed to fetch role:", error);
          }
        }
      }
      setIsLoading(false);
    };

    const timeout = setTimeout(() => {
      checkUserRole();
    }, 300);

    return () => clearTimeout(timeout);
  }, [status, address, user, loading, roleName, dispatch]);

  if (isLoading || loading || status === "connecting") {
    return (
      <div className="flex items-center justify-center py-6">
        <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
        <p className="text-orange-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!address || status === "disconnected") {
    return <NotAuthenticate />;
  }

  console.log("RoleName:", roleName, "Allowed Roles:", allowedRoles);

  if (!roleName || (allowedRoles && !allowedRoles.includes(roleName))) {
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