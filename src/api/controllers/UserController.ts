import { NextFunction, Request, Response } from 'express';
import UserService from '../services/UserService';
import {
    CreateUserType,
    UpdateProfilePictureType,
    UpdateUserType
} from '../types/user';
import { STATUS } from '../../constants';
import { asyncHandler } from '../middlewares/handlers/async';

class UserController {
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
                const user = await UserService.getUsers(req.query);
                res.status(200).send({
                    message: 'Users fetched successfully',
                    data: user
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
            const user = await UserService.getUserDetail(userId);
            res.status(200).send({
                message: 'User details fetched successfully',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    async updateProfilePicture(
        req: any,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { userdata } = req;
            const payload: UpdateProfilePictureType = req.body;
            await UserService.updateUser(userdata?.id, payload);
            res.status(200).send({
                message: 'Profile picture updated successfully',
                success: true,
                data: payload
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
                message: 'User updated successfully',
                success: true
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

    async currentUser(
        req: Request | any,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const user = await UserService.findUserById(req.userdata?.id);
            res.status(STATUS.OK).send({
                data: user
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();
