// pages/api/stylists/index.ts
// This Next.js API Route handles requests to /api/stylists.
// It serves as the server-side endpoint for fetching and adding stylists.

import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchAllStylists, fetchAvailableStylists, addStylist } from '@/utils/supabase/stylists'; // Import addStylist

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle GET requests to retrieve stylists
  if (req.method === 'GET') {
    const { serviceId } = req.query;

    let stylists, error;

    if (serviceId) {
      // Fetch stylists available for a specific service
      [stylists, error] = await fetchAvailableStylists(serviceId as string);
    } else {
      // Fetch all stylists
      [stylists, error] = await fetchAllStylists();
    }

    if (error) {
      console.error('API Route Error: GET /api/stylists -', error.message);
      return res.status(500).json({ message: 'Failed to fetch stylists', error: error.message });
    }

    return res.status(200).json(stylists);

  // Handle POST requests to add a new stylist
  } else if (req.method === 'POST') {
    const newStylistData = req.body; // The new stylist data is in the request body

    const [stylist, error] = await addStylist(newStylistData);

    if (error) {
      console.error('API Route Error: POST /api/stylists -', error.message);
      return res.status(500).json({ message: 'Failed to add stylist', error: error.message });
    }

    // Return the newly created stylist with a 201 Created status
    return res.status(201).json(stylist);

  // Handle other HTTP methods not allowed
  } else {
    res.setHeader('Allow', ['GET', 'POST']); // Inform client about allowed methods
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
