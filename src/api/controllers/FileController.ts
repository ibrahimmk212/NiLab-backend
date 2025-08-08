/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import cloudinary, { UploadApiResponse } from 'cloudinary';
import { v2 as cloudinaryV2 } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary (ensure you replace with your actual credentials)
cloudinaryV2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

const FilesController = {
    // Upload multiple files to Cloudinary
    uploadFiles: async (req: Request | any, res: Response): Promise<void> => {
        try {
            if (!req.files || req.files.length === 0) {
                res.status(400).json({ message: 'No files uploaded' });
                return;
            }

            const files = req.files;

            // Upload files to Cloudinary
            const uploadPromises = files.map(
                (file: any) =>
                    new Promise<UploadApiResponse>((resolve, reject) => {
                        const stream = cloudinaryV2.uploader.upload_stream(
                            {
                                resource_type: 'auto', // Auto-detect file type
                                public_id: Date.now().toString() // Unique public ID using timestamp
                            },
                            (error, result) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(result as UploadApiResponse); // Return the result (including URL) from Cloudinary
                                }
                            }
                        );

                        // Pipe the file buffer to Cloudinary
                        const bufferStream = new Readable();
                        bufferStream.push(file.buffer);
                        bufferStream.push(null); // Signal the end of the stream
                        bufferStream.pipe(stream);
                    })
            );

            // Wait for all files to upload
            const uploadResults = await Promise.all(uploadPromises);

            // Return the file URLs from Cloudinary
            const fileUrls = uploadResults.map((result) => result.secure_url);

            res.status(200).json({
                message: 'Files uploaded successfully',
                files: fileUrls // Array of uploaded file URLs
            });
        } catch (error) {
            console.error('Error uploading files to Cloudinary:', error);
            res.status(500).json({
                message: 'Error uploading files',
                error: (error as Error).message
            });
        }
    },

    // Upload a single file to Cloudinary
    uploadSingleFile: async (
        req: Request | any,
        res: Response
    ): Promise<void> => {
        try {
            if (!req.file) {
                res.status(400).json({ message: 'No file uploaded' });
                return;
            }

            const file = req.file;

            // Upload the single file to Cloudinary
            const stream = cloudinaryV2.uploader.upload_stream(
                {
                    resource_type: 'auto', // Auto-detect file type
                    public_id: Date.now().toString() // Unique public ID using timestamp
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        res.status(500).json({
                            success: false,
                            message: 'File upload failed',
                            error: error.message
                        });
                        return;
                    }

                    if (result) {
                        res.status(200).json({
                            success: true,
                            message: 'File uploaded successfully',
                            file: {
                                url: result.secure_url, // Return the secure URL of the uploaded file
                                publicId: result.public_id // Return the public ID for future reference
                            }
                        });
                    } else {
                        res.status(500).json({
                            success: false,
                            message: 'File upload failed',
                            error: 'No result returned from Cloudinary'
                        });
                    }
                }
            );

            // Pipe the file buffer to Cloudinary
            const bufferStream = new Readable();
            bufferStream.push(file.buffer);
            bufferStream.push(null); // Signal the end of the stream
            bufferStream.pipe(stream);
        } catch (error) {
            console.error('Error uploading file to Cloudinary:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading file',
                error: (error as Error).message
            });
        }
    },

    // Delete a file from Cloudinary
    deleteFile: async (req: Request, res: Response): Promise<void> => {
        try {
            const { publicId } = req.params;

            if (!publicId) {
                res.status(400).json({ message: 'Public ID is required' });
                return;
            }

            const result = await cloudinaryV2.uploader.destroy(publicId);

            if (result.result === 'ok') {
                res.status(200).json({
                    message: 'File deleted successfully',
                    publicId
                });
            } else {
                res.status(404).json({
                    message: 'File not found',
                    publicId
                });
            }
        } catch (error) {
            console.error('Error deleting file from Cloudinary:', error);
            res.status(500).json({
                message: 'Error deleting file',
                error: (error as Error).message
            });
        }
    }
};

export default FilesController;
