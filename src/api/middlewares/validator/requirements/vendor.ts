import { body, param } from 'express-validator';

const vendorRequirement = {
    create: [
        body('name').isString(),
        body('email').isEmail(),
        body('phone').isString().isLength({ min: 11 }),
        body('address').isString().optional({ nullable: true }),
        body('description').isString().optional({ nullable: true }),
        body('logo').isString().optional({ nullable: true }),
        body('banner').isString().optional({ nullable: true })
    ],
    onboard: [
        body('name').isString(),
        body('email').isEmail(),
        body('phone').isString().isLength({ min: 11 }),
        body('address').isString().optional({ nullable: true }),
        body('description').isString().optional({ nullable: true }),
        body('logo').isString().optional({ nullable: true }),
        body('banner').isString().optional({ nullable: true }),
        // body('password').isString().isLength({ min: 6 }),
        body('managerFirstName').isString().isLength({ min: 1 }),
        body('managerLastName').isString().optional({ nullable: true }),
        body('managerEmail').isEmail(),
        body('managerPhone').isString().isLength({ min: 11 }),
        body('lat').isNumeric().optional({ nullable: true }),
        body('lng').isNumeric().optional({ nullable: true })
    ],
    getUserDetail: [param('id').isInt()],
    update: [
        // param('id').isString(),
        body('name').isString().optional({ nullable: true }),
        // body('email').isEmail(),
        // body('phone').isString().isLength({ min: 11 }),
        body('address').isString().optional({ nullable: true }),
        body('description').isString().optional({ nullable: true }),
        body('logo').isString().optional({ nullable: true }),
        body('banner').isString().optional({ nullable: true }),
        body('lat').isNumeric().optional({ nullable: true }),
        body('lng').isNumeric().optional({ nullable: true }),
        body('status').isString().optional({ nullable: true })
    ],
    updateBank: [
        // param('id').isString(),
        body('accountName').isString(),
        body('accountNumber').isString().isLength({ min: 10 }),
        body('bankName').isString()
    ],
    updateStatus: [param('id').isString(), body('status').isString()],
    deleteUser: [param('id').isInt()]
};

export default vendorRequirement;
