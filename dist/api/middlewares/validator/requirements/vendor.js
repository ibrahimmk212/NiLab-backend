"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const vendorRequirement = {
    create: [
        (0, express_validator_1.body)('name').isString(),
        (0, express_validator_1.body)('email').isEmail(),
        (0, express_validator_1.body)('phone').isString().isLength({ min: 11 }),
        (0, express_validator_1.body)('address').isString().optional({ nullable: true }),
        (0, express_validator_1.body)('description').isString().optional({ nullable: true }),
        (0, express_validator_1.body)('logo').isString().optional({ nullable: true }),
        (0, express_validator_1.body)('banner').isString().optional({ nullable: true })
    ],
    onboard: [
        (0, express_validator_1.body)('name').isString(),
        (0, express_validator_1.body)('email').isEmail(),
        (0, express_validator_1.body)('phone').isString().isLength({ min: 11 }),
        (0, express_validator_1.body)('address').isString().optional({ nullable: true }),
        (0, express_validator_1.body)('description').isString().optional({ nullable: true }),
        (0, express_validator_1.body)('logo').isString().optional({ nullable: true }),
        (0, express_validator_1.body)('banner').isString().optional({ nullable: true }),
        // body('password').isString().isLength({ min: 6 }),
        (0, express_validator_1.body)('managerFirstName').isString().isLength({ min: 1 }),
        (0, express_validator_1.body)('managerLastName').isString().optional({ nullable: true }),
        (0, express_validator_1.body)('managerEmail').isEmail(),
        (0, express_validator_1.body)('managerPhone').isString().isLength({ min: 11 }),
        (0, express_validator_1.body)('lat').isNumeric().optional({ nullable: true }),
        (0, express_validator_1.body)('lng').isNumeric().optional({ nullable: true })
    ],
    getUserDetail: [(0, express_validator_1.param)('id').isInt()],
    update: [
        (0, express_validator_1.param)('id').isString(),
        (0, express_validator_1.body)('name').isString(),
        // body('email').isEmail(),
        // body('phone').isString().isLength({ min: 11 }),
        (0, express_validator_1.body)('address').isString().optional({ nullable: true }),
        (0, express_validator_1.body)('description').isString().optional({ nullable: true }),
        (0, express_validator_1.body)('logo').isString().optional({ nullable: true }),
        (0, express_validator_1.body)('banner').isString().optional({ nullable: true }),
        (0, express_validator_1.body)('lat').isNumeric().optional({ nullable: true }),
        (0, express_validator_1.body)('lng').isNumeric().optional({ nullable: true }),
        (0, express_validator_1.body)('status').isString().optional({ nullable: true })
    ],
    updateBank: [
        // param('id').isString(),
        (0, express_validator_1.body)('accountName').isString(),
        (0, express_validator_1.body)('accountNumber').isString().isLength({ min: 10 }),
        (0, express_validator_1.body)('bankName').isString()
    ],
    updateStatus: [(0, express_validator_1.param)('id').isString(), (0, express_validator_1.body)('status').isString()],
    deleteUser: [(0, express_validator_1.param)('id').isInt()]
};
exports.default = vendorRequirement;
