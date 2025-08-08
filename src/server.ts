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

    // Getting cors enabled domain  from env
    const domainsFromEnv = process.env.CORS_DOMAINS || 'http://localhost:3000';

    const whitelist = domainsFromEnv.split(',').map((item) => item.trim());

    console.log(whitelist);
    const corsOption = {
        origin: function (origin: any, callback: any) {
            console.log('origin', origin);
            if (!origin || whitelist.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(Error('Not allowed by CORS'));
            }
        },
        credentials: true
    };

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(cors(corsOption));
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
