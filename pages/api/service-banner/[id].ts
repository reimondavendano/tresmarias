// pages/api/service-banner/[id].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  updateServiceBanner,
  deleteServiceBanner,
} from '@/utils/supabase/server/serviceBannerServer'; // Import enhanced server functions
import { ServiceBanner } from '@/types'; // Import ServiceBanner type

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query; // Get the banner ID from the dynamic route parameter

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Banner ID is required and must be a string.' });
  }

  // Handle PUT requests to update a service banner
  if (req.method === 'PUT') {
    // Expecting updated fields including image_url if changed
    const { title, description, is_active, image_url } = req.body;

    // Build the updates object carefully to avoid sending 'undefined' or unwanted values
    const updates: Partial<Omit<ServiceBanner, 'id' | 'created_at'>> = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description === '' ? null : description;
    if (is_active !== undefined) updates.is_active = is_active;
    // Only include image_url if it's explicitly provided (e.g., new image uploaded, or explicitly set to null to clear)
    // If not provided in the payload, it means no change to the image_url.
    if (image_url !== undefined) updates.image_url = image_url;


    // If no valid updates are provided, return early
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update.' });
    }

    const [updatedBanner, error] = await updateServiceBanner(id, updates);

    if (error) {
      console.error(`API Route Error: PUT /api/service-banner/${id} -`, error.message);
      return res.status(500).json({ message: 'Failed to update service banner', error: error.message });
    }

    if (!updatedBanner) {
      return res.status(404).json({ message: 'Service banner not found or could not be updated.' });
    }

    return res.status(200).json(updatedBanner);

  // Handle DELETE requests to delete a service banner
  } else if (req.method === 'DELETE') {
    const [success, error] = await deleteServiceBanner(id);

    if (error) {
      console.error(`API Route Error: DELETE /api/service-banner/${id} -`, error.message);
      return res.status(500).json({ message: 'Failed to delete service banner', error: error.message });
    }

    if (!success) {
      return res.status(404).json({ message: 'Service banner not found or could not be deleted.' });
    }

    return res.status(204).end(); // 204 No Content for successful deletion

  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}