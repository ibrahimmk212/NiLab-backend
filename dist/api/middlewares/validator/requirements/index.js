"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = __importDefault(require("./main"));
const users_1 = __importDefault(require("./users"));
const roles_1 = __importDefault(require("./roles"));
const orders_1 = __importDefault(require("./orders"));
const customerProfile_1 = __importDefault(require("./customerProfile"));
exports.default = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, main_1.default), users_1.default), roles_1.default), orders_1.default), customerProfile_1.default);
