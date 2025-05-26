import FileModel from "../models/File";
import { File } from "../models/File";

class FileRepository {
    async createFile(data: File): Promise<File> {
        const file = new FileModel(data);
        return await file.save();
    }

    async findFileById(fileId: string): Promise<File | null> {
        return await FileModel.findById(fileId);
    }

    async updateFile(
        fileId: string,
        updateData: Partial<File>
    ): Promise<File | null> {
        return await FileModel.findByIdAndUpdate(fileId, updateData, {
            new: true
        });
    }

    async deleteFile(fileId: string): Promise<File | null> {
        return await FileModel.findByIdAndDelete(fileId, { new: true });
    }

    // Additional file-specific methods...
}

export default new FileRepository();