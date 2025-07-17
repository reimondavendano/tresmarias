// pages/api/service-banner/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createServiceBanner,
  fetchAllServiceBanners,
} from '@/utils/supabase/server/serviceBannerServer'; // Import enhanced server functions
import { ServiceBanner } from '@/types'; // Import ServiceBanner type

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle GET requests to retrieve ALL service banners
  if (req.method === 'GET') {
    const [banners, error] = await fetchAllServiceBanners();

    if (error) {
      console.error('API Route Error: GET /api/service-banner -', error.message);
      return res.status(500).json({ message: 'Failed to fetch service banners', error: error.message });
    }

    return res.status(200).json(banners);

  // Handle POST requests to create a new service banner
  } else if (req.method === 'POST') {
    // Expecting image_url to be already uploaded and provided in the body
    const { title, description, is_active, image_url } = req.body;

    // Basic validation
    if (!title || typeof is_active === 'undefined') {
      return res.status(400).json({ message: 'Missing required fields: title, is_active.' });
    }
    // For creation, image_url is highly recommended, though not strictly enforced by DB schema for null
    // You might want to add: if (!image_url) return res.status(400).json({ message: 'Image URL is required for new banners.' });

    const bannerData: Omit<ServiceBanner, 'id' | 'created_at'> = {
      title,
      description: description === '' ? null : description, // Convert empty string to null
      is_active,
      image_url: image_url || null, // Ensure null if not provided
    };

    const [newBanner, error] = await createServiceBanner(bannerData);

    if (error) {
      console.error('API Route Error: POST /api/service-banner -', error.message);
      return res.status(500).json({ message: 'Failed to create service banner', error: error.message });
    }

    return res.status(201).json(newBanner);

  } else {
    // Inform the client which methods are allowed for this endpoint
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}