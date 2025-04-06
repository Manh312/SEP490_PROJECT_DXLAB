import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios";

const API_URL = "/areatypecategory";

// Fetch all area type categories
export const fetchAllAreaTypeCategories = createAsyncThunk(
  "areaTypeCategories/fetchAllAreaTypeCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/allAreaTypeCategory`);
      return response.data.data; // Assuming the API returns data in a similar structure
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi khi lấy danh sách danh mục loại khu vực");
    }
  }
);

// Create a new area type category
export const createAreaTypeCategory = createAsyncThunk(
  "areaTypeCategories/createAreaTypeCategory",
  async ({newAreaTypeCategory, files}, { rejectWithValue }) => {
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
      const response = await axios.post(`${API_URL}/newareatypecategory`, formData );
      console.log("Response:", response);

      return response.data;
    } catch (error) {
      console.log(error);
      
      return rejectWithValue(error);
    }
  }
);

// Update an area type category using PATCH
export const updateAreaTypeCategory = createAsyncThunk(
  "areaTypeCategories/updateAreaTypeCategory",
  async ({ categoryId, areaData, files }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      formData.append("Title", areaData.title);
      formData.append("CategoryDescription", areaData.categoryDescription);
      formData.append("Status", areaData.status);

      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("Images", file); // Use "Images" to match the API's expected field name
        });
      }

      const response = await axios.patch(`${API_URL}?id=${categoryId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data; // Return the updated data
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi khi cập nhật danh mục loại khu vực");
    }
  }
);

const areaCategorySlice = createSlice({
  name: "areaCategory",
  initialState: {
    areaTypeCategories: [],
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
        if (action.payload) {
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
        state.areaTypeCategories = state.areaTypeCategories.map((category) =>
          category.areaTypeCategoryId === action.payload.areaTypeCategoryId
            ? action.payload
            : category
        );
      })
      .addCase(updateAreaTypeCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default areaCategorySlice.reducer;