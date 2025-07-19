// utils/supabase/server/serviceBannerServer.ts

import { supabaseAdmin } from '@/utils/supabase/client/supabaseAdmin';
import { ServiceBanner } from '@/types';

/**
 * Fetches the active service banner.
 * This function should be called from a server-side context (e.g., an API route).
 */
export const fetchActiveServiceBanner = async (): Promise<[ServiceBanner | null, any | null]> => {
  const { data, error } = await supabaseAdmin
    .from('tbl_service_banner')
    .select('*')
    .eq('is_active', true)
    .maybeSingle(); // Use maybeSingle() to handle no active banner gracefully

  if (error) {
    console.error('Supabase Service Banner Server Error: Failed to fetch active banner:', error.message);
    return [null, error];
  }
  // Return null if no data or if image_url is explicitly 'EMPTY' or null/empty string
  if (!data || !data.image_url || data.image_url === 'EMPTY') {
    return [null, null];
  }
  return [data as ServiceBanner, null];
};

/**
 * Fetches all service banners from the database.
 * This function should be called from a server-side context (e.g., an API route).\
 */
export const fetchAllServiceBanners = async (): Promise<[ServiceBanner[] | null, any | null]> => {
  const { data, error } = await supabaseAdmin
    .from('tbl_service_banner')
    .select('*')
    .order('created_at', { ascending: false }); // Order by creation date, newest first

  if (error) {
    console.error('Supabase Service Banner Server Error: Failed to fetch all banners:', error.message);
    return [null, error];
  }
  return [data as ServiceBanner[], null];
};

/**
 * Creates a new service banner.
 * This function should be called from a server-side context (e.g., an API route).
 */
export const createServiceBanner = async (
  bannerData: Omit<ServiceBanner, 'id' | 'created_at'>
): Promise<[ServiceBanner | null, any | null]> => {
  const { data, error } = await supabaseAdmin
    .from('tbl_service_banner')
    .insert(bannerData)
    .select()
    .single();

  if (error) {
    console.error('Supabase Service Banner Server Error: Failed to create banner:', error.message);
    return [null, error];
  }

  // If the newly created banner is active, call the RPC to ensure it's the only active one
  if (bannerData.is_active && data?.id) {
    const { error: rpcError } = await supabaseAdmin.rpc('set_active_service_banner', {
      p_banner_id: data.id.toString(),
    });
    if (rpcError) {
      console.error('Supabase Service Banner Server Error: Failed to set active via RPC after creation:', rpcError.message);
      // Log the error but don't prevent the banner from being created
    }
  }

  return [data as ServiceBanner, null];
};

/**
 * Updates an existing service banner by ID.
 * If `is_active` is explicitly set to `true`, it calls a Supabase RPC to deactivate all other banners.
 * This function should be called from a server-side context (e.g., an API route).
 */
export const updateServiceBanner = async (
  id: string,
  bannerData: Partial<Omit<ServiceBanner, 'id' | 'created_at'>>
): Promise<[ServiceBanner | null, any | null]> => {
  // Perform the update first
  const { data, error } = await supabaseAdmin
    .from('tbl_service_banner')
    .update(bannerData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Supabase Service Banner Server Error: Failed to update banner with ID ${id}:`, error.message);
    return [null, error];
  }

  // If is_active was explicitly set to true in the update, call the RPC function
  if (bannerData.is_active === true && data?.id) {
    const { error: rpcError } = await supabaseAdmin.rpc('set_active_service_banner', {
      p_banner_id: data.id.toString(), // <--- Add .toString() here to convert number/bigint to string
    });
    if (rpcError) {
      console.error('Supabase Service Banner Server Error: Failed to set active via RPC after update:', rpcError.message);
      // Decide if you want to rollback or just log this error. For now, we log and proceed.
    }
  }

  return [data as ServiceBanner, null];
};

/**
 * Deletes a service banner by ID.
 * This function should be called from a server-side context (e.g., an API route).\
 */
export const deleteServiceBanner = async (id: string): Promise<[boolean, any | null]> => {
  const { error } = await supabaseAdmin
    .from('tbl_service_banner')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Supabase Service Banner Server Error: Failed to delete banner with ID ${id}:`, error.message);
    return [false, error];
  }
  return [true, null];
};

/**
 * Fetches a single service banner by its ID.
 * This function should be called from a server-side context (e.g., an API route).
 */
export const fetchServiceBannerById = async (id: string): Promise<[ServiceBanner | null, any | null]> => {
  const { data, error } = await supabaseAdmin
    .from('tbl_service_banner')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Supabase Service Banner Server Error: Failed to fetch banner by ID ${id}:`, error.message);
    return [null, error];
  }

  return [data as ServiceBanner, null];
};