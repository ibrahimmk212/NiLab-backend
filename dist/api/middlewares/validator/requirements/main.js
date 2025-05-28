"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const mainRequirement = {
    emailVerify: [
        (0, express_validator_1.body)('email')
            .isString()
            .matches(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
    ],
    otp: [(0, express_validator_1.body)('otp').isString().isLength({ min: 4 })],
    signup: [
        (0, express_validator_1.body)('password').isString().isLength({ min: 5 }),
        (0, express_validator_1.body)('firstName').isString().isLength({ min: 1 }),
        (0, express_validator_1.body)('lastName').isString().optional({ nullable: true }),
        (0, express_validator_1.body)('token').isString()
    ],
    login: [
        (0, express_validator_1.body)('email').isString(),
        (0, express_validator_1.body)('password').isString().isLength({ min: 5 })
    ],
    forgotPassword: [(0, express_validator_1.body)('email').isEmail().optional()],
    setPin: [(0, express_validator_1.body)('pin').isString().isLength({ min: 4 })],
    resetPassword: [
        (0, express_validator_1.body)('password').isString().isLength({ min: 5 }),
        (0, express_validator_1.body)('token').isString()
    ]
};
exports.default = mainRequirement;
