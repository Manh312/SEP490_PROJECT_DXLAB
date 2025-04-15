import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

const API_URL = "/areatype";

// Fetch danh sách loại khu vực với filter tùy chọn
export const fetchAreaTypes = createAsyncThunk(
  "areaTypes/fetchAreaTypes",
  async (fil = "", { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        fil ? `${API_URL}?fil=${fil}` : API_URL
      );
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
          formData.append("Images", file);
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

// Cập nhật loại khu vực theo API `PATCH`
export const updateAreaType = createAsyncThunk(
  "areaTypes/updateAreaType",
  async ({ areaTypeId, patchDoc }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `${API_URL}/${areaTypeId}`,
        patchDoc,
        {
          headers: {
            "Content-Type": "application/json-patch+json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// API để cập nhật ảnh riêng
export const updateAreaTypeImages = createAsyncThunk(
  "areaTypes/updateAreaTypeImages",
  async ({ areaTypeId, files }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("Images", file);
        });
      }

      const response = await axiosInstance.post(
        `${API_URL}/newImage?id=${areaTypeId}`,
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

// Xóa ảnh của loại khu vực
export const deleteAreaTypeImage = createAsyncThunk(
  "areaTypes/deleteAreaTypeImage",
  async ({ areaTypeId, imageUrl }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_URL}/Images?id=${areaTypeId}`, {
        headers: {
          "Content-Type": "application/json-patch+json",
        },
        data: [imageUrl],
      });
      return { areaTypeId, imageUrl };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi khi xóa ảnh của loại khu vực");
    }
  }
);

const areaTypeSlice = createSlice({
  name: "areaTypes",
  initialState: {
    areaTypes: [],
    selectedAreaType: null,
    selectedAreaIds: [], // New state to track selected area IDs
    loading: false,
    error: null,
  },
  reducers: {
    // Action to toggle a single area selection
    toggleAreaSelection: (state, action) => {
      const areaId = action.payload;
      state.selectedAreaIds = state.selectedAreaIds.includes(areaId)
        ? state.selectedAreaIds.filter((id) => id !== areaId)
        : [...state.selectedAreaIds, areaId];
    },
    // Action to select/deselect all areas
    setAllAreaSelections: (state, action) => {
      state.selectedAreaIds = action.payload;
    },
    // Action to clear selections
    clearAreaSelections: (state) => {
      state.selectedAreaIds = [];
    },
  },
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
      .addCase(deleteAreaType.fulfilled, (state, afterrorction) => {
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
        if (state.selectedAreaType?.areaTypeId === action.payload.data?.areaTypeId) {
          state.selectedAreaType = action.payload.data;
        }
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
        if (state.selectedAreaType?.areaTypeId === action.payload.data?.areaTypeId) {
          state.selectedAreaType = action.payload.data;
        }
        state.areaTypes = state.areaTypes.map((type) =>
          type.areaTypeId === action.payload.data?.areaTypeId ? action.payload.data : type
        );
      })
      .addCase(updateAreaTypeImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Xóa ảnh của loại khu vực
      .addCase(deleteAreaTypeImage.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAreaTypeImage.fulfilled, (state, action) => {
        state.loading = false;
        const { areaTypeId, imageUrl } = action.payload;
        state.areaTypes = state.areaTypes.map((type) => {
          if (type.areaTypeId === areaTypeId) {
            return {
              ...type,
              images: type.images.filter((img) => img !== imageUrl),
            };
          }
          return type;
        });
        if (state.selectedAreaType?.areaTypeId === areaTypeId) {
          state.selectedAreaType.images = state.selectedAreaType.images.filter(
            (img) => img !== imageUrl
          );
        }
      })
      .addCase(deleteAreaTypeImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { toggleAreaSelection, setAllAreaSelections, clearAreaSelections } = areaTypeSlice.actions;
export default areaTypeSlice.reducer;