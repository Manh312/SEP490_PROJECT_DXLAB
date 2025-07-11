import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

const API_URL = "/bookinghistory"; // Đã có baseURL từ axiosInstance
// Thunk call API
export const fetchBookingHistory = createAsyncThunk(
  'bookingHistory/fetchBookingHistory',
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(API_URL);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk lấy chi tiết booking theo ID
export const fetchBookingDetailById = createAsyncThunk(
    'bookingHistory/fetchBookingDetailById',
    async (id, thunkAPI) => {
      try {
        const response = await axiosInstance.get(`${API_URL}/${id}`);
        return response.data.data; // Trả về `bookingId`, `userName`, `bookingCreatedDate`, `totalPrice`, `details`
      } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message);
      }
    }
);

// Thunk check-in theo bookingDetailId
export const checkinBookingDetail = createAsyncThunk(
  'bookingHistory/checkinBookingDetail',
  async (bookingDetailId, thunkAPI) => {
    try {
      const response = await axiosInstance.post(`/bookinghistory/checkin/${bookingDetailId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk check-out theo bookingDetailId
export const checkoutBookingDetail = createAsyncThunk(
  'bookingHistory/checkoutBookingDetail',
  async (bookingDetailId, thunkAPI) => {
    try {
      const response = await axiosInstance.post(`/bookinghistory/checkout/${bookingDetailId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const bookingHistorySlice = createSlice({
  name: 'bookingHistory',
  initialState: {
    data: [],
    loading: false,
    error: null,
    bookingDetail: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookingHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchBookingHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //fetch detaildetail
      .addCase(fetchBookingDetailById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.bookingDetail = null;
      })
      .addCase(fetchBookingDetailById.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingDetail = action.payload;
      })
      .addCase(fetchBookingDetailById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Checkin
      .addCase(checkinBookingDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkinBookingDetail.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(checkinBookingDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Checkout
      .addCase(checkoutBookingDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkoutBookingDetail.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(checkoutBookingDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });     
  },
});

export default bookingHistorySlice.reducer;
