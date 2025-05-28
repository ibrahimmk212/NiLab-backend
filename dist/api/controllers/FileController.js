"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../constants");
const async_1 = require("../middlewares/handlers/async");
const FileService_1 = __importDefault(require("../services/FileService"));
class FileController {
    constructor() {
        this.createFile = (0, async_1.asyncHandler)(async (req, res) => {
            const file = req.file;
            if (!file) {
                throw new Error('Please upload a file');
            }
            const result = await FileService_1.default.createFile(file);
            if (!result) {
                throw new Error('Error uploading file');
            }
            res.status(constants_1.STATUS.OK).send({
                message: 'File uploaded successfully',
                success: true,
                data: result
            });
        });
    }
}
exports.default = new FileController();
