"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const WaitListController_1 = __importDefault(require("../../../controllers/public/WaitListController"));
const waitlist_1 = __importDefault(require("../../../middlewares/validator/requirements/waitlist"));
const validator_1 = require("../../../middlewares/validator");
const waitlistRouter = (0, express_1.Router)();
waitlistRouter.post('/', (0, validator_1.Validate)(waitlist_1.default.createWaitlist), WaitListController_1.default.create);
exports.default = waitlistRouter;
