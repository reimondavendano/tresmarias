// pages/api/stylists/[id].ts
// This Next.js API Route handles requests to /api/stylists/[id].
// It serves as the server-side endpoint for updating and deleting specific stylists.

import type { NextApiRequest, NextApiResponse } from 'next';
// Note: These imports assume you have corresponding functions in your supabaseService file.
import { updateStylist, deleteStylist, fetchStylistById } from '@/utils/supabase/stylists';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ 
      message: 'Invalid stylist ID', 
      error: 'Stylist ID is required and must be a string' 
    });
  }

  if (req.method === 'GET') {
    const [stylist, error] = await fetchStylistById(id);

    if (error) {
      console.error(`API Route Error: GET /api/stylists/${id} -`, error.message);
      return res.status(500).json({ message: 'Failed to fetch stylist', error: error.message });
    }

    if (!stylist) {
      return res.status(404).json({ message: 'Stylist not found.' });
    }

    return res.status(200).json(stylist);

  // Handle PUT requests to update a stylist
  } else if (req.method === 'PUT') {
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ 
        message: 'No updates provided', 
        error: 'Request body must contain fields to update' 
      });
    }

    const [stylist, error] = await updateStylist(id, updates);

    if (error) {
      console.error('API Route Error: PUT /api/stylists/[id] -', error.message);
      return res.status(500).json({ message: 'Failed to update stylist', error: error.message });
    }

    return res.status(200).json(stylist);

  // Handle DELETE requests to delete a stylist
  } else if (req.method === 'DELETE') {
    const [success, error] = await deleteStylist(id);

    if (error) {
      console.error('API Route Error: DELETE /api/stylists/[id] -', error.message);
      return res.status(500).json({ message: 'Failed to delete stylist', error: error.message });
    }

    if (!success) {
      return res.status(404).json({ message: 'Stylist not found' });
    }

    return res.status(200).json({ message: 'Stylist deleted successfully' });

  // Handle other HTTP methods not allowed
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}