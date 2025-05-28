"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const usersRequirement = {
    createUsers: [
        (0, express_validator_1.body)('email').isEmail(),
        (0, express_validator_1.body)('password').isString().isLength({ min: 5 }),
        (0, express_validator_1.body)('firstName').isString().isLength({ min: 1 }),
        (0, express_validator_1.body)('lastName').isString().optional({ nullable: true }),
        (0, express_validator_1.body)('roleId').isInt().optional({ nullable: true })
    ],
    getUserDetail: [(0, express_validator_1.param)('id').isInt()],
    updateUser: [
        (0, express_validator_1.param)('id').isInt(),
        (0, express_validator_1.body)('firstName').isString().optional().isLength({ min: 1 }),
        (0, express_validator_1.body)('lastName').isString().optional({ nullable: true }),
        (0, express_validator_1.body)('roleId').isInt().optional({ nullable: true })
    ],
    deleteUser: [(0, express_validator_1.param)('id').isInt()]
};
exports.default = usersRequirement;
