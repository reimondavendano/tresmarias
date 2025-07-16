// pages/api/service-banner/index.ts
// This Next.js API Route handles requests to /api/service-banner.
// It serves as the server-side endpoint for fetching the active service banner.

import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchActiveServiceBanner } from '@/utils/supabase/serviceBanner'; // Import the service

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle GET requests to retrieve the active service banner
  if (req.method === 'GET') {
    const [banner, error] = await fetchActiveServiceBanner();

    if (error) {
      console.error('API Route Error: GET /api/service-banner -', error.message);
      return res.status(500).json({ message: 'Failed to fetch service banner', error: error.message });
    }

    // If no active banner or image_url is missing, return 200 with null
    if (!banner) {
      return res.status(200).json(null); 
    }

    return res.status(200).json(banner);

  // Handle other HTTP methods not allowed
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
