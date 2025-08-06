// import { Request, Response } from 'express';
// import { STATUS } from '../../constants';
// import { asyncHandler } from '../middlewares/handlers/async';

// class FileController {
//     createFile = asyncHandler(
//         async (req: Request | any, res: Response): Promise<void> => {
//             const file = req.file;
//             if (!file) {
//                 throw new Error('Please upload a file');
//             }
//             const result: any = await FileService.createFile(file);
//             if (!result) {
//                 throw new Error('Error uploading file');
//             }
//             res.status(STATUS.OK).send({
//                 message: 'File uploaded successfully',
//                 success: true,
//                 data: result
//             });
//         }
//     );
// }

// export default new FileController();
