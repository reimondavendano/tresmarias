// utils/supabase/stylists.ts

import { supabaseService } from '@/utils/supabase/client/supaBaseClient';
import { Stylist } from '@/types';

/**
 * Fetches all stylists from the 'stylists' table.
 */
export const fetchAllStylists = async (): Promise<[Stylist[] | null, any | null]> => {
  const { data, error } = await supabaseService // <-- Use supabaseService
    .from('tbl_stylists')
    .select('*')
    .order('rating', { ascending: false });

  if (error) {
    console.error('Supabase Service Error: Failed to fetch stylists:', error.message);
    return [null, error];
  }
  return [data as Stylist[], null];
};

/**
 * Fetches a single stylist from the 'tbl_stylists' table by their ID.
 */
export const fetchStylistById = async (id: string): Promise<[Stylist | null, any | null]> => {
  const { data, error } = await supabaseService
    .from('tbl_stylists') // Assuming your stylist table is named 'tbl_stylists'
    .select('*')
    .eq('id', id)
    .single(); // Use .single() to get a single record

  if (error) {
    console.error('Supabase Stylist Service Error: Failed to fetch stylist by ID:', error.message);
    // If no rows found, data will be null and error will have code 'PGRST116'
    if (error.code === 'PGRST116') { // No rows found
      return [null, null];
    }
    return [null, error];
  }
  return [data as Stylist, null];
};

/**
 * Fetches available stylists for a specific service.
 */
export const fetchAvailableStylists = async (serviceId: string): Promise<[Stylist[] | null, any | null]> => {
  // First get the service to check what specialties are needed
  const { data: service, error: serviceError } = await supabaseService // <-- Use supabaseService
    .from('tbl_stylists')
    .select('name')
    .eq('id', serviceId)
    .single();

  if (serviceError) {
    console.error('Supabase Service Error: Failed to fetch service:', serviceError.message);
    return [null, serviceError];
  }

  // Get all available stylists
  const { data, error } = await supabaseService // <-- Use supabaseService
    .from('tbl_stylists')
    .select('*')
    .eq('is_available', true)
    .order('rating', { ascending: false });

  if (error) {
    console.error('Supabase Service Error: Failed to fetch available stylists:', error.message);
    return [null, error];
  }

  // Filter stylists based on service specialties
  const serviceName = service.name.toLowerCase();
  const filteredStylists = (data as Stylist[]).filter(stylist => 
    stylist.specialties.some(specialty => 
      specialty.toLowerCase().includes(serviceName) || 
      serviceName.includes(specialty.toLowerCase())
    )
  );

  const result = filteredStylists.length > 0 ? filteredStylists : data as Stylist[];
  return [result, null];
};


// Add full CRUD for stylists to match the service functions
export const addStylist = async (newStylist: Omit<Stylist, 'id' | 'created_at' | 'updated_at'>): Promise<[Stylist | null, any | null]> => {
  const { data, error } = await supabaseService // <-- Use supabaseService
    .from('tbl_stylists')
    .insert([newStylist])
    .select()
    .single();
  if (error) {
    console.error('Supabase Service Error: Failed to add stylist:', error.message);
    return [null, error];
  }
  return [data as Stylist, null];
};

export const updateStylist = async (id: string, updates: Partial<Stylist>): Promise<[Stylist | null, any | null]> => {
  const { data, error } = await supabaseService // <-- Use supabaseService
    .from('tbl_stylists')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('Supabase Service Error: Failed to update stylist:', error.message);
    return [null, error];
  }
  return [data as Stylist, null];
};

export const deleteStylist = async (id: string): Promise<[boolean, any | null]> => {
  const { error } = await supabaseService // <-- Use supabaseService
    .from('tbl_stylists')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Supabase Service Error: Failed to delete stylist:', error.message);
    return [false, error];
  }
  return [true, null];
};