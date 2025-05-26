import FileRepository from "../repositories/FileRepository";
import { CloudinaryService } from "../../utils/cloudinary";   

class FileService {
    cloudinaryService = new CloudinaryService();
    async createFile(file: any) {
      try{
        const uploadResult = await this.cloudinaryService.uploadFile(file);
        const newFile: any = {
            name: uploadResult.original_filename,
            url: uploadResult.secure_url,
            cloudinaryId: uploadResult.public_id,
            format: uploadResult.format,
            size: uploadResult.bytes,
            width: uploadResult.width,
            height: uploadResult.height
        };
        return await FileRepository.createFile(newFile);
      }
      catch(error){
        throw new Error("Error uploading file");
      }
    }

    // async findFileById(fileId) {
    //     return await FileRepository.findFileById(fileId);
    // }

    // async updateFile(fileId, updateData) {
    //     return await FileRepository.updateFile(fileId, updateData);
    // }

    // async deleteFile(fileId) {
    //     return await FileRepository.deleteFile(fileId);
    // }

    // Additional file-specific methods...
}

export default new FileService();