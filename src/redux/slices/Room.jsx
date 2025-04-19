import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

const API_URL = "/room";

// **1. Lấy danh sách tất cả các phòng**
export const fetchRooms = createAsyncThunk(
  "room/fetchRooms",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_URL);
      return response.data.data; // Chỉ lấy mảng data
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
      return response.data.data; // Chỉ lấy data
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
      const formData = new FormData();

      formData.append("RoomName", roomData.roomName || "");
      formData.append("RoomDescription", roomData.roomDescription || "");
      formData.append("Capacity", roomData.capacity || 0);
      formData.append("IsDeleted", roomData.isDeleted ? "true" : "false");

      if (roomData.images && Array.isArray(roomData.images)) {
        roomData.images.forEach((file) => {
          formData.append("Images", file);
        });
      }

      // Append AreaAddDTO as a JSON string
      formData.append("AreaAddDTO", roomData.areaAddDTO || "[]");

      const response = await axiosInstance.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data; // Chỉ lấy data
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// **4. Cập nhật phòng (Updated to match areaTypeSlice)**
export const updateRoom = createAsyncThunk(
  "room/updateRoom",
  async ({ roomId, patchDoc }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${API_URL}/${roomId}`, patchDoc, {
        headers: { "Content-Type": "application/json-patch+json" },
      });
      return response.data; // Trả về dữ liệu phòng đã cập nhật
    } catch (error) {
      console.error(error);
      return rejectWithValue(error.message);
    }
  }
);

// **5. Cập nhật ảnh của phòng**
export const updateRoomImages = createAsyncThunk(
  "room/updateRoomImages",
  async ({ roomId, files }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("Images", file);
        });
      }

      const response = await axiosInstance.post(
        `${API_URL}/newImage?id=${roomId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data; // Trả về dữ liệu phòng đã cập nhật
    } catch (error) {
      console.error("Error updating room images:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || "Lỗi khi cập nhật ảnh phòng");
    }
  }
);

// **6. Xóa ảnh của phòng**
export const deleteRoomImage = createAsyncThunk(
  "room/deleteRoomImage",
  async ({ roomId, imageUrl }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_URL}/Images?id=${roomId}`, {
        headers: {
          "Content-Type": "application/json-patch+json",
        },
        data: [imageUrl], // Gửi URL ảnh cần xóa dưới dạng mảng JSON
      });
      return { roomId, imageUrl }; // Trả về roomId và URL ảnh đã xóa để cập nhật state
    } catch (error) {
      console.error("Error deleting room image:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || "Lỗi khi xóa ảnh phòng");
    }
  }
);

// **7. Xóa phòng**
export const deleteRoom = createAsyncThunk(
  "room/delete",
  async (roomId, { rejectWithValue }) => {
    try {
      await axiosInstance.put(`${API_URL}/room?roomId=${roomId}`);
      return roomId;
    } catch (error) {
      return rejectWithValue(error);
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
        state.rooms = Array.isArray(action.payload) ? action.payload : [];
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
        if (action.payload) {
          state.rooms = [...state.rooms, action.payload];
        }
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

        // Cập nhật dữ liệu nếu đang ở trang chi tiết
        if (state.selectedRoom?.roomId === action.payload.roomId) {
          state.selectedRoom = action.payload;
        }

        // Cập nhật dữ liệu trong danh sách
        state.rooms = state.rooms.map((room) =>
          room.roomId === action.payload.roomId ? action.payload : room
        );
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Room Images
      .addCase(updateRoomImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoomImages.fulfilled, (state, action) => {
        state.loading = false;
        // Cập nhật danh sách rooms
        state.rooms = state.rooms.map((room) =>
          room.roomId === action.payload.roomId ? action.payload : room
        );
        // Cập nhật selectedRoom nếu đang ở trang chi tiết
        if (state.selectedRoom?.roomId === action.payload.roomId) {
          state.selectedRoom = action.payload;
        }
      })
      .addCase(updateRoomImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Room Image
      .addCase(deleteRoomImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRoomImage.fulfilled, (state, action) => {
        state.loading = false;
        const { roomId, imageUrl } = action.payload;

        // Cập nhật danh sách rooms
        state.rooms = state.rooms.map((room) => {
          if (room.roomId === roomId) {
            return {
              ...room,
              images: room.images.filter((img) => img !== imageUrl),
            };
          }
          return room;
        });

        // Cập nhật selectedRoom nếu đang ở trang chi tiết
        if (state.selectedRoom?.roomId === roomId) {
          state.selectedRoom.images = state.selectedRoom.images.filter(
            (img) => img !== imageUrl
          );
        }
      })
      .addCase(deleteRoomImage.rejected, (state, action) => {
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
        if (state.selectedRoom?.roomId === action.payload) {
          state.selectedRoom = null;
        }
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default roomSlice.reducer;