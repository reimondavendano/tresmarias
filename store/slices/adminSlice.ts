// lib/redux/slices/adminSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AdminUser } from '@/types'; // Import AdminUser from shared types

export interface AdminState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

// Async thunk for admin login
export const loginAdmin = createAsyncThunk(
  'admin/login',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      // This fetch call will go to your Next.js API Route for authentication
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed');
      }

      // Store token in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_token', data.token);
      }

      return data; // This should contain { admin: AdminUser, token: string }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

// Async thunk for admin logout
export const logoutAdmin = createAsyncThunk(
  'admin/logout',
  async (_, { rejectWithValue }) => {
    try {
      // This fetch call will go to your Next.js API Route for logout
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        return rejectWithValue('Logout failed');
      }

      // Remove token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
      }

      return {};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

// Async thunk for token verification
export const verifyAdmin = createAsyncThunk(
  'admin/verify',
  async (_, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      
      if (!token) {
        return rejectWithValue('No token found');
      }

      // This fetch call will go to your Next.js API Route for token verification
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Remove invalid token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_token');
        }
        return rejectWithValue(data.message || 'Token verification failed');
      }

      return { ...data, token }; // This should contain { admin: AdminUser, token: string }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAdmin: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token'); // Ensure token is removed on full reset
      }
    },
    setAdminAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action: PayloadAction<{ admin: AdminUser; token: string }>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.admin;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      });

    // Logout cases
    builder
      .addCase(logoutAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(logoutAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Verify cases
    builder
      .addCase(verifyAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyAdmin.fulfilled, (state, action: PayloadAction<{ admin: AdminUser; token: string }>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.admin;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(verifyAdmin.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetAdmin, setAdminAuthenticated } = adminSlice.actions;
export default adminSlice.reducer;