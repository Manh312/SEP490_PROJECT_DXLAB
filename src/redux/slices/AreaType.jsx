import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

const API_URL = "/areatype";

// Fetch danh sách dịch vụ với filter tùy chọn
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

// Fetch dịch vụ theo id
export const fetchAreaTypeById = createAsyncThunk(
  "areaTypes/fetchAreaTypeById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/areatype/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi khi lấy chi tiết dịch vụ");
    }
  }
);

// Thêm dịch vụ mới
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
      return rejectWithValue(error.message);
    }
  }
);

// Cập nhật dịch vụ theo API `PATCH`
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
      return rejectWithValue(error || "Lỗi khi cập nhật ảnh");
    }
  }
);

// Xóa dịch vụ
export const deleteAreaType = createAsyncThunk(
  "areaTypes/deleteAreaType",
  async (areaTypeId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_URL}/${areaTypeId}`);
      return areaTypeId;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi khi xóa dịch vụ");
    }
  }
);

// Xóa ảnh của dịch vụ
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
      return rejectWithValue(error.response?.data || "Lỗi khi xóa ảnh của dịch vụ");
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
      // Fetch danh sách dịch vụ
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

      // Fetch dịch vụ theo id
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

      // Xóa dịch vụ
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

      // Thêm dịch vụ
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

      // Cập nhật dịch vụ
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

      // Cập nhật ảnh dịch vụ
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

      // Xóa ảnh của dịch vụ
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