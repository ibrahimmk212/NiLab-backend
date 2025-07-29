import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import StaffService from '../../services/StaffService';
import UserService from '../../services/UserService';

class VendorStaffController {
    create = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor, body } = req;

            const user = await UserService.findByEmailOrPhone(
                body.email,
                body.phone
            );

            if (user) {
                throw Error('Account already exist');
            }

            const newUser = await UserService.createUser({
                ...body,
                role: 'staff'
            });
            const staff = await StaffService.createStaff({
                user: newUser.id,
                role: body.role,
                vendor: vendor.id
            });

            if (!staff) {
                throw Error('Failed to create Product');
            }
            res.status(STATUS.CREATED).json({
                success: true,
                message: 'Staff Created',
                data: vendor
            });
        }
    );
    getAll = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor } = req;
            const staffs = await StaffService.findAllByKey('vendor', vendor.id);

            res.status(STATUS.OK).json({
                success: true,
                message: 'STaff Feteched',
                data: staffs
            });
        }
    );
    getSingle = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { id } = req.params;
            const { vendor } = req;
            const staffs = await StaffService.findById(id);

            res.status(STATUS.OK).json({
                success: true,
                message: 'STaff Feteched',
                data: staffs
            });
        }
    );

    update = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor, body, params } = req;
            const { id } = params;

            // res.json(vendor)
            throw Error('Failed to update staff');
        }
    );
}

export default new VendorStaffController();
