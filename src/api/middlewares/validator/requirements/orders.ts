import { body, param } from 'express-validator';
import { isValidObjectId } from 'mongoose';

const orderRequirement = {
    createOrder: [
        body('products')
            .isArray({ min: 1 })
            .withMessage('At least 1 item is required!'),
        body('amount').isNumeric(),
        body('deliveryFee').isNumeric(),
        body('serviceFee').isNumeric(),
        body('vat').isNumeric(),
        body('vendor').isString(),
        body('paymentType')
            .isString()
            .withMessage('Please select mode of payment'),
        body('deliveryAddress').isString(),
        body('deliveryLocation')
            .isArray({ min: 2, max: 2 })
            .withMessage('Both longitude and latitude are required')
    ],

    getOrderDetail: [
        param('orderId', 'Invalid order ID').custom((value) => {
            return isValidObjectId(value);
        })
    ],

    confirmOrCancleOrder: [
        param('orderId', 'Invalid order ID').custom((value) => {
            return isValidObjectId(value);
        }),
        body('status')
            .isString()
            // .contains(['delivered', 'canceled'], { ignoreCase: false })
            .withMessage('Invalid status, you can only cancel or confirm order')
    ],
    updateStatus: [param('id').isInt(), body('status').isString()]
};

export default orderRequirement;
