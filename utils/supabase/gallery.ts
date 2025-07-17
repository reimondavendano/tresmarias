// utils/supabase/gallery.ts

import { supabaseAdmin } from './client/supabaseAdmin'; // Assuming your Supabase client setup
import { GalleryImage } from '@/types'; // Import the new GalleryImage type

/**
 * Fetches all gallery images from the 'tbl_gallery' table.
 */
export const fetchAllGalleryImages = async (): Promise<[GalleryImage[] | null, any | null]> => {
  const { data, error } = await supabaseAdmin
    .from('tbl_gallery')
    .select('*')
    .order('created_at', { ascending: false }); // Order by creation date, newest first

  if (error) {
    console.error('Supabase Gallery Service Error: Failed to fetch gallery images:', error.message);
    return [null, error];
  }
  return [data as GalleryImage[], null];
};

/**
 * Fetches a single gallery image by its ID.
 */
export const fetchGalleryImageById = async (id: string): Promise<[GalleryImage | null, any | null]> => {
  const { data, error } = await supabaseAdmin
    .from('tbl_gallery')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Supabase Gallery Service Error: Failed to fetch gallery image by ID:', error.message);
    if (error.code === 'PGRST116') { // No rows found
      return [null, null];
    }
    return [null, error];
  }
  return [data as GalleryImage, null];
};

// You can add addGalleryImage, updateGalleryImage, deleteGalleryImage functions here if needed for admin panel
