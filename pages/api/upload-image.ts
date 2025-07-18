import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';
import { put } from '@vercel/blob'; // Import Vercel Blob's put function

// Determine if we are in development mode
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'; // Corrected this, it was 'production' before.

// Disable Next.js's default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // --- Determine if we should upload to Vercel Blob or save locally ---
  // In local development, if you want to save to public/assets/img for easy viewing,
  // set a flag like process.env.SAVE_LOCALLY_IN_DEV = 'true'
  // Otherwise, in production or if not explicitly saving locally, upload to Vercel Blob.
  const SAVE_LOCALLY_IN_DEV = process.env.SAVE_LOCALLY_IN_DEV === 'true'; // New optional env var

  let uploadDirectory: string;
  const shouldUploadToVercelBlob = !IS_DEVELOPMENT || !SAVE_LOCALLY_IN_DEV; // Simplified logic

  if (IS_DEVELOPMENT && SAVE_LOCALLY_IN_DEV) {
    // In local development and explicitly opting to save locally
    uploadDirectory = path.join(process.cwd(), 'public', 'assets', 'img');
    console.log(`[DEV] Saving to local public assets: ${uploadDirectory}`);
  } else {
    // In production (Vercel) or when not saving locally in dev, use the temporary directory
    // On Vercel, '/tmp' is the only guaranteed writable temporary directory.
    // Locally, path.join(process.cwd(), 'tmp') creates a 'tmp' folder in your project root.
    uploadDirectory = IS_DEVELOPMENT ? path.join(process.cwd(), 'tmp') : '/tmp'; // Corrected /var/tmp to /tmp
    console.log(`[${IS_DEVELOPMENT ? 'DEV-VercelBlob' : 'PROD-VercelBlob'}] Saving to temporary directory: ${uploadDirectory}`);
  }

  // Ensure the temporary/target directory exists
  try {
    await fs.mkdir(uploadDirectory, { recursive: true });
  } catch (mkdirError: any) {
    console.error('Error creating temporary upload directory:', mkdirError);
    return res.status(500).json({ message: 'Failed to prepare upload directory.', error: mkdirError.message });
  }

  const form = formidable({
    uploadDir: uploadDirectory,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB limit
    filename: (name, ext, part) => {
      const parsedPath = path.parse(part.originalFilename || 'upload');
      const baseName = parsedPath.name || 'upload';
      const fileExtension = parsedPath.ext || ext;
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `${baseName.replace(/\s+/g, '_')}_${uniqueSuffix}${fileExtension}`;
    },
  });

  let uploadedFilePath: string | null = null; // Formidable's path to the saved file

  try {
    const [fields, files] = await form.parse(req);
    const uploadedFile = files.image?.[0]; // Assuming 'image' is the field name from your frontend

    if (!uploadedFile) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    uploadedFilePath = uploadedFile.filepath; // Formidable saves to this temp path first

    let finalImageUrl: string;

    if (IS_DEVELOPMENT && SAVE_LOCALLY_IN_DEV) {
      // If saving locally in development, return the local public path
      finalImageUrl = `/assets/img/${path.basename(uploadedFile.filepath)}`;
      console.log(`[DEV] Image saved locally: ${finalImageUrl}`);
      // No cleanup needed here as it's meant to stay in public
    } else {
      // Production or when not saving locally in dev: Upload to Vercel Blob
      const filename = uploadedFile.originalFilename || path.basename(uploadedFile.filepath);
      const mimeType = uploadedFile.mimetype || 'application/octet-stream';

      // Read the temporary file as a stream for efficient upload to Vercel Blob
      const fileBuffer = await fs.readFile(uploadedFilePath); // Read full file to buffer for put()

      // --- Upload to Vercel Blob ---
      const blob = await put(filename, fileBuffer, {
        access: 'public', // Make the file publicly accessible
        contentType: mimeType,
      });

      // Important: Clean up the temporary file after successful upload
      if (uploadedFilePath) {
        await fs.unlink(uploadedFilePath);
      }

      finalImageUrl = blob.url; // This is the public URL of the uploaded blob
      console.log(`[${IS_DEVELOPMENT ? 'DEV-VercelBlob' : 'PROD-VercelBlob'}] Image uploaded to Vercel Blob. URL: ${finalImageUrl}`);
    }

    // Return the appropriate URL to the frontend
    return res.status(200).json({
      imageUrl: finalImageUrl,
      message: 'Image uploaded successfully.',
    });

  } catch (error: any) {
    console.error('File upload error:', error);
    // Clean up temporary file ONLY if it was saved to a temporary location for blob upload
    if (uploadedFilePath && shouldUploadToVercelBlob) {
        await fs.unlink(uploadedFilePath).catch(e => console.error("Error cleaning up temp file:", e));
    }
    const errorMessage = error.message || 'Failed to upload image due to an internal server error.';
    return res.status(500).json({ message: 'Failed to upload image.', error: errorMessage });
  }
}