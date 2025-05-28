"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validate = exports.Requirements = void 0;
const express_validator_1 = require("express-validator");
const requirements_1 = __importDefault(require("./requirements"));
exports.Requirements = requirements_1.default;
const Validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map((validation) => validation.run(req)));
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        let errorMessage = '';
        errors.array().forEach((error) => {
            errorMessage += ' ' + error.msg + ' "' + error.param + '", ';
        });
        res.status(400).json({
            success: false,
            message: 'Validation Error! ' + errorMessage,
            errors: errors.array()
        });
    };
};
exports.Validate = Validate;
