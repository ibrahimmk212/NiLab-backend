"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appConfig_1 = __importDefault(require("../../../config/appConfig"));
const logger_1 = __importDefault(require("../../../utils/logger"));
function errorHandler(err, req, res, next) {
    const response = { success: false };
    if (err.message) {
        const logs = {
            type: err.name,
            message: err.message,
            method: req.method,
            path: req.path,
            params: req.route.path,
            body: req.body,
            query: req.query,
            stack: err.stack
        };
        logger_1.default.error(JSON.stringify(logs));
        response.message = appConfig_1.default.app.isDevelopment
            ? err.message
            : 'Something wrong!';
    }
    res.status(422).send(response);
}
exports.default = errorHandler;
