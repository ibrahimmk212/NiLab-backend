"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FileRepository_1 = __importDefault(require("../repositories/FileRepository"));
const cloudinary_1 = require("../../utils/cloudinary");
class FileService {
    constructor() {
        this.cloudinaryService = new cloudinary_1.CloudinaryService();
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
    async createFile(file) {
        try {
            const uploadResult = await this.cloudinaryService.uploadFile(file);
            const newFile = {
                name: uploadResult.original_filename,
                url: uploadResult.secure_url,
                cloudinaryId: uploadResult.public_id,
                format: uploadResult.format,
                size: uploadResult.bytes,
                width: uploadResult.width,
                height: uploadResult.height
            };
            return await FileRepository_1.default.createFile(newFile);
        }
        catch (error) {
            throw new Error("Error uploading file");
        }
    }
}
exports.default = new FileService();
