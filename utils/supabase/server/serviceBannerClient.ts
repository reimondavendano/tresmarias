// utils/supabase/client/serviceBannerClient.ts

import { supabaseBrowser } from '@/utils/supabase/client/supabaseBrowser'; // Only import the browser client
import { ServiceBanner } from '@/types'; // Import the ServiceBanner type

/**
 * Uploads a service banner image to Supabase storage.
 * This function is intended to be called from the client-side.
 * It uses the supabaseBrowser client to handle file uploads.
 */
export const uploadServiceBannerImage = async (
  file: File,
  existingImageUrl?: string | null
): Promise<[string | null, any | null]> => {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExtension}`;
    const filePath = `assets/services/${fileName}`; // Path inside your bucket

    // Upload the new image using the browser client
    const { data: uploadData, error: uploadError } = await supabaseBrowser.storage
      .from('tres-marias') // Use your actual bucket name here
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase Storage Error: Failed to upload image:', uploadError.message);
      return [null, uploadError];
    }

    // If there was an existing image, attempt to delete it
    if (existingImageUrl) {
      // Extract the file path from the full public URL
      const oldFilePathMatch = existingImageUrl.match(/\/storage\/v1\/object\/public\/tres-marias\/(.*)/);
      if (oldFilePathMatch && oldFilePathMatch[1]) {
        const oldFilePath = oldFilePathMatch[1]; // e.g., 'assets/services/old_image.jpg'
        const { error: deleteError } = await supabaseBrowser.storage
          .from('tres-marias') // Use your actual bucket name here
          .remove([oldFilePath]);

        if (deleteError) {
          console.warn('Supabase Storage Warning: Failed to delete old image:', deleteError.message);
        }
      } else {
        console.warn('Supabase Storage Warning: Could not parse old image URL for deletion:', existingImageUrl);
      }
    }

    // Get the public URL for the newly uploaded image
    const { data: publicUrlData } = supabaseBrowser.storage
      .from('tres-marias') // Use your actual bucket name here
      .getPublicUrl(filePath);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      return [null, new Error('Failed to get public URL for uploaded image.')];
    }

    return [publicUrlData.publicUrl, null];

  } catch (error: any) {
    console.error('Service Banner Image Upload Error:', error.message);
    return [null, error];
  }
};