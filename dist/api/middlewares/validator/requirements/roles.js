"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const rolesRequirement = {
    createRole: [
        (0, express_validator_1.body)('name').isString(),
        (0, express_validator_1.body)('description').isString().optional({ nullable: true })
    ]
};
exports.default = rolesRequirement;
