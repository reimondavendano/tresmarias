// utils/supabase/services.ts

import { supabaseService } from '@/utils/supabase/client/supaBaseClient';
import { Service } from '@/types';

/**
 * Fetches all services from the 'services' table.
 */
export const fetchAllServices = async (): Promise<[Service[] | null, any | null]> => {
  const { data, error } = await supabaseService // <-- Use supabaseService
    .from('tbl_services')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Supabase Service Error: Failed to fetch services:', error.message);
    return [null, error];
  }
  return [data as Service[], null];
};

 /* Fetches a single service from the 'tbl_services' table by its ID.
 */
export const fetchServiceById = async (id: string): Promise<[Service | null, any | null]> => {
  const { data, error } = await supabaseService
    .from('tbl_services')
    .select('*')
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
 */
export const addService = async (newService: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<[Service | null, any | null]> => {
  const { data, error } = await supabaseService // <-- Use supabaseService
    .from('tbl_services')
    .insert([newService])
    .select()
    .single();

  if (error) {
    console.error('Supabase Service Error: Failed to add service:', error.message);
    return [null, error];
  }
  return [data as Service, null];
};

/**
 * Updates an existing service in the 'services' table.
 */
export const updateService = async (id: string, updates: Partial<Service>): Promise<[Service | null, any | null]> => {
  const { data, error } = await supabaseService // <-- Use supabaseService
    .from('tbl_services')
    .update(updates)
    .eq('id', id)
    .select()
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
  const { error } = await supabaseService // <-- Use supabaseService
    .from('tbl_services')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase Service Error: Failed to delete service:', error.message);
    return [false, error];
  }
  return [true, null];
};