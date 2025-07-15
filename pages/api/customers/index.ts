// pages/api/customers/index.ts
// This Next.js API Route handles requests to /api/customers.
// It serves as the server-side endpoint for creating and fetching customer data.

import type { NextApiRequest, NextApiResponse } from 'next';
import { createCustomer, fetchCustomerByEmail, fetchAllCustomers } from '@/utils/supabase/customers'; // Import fetchAllCustomers

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle GET requests to fetch customers
  if (req.method === 'GET') {
    const { email } = req.query;

    if (email) {
      // If email is provided, fetch by email
      const [customers, error] = await fetchCustomerByEmail(email as string);

      if (error) {
        console.error('API Route Error: GET /api/customers (by email) -', error.message);
        return res.status(500).json({ message: 'Failed to fetch customer by email', error: error.message });
      }
      return res.status(200).json(customers);
    } else {
      // If no email is provided, fetch all customers
      const [customers, error] = await fetchAllCustomers();

      if (error) {
        console.error('API Route Error: GET /api/customers (all) -', error.message);
        return res.status(500).json({ message: 'Failed to fetch all customers', error: error.message });
      }
      return res.status(200).json(customers);
    }

  // Handle POST requests to create a new customer
  } else if (req.method === 'POST') {
    const customerData = req.body;

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone'];
    const missingFields = requiredFields.filter(field => !customerData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        error: `Required fields: ${missingFields.join(', ')}`
      });
    }

    const [customer, error] = await createCustomer(customerData);

    if (error) {
      console.error('API Route Error: POST /api/customers -', error.message);
      return res.status(500).json({ message: 'Failed to create customer', error: error.message });
    }

    return res.status(201).json(customer);

  // Handle other HTTP methods not allowed
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
