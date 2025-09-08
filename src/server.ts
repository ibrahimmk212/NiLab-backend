import express, { NextFunction, Response, Request } from 'express';
import compression from 'compression';
import cors from 'cors';
import * as swaggerUi from 'swagger-ui-express';
import routesV1 from './api/routes/v1';
import MorganMiddleware from './api/middlewares/morgan';
import { Application } from 'express';
import AppConfig from './config/appConfig';
import { specs } from './utils/swagger';
import errorHandler from './api/middlewares/handlers/error';
import expressfileupload from 'express-fileupload';

export function createServer(): Application {
    const app = express();

    const whitelist = AppConfig.corsWhiteList || ['*'];

    const corsOptions = {
        origin: (
            origin: string | undefined,
            callback: (err: Error | null, allow?: boolean) => void
        ) => {
            console.log('CORS check for origin:', origin);

            // allow requests with no origin (like curl, Postman)
            if (!origin || whitelist.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    };

    // apply CORS for all requests
    app.use(cors(corsOptions));
    // make sure preflight OPTIONS requests are handled too
    app.options('*', cors(corsOptions));

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(compression());
    app.use(MorganMiddleware);
    // app.use(expressfileupload());
    app.use(`/api/${AppConfig.app.apiVersion}`, routesV1);

    app.get('/', (req: Request, res: Response) => {
        return res.json({ hello: 'hy' });
    });
    if (AppConfig.app.isDevelopment) {
        app.use(
            `/docs/${AppConfig.app.apiVersion}`,
            swaggerUi.serve,
            swaggerUi.setup(specs)
        );
    }

    app.use('/monnify', (req: Request, res: Response) => {
        console.log(req.params);
        // const error = Error('Page Not FOund');
        return res.status(404).json({ success: false, message: 'MOnify' });
    });

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
