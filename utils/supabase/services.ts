// utils/supabase/services.ts

import { supabaseAdmin } from '@/utils/supabase/client/supabaseAdmin';
import { Service } from '@/types';

/**
 * Fetches all services from the 'tbl_services' table, including discount and total_price.
 */
export const fetchAllServices = async (): Promise<[Service[] | null, any | null]> => {
  const { data, error } = await supabaseAdmin // <-- Use supabaseAdmin
    .from('tbl_services')
    .select('*, discount, total_price') // Modified: Select new columns
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Supabase Service Error: Failed to fetch services:', error.message);
    return [null, error];
  }
  return [data as Service[], null];
};

 /* Fetches a single service from the 'tbl_services' table by its ID, including discount and total_price.
 */
export const fetchServiceById = async (id: string): Promise<[Service | null, any | null]> => {
  const { data, error } = await supabaseAdmin
    .from('tbl_services')
    .select('*, discount, total_price') // Modified: Select new columns
    .eq('id', id)
    .single(); // Use .single() to get a single record

  if (error) {
    console.error('Supabase Service Error: Failed to fetch service by ID:', error.message);
    // If no rows found, data will be null and error will have code 'PGRST116'
    if (error.code === 'PGRST116') { // No rows found
      return [null, null];
    }
    return [null, error];
  }
  return [data as Service, null];
};

/**
 * Adds a new service to the 'services' table.
 * Ensure the database handles the computation of total_price based on price and discount.
 */
export const addService = async (newService: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'total_price'>): Promise<[Service | null, any | null]> => {
  const { data, error } = await supabaseAdmin // <-- Use supabaseAdmin
    .from('tbl_services')
    .insert([newService])
    .select('*, discount, total_price') // Select new columns on insert return
    .single();

  if (error) {
    console.error('Supabase Service Error: Failed to add service:', error.message);
    return [null, error];
  }
  return [data as Service, null];
};

/**
 * Updates an existing service in the 'services' table.
 * Ensure the database handles the computation of total_price based on price and discount.
 */
export const updateService = async (id: string, updates: Partial<Service>): Promise<[Service | null, any | null]> => {
  const { data, error } = await supabaseAdmin // <-- Use supabaseAdmin
    .from('tbl_services')
    .update(updates)
    .eq('id', id)
    .select('*, discount, total_price') // Select new columns on update return
    .single();

  if (error) {
    console.error('Supabase Service Error: Failed to update service:', error.message);
    return [null, error];
  }
  return [data as Service, null];
};

/**
 * Deletes a service from the 'services' table.
 */
export const deleteService = async (id: string): Promise<[boolean, any | null]> => {
  const { error } = await supabaseAdmin // <-- Use supabaseAdmin
    .from('tbl_services')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase Service Error: Failed to delete service:', error.message);
    return [false, error];
  }
  return [true, null];
};