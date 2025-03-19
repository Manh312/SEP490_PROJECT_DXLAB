import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios";

// Fetch blogs by status (for staff)
export const fetchBlogsByStatus = createAsyncThunk(
  "blogs/fetchByStatus",
  async (status, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/blog/list/${status}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể lấy danh sách blog");
    }
  }
);

// Fetch blog by ID (for staff)
export const fetchBlogById = createAsyncThunk(
  "blogs/fetchById",
  async (blogId, { rejectWithValue }) => {
    try {      
      const response = await axios.get(`/blog/${blogId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể lấy dữ liệu blog");
    }
  }
);

export const createBlog = createAsyncThunk(
  "blogs/create",
  async ({ blogData, files }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      formData.append("BlogTitle", blogData.blogTitle);
      formData.append("BlogContent", blogData.blogContent);
      formData.append("BlogCreatedDate", blogData.blogCreatedDate || new Date().toISOString());
      formData.append("Status", blogData.status || 1);

      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("ImageFiles", file);
        });
      }

      const response = await axios.post("/blog", formData); 

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể tạo blog");
    }
  }
);

// Update blog (for staff)
export const updateBlog = createAsyncThunk(
  "blogs/update",
  async ({ id, blogData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/blog/edit-cancelled/${id}`, blogData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể cập nhật blog");
    }
  }
);

// Giữ nguyên các phần khác của file...

// Admin-Specific Actions
// Fetch pending approval blogs (for admin)
export const fetchAdminPendingBlogs = createAsyncThunk(
  "adminBlogs/fetchPending",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/approvalblog/pending");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể lấy danh sách blog chờ duyệt");
    }
  }
);

// Fetch approved blogs (for admin)
export const fetchAdminApprovedBlogs = createAsyncThunk(
  "adminBlogs/fetchApproved",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/approvalblog/approved");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể lấy danh sách blog đã duyệt");
    }
  }
);

// Fetch blog detail by ID (for admin)
export const fetchAdminBlogById = createAsyncThunk(
  "adminBlogs/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/approvalblog/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể lấy dữ liệu blog");
    }
  }
);

// Approve a blog (for admin)
export const approveAdminBlog = createAsyncThunk(
  "adminBlogs/approve",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/approvalblog/approve/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể phê duyệt blog");
    }
  }
);

// Cancel a blog (for admin)
export const cancelAdminBlog = createAsyncThunk(
  "adminBlogs/cancel",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/approvalblog/cancel/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể hủy blog");
    }
  }
);

//Delete a blog (for admin)
export const deleteAdminBlog = createAsyncThunk(
  "adminBlogs/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/approvalblog/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể xóa blog");
    }
  }
);

const blogSlice = createSlice({
  name: "blogs",
  initialState: {
    // State for staff
    blogs: [],
    selectedBlog: null,
    loading: false,
    error: null,
    statusFilter: "All",

    // State for admin (separate state to avoid conflict)
    pendingBlogs: [], 
    approvedBlogs: [],
    adminSelectedBlog: null,
    adminLoading: false,
    adminError: null,
    adminStatusFilter: "All", // Có thể dùng để lọc giữa pending/approved nếu cần
  },
  reducers: {
    // Set status filter for staff blogs
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    // Set status filter for admin blogs
    setAdminStatusFilter: (state, action) => {
      state.adminStatusFilter = action.payload;
    },
    // Reset error state for staff
    resetError: (state) => {
      state.error = null;
    },
    // Reset error state for admin
    resetAdminError: (state) => {
      state.adminError = null;
    },
    // Reset selected blog for staff
    resetSelectedBlog: (state) => {
      state.selectedBlog = null;
    },
    // Reset selected blog for admin
    resetAdminSelectedBlog: (state) => {
      state.adminSelectedBlog = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Staff Actions
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
      })

      // Admin Actions
      .addCase(fetchAdminPendingBlogs.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchAdminPendingBlogs.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.pendingBlogs = action.payload;
      })
      .addCase(fetchAdminPendingBlogs.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      })
      .addCase(fetchAdminApprovedBlogs.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchAdminApprovedBlogs.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.approvedBlogs = action.payload;
      })
      .addCase(fetchAdminApprovedBlogs.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      })
      .addCase(fetchAdminBlogById.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchAdminBlogById.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminSelectedBlog = action.payload;
      })
      .addCase(fetchAdminBlogById.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      })
      .addCase(approveAdminBlog.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(approveAdminBlog.fulfilled, (state, action) => {
        const blogId = action.meta.arg;
        state.pendingBlogs = state.pendingBlogs.filter((b) => b.blogId !== blogId);
        state.approvedBlogs = [...state.approvedBlogs, action.payload];
      })
      .addCase(approveAdminBlog.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      })
      .addCase(cancelAdminBlog.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(cancelAdminBlog.fulfilled, (state, action) => {
        const blogId = action.meta.arg;
        state.pendingBlogs = state.pendingBlogs.filter((b) => b.blogId !== blogId);
        state.approvedBlogs = state.approvedBlogs.filter((b) => b.blogId !== blogId);
      })
      .addCase(cancelAdminBlog.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      })
      .addCase(deleteAdminBlog.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(deleteAdminBlog.fulfilled, (state, action) => {
        const blogId = action.meta.arg;
        state.pendingBlogs = state.pendingBlogs.filter((b) => b.blogId !== blogId);
        state.approvedBlogs = state.approvedBlogs.filter((b) => b.blogId !== blogId);
      })
      .addCase(deleteAdminBlog.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      })
  },
});

// Export actions
export const {
  setStatusFilter,
  setAdminStatusFilter,
  resetError,
  resetAdminError,
  resetSelectedBlog,
  resetAdminSelectedBlog,
} = blogSlice.actions;

// Export reducer
export default blogSlice.reducer;