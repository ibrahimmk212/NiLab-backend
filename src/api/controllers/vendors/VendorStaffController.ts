import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import StaffService from '../../services/StaffService';
import UserService from '../../services/UserService';
import StaffModel from '../../models/Staff';
import EmailTemplate from '../../libraries/emails';
import appConfig from '../../../config/appConfig';

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
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                phoneNumber: body.phoneNumber,
                password: tempPassword,
                role: body.role || 'staff',
                mustChangePassword: true
            } as any);

            const staff = await StaffService.createStaff({
                user: newUser._id,
                name: `${newUser.firstName} ${newUser.lastName}`,
                email: newUser.email,
                role: body.role || 'staff',
                permissions: body.permissions || [],
                vendor: vendor._id
            });

            if (!staff) {
                throw Error('Failed to create staff');
            }

            // Notify staff member via email
            try {
                const loginUrl = `${appConfig.app.frontendUrl}/login`;
                await EmailTemplate.staffWelcome(newUser.email, {
                    staffName: newUser.firstName,
                    email: newUser.email,
                    temporaryPassword: tempPassword,
                    loginUrl,
                    vendorName: vendor.name
                } as any);
            } catch (emailErr) {
                console.error('Failed to send staff welcome email:', emailErr);
            }

            res.status(STATUS.CREATED).json({
                success: true,
                message: 'Staff added successfully',
                data: staff,
                tempPassword // Share this with the vendor
            });
        }
    );
    getAll = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor, query } = req;
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            const search = query.search || '';

            const skip = (page - 1) * limit;
            const filter: any = { vendor: vendor._id };

            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }

            const [staffs, total] = await Promise.all([
                StaffModel.find(filter)
                    .populate('user')
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 }),
                StaffModel.countDocuments(filter)
            ]);

            res.status(STATUS.OK).json({
                success: true,
                message: 'Staff fetched successfully',
                data: staffs,
                total,
                page,
                limit
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
