import { NextFunction, Request, Response } from 'express';
import UserService from '../../services/UserService';
import { BanUserType, CreateUserType, UpdateUserType } from '../../types/user';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import { LoginType } from '../../types/auth';
import AuthService from '../../services/AuthService';
import AdminService from '../../services/AdminService';

class AdminUserController {
    async createUser(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const payload: CreateUserType = req.body;
            const user = await UserService.createUser(payload);
            res.status(200).send({
                message: 'User created successfully',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    getUsers = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            try {
                const {
                    page,
                    limit,
                    role,
                    status,
                    search,
                    sortBy,
                    sortOrder,
                    startDate,
                    endDate,
                    kycStatus,
                    isBanned
                } = req.query;

                const user = await UserService.getUsers({
                    page,
                    limit,
                    role,
                    status,
                    search,
                    sortBy,
                    sortOrder,
                    startDate,
                    endDate,
                    kycStatus,
                    isBanned
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

    async getUserDetail(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.params.id;
            const user = await UserService.findUserById(userId);
            res.status(200).send({
                message: 'User details fetched successfully',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    async updateUser(
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

    async banUser(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.params.id;
            const payload: BanUserType = req.body;
            await UserService.updateUser(userId, {
                isbanned: true,
                reasonForBan: payload.reasonForBan
            });
            res.status(200).send({
                message: 'User banned successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async unbanUser(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.params.id;
            await UserService.updateUser(userId, {
                isbanned: false,
                reasonForBan: ''
            });
            res.status(200).send({
                message: 'User unbanned successfully'
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

export default new AdminUserController();
