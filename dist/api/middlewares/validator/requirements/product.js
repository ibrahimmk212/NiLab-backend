"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const productRequirement = {
    create: [
        (0, express_validator_1.body)('name').isString(),
        (0, express_validator_1.body)('price').isNumeric(),
        (0, express_validator_1.body)('available')
            .isBoolean()
            .optional({ nullable: true })
            .default({ default: true }),
        (0, express_validator_1.body)('description').isString().optional({ nullable: true }),
        // body('vendor').isString(),
        (0, express_validator_1.body)('category').isString().optional({ nullable: true }),
        (0, express_validator_1.body)('image').isArray().optional({ nullable: true }),
        (0, express_validator_1.body)('thumbnail').isString().optional({ nullable: true })
    ],
    createCategory: [
        (0, express_validator_1.body)('name').isString(),
        (0, express_validator_1.body)('description').isString().optional({ nullable: true })
        // body('vendor').isString(),
    ],
    getSingle: [(0, express_validator_1.param)('id').isInt()],
    update: [
        (0, express_validator_1.param)('id').isString(),
        (0, express_validator_1.body)('name').isString().optional({ nullable: true }),
        (0, express_validator_1.body)('price').isNumeric().optional({ nullable: true }),
        (0, express_validator_1.body)('available')
            .isBoolean()
            .optional({ nullable: true })
            .default({ default: true })
            .optional({ nullable: true }),
        (0, express_validator_1.body)('description').isString().optional({ nullable: true }),
        // body('vendor').isString(),
        (0, express_validator_1.body)('category').isString().optional({ nullable: true }),
        (0, express_validator_1.body)('image').isString().optional({ nullable: true }),
        // body('thumbnail').isString().optional({ nullable: true }),
        (0, express_validator_1.body)('status').isString().optional({ nullable: true })
    ],
    updateStatus: [(0, express_validator_1.param)('id').isString(), (0, express_validator_1.body)('status').isString()],
    deleteUser: [(0, express_validator_1.param)('id').isInt()]
};
exports.default = productRequirement;
