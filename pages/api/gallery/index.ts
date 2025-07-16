// pages/api/gallery/index.ts
// This Next.js API Route handles requests to /api/gallery.
// It serves as the server-side endpoint for fetching gallery images.

import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchAllGalleryImages } from '@/utils/supabase/gallery'; // Import the gallery service

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle GET requests to retrieve all gallery images
  if (req.method === 'GET') {
    const [galleryImages, error] = await fetchAllGalleryImages();

    if (error) {
      console.error('API Route Error: GET /api/gallery -', error.message);
      return res.status(500).json({ message: 'Failed to fetch gallery images', error: error.message });
    }

    return res.status(200).json(galleryImages);

  // Handle other HTTP methods not allowed
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
