import express, { Request, Response } from 'express';
import multer from 'multer';
// import FileService from '../../api/services/FileService'; // Your custom file service

const fileRouter = express();

// Multer setup: Store files in memory as Buffers
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Max size: 10 MB
}).single('file'); // Accept a single file with key 'file'

// Route to handle file uploads
fileRouter.post('/upload', (req: Request, res: Response) => {
    upload(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).send({ error: 'File upload failed', details: err.message });
        }

        // File metadata and content (from multer's memoryStorage)
        const file = req.file;
        if (!file) {
            return res.status(400).send({ error: 'No file provided' });
        }

        console.log('File uploaded:', file);

        // Process the file with FileService (if fileapplicable)
        // Example: await FileService.process(file);

        res.status(200).send({
            message: 'File uploaded successfully',
            fileDetails: {
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
            },
        });
    });
});

export default fileRouter;