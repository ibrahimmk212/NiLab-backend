"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appConfig_1 = __importDefault(require("../../config/appConfig"));
const jwt = __importStar(require("jsonwebtoken"));
class JWT {
    signToken(userId, expires = '1d') {
        return new Promise((resolve, reject) => {
            jwt.sign({
                id: userId,
                iat: Date.now()
            }, appConfig_1.default.app.secret, {
                expiresIn: expires
            }, (err, token) => {
                if (err) {
                    reject(err);
                }
                resolve(token);
            });
        });
    }
    signTempToken(data, expires = '1d') {
        console.log(data);
        return new Promise((resolve, reject) => {
            jwt.sign(Object.assign(Object.assign({}, data), { iat: Date.now() }), appConfig_1.default.app.tempSecret + data.purpose, {
                expiresIn: expires
            }, (err, token) => {
                if (err) {
                    reject(err);
                }
                resolve(token);
            });
        });
    }
    verifyToken(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, appConfig_1.default.app.secret, (err, decoded) => {
                if (err) {
                    reject(err);
                }
                resolve(decoded);
            });
        });
    }
    verifyTempToken(token, purpose) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, appConfig_1.default.app.tempSecret + purpose, (err, decoded) => {
                if (err) {
                    reject(err);
                }
                resolve(decoded);
            });
        });
    }
}
exports.default = new JWT();
