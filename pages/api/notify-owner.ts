// pages/api/notify-owner.ts
// This Next.js API Route handles sending a notification to the owner via Facebook Messenger
// after a successful booking.

import type { NextApiRequest, NextApiResponse } from 'next';

// IMPORTANT: These should be stored securely as environment variables (e.g., in a .env.local file)
// and NEVER hardcoded in production code.
// You will need to set these in your deployment environment as well.
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN || 'YOUR_FACEBOOK_PAGE_ACCESS_TOKEN_HERE';
const FB_PAGE_ID = process.env.FB_PAGE_ID || 'YOUR_FACEBOOK_PAGE_ID_HERE';

// The PSID of the owner's Messenger chat with your Facebook Page.
// This is crucial. You must obtain this PSID by having the owner message your Facebook Page
// at least once, and then retrieve it via Facebook's webhooks or Page Inbox tools.
// Alternatively, for a more complex setup, integrate Facebook Login for Business to get PSID.
const OWNER_PSID = process.env.OWNER_FACEBOOK_PSID || 'OWNER_FACEBOOK_PSID_HERE'; // Placeholder

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests for sending notifications
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Extract booking details from the request body
  const { bookingDetails } = req.body;

  if (!bookingDetails) {
    return res.status(400).json({ message: 'Booking details are required.' });
  }

  // Basic validation for critical Facebook credentials
  if (FB_PAGE_ACCESS_TOKEN === 'YOUR_FACEBOOK_PAGE_ACCESS_TOKEN_HERE' || FB_PAGE_ID === 'YOUR_FACEBOOK_PAGE_ID_HERE' || OWNER_PSID === 'OWNER_FACEBOOK_PSID_HERE') {
    console.error('Facebook Messenger API credentials are not configured. Please set FB_PAGE_ACCESS_TOKEN, FB_PAGE_ID, and OWNER_FACEBOOK_PSID environment variables.');
    return res.status(500).json({ message: 'Messenger notification not configured on server.' });
  }

  // Construct the message payload for Facebook Messenger
  const messageText = `
    🎉 New Booking Confirmation! 🎉

    Service: ${bookingDetails.serviceName}
    Date: ${bookingDetails.bookingDate}
    Time: ${bookingDetails.bookingTime}
    Customer: ${bookingDetails.customerName}
    Contact: ${bookingDetails.customerPhone} (${bookingDetails.customerEmail})
    Total Amount: $${(bookingDetails.totalAmount || 0).toFixed(2)}
    Status: ${bookingDetails.status}

    Please check the admin dashboard for more details.
  `;

  const messagePayload = {
    recipient: {
      id: OWNER_PSID, // Send to the owner's PSID
    },
    message: {
      text: messageText,
    },
    // You can also add quick replies, buttons, or other structured messages here
    // based on Facebook Messenger Platform documentation.
    // Example for a button linking to your admin dashboard:
    // quick_replies: [
    //   {
    //     content_type: 'text',
    //     title: 'View Booking',
    //     payload: 'VIEW_BOOKING_PAYLOAD', // This payload can be handled by a webhook
    //     webview_height_ratio: 'full',
    //     messenger_extensions: true,
    //     url: 'YOUR_ADMIN_DASHBOARD_BOOKING_URL/' + bookingDetails.bookingId, // Link to specific booking
    //   }
    // ]
  };

  try {
    // Send the message using Facebook Graph API
    const fbResponse = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${FB_PAGE_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messagePayload),
    });

    const fbData = await fbResponse.json();

    if (!fbResponse.ok) {
      console.error('Facebook API Error (Response not OK):', fbData);
      return res.status(fbResponse.status).json({
        message: 'Failed to send Messenger notification via Facebook API',
        error: fbData.error?.message || 'Unknown Facebook API error',
      });
    }

    console.log('Messenger notification sent successfully:', fbData);
    return res.status(200).json({ message: 'Notification sent successfully', fbResponse: fbData });

  } catch (error: any) {
    console.error('Server Error sending Messenger notification:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
