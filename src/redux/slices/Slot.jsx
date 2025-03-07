import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API endpoint (cập nhật URL thực tế)
const API_URL = "https://localhost:7101/api/Slot";


// Lấy danh sách slots
export const listSlots = createAsyncThunk(
  '/',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/slots`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể tải danh sách slots");
    }
  }
);

// Tạo slot mới
export const createSlot = createAsyncThunk(
  '/Generate',
  async (slot, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/slots`, slot);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Có lỗi xảy ra khi tạo slot");
    }
  }
);

const slotSlice = createSlice({
  name: 'slots',
  initialState: {
    slots: [],
    loading: false,
    error: null,
  },
  reducers: {
    deleteSlot: (state, action) => {
      state.slots = state.slots.filter(slot => slot.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý lấy danh sách slots
      .addCase(listSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listSlots.fulfilled, (state, action) => {
        state.slots = action.payload;
        state.loading = false;
      })
      .addCase(listSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Xử lý tạo slot mới
      .addCase(createSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSlot.fulfilled, (state, action) => {
        state.slots.push(action.payload);
        state.loading = false;
      })
      .addCase(createSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { deleteSlot } = slotSlice.actions;
export default slotSlice.reducer;
