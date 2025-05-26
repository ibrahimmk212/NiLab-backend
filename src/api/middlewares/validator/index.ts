import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import requirements from './requirements';

export const Requirements = requirements;

export const Validate = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        await Promise.all(validations.map((validation) => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        let errorMessage = '';

        errors.array().forEach((error: any) => {
            errorMessage += ' ' + error.msg + ' "' + error.param + '", ';
        });

        res.status(400).json({
            success: false,
            message: 'Validation Error! ' + errorMessage,
            errors: errors.array()
        });
    };
};
