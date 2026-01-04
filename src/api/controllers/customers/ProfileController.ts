/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import UserService from '../../services/UserService';
import AuthService from '../../services/AuthService';
import { Address } from '../../models/User';
import ConfigurationService from '../../services/ConfigurationService';

class ProfileController {
    currentUser = asyncHandler(
        async (req: Request | any, res: Response): Promise<void> => {
            const user = await UserService.findUserById(req.userdata.id);
            const systemConfig = await ConfigurationService.getConfiguration();
            res.status(STATUS.OK).send({
                success: true,
                message: 'User fetched successfully',
                data: { ...user.toObject(), systemConfig }
            });
        }
    );
    updatePassword = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const pin: string = req.body.pin;
            const { userdata }: any = req;

            const { currentPassword, newPassword } = req.body;

            const user = await AuthService.updatePassword(
                userdata.id,
                currentPassword,
                newPassword
            );

            res.status(STATUS.OK).send({
                success: true,
                data: user,
                message: 'Password updated successfully'
            });
        }
    );
    updateProfile = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { userdata }: any = req;

            const { firstName, lastName, phoneNumber } = req.body;

            const user = await UserService.updateUser(userdata.id, {
                firstName,
                lastName,
                phoneNumber
            });

            res.status(STATUS.OK).send({
                success: true,
                data: user,
                message: 'Profile updated successfully'
            });
        }
    );

    addNewAddress = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { userdata }: any = req;

            const payload: Address = req.body;

            const user = await UserService.addNewAddress(userdata?.id, payload);

            res.status(STATUS.OK).send({
                success: true,
                data: user,
                message: 'New Address created successfully'
            });
        }
    );
    updateAddress = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { userdata }: any = req;

            const { addressId } = req.params;
            const payload: Address = req.body;

            const user = await UserService.updateAddress(
                userdata?.id,
                addressId,
                payload
            );

            res.status(STATUS.OK).send({
                success: true,
                data: user,
                message: 'Address updated successfully'
            });
        }
    );
    deleteAddress = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { userdata }: any = req;

            const { addressId } = req.params;

            const user = await UserService.deleteAddress(
                userdata?.id,
                addressId
            );

            res.status(STATUS.OK).send({
                success: true,
                data: user,
                message: 'Address deleted successfully'
            });
        }
    );
}

export default new ProfileController();
