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
      return rejectWithValue(error);
    }
  }
);

// Update blog (for staff)
export const updateBlog = createAsyncThunk(
  "blogs/update",
  async ({ id, blogData, files }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      formData.append("BlogTitle", blogData.blogTitle);
      formData.append("BlogContent", blogData.blogContent);
      formData.append("BlogCreatedDate", blogData.blogCreatedDate);
      formData.append("Status", blogData.status || 1);

      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("ImageFiles", file);
        });
      }

      const response = await axios.put(`/blog/edit-cancelled/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Không thể cập nhật blog");
    }
  }
);

// Admin-Specific Actions
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
    blogs: [],
    selectedBlog: null,
    loading: false,
    error: null,
    statusFilter: "All",
    pendingBlogs: [],
    approvedBlogs: [],
    adminSelectedBlog: null,
    adminLoading: false,
    adminError: null,
    adminStatusFilter: "All",
  },
  reducers: {
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setAdminStatusFilter: (state, action) => {
      state.adminStatusFilter = action.payload;
    },
    resetError: (state) => {
      state.error = null;
    },
    resetAdminError: (state) => {
      state.adminError = null;
    },
    resetSelectedBlog: (state) => {
      state.selectedBlog = null;
    },
    resetAdminSelectedBlog: (state) => {
      state.adminSelectedBlog = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
        state.blogs = [];
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
      .addCase(fetchAdminPendingBlogs.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchAdminPendingBlogs.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.pendingBlogs = action.payload || []; // Đảm bảo luôn là mảng
      })
      .addCase(fetchAdminPendingBlogs.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
        state.pendingBlogs = [];
      })
      .addCase(fetchAdminApprovedBlogs.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchAdminApprovedBlogs.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.approvedBlogs = action.payload || []; // Đảm bảo luôn là mảng
      })
      .addCase(fetchAdminApprovedBlogs.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
        state.approvedBlogs = [];
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
        state.adminLoading = false;
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
        state.adminLoading = false;
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
        state.adminLoading = false;
        const blogId = action.meta.arg;
        state.pendingBlogs = state.pendingBlogs.filter((b) => b.blogId !== blogId);
        state.approvedBlogs = state.approvedBlogs.filter((b) => b.blogId !== blogId);
        state.blogs = state.blogs.filter((b) => b.blogId !== blogId);
      })
      .addCase(deleteAdminBlog.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      });
  },
});

export const {
  setStatusFilter,
  setAdminStatusFilter,
  resetError,
  resetAdminError,
  resetSelectedBlog,
  resetAdminSelectedBlog,
} = blogSlice.actions;

export default blogSlice.reducer;