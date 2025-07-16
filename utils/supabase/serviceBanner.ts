// utils/supabase/serviceBanner.ts

import { supabaseService } from './client/supaBaseClient'; // Assuming your Supabase client setup
import { ServiceBanner } from '@/types'; // Import the new ServiceBanner type

/**
 * Fetches the active service banner.
 * Assumes only one banner can be active (is_active = true).
 */
export const fetchActiveServiceBanner = async (): Promise<[ServiceBanner | null, any | null]> => {
  const { data, error } = await supabaseService
    .from('tbl_service_banner')
    .select('*')
    .eq('is_active', true)
    .single(); // Use .single() to expect one record

  if (error) {
    // If no rows found, data will be null and error will have code 'PGRST116'
    if (error.code === 'PGRST116') {
      return [null, null]; // No active banner found, not an error in this context
    }
    console.error('Supabase Service Banner Error: Failed to fetch active banner:', error.message);
    return [null, error];
  }

  // Ensure image_url is not empty or undefined before returning
  if (data && data.image_url) {
    return [data as ServiceBanner, null];
  } else {
    return [null, null]; // If image_url is missing, treat as no active banner
  }
};
