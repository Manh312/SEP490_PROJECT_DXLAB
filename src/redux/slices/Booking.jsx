import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/Booking', bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể tạo đặt chỗ');
    }
  }
);

const initialState = {
  isModalOpen: false,
  selectedArea: null,
  selectedTime: [],
  peopleCount: 1,
  bookingLoading: false,
  bookingError: null,
  bookingSuccess: false,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    openModal: (state, action) => {
      state.isModalOpen = true;
      state.selectedArea = action.payload;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.selectedArea = null;
      state.selectedTime = [];
      state.peopleCount = 1;
      state.bookingError = null;
      state.bookingSuccess = false;
    },
    setSelectedTime: (state, action) => {
      state.selectedTime = [...action.payload];
    },
    setPeopleCount: (state, action) => {
      state.peopleCount = action.payload;
    },
    setMonthRange: (state, action) => {
      state.monthRange = action.payload;
    },
    setSelectedArea: (state, action) => {
      state.selectedArea = action.payload;
    },
    confirmBooking: (state, action) => {
      state.isModalOpen = false;
      state.selectedTime = [...action.payload];
    },
    resetBookingStatus: (state) => {
      state.bookingLoading = false;
      state.bookingError = null;
      state.bookingSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.bookingLoading = true;
        state.bookingError = null;
        state.bookingSuccess = false;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.bookingLoading = false;
        state.bookingSuccess = true;
        state.selectedTime = [];
        state.peopleCount = 1;
        state.selectedArea = null;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.bookingLoading = false;
        state.bookingError = action.payload;
        state.bookingSuccess = false;
      });
  },
});

export const {
  openModal,
  closeModal,
  setSelectedTime,
  setPeopleCount,
  setSelectedArea,
  setMonthRange,
  confirmBooking,
  resetBookingStatus,
} = bookingSlice.actions;

export default bookingSlice.reducer;