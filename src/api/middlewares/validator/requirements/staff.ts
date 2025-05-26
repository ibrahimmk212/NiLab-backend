import { body, param } from 'express-validator';

const staffRequirement = {
    createStaff: [
        body('email').isEmail(),
        body('phoneNumber').isString().isLength({ min: 11 }),
        body('password').isString().isLength({ min: 5 }),
        body('firstName').isString().isLength({ min: 1 }),
        body('lastName').isString().optional({ nullable: true }),
        body('role').isString().optional({ nullable: true })
    ],
    getStaffDetail: [param('id').isInt()],
    updateStaff: [
        param('id').isInt(),
        body('firstName').isString().optional().isLength({ min: 1 }),
        body('lastName').isString().optional({ nullable: true }),
        body('role').isInt().optional({ nullable: true })
    ],
    deleteStaff: [param('id').isInt()]
};

export default staffRequirement;
