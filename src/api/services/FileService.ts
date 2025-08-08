import multer from 'multer';
import cloudinary from 'cloudinary';
import { v2 as cloudinaryV2 } from 'cloudinary';

// Configure Cloudinary
cloudinaryV2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up storage configuration to upload directly to Cloudinary
const storage = multer.memoryStorage(); // Use memory storage to hold the file temporarily

// Initialize multer with memory storage
export const upload = multer({ storage });
