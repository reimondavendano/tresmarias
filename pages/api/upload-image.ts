// --- Backend: pages/api/upload-image.ts ---
// This Next.js API route handles receiving image files via POST requests,
// saving them to the 'public/assets/img' directory, and returning their public URL.

import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable'; // You'll need to install this library: npm install formidable
import path from 'path';
import fs from 'fs/promises'; // Use fs/promises for async file operations

// Important: Disable Next.js's default body parser for file uploads
// Formidable will handle the body parsing.
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Ensure only POST requests are allowed
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Initialize formidable to parse the incoming form data
  const form = formidable({
    // Define the directory where uploaded files will be temporarily stored and then moved.
    // This path resolves to your project's `public/assets/img` directory.
    uploadDir: path.join(process.cwd(), 'public', 'assets', 'img'),
    keepExtensions: true, // Keep the original file extension (e.g., .jpg, .png)
    maxFileSize: 5 * 1024 * 1024, // Set a file size limit (e.g., 5MB). Adjust as needed.
    
    // Custom filename generation to ensure unique names and prevent overwrites.
    // It combines the original filename (if available) with a timestamp and random number.
    filename: (name, ext, part) => {
      // Use path.parse to safely get the base name and extension
      const parsedPath = path.parse(part.originalFilename || 'upload');
      const baseName = parsedPath.name || 'upload'; // Get the name without extension
      const fileExtension = parsedPath.ext || ext; // Get the extension, fallback to 'ext' provided by formidable

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `${baseName}-${uniqueSuffix}${fileExtension}`;
    },
  });

  try {
    // Parse the incoming request to extract fields and files
    const [fields, files] = await form.parse(req);

    // Access the uploaded file. 'image' should match the 'name' attribute
    // of the file input field in your frontend form (e.g., <Input type="file" name="image" />).
    const uploadedFile = files.image?.[0]; 

    if (!uploadedFile) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    // The file has already been saved by formidable to the `uploadDir`.
    // Now, construct the public URL path for the saved image.
    // `path.basename(uploadedFile.filepath)` extracts just the filename from the full path.
    const publicPath = `/assets/img/${path.basename(uploadedFile.filepath)}`;

    // Send a success response with the public URL of the uploaded image
    return res.status(200).json({ imageUrl: publicPath, message: 'Image uploaded successfully.' });

  } catch (error: any) {
    // Handle any errors that occur during the file upload process
    console.error('File upload error:', error);
    return res.status(500).json({ message: 'Failed to upload image.', error: error.message });
  }
}
