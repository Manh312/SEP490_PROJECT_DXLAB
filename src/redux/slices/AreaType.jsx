import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

const API_URL = "/areatype";

// Fetch danh sách loại khu vực với filter tùy chọn
export const fetchAreaTypes = createAsyncThunk(
  "areaTypes/fetchAreaTypes",
  async (fil = "", {rejectWithValue}) => {
    try {
      console.log(fil);
      // Nếu filterString rỗng thì gọi API lấy tất cả, ngược lại thêm query param
      const response = await axiosInstance.get(
        fil ? `${API_URL}?fil=${fil}` : API_URL
      );
      console.log(response.data);
      return response.data.data; // Lấy danh sách từ API response
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi khi lấy dữ liệu");
    }
  }
);

// Fetch loại khu vực theo id
export const fetchAreaTypeById = createAsyncThunk(
    "areaTypes/fetchAreaTypeById",
    async (id, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.get(`/areatype/${id}`);
        return response.data.data; // ✅ Trả về dữ liệu chi tiết
      } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi lấy chi tiết loại khu vực");
      }
    }
  );

// Thêm loại khu vực mới
export const createAreaType = createAsyncThunk(
  "areaTypes/createAreaType",
  async (newAreaType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_URL, newAreaType);
      return response.data; // Trả về loại khu vực vừa tạo
    } catch (error) {
        console.log(error.response.data);
      return rejectWithValue(error.response?.data || "Lỗi khi tạo loại khu vực");
    }
  }
);

// Cập nhật loại khu vực theo API `PATCH`
export const updateAreaType = createAsyncThunk(
    "areaTypes/updateAreaType",
    async ({ areaTypeId, updatedData }, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.patch(`${API_URL}/${areaTypeId}`, updatedData, {
            headers: { "Content-Type": "application/json-patch+json" }
          });
        return response.data; // ✅ Chỉ return phần `data`, tránh lỗi React
      } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi cập nhật loại khu vực");
      }
    }
);

// Xóa loại khu vực
export const deleteAreaType = createAsyncThunk(
    "areaTypes/deleteAreaType",
    async (areaTypeId, { rejectWithValue }) => {
      try {
        await axiosInstance.delete(`${API_URL}/${areaTypeId}`);
        return areaTypeId; // Trả về ID của loại khu vực đã xóa
      } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi xóa loại khu vực");
      }
    }
);

const areaTypeSlice = createSlice({
  name: "areaTypes",
  initialState: {
    areaTypes: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch danh sách loại khu vực
      .addCase(fetchAreaTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAreaTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.areaTypes = action.payload;
      })
      .addCase(fetchAreaTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

        // Fetch loại khu vực theo id
      .addCase(fetchAreaTypeById.pending, (state) => {
        state.loading = true;
        state.selectedAreaType = null;
        state.error = null;
      })
      .addCase(fetchAreaTypeById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAreaType = action.payload;
      })
      .addCase(fetchAreaTypeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Xóa loại khu vực
      .addCase(deleteAreaType.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAreaType.fulfilled, (state, action) => {
        state.loading = false;
        state.areaTypes = state.areaTypes.filter((type) => type.areaTypeId !== action.payload);
      })
      .addCase(deleteAreaType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Thêm loại khu vực
      .addCase(createAreaType.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAreaType.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
            state.areaTypes = [...state.areaTypes, action.payload.data]; // Thêm phòng mới vào danh sách
          }
      })
      .addCase(createAreaType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cập nhật loại khu vực
      .addCase(updateAreaType.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAreaType.fulfilled, (state, action) => {
        state.loading = false;
    
        // Cập nhật dữ liệu nếu đang ở trang chi tiết
        if (state.selectedAreaType?.areaTypeId === action.payload.areaTypeId) {
          state.selectedAreaType = action.payload.data; // ✅ Chỉ chứa `data`
        }
    
        // Cập nhật dữ liệu trong danh sách
        state.areaTypes = state.areaTypes.map((type) =>
          type.areaTypeId === action.payload.areaTypeId ? action.payload : type
        );
    })
      .addCase(updateAreaType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default areaTypeSlice.reducer;
