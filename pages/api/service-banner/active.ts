// pages/api/service-banner/active.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchActiveServiceBanner } from '@/utils/supabase/server/serviceBannerServer'; // Import the specific active fetcher

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle GET requests to retrieve the active service banner
  if (req.method === 'GET') {
    const [banner, error] = await fetchActiveServiceBanner();

    if (error) {
      console.error('API Route Error: GET /api/service-banner/active -', error.message);
      return res.status(500).json({ message: 'Failed to fetch active service banner', error: error.message });
    }

    // If no active banner found (PGRST116 from Supabase) or no banner data, return 200 with null
    if (!banner) {
      return res.status(200).json(null);
    }

    return res.status(200).json(banner);

  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}