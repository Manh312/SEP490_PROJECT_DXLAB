import { useAddress } from '@thirdweb-dev/react';
import PropTypes from 'prop-types';
import NotAuthenticate from '../../layouts/home/NotAuthenticate';

const ProtectedRoute = ({ children }) => {

  return (
     useAddress() ? children: <NotAuthenticate />
  ); 
  
  
};
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
