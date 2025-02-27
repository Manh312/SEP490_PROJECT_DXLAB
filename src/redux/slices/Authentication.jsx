import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signInWithGoogle } from '../../utils/firebase';

const initialState = {
  isLoading: false,
  isLoggedIn: false,
  token: '',
  email: '',
  userId: '',
  name: '',
  photoURL: '',
  role: '',  // Thêm role
  walletAddress: null,
  error: null,
};

// Thunk để xử lý đăng nhập Google
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const userData = await signInWithGoogle();

      // Chặn nếu email không thuộc @fpt.edu.vn
      if (!userData.email.endsWith("@fpt.edu.vn")) {
        return rejectWithValue("Bạn phải sử dụng email @fpt.edu.vn để đăng nhập!");
      }

      // Xác định role dựa trên email hoặc dữ liệu từ Firebase
      let role = "Student"; // Default role
      if (userData.email.startsWith("admin")) {
        role = "Admin";
      } else if (userData.email.startsWith("staff")) {
        role = "Staff";
      }

      return { ...userData, role };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'Authentication',
  initialState,
  reducers: {
    logout: (state) => {
      state.isLoggedIn = false;
      state.isLoading = false;
      state.token = '';
      state.email = '';
      state.name = '';
      state.photoURL = '';
      state.role = ''; // Reset role khi logout
    },
    setWalletAddress: (state, action) => {
      state.walletAddress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        state.token = action.payload.token;
        state.email = action.payload.email;
        state.userId = action.payload.id;
        state.name = action.payload.name;
        state.photoURL = action.payload.photoURL;
        state.role = action.payload.role; // Lưu role vào Redux
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        if (action.payload === "Firebase: Error (auth/popup-closed-by-user).") {
          state.isLoading = false;
          return; 
        }
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, setWalletAddress } = authSlice.actions;
export default authSlice.reducer;
