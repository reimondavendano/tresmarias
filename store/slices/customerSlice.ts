// lib/redux/slices/customerSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Customer } from '@/types'; // Corrected import path for Customer type

interface CustomerState {
  currentCustomer: Partial<Customer>;
  isLoadingCustomer: boolean;
  errorCustomer: string | null;
  isCreatingCustomer: boolean;
  createCustomerError: string | null;
  isFetchingCustomer: boolean;
  fetchCustomerError: string | null;
}

const initialState: CustomerState = {
  currentCustomer: {},
  isLoadingCustomer: false,
  errorCustomer: null,
  isCreatingCustomer: false,
  createCustomerError: null,
  isFetchingCustomer: false,
  fetchCustomerError: null,
};

// Async Thunk for creating or fetching a customer
export const createOrFetchCustomer = createAsyncThunk(
  'customer/createOrFetchCustomer',
  async (customerData: { name: string; email: string; phone: string }, { rejectWithValue }) => {
    try {
      const fetchResponse = await fetch(`/api/customers?email=${encodeURIComponent(customerData.email)}`);
      if (fetchResponse.ok) {
        const existingCustomers: Customer[] = await fetchResponse.json();
        if (existingCustomers.length > 0) {
          return existingCustomers[0];
        }
      }

      const createResponse = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.message || 'Failed to create customer');
      }

      const newCustomer: Customer = await createResponse.json();
      return newCustomer;

    } catch (error: any) {
      console.error('Redux Thunk Error (createOrFetchCustomer):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while processing customer details.');
    }
  }
);

// Async Thunk for fetching a customer by ID or email
export const fetchCustomer = createAsyncThunk(
  'customer/fetchCustomer',
  async (identifier: { id?: string; email?: string }, { rejectWithValue }) => {
    try {
      let url = '/api/customers';
      if (identifier.id) {
        url = `/api/customers/${identifier.id}`;
      } else if (identifier.email) {
        url = `/api/customers?email=${encodeURIComponent(identifier.email)}`;
      } else {
        throw new Error('Either customer ID or email must be provided.');
      }

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch customer');
      }

      const data: Customer | Customer[] = await response.json();
      if (Array.isArray(data)) {
        return data.length > 0 ? data[0] : null;
      }
      return data;
    } catch (error: any) {
      console.error('Redux Thunk Error (fetchCustomer):', error);
      return rejectWithValue(error.message || 'An unknown error occurred while fetching customer.');
    }
  }
);


const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setCurrentCustomer: (state, action: PayloadAction<Partial<Customer>>) => {
      state.currentCustomer = { ...state.currentCustomer, ...action.payload };
    },
    clearCurrentCustomer: (state) => {
      state.currentCustomer = {};
    },
    clearCustomerError: (state) => {
      state.errorCustomer = null;
      state.createCustomerError = null;
      state.fetchCustomerError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrFetchCustomer.pending, (state) => {
        state.isLoadingCustomer = true;
        state.errorCustomer = null;
        state.isCreatingCustomer = true;
        state.createCustomerError = null;
      })
      .addCase(createOrFetchCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.isLoadingCustomer = false;
        state.currentCustomer = action.payload;
        state.errorCustomer = null;
        state.isCreatingCustomer = false;
        state.createCustomerError = null;
      })
      .addCase(createOrFetchCustomer.rejected, (state, action) => {
        state.isLoadingCustomer = false;
        state.errorCustomer = action.payload as string;
        state.isCreatingCustomer = false;
        state.createCustomerError = action.payload as string;
      })
      .addCase(fetchCustomer.pending, (state) => {
        state.isFetchingCustomer = true;
        state.fetchCustomerError = null;
      })
      .addCase(fetchCustomer.fulfilled, (state, action: PayloadAction<Customer | null>) => {
        state.isFetchingCustomer = false;
        state.currentCustomer = action.payload || {};
        state.fetchCustomerError = null;
      })
      .addCase(fetchCustomer.rejected, (state, action) => {
        state.isFetchingCustomer = false;
        state.fetchCustomerError = action.payload as string;
        state.currentCustomer = {};
      });
  },
});

export const { setCurrentCustomer, clearCurrentCustomer, clearCustomerError } = customerSlice.actions;

export default customerSlice.reducer;
