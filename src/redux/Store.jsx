import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { useDispatch as useAppDispatch, useSelector as useAppSelector } from 'react-redux';
import { rootPersistConfig, rootReducer } from './RootReducer';
import { thunk } from 'redux-thunk'; // Middleware hỗ trợ async actions
import { configureAxios } from '../utils/axios'; // Import configureAxios

// Kết hợp Redux Persist với rootReducer
const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

// Tạo Redux Store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Giúp tránh lỗi khi lưu Redux Persist
    }).concat(thunk), // Thêm middleware thunk để hỗ trợ call API async
});

// Cấu hình axios với store sau khi store được tạo
configureAxios(store);

// Khởi tạo persistor
const persistor = persistStore(store);

// Tạo các hooks tùy chỉnh để sử dụng Redux dễ dàng hơn
const useDispatch = () => useAppDispatch();
const useSelector = useAppSelector;

export { store, persistor, useDispatch, useSelector };
export default store; // Để có thể import mặc định