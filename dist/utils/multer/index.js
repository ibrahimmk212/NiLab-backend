"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const app = (0, express_1.default)();
// Create a multer instance for handling file uploads
const storage = multer_1.default.memoryStorage();
// Initialize the multer upload middleware
exports.upload = (0, multer_1.default)({
    storage: storage,
    // limits: { fileSize: 10 * 1024 * 1024 } // Maximum file size 10MB
}).single('file'); // 'file' should match the form data key
