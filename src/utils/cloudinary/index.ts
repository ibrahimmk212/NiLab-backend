import { v2 as cloudinary } from 'cloudinary';

export class CloudinaryService {


    config = cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Upload a file
    async uploadFile(file: any) {
        try {
            const uploadResult = await cloudinary.uploader.upload(file.path, {
                upload_preset: 'ml_default'  // Ensure this preset is correct
            });
            return uploadResult;
        } catch (error) {
            console.error("Cloudinary upload failed:", error);  // Log detailed error message
            throw new Error("Error uploading file");
        }
    }
    

    // Delete an image
    async deleteFile(fileId: string){
       try {
        const deleteResult = await cloudinary.uploader.destroy(fileId);
        return deleteResult;
       }
         catch (error) {
              console.log(error);
         }
    }

   }