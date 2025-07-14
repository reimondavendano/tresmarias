// pages/api/stylists/index.ts
// This Next.js API Route handles requests to /api/stylists.
// It serves as the server-side endpoint for fetching stylists.

import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchAllStylists, fetchAvailableStylists } from '@/utils/supabase/stylists'; // Import the service to fetch stylists

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

  // Handle other HTTP methods not allowed
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}