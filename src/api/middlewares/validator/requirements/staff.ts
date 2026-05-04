import { body, param } from 'express-validator';

const staffRequirement = {
    createStaff: [
        body('email').isEmail(),
        body('phoneNumber').isString().isLength({ min: 11 }),
        body('firstName').isString().isLength({ min: 1 }),
        body('lastName').isString().optional({ nullable: true }),
        body('role').isString().optional({ nullable: true }),
        body('permissions').isArray().optional({ nullable: true })
    ],
    getStaffDetail: [param('id').isMongoId()],
    updateStaff: [
        param('id').isMongoId(),
        body('firstName').isString().optional().isLength({ min: 1 }),
        body('lastName').isString().optional({ nullable: true }),
        body('role').isString().optional({ nullable: true }),
        body('permissions').isArray().optional({ nullable: true }),
        body('status').isString().optional({ nullable: true })
    ],
    deleteStaff: [param('id').isMongoId()]
};

export default staffRequirement;
