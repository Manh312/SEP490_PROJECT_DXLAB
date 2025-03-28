import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

// Async thunk to create a booking
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

// Async thunk to fetch available slots with all three parameters
export const fetchAvailableSlots = createAsyncThunk(
  'booking/fetchAvailableSlots',
  async ({ roomId, areaTypeId, bookingDate }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/Booking/AvailiblePos?RoomId=${roomId}&AreaTypeId=${areaTypeId}&BookingDate=${bookingDate}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể lấy danh sách slot');
    }
  }
);

const initialState = {
  isModalOpen: false,
  selectedArea: null,
  selectedTime: [],
  peopleCount: 1,
  bookingDate: null, // New state to store the selected booking date
  bookingLoading: false,
  bookingError: null,
  bookingSuccess: false,
  availableSlots: [],
  slotsLoading: false,
  slotsError: null,
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
      state.bookingDate = null; // Reset booking date
      state.bookingError = null;
      state.bookingSuccess = false;
      state.slotsError = null;
    },
    setSelectedTime: (state, action) => {
      state.selectedTime = [...action.payload];
    },
    setPeopleCount: (state, action) => {
      state.peopleCount = action.payload;
    },
    setBookingDate: (state, action) => {
      state.bookingDate = action.payload; // New reducer to set booking date
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
      state.slotsLoading = false;
      state.slotsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle createBooking
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
        state.bookingDate = null;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.bookingLoading = false;
        state.bookingError = action.payload;
        state.bookingSuccess = false;
      })
      // Handle fetchAvailableSlots
      .addCase(fetchAvailableSlots.pending, (state) => {
        state.slotsLoading = true;
        state.slotsError = null;
      })
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.slotsLoading = false;
        state.availableSlots = action.payload.data;
      })
      .addCase(fetchAvailableSlots.rejected, (state, action) => {
        state.slotsLoading = false;
        state.slotsError = action.payload;
      });
  },
});

export const {
  openModal,
  closeModal,
  setSelectedTime,
  setPeopleCount,
  setBookingDate, // Export the new reducer
  setMonthRange,
  setSelectedArea,
  confirmBooking,
  resetBookingStatus,
} = bookingSlice.actions;

export default bookingSlice.reducer;