import {
    v2 as cloudinary,
    UploadApiResponse,
    UploadApiErrorResponse
} from 'cloudinary';
import { UploadedFile } from 'express-fileupload'; // or use Multer type

export class CloudinaryService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
    }

    // Upload a file
    async uploadFile(file: { path: string }): Promise<UploadApiResponse> {
        try {
            const uploadResult = await cloudinary.uploader.upload(file.path, {
                upload_preset: 'ml_default' // Must be set correctly in your Cloudinary account
            });
            return uploadResult;
        } catch (error) {
            console.error('Cloudinary upload failed:', error);
            throw new Error('Error uploading file to Cloudinary');
        }
    }

    // Delete a file
    async deleteFile(publicId: string): Promise<{ result: string }> {
        try {
            const deleteResult = await cloudinary.uploader.destroy(publicId);
            return deleteResult;
        } catch (error) {
            console.error('Cloudinary delete failed:', error);
            throw new Error('Error deleting file from Cloudinary');
        }
    }
}
