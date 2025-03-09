import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Endpoint API
const API_URL = "/api/room";

// **1. Lấy danh sách tất cả các phòng**
export const fetchRooms = createAsyncThunk(
  "room/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Không thể lấy danh sách phòng");
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// **2. Lấy thông tin phòng theo ID**
export const getRoomById = createAsyncThunk(
  "room/getById",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/${roomId}`);
      if (!response.ok) throw new Error("Không tìm thấy phòng");
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//tạo phòng
export const createRoom = createAsyncThunk(
    "room/create",
    async (roomData, { rejectWithValue }) => {
        console.log(roomData);
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(roomData),
        });
        if (!response.ok) throw new Error("Không thể tạo phòng");
        return await response.json();
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );

// **3. Cập nhật phòng**
export const updateRoom = createAsyncThunk(
  "room/update",
  async ({ roomId, roomData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/${roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomData),
      });
      if (!response.ok) throw new Error("Cập nhật phòng thất bại");
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// **4. Xóa phòng**
export const deleteRoom = createAsyncThunk(
  "room/delete",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/${roomId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Xóa phòng thất bại");
      return roomId; // Trả về roomId để cập nhật danh sách trong store
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const roomSlice = createSlice({
  name: "rooms",
  initialState: {
    rooms: [],
    loading: false,
    error: null,
    selectedRoom: null, // Lưu thông tin phòng khi getById
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
