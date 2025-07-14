// lib/redux/slices/stylistsSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Stylist } from '@/types'; // Assuming Stylist type is defined in '../../types'

interface StylistsState {
  stylists: Stylist[];
  isLoadingStylists: boolean;
  errorStylists: string | null;
  isAddingStylist: boolean;
  addStylistError: string | null;
  isUpdatingStylist: boolean;
  updateStylistError: string | null;
  isDeletingStylist: boolean;
  deleteStylistError: string | null;
  // New states for single stylist fetch
  isFetchingStylist: boolean; // Renamed from isLoadingStylists for clarity in single fetch
  fetchStylistError: string | null; // Renamed from errorStylists for clarity in single fetch
}

const initialState: StylistsState = {
  stylists: [],
  isLoadingStylists: false,
  errorStylists: null,
  isAddingStylist: false,
  addStylistError: null,
  isUpdatingStylist: false,
  updateStylistError: null,
  isDeletingStylist: false,
  deleteStylistError: null,
  // Initialize new states
  isFetchingStylist: false,
  fetchStylistError: null,
};

// Async Thunk for fetching all stylists
export const fetchStylists = createAsyncThunk(
  'stylists/fetchAllStylists', // Renamed to clarify it fetches all
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/stylists');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch stylists from API');
      }
      return (await response.json()) as Stylist[];
    } catch (error: any) {
      console.error('Redux Thunk Error (fetchStylists):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while fetching stylists.');
    }
  }
);

// NEW Async Thunk for fetching a single stylist by ID
export const fetchStylist = createAsyncThunk(
  'stylists/fetchStylistById',
  async (identifier: { id?: string; email?: string }, { rejectWithValue }) => {
    try {
      let url = '/api/stylists';
      if (identifier.id) {
        url = `/api/stylists/${identifier.id}`; // Assuming an API route for fetching by ID
      } else if (identifier.email) {
        url = `/api/stylists?email=${encodeURIComponent(identifier.email)}`; // Assuming API route for fetching by email
      } else {
        throw new Error('Either stylist ID or email must be provided.');
      }

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch stylist with ID/email ${identifier.id || identifier.email}`);
      }
      const data: Stylist | Stylist[] = await response.json();
      // If fetching by email, the API might return an array, so take the first one
      if (Array.isArray(data)) {
        return data.length > 0 ? data[0] : null; // Return null if no stylist found
      }
      return data; // Return single stylist if fetching by ID
    } catch (error: any) {
      console.error('Redux Thunk Error (fetchStylistById):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while fetching stylist by ID/email.');
    }
  }
);

// Async Thunk for adding a stylist
export const addStylist = createAsyncThunk(
  'stylists/addStylist',
  async (newStylistData: Omit<Stylist, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/stylists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStylistData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add stylist via API');
      }
      return (await response.json()) as Stylist;
    } catch (error: any) {
      console.error('Redux Thunk Error (addStylist):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while adding stylist.');
    }
  }
);

// Async Thunk for updating a stylist
export const updateStylist = createAsyncThunk(
  'stylists/updateStylist',
  async ({ id, updates }: { id: string; updates: Partial<Stylist> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/stylists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update stylist via API');
      }
      return (await response.json()) as Stylist;
    } catch (error: any) {
      console.error('Redux Thunk Error (updateStylist):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while updating stylist.');
    }
  }
);

// Async Thunk for deleting a stylist
export const deleteStylist = createAsyncThunk(
  'stylists/deleteStylist',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/stylists/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete stylist via API');
      }
      return id;
    } catch (error: any) {
      console.error('Redux Thunk Error (deleteStylist):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while deleting stylist.');
    }
  }
);

const stylistsSlice = createSlice({
  name: 'stylists',
  initialState,
  reducers: {}, // No local reducers defined in this slice
  extraReducers: (builder) => {
    builder
      // --- fetchStylists (all) ---
      .addCase(fetchStylists.pending, (state) => {
        state.isLoadingStylists = true;
        state.errorStylists = null;
      })
      .addCase(fetchStylists.fulfilled, (state, action: PayloadAction<Stylist[]>) => {
        state.isLoadingStylists = false;
        state.stylists = action.payload;
        state.errorStylists = null;
      })
      .addCase(fetchStylists.rejected, (state, action) => {
        state.isLoadingStylists = false;
        state.errorStylists = action.payload as string;
        state.stylists = [];
      })
      // --- fetchStylist (single) ---
      .addCase(fetchStylist.pending, (state) => {
        state.isFetchingStylist = true;
        state.fetchStylistError = null;
      })
      .addCase(fetchStylist.fulfilled, (state, action: PayloadAction<Stylist | null>) => {
        state.isFetchingStylist = false;
        // Optionally update the stylists array with the fetched single stylist if it's not already there
        // This is useful if you want to keep the 'stylists' array comprehensive
        if (action.payload) {
          const index = state.stylists.findIndex(s => s.id === action.payload?.id);
          if (index !== -1) {
            state.stylists[index] = action.payload;
          } else {
            // state.stylists.push(action.payload); // Uncomment if you want to add it
          }
        }
        state.fetchStylistError = null;
      })
      .addCase(fetchStylist.rejected, (state, action) => {
        state.isFetchingStylist = false;
        state.fetchStylistError = action.payload as string;
      })
      // --- addStylist ---
      .addCase(addStylist.pending, (state) => {
        state.isAddingStylist = true;
        state.addStylistError = null;
      })
      .addCase(addStylist.fulfilled, (state, action: PayloadAction<Stylist>) => {
        state.isAddingStylist = false;
        state.stylists.push(action.payload);
        state.addStylistError = null;
      })
      .addCase(addStylist.rejected, (state, action) => {
        state.isAddingStylist = false;
        state.addStylistError = action.payload as string;
      })
      .addCase(updateStylist.pending, (state) => {
        state.isUpdatingStylist = true;
        state.updateStylistError = null;
      })
      .addCase(updateStylist.fulfilled, (state, action: PayloadAction<Stylist>) => {
        state.isUpdatingStylist = false;
        const index = state.stylists.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.stylists[index] = action.payload;
        }
        state.updateStylistError = null;
      })
      .addCase(updateStylist.rejected, (state, action) => {
        state.isUpdatingStylist = false;
        state.updateStylistError = action.payload as string;
      })
      .addCase(deleteStylist.pending, (state) => {
        state.isDeletingStylist = true;
        state.deleteStylistError = null;
      })
      .addCase(deleteStylist.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeletingStylist = false;
        state.stylists = state.stylists.filter((stylist) => stylist.id !== action.payload);
        state.deleteStylistError = null;
      })
      .addCase(deleteStylist.rejected, (state, action) => {
        state.isDeletingStylist = false;
        state.deleteStylistError = action.payload as string;
      });
  },
});

export default stylistsSlice.reducer;
