// pages/api/services/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchAllServices, addService } from '@/utils/supabase/services'; // Import the service functions

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle GET requests to retrieve all services
  if (req.method === 'GET') {
    const [services, error] = await fetchAllServices();

    if (error) {
      console.error('API Route Error: GET /api/services -', error.message);
      return res.status(500).json({ message: 'Failed to fetch services', error: error.message });
    }

    return res.status(200).json(services);

  // Handle POST requests to create a new service
  } else if (req.method === 'POST') {
    const serviceData = req.body;

    // Validate required fields. Add 'discount' if it's a mandatory input for a new service.
    // If discount is optional, remove it from here.
    const requiredFields = ['name', 'description', 'price']; // price is original price
    // If discount is passed from the frontend and saved, include it.
    // if (serviceData.discount !== undefined) {
    //   requiredFields.push('discount');
    // }
    
    const missingFields = requiredFields.filter(field => !serviceData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        error: `Required fields: ${missingFields.join(', ')}` 
      });
    }

    const [service, error] = await addService(serviceData);

    if (error) {
      console.error('API Route Error: POST /api/services -', error.message);
      return res.status(500).json({ message: 'Failed to create service', error: error.message });
    }

    return res.status(201).json(service);

  // Handle other HTTP methods not allowed
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}