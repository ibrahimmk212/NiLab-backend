import express, { NextFunction, Response, Request } from 'express';
import compression from 'compression';
import cors from 'cors';
import routesV1 from './api/routes/v1';
import MorganMiddleware from './api/middlewares/morgan';
import { Application } from 'express';
import AppConfig from './config/appConfig';
import errorHandler from './api/middlewares/handlers/error';
import expressfileupload from 'express-fileupload';

export function createServer(): Application {
    const app = express();
    const corsOption = {
        origin: '*',
        credentials: true
    };

    app.use(express.urlencoded(
        // { extended: true }
    ));
    app.use(express.json());
    app.use(cors(corsOption));
    app.use(compression());
    app.use(MorganMiddleware);
    app.use(expressfileupload());
    app.use(`/api/${AppConfig.app.apiVersion}`, routesV1);

    app.get('/', (req: Request, res: Response) => {
        return res.json({ hello: 'hy' });
    });
    // app.use('/monnify', (req: Request, res: Response) => {
    //     console.log(req.params);
    //     // const error = Error('Page Not FOund');
    //     return res.status(404).json({ success: false, message: 'MOnify' });
    // });

    app.use(errorHandler);
    // Invalid Endpoint
    app.use((req: Request, res: Response) => {
        // const error = Error('Page Not FOund');
        return res
            .status(404)
            .json({ success: false, message: 'Page Not Found' });
    });
    return app;
}
