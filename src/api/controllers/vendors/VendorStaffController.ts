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
                body.phoneNumber
            );

            if (user) {
                throw Error('Account already exists');
            }

            // Auto-generate a temporary password for the invitation flow
            const tempPassword =
                Math.random().toString(36).slice(-8) +
                Math.random().toString(36).slice(-8).toUpperCase() +
                '!';

            const newUser = await UserService.createUser({
                ...body,
                password: tempPassword,
                role: 'staff'
            });

            const staff = await StaffService.createStaff({
                user: newUser.id,
                role: body.role || 'staff',
                permissions: body.permissions || [],
                vendor: vendor.id
            });

            if (!staff) {
                throw Error('Failed to create staff');
            }

            res.status(STATUS.CREATED).json({
                success: true,
                message: 'Staff invited successfully',
                data: staff
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
            const { body, params } = req;
            const { id } = params;

            const updatedStaff = await StaffService.updateStaff(id, body);

            res.status(STATUS.OK).json({
                success: true,
                message: 'Staff Updated Successfully',
                data: updatedStaff
            });
        }
    );

    delete = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { params } = req;
            const { id } = params;

            await StaffService.deleteStaff(id);

            res.status(STATUS.OK).json({
                success: true,
                message: 'Staff Deleted Successfully'
            });
        }
    );
}

export default new VendorStaffController();
