import { body, param } from 'express-validator';
import { isValidObjectId } from 'mongoose';

const customerProfileRequirement = {
    updateProfile: [
        body('phoneNumber').isString().isLength({ min: 11, max: 13 }),
        body('firstName').isString().isLength({ min: 1 }),
        body('lastName').isString().optional({ nullable: true }),
        body('token').isString()
    ],

    updatePassword: [
        body('currentPassword').isString().isLength({ min: 5 }),
        body('newPassword').isString().isLength({ min: 5 })
    ],

    addNewAddress: [
        body('coordinates')
            .isArray()
            .notEmpty()
            .withMessage('Invalid coordinates'),
        body('street').isString().withMessage('Street is required'),
        body('city').isString().withMessage('City is required'),
        body('state').isString().withMessage('State is required'),
        body('postcode').isString().optional(),
        body('buildingNumber')
            .isString()
            .withMessage('Building number is required'),
        body('label').isString().withMessage('Label is required'),
        body('default').isBoolean().optional().default(false)
    ],

    updateAddress: [
        param('addressId', 'Invalid adress ID').custom((value) => {
            return isValidObjectId(value);
        }),
        body('coordinates')
            .isArray()
            .notEmpty()
            .withMessage('Invalid coordinates'),
        body('street').isString().withMessage('Street is required'),
        body('city').isString().withMessage('City is required'),
        body('state').isString().withMessage('State is required'),
        body('postcode').isString().optional(),
        body('buildingNumber')
            .isString()
            .withMessage('Building number is required'),
        body('label').isString().withMessage('Label is required'),
        body('default').isBoolean().optional().default(false)
    ],

    deleteAddress: [
        param('addressId', 'Invalid address ID').custom((value) => {
            return isValidObjectId(value);
        })
    ],
    updateEmail: [
        body('email')
            .isString()
            .matches(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )
    ],

    otp: [body('otp').isString().isLength({ min: 4 })],

    login: [
        body('phone').isString(),
        body('password').isString().isLength({ min: 5 })
    ],

    setPin: [body('pin').isString().isLength({ min: 4 })]
};

export default customerProfileRequirement;
