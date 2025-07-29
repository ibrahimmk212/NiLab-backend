import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import FavouriteService from '../../services/FavouriteService';

class FavouriteController {
    getFavourites = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { userdata }: any = req;
            const { limit = 10, page = 1 } = req.query;

            const { favourites, count, pagination, total } =
                await FavouriteService.getFavouritesByCustomer(
                    userdata.id,
                    Number(limit),
                    Number(page)
                );

            res.status(STATUS.OK).json({
                success: true,
                total,
                count,
                pagination,
                data: favourites
            });
        }
    );

    createFavourite = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { userdata }: any = req;
            const { productId, vendorId } = req.body;

            const favourite = await FavouriteService.createFavourite({
                user: userdata.id,
                product: productId,
                vendor: vendorId
            });

            res.status(STATUS.OK).json({
                success: true,
                data: favourite
            });
        }
    );

    getFavouriteDetails = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const favourite = await FavouriteService.getFavouriteById(
                req.params.favouriteId
            );

            if (!favourite) {
                throw Error('Favourite not found!');
            }

            res.status(STATUS.OK).json({
                success: true,
                data: favourite
            });
        }
    );

    deleteFavourite = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const favourite = await FavouriteService.deleteFavourite(
                req.params.favouriteId
            );

            res.status(STATUS.OK).json({
                success: true,
                data: favourite
            });
        }
    );
}

export default new FavouriteController();
