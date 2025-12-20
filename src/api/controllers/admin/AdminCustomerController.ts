import { NextFunction, Request, Response } from 'express';
import UserService from '../../services/UserService';
import { BanUserType, CreateUserType, UpdateUserType } from '../../types/user';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import { LoginType } from '../../types/auth';
import AuthService from '../../services/AuthService';
import AdminService from '../../services/AdminService';

class AdminCustomerController {
    getCustomers = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            try {
                const user = await UserService.getUsers({
                    role: 'user',
                    ...req.query
                });
                res.status(200).send({
                    message: 'Users fetched successfully',
                    ...user
                });
            } catch (error) {
                next(error);
            }
        }
    );

    async getCustomerDetail(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.params.id;
            const resp = await UserService.findCustomerUserById(userId);
            if (resp.user.role !== 'user') {
                res.status(404).send({
                    message: 'User not found'
                });
            }

            res.status(200).send({
                message: 'User details fetched successfully',
                // data: {
                //     ...resp.user.toJSON(),
                //     orderCount: resp.orderCount
                // }
                data: resp
            });
        } catch (error) {
            next(error);
        }
    }

    async updateCustomer(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.params.id;
            const payload: UpdateUserType = req.body;
            await UserService.updateUser(userId, payload);
            res.status(200).send({
                message: 'User updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.params.id;
            await UserService.deleteUser(userId);
            res.status(200).send({
                message: 'User deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    currentUser = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            // const user = await UserService.findUserById(req.userdata.id);
            const { userdata, admin }: any = req;

            res.status(STATUS.OK).send({
                success: true,
                message: 'User fetched successfully',
                data: { user: userdata, admin }
            });
        }
    );

    login = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        const payload: LoginType = req.body;
        const { token, user } = await AuthService.login(payload);

        const admin = await AdminService.getByUserId(user.id);
        if (!admin) {
            return res.status(STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Admin not found'
            });
        }
        res.status(STATUS.OK).send({
            message: 'Logged in successfully',
            success: true,
            data: user,
            user: user,
            admin: admin,
            active: admin.status === 'active',
            token: token
        });
    });
}

export default new AdminCustomerController();
