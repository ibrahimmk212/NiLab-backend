"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const staffRequirement = {
    createStaff: [
        (0, express_validator_1.body)('email').isEmail(),
        (0, express_validator_1.body)('phoneNumber').isString().isLength({ min: 11 }),
        (0, express_validator_1.body)('password').isString().isLength({ min: 5 }),
        (0, express_validator_1.body)('firstName').isString().isLength({ min: 1 }),
        (0, express_validator_1.body)('lastName').isString().optional({ nullable: true }),
        (0, express_validator_1.body)('role').isString().optional({ nullable: true })
    ],
    getStaffDetail: [(0, express_validator_1.param)('id').isInt()],
    updateStaff: [
        (0, express_validator_1.param)('id').isInt(),
        (0, express_validator_1.body)('firstName').isString().optional().isLength({ min: 1 }),
        (0, express_validator_1.body)('lastName').isString().optional({ nullable: true }),
        (0, express_validator_1.body)('role').isInt().optional({ nullable: true })
    ],
    deleteStaff: [(0, express_validator_1.param)('id').isInt()]
};
exports.default = staffRequirement;
