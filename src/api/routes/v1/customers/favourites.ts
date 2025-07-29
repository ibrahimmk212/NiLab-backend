import { Router } from 'express';
import favouriteController from '../../../controllers/customers/FavouriteController';
import { Requirements, Validate } from '../../../middlewares/validator';

const customerFavouriteRouter: Router = Router();

customerFavouriteRouter
    .route('/')
    .get(favouriteController.getFavourites)
    .post(
        Validate(Requirements.createFavourite),
        favouriteController.createFavourite
    );

customerFavouriteRouter
    .route('/:favouriteId')
    .get(favouriteController.getFavouriteDetails)
    .delete(favouriteController.deleteFavourite);

export default customerFavouriteRouter;
