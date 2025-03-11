import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";
import bookingReducer from "./slices/Booking";
import slotReducer from "./slices/Slot";
import roomReducer from "./slices/Room";
import authReducer from "./slices/Authentication";
import accountReducer from "./slices/Account";
import storageReducer from "./slices/Storage";
import facilitiesReducer from "./slices/Facilities";



// slices

const rootPersistConfig = {
  key: "root",
  storage,
  keyPrefix: 'redux-',
};


const rootReducer = combineReducers({
  booking: bookingReducer,
  slots: slotReducer,
  rooms: roomReducer,
  auth: authReducer,
  accounts: accountReducer,
  storage: storageReducer,
  facilities: facilitiesReducer,
  

});

export { rootPersistConfig, rootReducer }; 