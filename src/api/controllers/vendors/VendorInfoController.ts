import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import VendorService from '../../services/VendorService';
import WalletRepository from '../../repositories/WalletRepository';
// import { uploadFileToS3 } from '../../../utils/s3';
import WalletService from '../../services/WalletService';
import { LoginType } from '../../types/auth';
import AuthService from '../../services/AuthService';
import OrderService from '../../services/OrderService';
import dayjs from 'dayjs';
import MarketCategoryService from '../../services/MarketCategoryService';
import { v2 as cloudinaryV2 } from 'cloudinary';
import { Readable } from 'stream';
import VendorRepository from '../../repositories/VendorRepository';

class VendorInfoController {
    currentUser = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            // const user = await UserService.findUserById(req.userdata.id);
            const { userdata, vendor }: any = req;

            const wallet = await WalletService.getMyWallet({
                role: 'vendor',
                owner: vendor.id
            });

            const marketCategory = await MarketCategoryService.find(
                vendor?.marketCategoryId.toString()
            );

            res.status(STATUS.OK).send({
                success: true,
                message: 'User fetched successfully',
                data: { user: userdata, vendor, marketCategory, wallet }
            });
        }
    );

    login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const payload: LoginType = req.body;
        const { token, user } = await AuthService.login(payload);

        const vendor = await VendorService.getByUserId(user.id);
        res.status(STATUS.OK).send({
            message: 'Logged in successfully',
            success: true,
            data: user,
            user: user,
            vendor: vendor,
            active: vendor.status === 'active',
            token: token
        });
    });

    dashboard = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { vendor }: any = req;
            let { startDate, endDate }: any = req.query;

            startDate = dayjs(startDate).toDate();
            endDate = dayjs(endDate).add(1, 'day').toDate();

            // const startDate = new Date('2024-01-01');
            // const endDate = new Date('2024-03-31');
            const analytics: any = {};
            const {
                salesRevenue,
                salesMargin,
                ordersMargin,
                salesReport,
                productsSoldByCategory,
                topSellingProducts
            } = await OrderService.vendorAnalytics(
                vendor.id,
                startDate,
                endDate
            );

            analytics.statisticData = {
                revenue: {
                    value: salesRevenue.amount,
                    growShrink: salesMargin
                },
                orders: {
                    value: salesRevenue.count,
                    growShrink: ordersMargin
                }
            };
            analytics.salesReportData = {
                series: [
                    {
                        name: 'Food Orders',
                        data: salesReport.map(
                            (order: any) => order.dailyRevenue
                        )
                    }
                ],
                categories: salesReport.map((order: any) => order._id)
            };

            analytics.salesByCategoriesData = {
                labels: productsSoldByCategory.map((data: any) => data._id),
                data: productsSoldByCategory.map((data: any) => data.totalSold)
            };

            analytics.topProductsData = topSellingProducts.map((data: any) => {
                return {
                    id: data._id,
                    name: data.productName,
                    img: data.thumbnail,
                    amount: data.totalPrice,
                    sold: data.totalQuantity
                };
            });

            const orders = await OrderService.getAll({ vendorId: vendor.id });
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

    get = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor } = req;
            const vendorInfo = await VendorService.get(vendor.id);

            res.status(STATUS.OK).send({
                message: 'Vendor Fetchd successfully',
                data: vendorInfo
            });
        }
    );
    // getWallet = asyncHandler(
    //     async (
    //         req: Request | any,
    //         res: Response,
    //         next: NextFunction
    //     ): Promise<void> => {
    //         const { vendor } = req;
    //         const wallet = await WalletRepository.getWalletByKey(
    //             'vendorId',
    //             vendor.id
    //         );

    //         if (!wallet) {
    //             throw new Error('Wallet not available');
    //         }
    //         res.status(STATUS.OK).send({
    //             message: 'Vendor wallet Fetchd successfully',
    //             data: wallet
    //         });
    //     }
    // );
    update = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor, body, params } = req;
            const { id } = params;

            const update = await VendorService.update(vendor.id, body);
            res.status(STATUS.OK).json({
                success: true,
                message: 'Vendor Updated',
                data: update
            });
        }
    );
    updateBank = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor, body, params } = req;

            const update = await VendorService.updateBank(vendor.id, body);
            res.status(STATUS.OK).json({
                success: true,
                message: 'Vendor Updated',
                data: update
            });
        }
    );
    updateLocation = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor, body, params } = req;

            // if vendor.status==inactive, set to active
            const update = await VendorService.updateLocation(vendor.id, {
                ...body,
                status:
                    vendor.status == 'inactive' || vendor.status == 'pending'
                        ? 'active'
                        : vendor.status
            });
            res.status(STATUS.OK).json({
                success: true,
                message: 'Vendor Location Updated',
                data: update
            });
        }
    );

    uploadBanner = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor } = req;
            const file = req?.file;

            if (!file) throw Error('File Not selected');

            const stream = cloudinaryV2.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    public_id: `banner_${vendor.id}_${Date.now()}`
                },
                async (error, result) => {
                    if (error) {
                        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
                            success: false,
                            message: 'Banner upload failed',
                            error: error.message
                        });
                    }

                    if (result) {
                        await VendorRepository.update(vendor.id, {
                            banner: result.secure_url
                        });

                        return res.status(STATUS.CREATED).send({
                            success: true,
                            message: 'Banner Updated Successfully.',
                            data: {
                                url: result.secure_url
                            }
                        });
                    }
                }
            );

            const bufferStream = new Readable();
            bufferStream.push(file.buffer);
            bufferStream.push(null);
            bufferStream.pipe(stream);
        }
    );
}

export default new VendorInfoController();
