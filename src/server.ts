import express, { Response, Request } from 'express';
import compression from 'compression';
import cors from 'cors';
import * as swaggerUi from 'swagger-ui-express';
import routesV1 from './api/routes/v1';
import MorganMiddleware from './api/middlewares/morgan';
import { Application } from 'express';
import AppConfig from './config/appConfig';
import { specs } from './utils/swagger';
import errorHandler from './api/middlewares/handlers/error';

export function createServer(): Application {
    const app = express();

    // ---- ALLOW ALL CORS ----
    app.use(
        cors({
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        })
    );
    app.options('*', cors()); // preflight
    // -------------------------

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(compression());
    app.use(MorganMiddleware);
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
        return res.status(404).json({ success: false, message: 'MOnify' });
    });

    app.use(errorHandler);

    app.use((req: Request, res: Response) => {
        return res
            .status(404)
            .json({ success: false, message: 'Page Not Found' });
    });

    return app;
}
