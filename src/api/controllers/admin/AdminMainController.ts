import { NextFunction, Request, Response } from 'express';
import UserService from '../../services/UserService';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import { CreateAdminType, LoginType } from '../../types/auth';
import AuthService from '../../services/AuthService';
import AdminService from '../../services/AdminService';
import AuditService from '../../services/AuditService';
import dayjs from 'dayjs';
import OrderService from '../../services/OrderService';

class AdminMainController {
    dashboard = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { admin }: any = req;
            let { startDate, endDate }: any = req.query;

            startDate = dayjs(startDate).toDate();
            endDate = dayjs(endDate).add(1, 'day').toDate();

            // const startDate = new Date('2024-01-01');
            // const endDate = new Date('2024-03-31');
            const analytics: any = {};
            // const {
            //     salesRevenue,
            //     salesMargin,
            //     ordersMargin,
            //     salesReport,
            //     productsSoldByCategory,
            //     topSellingProducts
            // } = await OrderService.adminAnalytics(startDate, endDate);

            // analytics.statisticData = {
            //     revenue: {
            //         value: salesRevenue.amount,
            //         growShrink: salesMargin
            //     },
            //     orders: {
            //         value: salesRevenue.count,
            //         growShrink: ordersMargin
            //     }
            // };
            // analytics.salesReportData = {
            //     series: [
            //         {
            //             name: 'Food Orders',
            //             data: salesReport.map(
            //                 (order: any) => order.dailyRevenue
            //             )
            //         }
            //     ],
            //     categories: salesReport.map((order: any) => order._id)
            // };

            // analytics.salesByCategoriesData = {
            //     labels: productsSoldByCategory.map((data: any) => data._id),
            //     data: productsSoldByCategory.map((data: any) => data.count)
            // };

            // analytics.topProductsData = topSellingProducts.map((data: any) => {
            //     return {
            //         id: data._id,
            //         name: data.productName,
            //         img: data.thumbnail,
            //         amount: data.totalPrice,
            //         sold: data.totalQuantity
            //     };
            // });

            const orders = await OrderService.getAll(req.query);
            // [];
            // analytics.latestOrderData = orders?.slice(0, 5);

            res.status(STATUS.OK).send({
                success: true,
                message: 'User fetched successfully',
                data:
                    // {
                    //     salesRevenue,
                    //     salesMargin,
                    //     ordersMargin,
                    //     salesReport,
                    //     productsSoldByCategory,
                    //     topSellingProducts,
                    analytics
                // }
            });
        }
    );

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

    getAll = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const admins = await AdminService.getAll();
            res.status(STATUS.OK).send({
                success: true,
                message: 'Admins fetched successfully',
                data: admins
            });
        }
    );

    create = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const payload: CreateAdminType = req.body;

            // Auto-generate a secure temporary password
            const tempPassword =
                Math.random().toString(36).slice(-8) +
                Math.random().toString(36).slice(-8).toUpperCase() +
                '!';

            const user = await UserService.createUser({
                ...payload,
                password: tempPassword,
                role: 'admin'
            });

            if (!user) {
                throw Error('User not created');
            }

            const admin = await AdminService.create({
                userId: user.id,
                name: `${user.firstName} ${user.lastName}`,
                phone: user.phoneNumber,
                email: user.email,
                role: payload.role,
                permissions: payload.permissions || []
            });

            if (!admin) {
                await user.deleteOne();
                throw Error('Admin not created');
            }

            // TODO: send tempPassword to admin's email
            console.log('Temp password for', user.email, ':', tempPassword);

            res.status(STATUS.OK).send({
                success: true,
                message: 'Admin account created successfully',
                data: { user, admin }
            });

            AuditService.log({
                adminId: (req as any).userdata.id,
                action: 'CREATE_PLATFORM_STAFF',
                resource: 'Admin',
                resourceId: admin.id,
                details: { role: admin.role, email: admin.email },
                ip: req.ip,
                userAgent: req.headers['user-agent']
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
            const admin = await AdminService.getById(id);
            if (!admin) throw new Error('Admin not available');
            res.status(STATUS.OK).send({
                success: true,
                message: 'Admin fetched successfully',
                data: admin
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
            const update = await AdminService.update(id, body);
            if (!update) {
                throw Error(' Could not update admin');
            }
            res.status(STATUS.OK).send({
                success: true,
                message: 'Admin updated successfully',
                data: update
            });

            AuditService.log({
                adminId: (req as any).userdata.id,
                action: 'UPDATE_PLATFORM_STAFF',
                resource: 'Admin',
                resourceId: id,
                details: body,
                ip: req.ip,
                userAgent: req.headers['user-agent']
            });
        }
    );

    updateStatus = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { id } = req.params;
            const { status } = req.body;

            if (!['active', 'suspended'].includes(status)) {
                throw Error(
                    'Invalid status, only suspended and active are allowed'
                );
            }
            const update = await AdminService.update(id, { status });
            if (!update) {
                throw Error(' Could not update admin');
            }
            res.status(STATUS.OK).send({
                success: true,
                message: 'Admin updated successfully',
                data: update
            });

            AuditService.log({
                adminId: (req as any).userdata.id,
                action: 'UPDATE_PLATFORM_STAFF_STATUS',
                resource: 'Admin',
                resourceId: id,
                details: { status },
                ip: req.ip,
                userAgent: req.headers['user-agent']
            });
        }
    );
}

export default new AdminMainController();
