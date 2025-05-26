import { NextFunction, Request, Response } from 'express';
import JWT from '../../../utils/jwt';
import UserRepository from '../../repositories/UserRepository';
import { ROLE, STATUS } from '../../../constants';
import VendorRepository from '../../repositories/VendorRepository';

class Auth {
    async authenticate(
        req: Request | any,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const authorization = String(req.headers.authorization);
        if (!authorization || !authorization.includes('Bearer')) {
            res.status(STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Provide a token'
            });
            return;
        }

        const token = authorization?.slice(7);
        try {
            const payload = await JWT.verifyToken(token);

            if (!payload) {
                res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'invalid Token'
                });
                return;
            }

            const userId: string = payload.id;
            const userdata = await UserRepository.findUserById(userId);

            if (!userdata) {
                res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Account not found'
                });
                return;
            }
            // TODO check if account is active
            req.userdata = userdata;

            next();
        } catch (err) {
            console.log(err);
            throw Error(`Invalid Token`);
        }
    }
    async isAdmin(
        req: Request | any,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const authorization = String(req.headers.authorization);
        if (!authorization || !authorization.includes('Bearer')) {
            res.status(STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Provide a token'
            });
            return;
        }
        const token = authorization?.slice(7);
        try {
            const payload = await JWT.verifyToken(token);

            if (!payload) {
                res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'invalid Token'
                });
                return;
            }

            const userId: string = payload.id;
            const userdata = await UserRepository.findUserById(userId);

            if (!userdata) {
                res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Account not found'
                });
                return;
            }
            if (userdata.role != ROLE.ADMIN) {
                res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'This is not an Admin Account'
                });
                return;
            }
            // TODO check if account is active
            req.userdata = userdata;

            next();
        } catch (e: any) {
            res.status(STATUS.UNAUTHORIZED).json({
                success: false,
                message: e?.message
            });
            return;
        }
    }
    async isVendor(
        req: Request | any,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const authorization = String(req.headers.authorization);
        if (!authorization || !authorization.includes('Bearer')) {
            res.status(STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Provide a token'
            });
            return;
        }
        try {
            const token = authorization?.slice(7);
            const payload = await JWT.verifyToken(token);

            if (!payload) {
                res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'invalid Token'
                });
                return;
            }

            const userId: string = payload.id;
            const userdata = await UserRepository.findUserById(userId);

            if (!userdata) {
                res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Account not found'
                });
                return;
            }
            if (userdata.role != ROLE.VENDOR) {
                res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'This is not a Vendor Account'
                });
                return;
            }
            //Get vendor by user
            const vendor = await VendorRepository.findByKey(
                'userId',
                userdata.id
            );
            if (!vendor) {
                res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Invalid Vendor'
                });
                return;
            }
            if (vendor.status != 'active') {
                res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Vendor Not Active'
                });
                return;
            }

            req.userdata = userdata;
            req.vendor = vendor;
            next();
        } catch (e: any) {
            res.status(STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Error validating vendor'
            });
            return;
        }
    }
    checkRoles(...roles: string[]) {
        return async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ) => {
            const userdata = req.userdata;

            const roleUser = userdata.role;
            if (!roleUser) {
                res.sendStatus(403);
                return;
            }

            const isRoleValid = roles.includes(roleUser);
            if (!isRoleValid) {
                res.sendStatus(403);
                return;
            }
            next();
        };
    }
}

export default new Auth();
