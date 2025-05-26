import dotenv from 'dotenv';
dotenv.config();

import { Server } from 'net';
import { createServer } from './server';
import Logger from './utils/logger';
import AppConfig from './config/appConfig';
import connectDB from './database';
import { Server as socketServer } from 'socket.io';
import http from 'http';

const PORT = AppConfig.app.port;

function startServer(): Server {
    const app = createServer();

    /**
     * Event listener for HTTP server "listening" event.
     */
    const onListening = () => {
        Logger.debug(
            `App ${AppConfig.app.name} with api version ${AppConfig.app.apiVersion} is starting`
        );
        console.log(`Running on port ${PORT}`)

        const addr = server.address();
        const bind =
            typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr?.port;

        Logger.debug(`App is listening on ${bind}`);
        connectDB();
    };

    /**
     * Create HTTP server.
     */

    const server = http.createServer(app);

    /**
     * Listen on provided port, on all network interfaces.
     */

    server.listen(PORT);
    server.on('listening', onListening);
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: any, promise) => {
        console.log(`Error: ${err?.message}`);
        // Close the server and exit process
        server.close(() => process.exit(1));
    });

    /**
     *  Realtime communication with socket io
     */

    const io = new socketServer(server, {
        cors: {
            // origin:"http://localhost:3000",
            origin: '*',
            credentials: true
        }
    });

    interface User {
        userId: string;
        role: 'rider' | 'customer';
        orderId: string;
    }

    const users: { [key: string]: User } = {};

    console.log(io);
    io.on('connection', (socket) => {
        socket.on(
            'register',
            (userId: string, role: 'rider' | 'customer', orderId: string) => {
                console.log('registering', userId);
                users[socket.id] = { userId, role, orderId };
            }
        );

        socket.on(
            'updateLocation',
            (location: { lat: number; long: number }) => {
                console.log('updating location', location);
                const user = users[socket.id];
                if (user && user.role === 'rider') {
                    Object.keys(users).forEach((id) => {
                        if (
                            users[id].orderId === user.orderId &&
                            users[id].role === 'customer'
                        ) {
                            io.to(id).emit('locationUpdate', location);
                        }
                    });
                }
            }
        );

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
