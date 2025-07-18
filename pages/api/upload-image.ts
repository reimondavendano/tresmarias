import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';
import { google } from 'googleapis';

// IMPORTANT: Load your service account credentials and folder ID from environment variables
const googleDriveCreds = JSON.parse(process.env.GOOGLE_DRIVE_CREDS || '{}');
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID as string;

// Determine if we are in development mode
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

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

  // --- Initialize Google Drive API client (only if not in local public save mode) ---
  let drive: any;
  if (!IS_DEVELOPMENT || process.env.ALWAYS_UPLOAD_TO_GDRIVE === 'true') { // Added an override for local testing
    try {
      if (!googleDriveCreds.client_email || !googleDriveCreds.private_key) {
        throw new Error("Google Drive credentials are not properly set.");
      }
      const auth = new google.auth.JWT({
        email: googleDriveCreds.client_email,
        key: googleDriveCreds.private_key,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });

      await auth.authorize();
      drive = google.drive({ version: 'v3', auth });

    } catch (authError: any) {
      console.error('Google Drive authentication error:', authError);
      return res.status(500).json({ message: 'Failed to authenticate with Google Drive.', error: authError.message });
    }
  }


  // --- Configure formidable based on environment ---
  let uploadDirectory: string;
  let publicAssetsPath: string | null = null; // To store the public path if saving locally

  if (IS_DEVELOPMENT && process.env.ALWAYS_UPLOAD_TO_GDRIVE !== 'true') {
    // In development AND not forcing GDrive upload, save to public/assets/img
    uploadDirectory = path.join(process.cwd(), 'public', 'assets', 'img');
    // Ensure the directory exists
    await fs.mkdir(uploadDirectory, { recursive: true }).catch(console.error);
  } else {
    // In production or when forcing GDrive upload, use the temporary directory
    uploadDirectory = path.join(process.cwd(), 'tmp');
    // Ensure the temporary directory exists
    await fs.mkdir(uploadDirectory, { recursive: true }).catch(console.error);
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
      // Construct a unique filename
      return `${baseName.replace(/\s+/g, '_')}_${uniqueSuffix}${fileExtension}`;
    },
  });

  let uploadedFilePath: string | null = null; // Formidable's path to the saved file

  try {
    const [fields, files] = await form.parse(req);
    const uploadedFile = files.image?.[0];

    if (!uploadedFile) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    uploadedFilePath = uploadedFile.filepath; // This is the path to the saved file (either tmp or public)

    let finalImageUrl: string;
    let googleDriveFileId: string | undefined;

    if (IS_DEVELOPMENT && process.env.ALWAYS_UPLOAD_TO_GDRIVE !== 'true') {
      // If saving locally in development
      finalImageUrl = `/assets/img/${path.basename(uploadedFile.filepath)}`;
      console.log(`Image saved locally: ${finalImageUrl}`);
      // No cleanup needed here as it's meant to stay in public
    } else {
      // Production or forced GDrive upload: read from tmp and upload to Google Drive
      const filename = uploadedFile.originalFilename || path.basename(uploadedFile.filepath);
      const mimeType = uploadedFile.mimetype || 'application/octet-stream';

      // Read the content of the temporary file
      const fileContent = await fs.readFile(uploadedFilePath);

      // --- Upload to Google Drive ---
      const response = await drive.files.create({
        requestBody: {
          name: filename,
          parents: [GOOGLE_DRIVE_FOLDER_ID],
          mimeType: mimeType,
        },
        media: {
          mimeType: mimeType,
          body: Buffer.from(fileContent),
        },
        fields: 'id,webContentLink,webViewLink',
      });

      // Important: Clean up the temporary file
      if (uploadedFilePath) {
          await fs.unlink(uploadedFilePath);
      }

      googleDriveFileId = response.data.id;
      finalImageUrl = response.data.webViewLink; // The Google Drive view link
      console.log(`Image uploaded to Google Drive. URL: ${finalImageUrl}`);
    }

    // Return the appropriate URL to the frontend
    return res.status(200).json({
      imageUrl: finalImageUrl,
      googleDriveFileId: googleDriveFileId, // Will be undefined if saved locally
      message: 'Image uploaded successfully.',
    });

  } catch (error: any) {
    console.error('File upload error:', error);
    // Clean up temporary file only if it was indeed a temporary file
    if (uploadedFilePath && (!IS_DEVELOPMENT || process.env.ALWAYS_UPLOAD_TO_GDRIVE === 'true')) {
        await fs.unlink(uploadedFilePath).catch(e => console.error("Error cleaning up temp file:", e));
    }
    const errorMessage = error.message || 'Failed to upload image due to an internal server error.';
    return res.status(500).json({ message: 'Failed to upload image.', error: errorMessage });
  }
}