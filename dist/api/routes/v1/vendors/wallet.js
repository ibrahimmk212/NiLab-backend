"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const VendorWalletController_1 = __importDefault(require("../../../controllers/vendors/VendorWalletController"));
const vendorWalletRouter = (0, express_1.Router)();
vendorWalletRouter.get('/', VendorWalletController_1.default.get);
exports.default = vendorWalletRouter;
