import { body, param } from 'express-validator';

const waitlistRequirement = {
    createWaitlist: [
        body('firstname').isString(),
        body('lastname').isString(),
        body('email').isEmail(),
        body('phone').isString(),
        body('state').isString()
    ],


};

export default waitlistRequirement;
