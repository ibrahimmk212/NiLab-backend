import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import SubcategoryService from '../../services/SubcategoryService';
import { Subcategory } from 'src/api/models/Subcategory';

class VendorSubcategoryController {
    create = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {

            const user = req.userdata;


            const newSubcategory = await SubcategoryService.create({ ...req.body, userId: user.id })
            if (!newSubcategory)
                res.status(STATUS.BAD_REQUEST).send({
                    success: false,
                    message: 'Failed to create Product Subcategory'
                });
            res.status(STATUS.CREATED).send({
                success: true,
                message: 'Product Subcategory Created Successfully',
                data: newSubcategory
            });
        }
    );
    getAll = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const product = await SubcategoryService.getAll();
            res.status(STATUS.OK).send({
                success: true,
                message: 'Categories fetched successfully',
                data: product
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
            const product = await SubcategoryService.find(id);
            res.status(STATUS.OK).send({
                success: true,
                message: 'Categories fetched successfully',
                data: product
            });
        }
    );
}

export default new VendorSubcategoryController();
