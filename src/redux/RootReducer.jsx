import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";
import bookingReducer from "./slices/Booking";
import slotReducer from "./slices/Slot";
import roomReducer from "./slices/Room";
import authReducer from "./slices/Authentication";
import accountReducer from "./slices/Account";
import facilitiesReducer from "./slices/Facilities";
import blogsReducer from "./slices/Blog";
import areaTypesReducer from "./slices/AreaType";
import bookingHistoryReducer from "./slices/BookingHistory";
import statisticsReducer from "./slices/Statistics";
import areaReducer from "./slices/Area";
import areaCategoryReducer from "./slices/AreaCategory";
import reportsReducer from "./slices/Report";
import notificationReducer from "./slices/Notification";


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
  bookingHistory: bookingHistoryReducer,
  areas: areaReducer,
  areaCategory: areaCategoryReducer,
  reports: reportsReducer,
  notifications: notificationReducer,
});

export { rootPersistConfig, rootReducer }; 