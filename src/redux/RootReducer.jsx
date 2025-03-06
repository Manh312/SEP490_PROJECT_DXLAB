import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";
import bookingReducer from "./slices/Booking";


// slices

const rootPersistConfig = {
  key: "root",
  storage,
  keyPrefix: 'redux-',
};


const rootReducer = combineReducers({
  booking: bookingReducer,
});

export { rootPersistConfig, rootReducer }; 