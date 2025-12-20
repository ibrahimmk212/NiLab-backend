import { NextFunction, Request, Response } from 'express';
import UserService from '../../services/UserService';
import { ROLE, STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import VendorService from './../../services/VendorService';
import { generateRandomNumbers } from '../../../utils/helpers';
import emails from '../../libraries/emails';

class AdminVendorController {
    create = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const payload: any = req.body;
            const findUser = await UserService.findByEmailOrPhone(
                payload.managerEmail,
                payload.managerPhone
            );

            if (findUser) {
                throw Error('Manager account already exist');
            }
            const tempPassword = generateRandomNumbers(6).toString();

            console.log(tempPassword);
            const user = await UserService.createUser({
                role: ROLE.VENDOR,
                firstName: payload.managerFirstName,
                lastName: payload.managerLastName,
                phoneNumber: payload.managerPhone,
                email: payload.managerEmail,
                password: tempPassword
            });
            if (!user) {
                throw Error('Manager Could not create account');
            }

            // TODO send temp password to email

            const newVendor = await VendorService.create({
                name: payload.name,
                address: payload.address,
                description: payload?.description ?? '',
                userId: user._id,
                email: payload.email,
                phoneNumber: payload.phoneNumber,
                logo: payload.logo ?? '',
                banner: payload.banner ?? '',
                lat: payload.lat,
                lng: payload.lng
            });

            if (!newVendor) {
                await user.deleteOne();

                throw Error('Could not create vendor account');
            }

            emails.vendorOnboarding(payload.managerEmail, {
                vendorName: newVendor.name,
                email: payload.managerEmail,
                temporaryPassword: tempPassword
            });

            res.status(STATUS.CREATED).send({
                message: 'Vendor created successfully',
                data: newVendor
            });
        }
    );
    getAll = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const vendors = await VendorService.getAll(req.query);
            res.status(STATUS.OK).send({
                success: true,
                message: 'Venors fetched successfully',
                ...vendors
            });
        }
    );

    getSingle = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { id } = req.params;
            const vendor = await VendorService.get(id);
            if (!vendor) throw new Error('Vendor not available');
            res.status(STATUS.OK).send({
                success: true,
                message: 'Vendor fetched successfully',
                data: vendor
            });
        }
    );

    update = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { id } = req.params;
            const { body } = req;
            const vendor = await VendorService.getById(id);
            if (!vendor) {
                throw Error('Vendor not found');
            }
            // if (
            //     body.status === 'active'
            //     //  && !vendor.location.coordinates
            // ) {
            // throw Error('Location data is missing');
            // }
            const update = await VendorService.update(id, body);
            if (!update) {
                throw Error(' Could not update vendor');
            }
            res.status(STATUS.OK).send({
                success: true,
                message: 'Vendor updated successfully',
                data: update
            });
        }
    );
}

export default new AdminVendorController();
