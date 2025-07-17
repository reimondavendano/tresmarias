// utils/supabase/customers.ts

import { supabaseAdmin } from './client/supabaseAdmin'; // Assuming you have a configured Supabase client
import { Customer } from '../../types'; // Corrected import path for Customer type

/**
 * Fetches a customer by their email address.
 */
export const fetchCustomerByEmail = async (email: string): Promise<[Customer[] | null, any | null]> => {
  const { data, error } = await supabaseAdmin
    .from('tbl_customers') // Assuming your customer table is named 'tbl_customers'
    .select('*')
    .eq('email', email);

  if (error) {
    console.error('Supabase Customer Service Error: Failed to fetch customer by email:', error.message);
    return [null, error];
  }
  return [data as Customer[], null];
};

/**
 * Fetches a customer by their ID.
 */
export const fetchCustomerById = async (id: string): Promise<[Customer | null, any | null]> => {
  const { data, error } = await supabaseAdmin
    .from('tbl_customers') // Assuming your customer table is named 'tbl_customers'
    .select('*')
    .eq('id', id)
    .single(); // Use .single() as we expect only one customer by ID

  if (error) {
    console.error('Supabase Customer Service Error: Failed to fetch customer by ID:', error.message);
    // If no rows found, data will be null and error will have code 'PGRST116'
    if (error.code === 'PGRST116') { // No rows found
      return [null, null];
    }
    return [null, error];
  }
  return [data as Customer, null];
};

/**
 * Fetches all customers from the 'tbl_customers' table.
 */
export const fetchAllCustomers = async (): Promise<[Customer[] | null, any | null]> => {
  const { data, error } = await supabaseAdmin
    .from('tbl_customers')
    .select('*')
    .order('created_at', { ascending: false }); // Order by creation date for consistency

  if (error) {
    console.error('Supabase Customer Service Error: Failed to fetch all customers:', error.message);
    return [null, error];
  }
  return [data as Customer[], null];
};

/**
 * Creates a new customer entry in the 'tbl_customers' table.
 */
export const createCustomer = async (newCustomer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<[Customer | null, any | null]> => {
  const { data, error } = await supabaseAdmin
    .from('tbl_customers') // Assuming your customer table is named 'tbl_customers'
    .insert([newCustomer])
    .select()
    .single();

  if (error) {
    console.error('Supabase Customer Service Error: Failed to create customer:', error.message);
    return [null, error];
  }
  return [data as Customer, null];
};

/**
 * Updates an existing customer in the 'tbl_customers' table.
 */
export const updateCustomer = async (id: string, updates: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>): Promise<[Customer | null, any | null]> => {
  const { data, error } = await supabaseAdmin
    .from('tbl_customers') // Assuming your customer table is named 'tbl_customers'
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase Customer Service Error: Failed to update customer:', error.message);
    return [null, error];
  }
  return [data as Customer, null];
};

/**
 * Deletes a customer from the 'tbl_customers' table.
 */
export const deleteCustomer = async (id: string): Promise<[boolean, any | null]> => {
  const { error } = await supabaseAdmin
    .from('tbl_customers') // Assuming your customer table is named 'tbl_customers'
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase Customer Service Error: Failed to delete customer:', error.message);
    return [false, error];
  }
  return [true, null];
};
