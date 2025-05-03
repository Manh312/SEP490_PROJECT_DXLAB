import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

// Async thunk to create a booking
export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/booking', bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchAvailableSlots = createAsyncThunk(
  'booking/fetchAvailableSlots',
  async ({ roomId, areaTypeId, bookingDate }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/booking/availiblepos?RoomId=${roomId}&AreaTypeId=${areaTypeId}&BookingDate=${bookingDate}`);
      return response.data;
    } catch (error) {      
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCategoryInRoom = createAsyncThunk(
  'booking/fetchCategoryInRoom',
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/booking/categoryinroom?id=${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể lấy danh sách khu vực trong phòng');
    }
  }
);

export const fetchBookingHistory = createAsyncThunk(
  'booking/fetchBookingHistory',
  async (_, { rejectWithValue }) => {
    try {      
      const response = await axios.get(`/studentbookinghistory`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Lỗi khi lấy lịch sử');
    }
  }
);

export const fetchBookingHistoryDetail = createAsyncThunk(
  'booking/fetchBookingHistoryDetail',
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/studentbookinghistory/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Async thunk to delete a booking
export const deleteBooking = createAsyncThunk(
  'booking/deleteBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/booking?bookingId=${bookingId}`);
      return { bookingId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể xóa booking');
    }
  }
);

// Async thunk to fetch booking cancel info
export const fetchBookingCancelInfo = createAsyncThunk(
  'booking/fetchBookingCancelInfo',
  async ({ bookingId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/booking/bookingcancelinfo?bookingId=${bookingId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  isModalOpen: false,
  selectedArea: null,
  selectedTime: [],
  bookingDate: null,
  bookingLoading: false,
  bookingError: null,
  bookingSuccess: false,
  availableSlots: [],
  slotsLoading: false,
  slotsError: null,
  categoryInRoom: null,
  categoryLoading: false,
  categoryError: null,
  bookings: { data: [], message: '', statusCode: null }, // Initialize bookings as an object with data array
  bookingDetail: null,
  historyDetailLoading: false,
  historyDetailError: null,
  selectedSlot: 1,
  selectedDate: Date,
  cancelInfo: null, // Lưu trữ thông tin hủy booking
  cancelInfoLoading: false, // Trạng thái loading khi gọi API fetchBookingCancelInfo
  cancelInfoError: null, // Lưu trữ lỗi khi gọi API fetchBookingCancelInfo
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
      state.bookingDate = null;
      state.bookingError = null;
      state.bookingSuccess = false;
      state.slotsError = null;
      state.categoryLoading = false;
      state.categoryError = null;
      state.cancelInfo = null; // Reset cancelInfo khi đóng modal
      state.cancelInfoLoading = false;
      state.cancelInfoError = null;
    },
    setSelectedTime: (state, action) => {
      state.selectedTime = [...action.payload];
    },
    setBookingDate: (state, action) => {
      state.bookingDate = action.payload;
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
      state.categoryLoading = false;
      state.categoryError = null;
      state.historyDetailLoading = false;
      state.historyDetailError = null;
      state.cancelInfoLoading = false; // Reset trạng thái cancelInfoLoading
      state.cancelInfoError = null; // Reset trạng thái cancelInfoError
      // Do NOT reset bookingDetail, selectedDate, or selectedSlot
    },
    setSelectedSlot: (state, action) => {
      state.selectedSlot = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    clearBooking: (state) => {
      state.bookings = { data: [], message: '', statusCode: null };
      state.bookingDetail = null;
      state.historyDetailLoading = false;
      state.historyDetailError = null;
      state.selectedDate = Date;
      state.cancelInfo = null; // Reset cancelInfo khi clear booking
      state.cancelInfoLoading = false;
      state.cancelInfoError = null;
    }
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
        const newBooking = action.payload.data || action.payload;
        if (newBooking && newBooking.bookingId) { // Fix: Use bookingId
          state.bookingSuccess = true;
          state.bookings.data = Array.isArray(state.bookings.data)
            ? [...state.bookings.data, newBooking]
            : [newBooking];
        } else {
          state.bookingError = 'Dữ liệu booking không hợp lệ';
          state.bookingSuccess = false;
        }        
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
      })
      // Handle fetchCategoryInRoom
      .addCase(fetchCategoryInRoom.pending, (state) => {
        state.categoryLoading = true;
        state.categoryError = null;
      })
      .addCase(fetchCategoryInRoom.fulfilled, (state, action) => {
        state.categoryLoading = false;
        state.categoryInRoom = action.payload;
      })
      .addCase(fetchCategoryInRoom.rejected, (state, action) => {
        state.categoryLoading = false;
        state.categoryError = action.payload;
      })
      // Handle fetchBookingHistory
      .addCase(fetchBookingHistory.pending, (state) => {
        state.bookingLoading = true;
        state.bookingError = null;        
      })
      .addCase(fetchBookingHistory.fulfilled, (state, action) => {
        state.bookingLoading = false;
        console.log("ABC", action.payload);
        state.bookings = {
          data: action.payload.data || [],
          message: action.payload.message || '',
          statusCode: action.payload.statusCode || null,
        };
        console.log('Updated bookings:', state.bookings);
      })
      .addCase(fetchBookingHistory.rejected, (state, action) => {
        state.bookingLoading = false;
        state.bookingError = action.payload;
      })
      // Handle fetchBookingHistoryDetail
      .addCase(fetchBookingHistoryDetail.pending, (state) => {
        state.historyDetailLoading = true;
        state.historyDetailError = null;
      })
      .addCase(fetchBookingHistoryDetail.fulfilled, (state, action) => {
        state.historyDetailLoading = false;
        state.bookingDetail = action.payload;
        console.log('Updated bookingDetail:', state.bookingDetail);
      })
      .addCase(fetchBookingHistoryDetail.rejected, (state, action) => {
        state.historyDetailLoading = false;
        state.historyDetailError = action.payload;
      })
      // Handle deleteBooking
      .addCase(deleteBooking.pending, (state) => {
        state.bookingLoading = true;
        state.bookingError = null;
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.bookingLoading = false;
        state.bookings.data = state.bookings.data.filter(booking => booking.bookingId !== action.payload.bookingId);
        state.bookingSuccess = true;
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.bookingLoading = false;
        state.bookingError = action.payload;
        state.bookingSuccess = false;
      })
      // Handle fetchBookingCancelInfo
      .addCase(fetchBookingCancelInfo.pending, (state) => {
        state.cancelInfoLoading = true;
        state.cancelInfoError = null;
      })
      .addCase(fetchBookingCancelInfo.fulfilled, (state, action) => {
        state.cancelInfoLoading = false;
        state.cancelInfo = action.payload;
      })
      .addCase(fetchBookingCancelInfo.rejected, (state, action) => {
        state.cancelInfoLoading = false;
        state.cancelInfoError = action.payload;
      });
  },
});

export const {
  openModal,
  closeModal,
  setSelectedTime,
  setBookingDate,
  setMonthRange,
  setSelectedArea,
  confirmBooking,
  resetBookingStatus,
  setSelectedSlot,
  setSelectedDate,
  clearBooking
} = bookingSlice.actions;

export default bookingSlice.reducer;