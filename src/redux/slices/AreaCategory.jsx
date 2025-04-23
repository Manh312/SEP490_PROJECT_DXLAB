import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

const API_URL = "/areatypecategory";

// Fetch all area type categories
export const fetchAllAreaTypeCategories = createAsyncThunk(
  "areaTypeCategories/fetchAllAreaTypeCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/allAreaTypeCategory`);
      return response.data.data; // Assuming the API returns data in a similar structure
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi khi lấy danh sách danh mục dịch vụ");
    }
  }
);

// Create a new area type category
export const createAreaTypeCategory = createAsyncThunk(
  "areaTypeCategories/createAreaTypeCategory",
  async ({ newAreaTypeCategory, files }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      formData.append("Title", newAreaTypeCategory.title);
      formData.append("CategoryDescription", newAreaTypeCategory.categoryDescription);
      formData.append("Status", newAreaTypeCategory.status || 1);

      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("Images", file);
        });
      }
      const response = await axiosInstance.post(`${API_URL}/newareatypecategory`, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error || "Lỗi khi tạo danh mục dịch vụ");
    }
  }
);

// Update an area type category using PATCH
export const updateAreaTypeCategory = createAsyncThunk(
  "areaTypeCategories/updateAreaTypeCategory",
  async ({ categoryId, patchDoc }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `${API_URL}?id=${categoryId}`,
        patchDoc,
        {
          headers: {
            "Content-Type": "application/json-patch+json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi khi cập nhật danh mục dịch vụ");
    }
  }
);

// Update images for an area type category
export const updateAreaTypeCategoryImages = createAsyncThunk(
  "areaTypeCategories/updateAreaTypeCategoryImages",
  async ({ categoryId, files }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("Images", file);
        });
      }

      const response = await axiosInstance.post(
        `${API_URL}/newImage?id=${categoryId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.message || "Lỗi khi cập nhật ảnh");
    }
  }
);

// Delete an image from an area type category
export const deleteAreaTypeCategoryImage = createAsyncThunk(
  "areaTypeCategories/deleteAreaTypeCategoryImage",
  async ({ categoryId, imageUrl }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_URL}/Images?id=${categoryId}`, {
        headers: {
          "Content-Type": "application/json-patch+json",
        },
        data: [imageUrl], // Send the image URL as a JSON array
      });
      return { categoryId, imageUrl }; // Return the areaTypeCategoryId and deleted image URL
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi khi xóa ảnh của dịch vụ");
    }
  }
);

const areaCategorySlice = createSlice({
  name: "areaCategory",
  initialState: {
    areaTypeCategories: [],
    selectedAreaTypeCategory: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all area type categories
      .addCase(fetchAllAreaTypeCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAreaTypeCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.areaTypeCategories = action.payload;
      })
      .addCase(fetchAllAreaTypeCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create a new area type category
      .addCase(createAreaTypeCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAreaTypeCategory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          state.areaTypeCategories = [...state.areaTypeCategories, action.payload.data];
        }
      })
      .addCase(createAreaTypeCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update an area type category
      .addCase(updateAreaTypeCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAreaTypeCategory.fulfilled, (state, action) => {
        state.loading = false;
        // Update the list
        state.areaTypeCategories = state.areaTypeCategories.map((category) =>
          category.categoryId === action.payload.data?.categoryId
            ? action.payload.data
            : category
        );
        // Update selected category if applicable
        if (
          state.selectedAreaTypeCategory?.categoryId ===
          action.payload.data?.categoryId
        ) {
          state.selectedAreaTypeCategory = action.payload.data;
        }
      })
      .addCase(updateAreaTypeCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update images for an area type category
      .addCase(updateAreaTypeCategoryImages.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAreaTypeCategoryImages.fulfilled, (state, action) => {
        state.loading = false;
        // Update the list
        state.areaTypeCategories = state.areaTypeCategories.map((category) =>
          category.areaTypeCategoryId === action.payload.data?.areaTypeCategoryId
            ? action.payload.data
            : category
        );
        // Update selected category if applicable
        if (
          state.selectedAreaTypeCategory?.areaTypeCategoryId ===
          action.payload.data?.areaTypeCategoryId
        ) {
          state.selectedAreaTypeCategory = action.payload.data;
        }
      })
      .addCase(updateAreaTypeCategoryImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete an image from an area type category
      .addCase(deleteAreaTypeCategoryImage.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAreaTypeCategoryImage.fulfilled, (state, action) => {
        state.loading = false;
        const { areaTypeCategoryId, imageUrl } = action.payload;

        // Update the list
        state.areaTypeCategories = state.areaTypeCategories.map((category) => {
          if (category.areaTypeCategoryId === areaTypeCategoryId) {
            return {
              ...category,
              images: category.images.filter((img) => img !== imageUrl),
            };
          }
          return category;
        });
      })
      .addCase(deleteAreaTypeCategoryImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default areaCategorySlice.reducer;