import { useSelector } from "react-redux";
import PropTypes from 'prop-types';
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isLoggedIn);

  return isAuthenticated ? children : <Navigate to="/not-authenticate" replace />;
};
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
