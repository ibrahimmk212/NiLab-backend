/* eslint-disable @typescript-eslint/no-explicit-any */
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
        } catch (err: any) {
            console.log('JWT Error:', err.name, err.message);
            if (err.name === 'TokenExpiredError') {
                return res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Token expired'
                });
            }
            if (err.name === 'JsonWebTokenError') {
                return res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Invalid token'
                });
            }
            return res.status(STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Authentication failed'
            });
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
        } catch (err: any) {
            console.log('JWT Error:', err.name, err.message);
            if (err.name === 'TokenExpiredError') {
                return res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Token expired'
                });
            }
            if (err.name === 'JsonWebTokenError') {
                return res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Invalid token'
                });
            }
            return res.status(STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Authentication failed'
            });
        }
    }

    async isSuperAdmin(
        req: Request | any,
        res: Response,
        next: NextFunction
    ): Promise<any> {
        const admin = req.admin;
        if (!admin || admin.role !== 'superadmin') {
            return res.status(STATUS.FORBIDDEN).json({
                success: false,
                message: 'Access denied: Superadmin privileges required'
            });
        }
        next();
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

            req.userdata = userdata;

            // Case 1: Primary Vendor Owner
            if (userdata.role === ROLE.VENDOR) {
                const vendor = await VendorRepository.findByKey(
                    'userId',
                    userdata.id
                );
                if (!vendor) {
                    return res.status(STATUS.UNAUTHORIZED).json({
                        success: false,
                        message: 'Vendor record not found'
                    });
                }
                req.vendor = vendor;
                return next();
            }

            // Case 2: Vendor Staff
            if (userdata.role === 'staff') {
                const { default: StaffModel } = await import(
                    '../../models/Staff'
                );
                const staff = await StaffModel.findOne({
                    user: userdata.id
                }).populate('vendor');

                if (!staff) {
                    return res.status(STATUS.UNAUTHORIZED).json({
                        success: false,
                        message: 'Staff record not found'
                    });
                }

                if (staff.status === 'suspended') {
                    return res.status(STATUS.FORBIDDEN).json({
                        success: false,
                        message: 'Your staff account has been suspended'
                    });
                }

                req.staff = staff;
                req.vendor = staff.vendor; // Attach the associated vendor
                return next();
            }

            return res.status(STATUS.FORBIDDEN).json({
                success: false,
                message: 'Access denied: You are not a Vendor or Staff member'
            });
        } catch (err: any) {
            console.log('JWT Error:', err.name, err.message);
            return res.status(STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Authentication failed'
            });
        }
    }

    async vendorLocationIsSet(
        req: Request | any,
        res: Response,
        next: NextFunction
    ): Promise<any> {
        const vendor = req.vendor;

        if (!vendor) {
            return res.status(STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        if (
            !vendor.location ||
            !vendor.location.coordinates ||
            vendor.location.coordinates.length !== 2
        ) {
            return res.status(STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Vendor location not set',
                code: 'VENDOR_LOCATION_NOT_SET'
            });
        }

        next();
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
        } catch (err: any) {
            console.log('JWT Error:', err.name, err.message);
            if (err.name === 'TokenExpiredError') {
                return res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Token expired'
                });
            }
            if (err.name === 'JsonWebTokenError') {
                return res.status(STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Invalid token'
                });
            }
            return res.status(STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Authentication failed'
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
                return res.status(STATUS.FORBIDDEN).json({
                    success: false,
                    message: 'Permission denied: Invalid role'
                });
            }
            next();
        };
    }

    checkPermissions(...requiredPermissions: string[]) {
        return async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ) => {
            const admin = req.admin;
            const staff = req.staff;

            // 1. Superadmin has all permissions
            if (admin && admin.role === 'superadmin') {
                return next();
            }

            // 2. Combine permissions from admin or staff records
            const userPermissions = [
                ...(admin?.permissions || []),
                ...(staff?.permissions || [])
            ];

            // 3. Check if any of the required permissions are present
            // (Or all, depending on required logic. Usually "any" is sufficient for route gating)
            const hasPermission = requiredPermissions.every((p) =>
                userPermissions.includes(p)
            );

            if (!hasPermission) {
                return res.status(STATUS.FORBIDDEN).json({
                    success: false,
                    message: 'Permission denied: Insufficient privileges',
                    required: requiredPermissions
                });
            }

            next();
        };
    }
}

export default new Auth();
