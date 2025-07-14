// pages/api/stylists/available.ts
// This Next.js API Route handles requests to /api/stylists/available.
// It serves as the server-side endpoint for fetching available stylists for a service.

import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchAvailableStylists } from '@/utils/supabase/stylists'; // Import the service to fetch available stylists

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle GET requests to retrieve available stylists
  if (req.method === 'GET') {
    const serviceId = req.query.serviceId as string;
    
    if (!serviceId) {
      return res.status(400).json({ 
        message: 'Missing required parameter', 
        error: 'serviceId is required' 
      });
    }
    
    const [stylists, error] = await fetchAvailableStylists(serviceId);

    if (error) {
      console.error('API Route Error: GET /api/stylists/available -', error.message);
      // Send a 500 Internal Server Error response
      return res.status(500).json({ message: 'Failed to fetch available stylists', error: error.message });
    }

    // Send a 200 OK response with the stylists data
    return res.status(200).json(stylists);

  // Handle other HTTP methods not allowed
  } else {
    // Inform the client which methods are allowed for this endpoint
    res.setHeader('Allow', ['GET']);
    // Send a 405 Method Not Allowed response
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}