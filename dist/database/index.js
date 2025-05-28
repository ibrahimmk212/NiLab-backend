"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
const appConfig_1 = __importDefault(require("../config/appConfig"));
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = () => {
    mongoose_1.default.set('strictQuery', false);
    mongoose_1.default.set('strictPopulate', false);
    mongoose_1.default
        .connect(appConfig_1.default.db.mongo_url)
        .then((conn) => {
        logger_1.default.debug(`Database connected:${conn.connection.host}`);
    })
        .catch((err) => {
        logger_1.default.error(err);
    });
};
exports.default = connectDB;
