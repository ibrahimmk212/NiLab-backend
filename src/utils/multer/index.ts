import express from 'express';
import { Request, Response } from 'express';
import FileService from '../../api/services/FileService';
import multer from 'multer';

const app = express();

// Create a multer instance for handling file uploads
const storage = multer.memoryStorage();

// Initialize the multer upload middleware
export const upload = multer({
    storage: storage,
    // limits: { fileSize: 10 * 1024 * 1024 } // Maximum file size 10MB
}).single('file');  // 'file' should match the form data key


