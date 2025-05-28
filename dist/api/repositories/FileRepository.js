"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const File_1 = __importDefault(require("../models/File"));
class FileRepository {
    async createFile(data) {
        const file = new File_1.default(data);
        return await file.save();
    }
    async findFileById(fileId) {
        return await File_1.default.findById(fileId);
    }
    async updateFile(fileId, updateData) {
        return await File_1.default.findByIdAndUpdate(fileId, updateData, {
            new: true
        });
    }
    async deleteFile(fileId) {
        return await File_1.default.findByIdAndDelete(fileId, { new: true });
    }
}
exports.default = new FileRepository();
