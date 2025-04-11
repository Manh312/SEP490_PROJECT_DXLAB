import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

const API_URL = "/areatype";

// Fetch danh sách loại khu vực với filter tùy chọn
export const fetchAreaTypes = createAsyncThunk(
  "areaTypes/fetchAreaTypes",
  async (fil = "", { rejectWithValue }) => {
    try {
      console.log(fil);
      const response = await axiosInstance.get(
        fil ? `${API_URL}?fil=${fil}` : API_URL
      );
      console.log(response.data);
      return response.data.data;
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
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi khi lấy chi tiết loại khu vực");
    }
  }
);

// Thêm loại khu vực mới
export const createAreaType = createAsyncThunk(
  "areaTypes/createAreaType",
  async ({ newAreaType, files }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      formData.append("AreaTypeName", newAreaType.AreaTypeName);
      formData.append("AreaCategory", newAreaType.AreaCategory);
      formData.append("AreaDescription", newAreaType.AreaDescription);
      formData.append("Size", newAreaType.Size);
      formData.append("Price", newAreaType.Price);
      formData.append("IsDeleted", newAreaType.IsDeleted);

      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("files", file);
        });
      }
      const response = await axiosInstance.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.log(error.response.data);
      return rejectWithValue(error.response?.data || "Lỗi khi tạo loại khu vực");
    }
  }
);

// Cập nhật loại khu vực theo API `PATCH` (đã bỏ phần upload ảnh)
export const updateAreaType = createAsyncThunk(
  "areaTypes/updateAreaType",
  async ({ areaTypeId, updatedData }, { rejectWithValue }) => {
    try {
      // Tạo object areaTypeData từ updatedData
      const areaTypeData = {
        areaTypeName: updatedData.areaTypeName,
        areaDescription: updatedData.areaDescription,
        price: updatedData.price,
        areaCategory: updatedData.areaCategory,
        size: updatedData.size,
        isDeleted: updatedData.isDeleted,
      };

      const response = await axiosInstance.patch(`${API_URL}/${areaTypeId}`, areaTypeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi khi cập nhật loại khu vực");
    }
  }
);

// API mới để cập nhật ảnh riêng
export const updateAreaTypeImages = createAsyncThunk(
  "areaTypes/updateAreaTypeImages",
  async ({ id, files }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("Images", file);
        });
      }

      // Include areaTypeId as a query parameter in the URL
      const response = await axiosInstance.post(
        `${API_URL}/newImage?id=${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi khi cập nhật ảnh");
    }
  }
);

// Xóa loại khu vực
export const deleteAreaType = createAsyncThunk(
  "areaTypes/deleteAreaType",
  async (areaTypeId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_URL}/${areaTypeId}`);
      return areaTypeId;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi khi xóa loại khu vực");
    }
  }
);

const areaTypeSlice = createSlice({
  name: "areaTypes",
  initialState: {
    areaTypes: [],
    selectedAreaType: null,
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
          state.areaTypes = [...state.areaTypes, action.payload.data];
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
        if (state.selectedAreaType?.areaTypeId === action.payload.data?.areaTypeId) {
          state.selectedAreaType = action.payload.data;
        }

        // Cập nhật dữ liệu trong danh sách
        state.areaTypes = state.areaTypes.map((type) =>
          type.areaTypeId === action.payload.data?.areaTypeId ? action.payload.data : type
        );
      })
      .addCase(updateAreaType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cập nhật ảnh loại khu vực
      .addCase(updateAreaTypeImages.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAreaTypeImages.fulfilled, (state, action) => {
        state.loading = false;

        // Cập nhật dữ liệu nếu đang ở trang chi tiết
        if (state.selectedAreaType?.areaTypeId === action.payload.data?.areaTypeId) {
          state.selectedAreaType = action.payload.data;
        }

        // Cập nhật dữ liệu trong danh sách
        state.areaTypes = state.areaTypes.map((type) =>
          type.areaTypeId === action.payload.data?.areaTypeId ? action.payload.data : type
        );
      })
      .addCase(updateAreaTypeImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default areaTypeSlice.reducer;