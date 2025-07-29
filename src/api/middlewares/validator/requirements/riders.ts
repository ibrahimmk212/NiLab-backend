import { body, param } from 'express-validator';

const ridersRequirement = {
    getUserDetail: [param('id').isInt()],
    update: [
        param('id').isString(),
        body('name').isString().optional(),
        body('vehicle').isString().optional(),
        body('city').isString().optional(),
        body('availability').isString().optional()
        // body('status').isString().optional()
    ],
    updateBank: [
        // param('id').isString(),
        body('accountName').isString(),
        body('accountNumber').isString().isLength({ min: 10 }),
        body('bankName').isString()
    ],
    updateStatus: [param('id').isString(), body('status').isString()],
    deleteUser: [param('id').isString()]
};

export default ridersRequirement;
