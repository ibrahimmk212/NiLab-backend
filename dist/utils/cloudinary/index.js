"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const cloudinary_1 = require("cloudinary");
class CloudinaryService {
    constructor() {
        this.config = cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }
    // Upload a file
    async uploadFile(file) {
        try {
            const uploadResult = await cloudinary_1.v2.uploader.upload(file.path, {
                upload_preset: 'ml_default' // Ensure this preset is correct
            });
            return uploadResult;
        }
        catch (error) {
            console.error("Cloudinary upload failed:", error); // Log detailed error message
            throw new Error("Error uploading file");
        }
    }
    // Delete an image
    async deleteFile(fileId) {
        try {
            const deleteResult = await cloudinary_1.v2.uploader.destroy(fileId);
            return deleteResult;
        }
        catch (error) {
            console.log(error);
        }
    }
}
exports.CloudinaryService = CloudinaryService;
