import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios";

// Fetch blogs by status
export const fetchBlogsByStatus = createAsyncThunk(
  "blogs/fetchByStatus",
  async (status, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/blog/list/${status}`);
      console.log("fetchBlogsByStatus response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể lấy danh sách blog");
    }
  }
);

// Fetch blog by ID
export const fetchBlogById = createAsyncThunk(
  "blogs/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/blog/${id}`);
      console.log("fetchBlogById response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể lấy dữ liệu blog");
    }
  }
);

// Create a new blog
export const createBlog = createAsyncThunk(
  "blogs/create",
  async (blogData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/blog", blogData);
      console.log("createBlog response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể tạo blog");
    }
  }
);

// Update blog status to "cancelled"
export const updateBlog = createAsyncThunk(
  "blogs/update",
  async ({ id, blogData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/blog/${id}`, blogData);
      console.log("updateBlog response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể cập nhật blog");
    }
  }
);

const blogSlice = createSlice({
  name: "blogs",
  initialState: {
    blogs: [],
    selectedBlog: null,
    loading: false,
    error: null,
    statusFilter: "All",
  },
  reducers: {
    // Set status filter for blogs
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    // Reset error state
    resetError: (state) => {
      state.error = null;
    },
    // Reset selected blog
    resetSelectedBlog: (state) => {
      state.selectedBlog = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch blogs by status
      .addCase(fetchBlogsByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogsByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload;
      })
      .addCase(fetchBlogsByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch blog by ID
      .addCase(fetchBlogById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBlog = action.payload;
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create a new blog
      .addCase(createBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs.push(action.payload);
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update blog
      .addCase(updateBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = state.blogs.map((blog) =>
          blog.id === action.payload.id ? action.payload : blog
        );
        if (state.selectedBlog?.id === action.payload.id) {
          state.selectedBlog = action.payload;
        }
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { setStatusFilter, resetError, resetSelectedBlog } = blogSlice.actions;

// Export reducer
export default blogSlice.reducer;