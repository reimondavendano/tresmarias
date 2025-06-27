// utils/supabaseService.ts
import { supabase } from '@/utils/supaBaseClient'; // Assuming you have your Supabase client initialized here

// Define interfaces for Service and Stylist based on your database schema
// These should match the interfaces in servicesSlice.ts
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: 'hair' | 'facial' | 'nails' | 'foot' | string; // Added string for flexibility
  image: string;
}

export interface Stylist {
  id: string;
  name: string;
  specialties: string[];
  experience: number;
  rating: number;
  image: string;
  available: boolean;
}

/**
 * Fetches all services from the 'tbl_services' table.
 * @returns A tuple containing the data array or null, and an error object or null.
 */
export const fetchAllServices = async (): Promise<[Service[] | null, any | null]> => {
  const { data, error } = await supabase
    .from('tbl_services')
    .select('*'); // Select all columns
    
  if (error) {
    console.error('Error fetching services:', error.message);
    return [null, error];
  }
  return [data as Service[], null];
};

/**
 * Fetches all stylists from the 'tbl_stylists' table.
 * (Assuming you have a tbl_stylists table and a similar structure)
 * @returns A tuple containing the data array or null, and an error object or null.
 */
export const fetchAllStylists = async (): Promise<[Stylist[] | null, any | null]> => {
  // Replace 'tbl_stylists' with your actual stylists table name if different
  const { data, error } = await supabase
    .from('tbl_stylist')
    .select('*');

  if (error) {
    console.error('Error fetching stylists:', error.message);
    return [null, error];
  }
  return [data as Stylist[], null];
};

/**
 * Adds a new service to the 'tbl_services' table.
 * @param newService The service object to add.
 * @returns A tuple containing the newly created service or null, and an error object or null.
 */
export const addService = async (newService: Omit<Service, 'id'>): Promise<[Service | null, any | null]> => {
  const { data, error } = await supabase
    .from('tbl_services')
    .insert([newService])
    .select() // Use .select() with no arguments after insert to return the inserted data
    .single(); // Expect a single row back

  if (error) {
    console.error('Error adding service:', error.message);
    return [null, error];
  }
  return [data as Service, null];
};

// You can add more functions here for updating, deleting services, or managing stylists
// For example:
/*
export const updateService = async (id: string, updates: Partial<Service>): Promise<[Service | null, any | null]> => {
  const { data, error } = await supabase
    .from('tbl_services')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating service:', error.message);
    return [null, error];
  }
  return [data as Service, null];
};

export const deleteService = async (id: string): Promise<[boolean, any | null]> => {
  const { error } = await supabase
    .from('tbl_services')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting service:', error.message);
    return [false, error];
  }
  return [true, null];
};
*/
