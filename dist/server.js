"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = void 0;
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const v1_1 = __importDefault(require("./api/routes/v1"));
const morgan_1 = __importDefault(require("./api/middlewares/morgan"));
const appConfig_1 = __importDefault(require("./config/appConfig"));
const error_1 = __importDefault(require("./api/middlewares/handlers/error"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
function createServer() {
    const app = (0, express_1.default)();
    const corsOption = {
        origin: '*',
        credentials: true
    };
    app.use(express_1.default.urlencoded(
    // { extended: true }
    ));
    app.use(express_1.default.json());
    app.use((0, cors_1.default)(corsOption));
    app.use((0, compression_1.default)());
    app.use(morgan_1.default);
    app.use((0, express_fileupload_1.default)());
    app.use(`/api/${appConfig_1.default.app.apiVersion}`, v1_1.default);
    app.get('/', (req, res) => {
        return res.json({ hello: 'hy' });
    });
    // app.use('/monnify', (req: Request, res: Response) => {
    //     console.log(req.params);
    //     // const error = Error('Page Not FOund');
    //     return res.status(404).json({ success: false, message: 'MOnify' });
    // });
    app.use(error_1.default);
    // Invalid Endpoint
    app.use((req, res) => {
        // const error = Error('Page Not FOund');
        return res
            .status(404)
            .json({ success: false, message: 'Page Not Found' });
    });
    return app;
}
exports.createServer = createServer;
