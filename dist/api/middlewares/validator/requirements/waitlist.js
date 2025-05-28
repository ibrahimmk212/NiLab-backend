"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const waitlistRequirement = {
    createWaitlist: [
        (0, express_validator_1.body)('firstname').isString(),
        (0, express_validator_1.body)('lastname').isString(),
        (0, express_validator_1.body)('email').isEmail(),
        (0, express_validator_1.body)('phone').isString(),
        (0, express_validator_1.body)('state').isString()
    ],
};
exports.default = waitlistRequirement;
