import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signInWithGoogle } from '../../utils/firebase';

const initialState = {
  isLoading: false,
  isLoggedIn: false,
  token: '',
  email: '',
  name: '',
  photoURL: '',
  error: null,
};

// Thunk để xử lý đăng nhập Google
export const loginWithGoogle = createAsyncThunk('auth/loginWithGoogle', async (_, { rejectWithValue }) => {
  try {
    const userData = await signInWithGoogle();
    return userData;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const authSlice = createSlice({
  name: 'Authentication',
  initialState,
  reducers: {
    logout: (state) => {
      state.isLoggedIn = false;
      state.token = '';
      state.email = '';
      state.name = '';
      state.photoURL = '';
    }
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
        state.name = action.payload.name;
        state.photoURL = action.payload.photoURL;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
