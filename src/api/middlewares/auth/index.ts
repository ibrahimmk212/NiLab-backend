import { NextFunction, Request, Response } from 'express';
import JWT from '../../../utils/jwt';
import UserRepository from '../../repositories/UserRepository';
import { ROLE, STATUS } from '../../../constants';
import VendorRepository from '../../repositories/VendorRepository';
import RiderRepository from '../../repositories/RiderRepository';
import AdminService from '../../services/AdminService';

class Auth {
    async authenticate(
        req: Request | any,
        res: Response,
        next: NextFunction
    ): Promise<any> {
        const authorization = String(req.headers.authorization);
        if (!authorization || !authorization.includes('Bearer')) {
            return res.status(STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Provide a token'
            });
        }

        const token = authorization?.slice(7);
        try {
            const payload = await JWT.verifyToken(token);

            if (!payload) {
                return res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'invalid Token'
                });
            }

            const userId: string = payload.id;
            const userdata = await UserRepository.findUserById(userId);

            if (!userdata) {
                return res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Account not found'
                });
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
    ): Promise<any> {
        const authorization = String(req.headers.authorization);
        if (!authorization || !authorization.includes('Bearer')) {
            return res.status(STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Provide a token'
            });
        }
        const token = authorization?.slice(7);
        try {
            const payload = await JWT.verifyToken(token);

            if (!payload) {
                return res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'invalid Token'
                });
            }

            const userId: string = payload.id;
            const userdata = await UserRepository.findUserById(userId);

            if (!userdata) {
                return res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Account not found'
                });
            }
            if (userdata.role != ROLE.ADMIN) {
                return res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'This is not an Admin Account'
                });
            }

            const admin = await AdminService.getByUserId(userdata.id);

            if (admin && admin.status == 'suspended') {
                return res.status(STATUS.FORBIDDEN).json({
                    success: false,
                    message: 'Your account has been suspended'
                });
            }
            req.userdata = userdata;
            req.admin = admin;

            next();
        } catch (e: any) {
            return res.status(STATUS.UNAUTHORIZED).json({
                success: false,
                message: e?.message
            });
        }
    }
    async isVendor(
        req: Request | any,
        res: Response,
        next: NextFunction
    ): Promise<any> {
        const authorization = String(req.headers.authorization);
        if (!authorization || !authorization.includes('Bearer')) {
            return res.status(STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Provide a token'
            });
        }
        try {
            const token = authorization?.slice(7);
            const payload = await JWT.verifyToken(token);

            if (!payload) {
                return res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'invalid Token'
                });
            }

            const userId: string = payload.id;
            const userdata = await UserRepository.findUserById(userId);

            if (!userdata) {
                return res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Account not found'
                });
            }
            if (userdata.role != ROLE.VENDOR) {
                return res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'This is not a Vendor Account'
                });
            }
            //Get vendor by user
            const vendor = await VendorRepository.findByKey(
                'userId',
                userdata.id
            );
            if (!vendor) {
                return res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Invalid Vendor'
                });
            }

            if (
                // req.path !== '/location' &&
                vendor.status != 'active'
            ) {
                return res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Vendor Not Active'
                });
            }

            req.userdata = userdata;
            req.vendor = vendor;
            next();
        } catch (e: any) {
            return res.status(STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Error validating vendor'
            });
        }
    }

    async isRider(
        req: Request | any,
        res: Response,
        next: NextFunction
    ): Promise<any> {
        const authorization = String(req.headers.authorization);
        if (!authorization || !authorization.includes('Bearer')) {
            return res.status(STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Provide a token'
            });
        }
        try {
            const token = authorization?.slice(7);
            const payload = await JWT.verifyToken(token);

            if (!payload) {
                return res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'invalid Token'
                });
            }

            const userId: string = payload.id;
            const userdata = await UserRepository.findUserById(userId);

            if (!userdata) {
                return res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Account not found'
                });
            }
            if (userdata.role != ROLE.RIDER) {
                return res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'This is not a rider Account'
                });
            }

            //Get rider by user
            const rider = await RiderRepository.findByKey(
                'userId',
                userdata.id
            );
            if (!rider) {
                return res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Invalid rider'
                });
            }
            if (rider.status == 'suspended') {
                return res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Your account is suspended'
                });
            }

            req.userdata = userdata;
            req.rider = rider;
            next();
        } catch (e: any) {
            return res.status(STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Error validating rider'
            });
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
                return res.sendStatus(STATUS.FORBIDDEN);
            }
            const isRoleValid = roles.includes(roleUser);
            if (!isRoleValid) {
                return res.sendStatus(STATUS.FORBIDDEN);
            }
            next();
        };
    }
}

export default new Auth();
