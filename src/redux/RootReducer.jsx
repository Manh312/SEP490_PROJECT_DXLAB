import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";
import bookingReducer from "./slices/Booking";
import slotReducer from "./slices/Slot";
import roomReducer from "./slices/Room";
import authReducer from "./slices/Authentication";
import accountReducer from "./slices/Account";
import facilitiesReducer from "./slices/Facilities";
import blogsReducer from "./slices/Blog";
import areaTypesReducer from "./slices/AreaType"
import statisticsReducer from "./slices/Statistics"



// slices

const rootPersistConfig = {
  key: "root",
  storage,
  keyPrefix: 'redux-',
};


const rootReducer = combineReducers({
  booking: bookingReducer,
  slots: slotReducer,
  statistics: statisticsReducer,
  rooms: roomReducer,
  areaTypes: areaTypesReducer,
  auth: authReducer,
  accounts: accountReducer,
  facilities: facilitiesReducer,
  blogs: blogsReducer,

});

export { rootPersistConfig, rootReducer }; 