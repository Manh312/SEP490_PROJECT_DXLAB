import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/Authentication";
import bookingReducer from "./slices/Booking";



// slices

const rootPersistConfig = {
  key: "root",
  storage,
  keyPrefix: 'redux-',
};


const rootReducer = combineReducers({
  auth: authReducer,
  booking: bookingReducer
});

export { rootPersistConfig, rootReducer }; 