"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class HttpGateway {
    async get(data) {
        var _a;
        try {
            const resp = await axios_1.default.get(data.baseUrl, {
                headers: (_a = data.headers) !== null && _a !== void 0 ? _a : { 'Content-Type': 'application/json' }
            });
            return resp;
        }
        catch (error) {
            return handleError(error);
        }
    }
    async post(data) {
        var _a;
        try {
            const resp = await axios_1.default.post(data.baseUrl, data.body, {
                headers: (_a = data.headers) !== null && _a !== void 0 ? _a : { 'Content-Type': 'application/json' }
            });
            return resp;
        }
        catch (error) {
            return handleError(error);
        }
    }
    async delete(data) {
        var _a;
        try {
            const resp = await axios_1.default.delete(data.baseUrl, {
                headers: (_a = data.headers) !== null && _a !== void 0 ? _a : { 'Content-Type': 'application/json' }
            });
            return resp;
        }
        catch (error) {
            return handleError(error);
        }
    }
    async put(data) {
        var _a;
        try {
            const resp = await axios_1.default.put(`${data.baseUrl}`, data.body, {
                headers: (_a = data.headers) !== null && _a !== void 0 ? _a : { 'Content-Type': 'application/json' }
            });
            return resp;
        }
        catch (error) {
            return handleError(error);
        }
    }
}
// Generic error handler for axios requests
function handleError(error) {
    if (axios_1.default.isAxiosError(error)) {
        return new Error(error.message);
    }
    return new Error('An unknown error occurred');
}
exports.default = new HttpGateway();
