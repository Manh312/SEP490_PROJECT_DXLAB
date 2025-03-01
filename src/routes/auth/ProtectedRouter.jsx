import { useAddress } from '@thirdweb-dev/react';
import PropTypes from 'prop-types';
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {

  return useAddress ? children : <Navigate to="/not-authenticate" replace />;
};
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
