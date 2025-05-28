"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const mongoose_1 = require("mongoose");
const customerProfileRequirement = {
    updateProfile: [
        (0, express_validator_1.body)('phoneNumber').isString().isLength({ min: 11, max: 13 }),
        (0, express_validator_1.body)('firstName').isString().isLength({ min: 1 }),
        (0, express_validator_1.body)('lastName').isString().optional({ nullable: true }),
        (0, express_validator_1.body)('token').isString()
    ],
    updatePassword: [
        (0, express_validator_1.body)('currentPassword').isString().isLength({ min: 5 }),
        (0, express_validator_1.body)('newPassword').isString().isLength({ min: 5 })
    ],
    addNewAddress: [
        (0, express_validator_1.body)('coordinates')
            .isArray()
            .notEmpty()
            .withMessage('Invalid coordinates'),
        (0, express_validator_1.body)('street').isString().withMessage('Street is required'),
        (0, express_validator_1.body)('city').isString().withMessage('City is required'),
        (0, express_validator_1.body)('state').isString().withMessage('State is required'),
        (0, express_validator_1.body)('postcode').isString().optional(),
        (0, express_validator_1.body)('buildingNumber')
            .isString()
            .withMessage('Building number is required'),
        (0, express_validator_1.body)('label').isString().withMessage('Label is required'),
        (0, express_validator_1.body)('default').isBoolean().optional().default(false)
    ],
    updateAddress: [
        (0, express_validator_1.param)('addressId', 'Invalid adress ID').custom((value) => {
            return (0, mongoose_1.isValidObjectId)(value);
        }),
        (0, express_validator_1.body)('coordinates')
            .isArray()
            .notEmpty()
            .withMessage('Invalid coordinates'),
        (0, express_validator_1.body)('street').isString().withMessage('Street is required'),
        (0, express_validator_1.body)('city').isString().withMessage('City is required'),
        (0, express_validator_1.body)('state').isString().withMessage('State is required'),
        (0, express_validator_1.body)('postcode').isString().optional(),
        (0, express_validator_1.body)('buildingNumber')
            .isString()
            .withMessage('Building number is required'),
        (0, express_validator_1.body)('label').isString().withMessage('Label is required'),
        (0, express_validator_1.body)('default').isBoolean().optional().default(false)
    ],
    deleteAddress: [
        (0, express_validator_1.param)('addressId', 'Invalid address ID').custom((value) => {
            return (0, mongoose_1.isValidObjectId)(value);
        })
    ],
    updateEmail: [
        (0, express_validator_1.body)('email')
            .isString()
            .matches(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
    ],
    otp: [(0, express_validator_1.body)('otp').isString().isLength({ min: 4 })],
    login: [
        (0, express_validator_1.body)('phone').isString(),
        (0, express_validator_1.body)('password').isString().isLength({ min: 5 })
    ],
    setPin: [(0, express_validator_1.body)('pin').isString().isLength({ min: 4 })]
};
exports.default = customerProfileRequirement;
