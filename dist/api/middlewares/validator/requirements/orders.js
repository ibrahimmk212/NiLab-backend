"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const mongoose_1 = require("mongoose");
const orderRequirement = {
    createOrder: [
        (0, express_validator_1.body)('products')
            .isArray({ min: 1 })
            .withMessage('At least 1 item is required!'),
        (0, express_validator_1.body)('amount').isNumeric(),
        (0, express_validator_1.body)('deliveryFee').isNumeric(),
        (0, express_validator_1.body)('serviceFee').isNumeric(),
        (0, express_validator_1.body)('vat').isNumeric(),
        (0, express_validator_1.body)('vendor').isString(),
        (0, express_validator_1.body)('paymentType')
            .isString()
            .withMessage('Please select mode of payment'),
        (0, express_validator_1.body)('deliveryAddress').isString(),
        (0, express_validator_1.body)('deliveryLocation')
            .isArray({ min: 2, max: 2 })
            .withMessage('Both longitude and latitude are required')
    ],
    getOrderDetail: [
        (0, express_validator_1.param)('orderId', 'Invalid order ID').custom((value) => {
            return (0, mongoose_1.isValidObjectId)(value);
        })
    ],
    confirmOrCancleOrder: [
        (0, express_validator_1.param)('orderId', 'Invalid order ID').custom((value) => {
            return (0, mongoose_1.isValidObjectId)(value);
        }),
        (0, express_validator_1.body)('status')
            .isString()
            // .contains(['delivered', 'canceled'], { ignoreCase: false })
            .withMessage('Invalid status, you can only cancel or confirm order')
    ],
    updateStatus: [(0, express_validator_1.param)('id').isInt(), (0, express_validator_1.body)('status').isString()]
};
exports.default = orderRequirement;
