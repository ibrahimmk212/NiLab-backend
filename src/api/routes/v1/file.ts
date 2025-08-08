import { Router } from 'express';
import FilesController from '../../../api/controllers/FileController';
import { upload } from '../../../api/services/FileService';

const filesRouter = Router();

// Route for uploading multiple files
filesRouter.post(
    '/multi',
    upload.array('files', 10), // Handles up to 10 files
    FilesController.uploadFiles // Controller method to handle the file processing
);

// Route for uploading a single file (generic)
filesRouter.post(
    '/single',
    upload.single('file'), // Handles single file upload
    FilesController.uploadSingleFile // Controller method to handle single file processing
);

export default filesRouter;
