import { Router } from 'express';
import SearchController from '../../../controllers/public/SearchController';

const searchRouter: Router = Router();

// GET /api/v1/public/search?q=query
searchRouter.get('/', SearchController.universalSearch);

export default searchRouter;
