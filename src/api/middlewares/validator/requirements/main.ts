import { body } from 'express-validator';

const mainRequirement = {
    emailVerify: [
        body('email')
            .isString()
            .matches(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )
    ],

    otp: [body('otp').isString().isLength({ min: 4 })],

    signup: [
        body('password').isString().isLength({ min: 5 }),
        body('phoneNumber').isString().isLength({ min: 11, max: 13 }),
        body('firstName').isString().isLength({ min: 1 }),
        body('lastName').isString().optional({ nullable: true }),
        body('gender').isString().optional({ nullable: true }),
        body('promotionCode').isString().optional({ nullable: true }),
        body('token').isString()
    ],

    riderSignup: [
        body('password').isString().isLength({ min: 5 }),
        body('phoneNumber').isString().isLength({ min: 11, max: 13 }),
        body('firstName').isString().isLength({ min: 1 }),
        body('lastName').isString().optional({ nullable: true }),
        body('gender').isString().optional({ nullable: true }),
        body('city').isString().optional(),
        body('vehicle').isString().optional(),
        body('token').isString()
    ],

    login: [
        body('email').isString(),
        body('password').isString().isLength({ min: 5 })
    ],

    forgotPassword: [body('email').isEmail().optional()],

    setPin: [body('pin').isString().isLength({ min: 4 })],

    resetPassword: [
        body('password').isString().isLength({ min: 5 }),
        body('token').isString()
    ]
};

export default mainRequirement;
