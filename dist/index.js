"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const server_1 = require("./server");
const logger_1 = __importDefault(require("./utils/logger"));
const appConfig_1 = __importDefault(require("./config/appConfig"));
const database_1 = __importDefault(require("./database"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const PORT = appConfig_1.default.app.port;
function startServer() {
    const app = (0, server_1.createServer)();
    /**
     * Event listener for HTTP server "listening" event.
     */
    const onListening = () => {
        logger_1.default.debug(`App ${appConfig_1.default.app.name} with api version ${appConfig_1.default.app.apiVersion} is starting`);
        console.log(`Running on port ${PORT}`);
        const addr = server.address();
        const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + (addr === null || addr === void 0 ? void 0 : addr.port);
        logger_1.default.debug(`App is listening on ${bind}`);
        (0, database_1.default)();
    };
    /**
     * Create HTTP server.
     */
    const server = http_1.default.createServer(app);
    /**
     * Listen on provided port, on all network interfaces.
     */
    server.listen(PORT);
    server.on('listening', onListening);
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
        console.log(`Error: ${err === null || err === void 0 ? void 0 : err.message}`);
        // Close the server and exit process
        server.close(() => process.exit(1));
    });
    /**
     *  Realtime communication with socket io
     */
    const io = new socket_io_1.Server(server, {
        cors: {
            // origin:"http://localhost:3000",
            origin: '*',
            credentials: true
        }
    });
    const users = {};
    console.log(io);
    io.on('connection', (socket) => {
        socket.on('register', (userId, role, orderId) => {
            console.log('registering', userId);
            users[socket.id] = { userId, role, orderId };
        });
        socket.on('updateLocation', (location) => {
            console.log('updating location', location);
            const user = users[socket.id];
            if (user && user.role === 'rider') {
                Object.keys(users).forEach((id) => {
                    if (users[id].orderId === user.orderId &&
                        users[id].role === 'customer') {
                        io.to(id).emit('locationUpdate', location);
                    }
                });
            }
        });
        socket.on('disconnect', () => {
            delete users[socket.id];
        });
    });
    // return app.listen(PORT, () => {
    //     Logger.debug(
    //         `App ${AppConfig.app.name} with api version ${AppConfig.app.apiVersion} is starting`
    //     );
    //     Logger.debug(`App is listening on port ${PORT}`);
    //     connectDB();
    // });
    return server;
}
startServer();
