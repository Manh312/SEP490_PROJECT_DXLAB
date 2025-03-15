import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios"; // Import axiosInstance

const API_URL = "/Room"; // Đã có baseURL từ axiosInstance

// **1. Lấy danh sách tất cả các phòng**
export const fetchRooms = createAsyncThunk(
  "room/fetchRooms",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_URL);
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Không thể lấy danh sách phòng");
    }
  }
);

// **2. Lấy thông tin phòng theo ID**
export const getRoomById = createAsyncThunk(
  "room/getById",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/${roomId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Không tìm thấy phòng");
    }
  }
);

// **3. Tạo phòng**
export const createRoom = createAsyncThunk(
  "room/create",
  async (roomData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_URL, roomData);
      console.log("create room: "+response);
      return response.data;
    } catch (error) {
      console.log(error.response.data.errors.RoomName);
      return rejectWithValue(error.message || "Không thể tạo phòng");
    }
  }
);

// **4. Cập nhật phòng**
export const updateRoom = createAsyncThunk(
  "room/update",
  async ({ roomId, roomData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/${roomId}`, roomData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Cập nhật phòng thất bại");
    }
  }
);

// **5. Xóa phòng**
export const deleteRoom = createAsyncThunk(
  "room/delete",
  async (roomId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_URL}/${roomId}`);
      return roomId;
    } catch (error) {
      return rejectWithValue(error.message || "Xóa phòng thất bại");
    }
  }
);

// **Slice Redux**
const roomSlice = createSlice({
  name: "rooms",
  initialState: {
    rooms: [],
    loading: false,
    error: null,
    selectedRoom: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Rooms
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Room by ID
      .addCase(getRoomById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoomById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRoom = action.payload;
      })
      .addCase(getRoomById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Room
      .addCase(createRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms.push(action.payload);
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Room
      .addCase(updateRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = state.rooms.map((room) =>
          room.roomId === action.payload.roomId ? action.payload : room
        );
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Room
      .addCase(deleteRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = state.rooms.filter((room) => room.roomId !== action.payload);
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default roomSlice.reducer;
