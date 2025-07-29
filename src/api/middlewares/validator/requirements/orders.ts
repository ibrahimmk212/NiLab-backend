import { body, param } from 'express-validator';
import { isValidObjectId } from 'mongoose';

const orderRequirement = {
    createOrder: [
        body('products')
            .isArray({ min: 1 })
            .withMessage('At least 1 item is required!'),
        body('amount').isNumeric(),
        body('deliveryFee').isNumeric().optional(),
        body('serviceFee').isNumeric().optional(),
        body('vat').isNumeric().optional(),
        body('distance').isNumeric().optional(),
        body('vendor').isString(),
        body('paymentType')
            .isString()
            .withMessage('Please select mode of payment'),
        body('addressId').isString()
        // body('deliveryLocation')
        //     .isArray({ min: 2, max: 2 })
        //     .withMessage('Both longitude and latitude are required')
    ],
    createPackageOrder: [
        body('package').isObject(),
        body('deliveryFee').isNumeric().optional(),
        body('serviceFee').isNumeric().optional(),
        body('vat').isNumeric().optional(),
        body('distance').isNumeric().optional(),
        body('paymentType')
            .isString()
            .withMessage('Please select mode of payment'),
        body('pickup').isObject(),
        body('destination').isObject(),
        body('senderDetails').isObject(),
        body('receiverDetails').isObject()
        // body('pickupTime').isString()
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
    updateStatus: [param('id').isString(), body('status').isString()]
};

export default orderRequirement;
