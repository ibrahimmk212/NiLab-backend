import dotenv from 'dotenv';
dotenv.config();

import { Server } from 'net';
import { createServer } from './server';
import Logger from './utils/logger';
import AppConfig from './config/appConfig';
import connectDB from './database';
import { Server as socketServer } from 'socket.io';
import http from 'http';
import emails from './api/libraries/emails';
import { sendPushNotification } from './api/libraries/firebase';

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

        const addr = server.address();
        const bind =
            typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr?.port;

        Logger.debug(`App is listening on ${bind}`);
        // emails.welcomeEmail('muhd@mailinator.com', { name: 'Muhammad' });
        // const userDeviceToken =
        //     'e_sR2wd7QQ2CKpAeZWziU9:APA91bHQOA3K1im9RerKrq0k11jVs_FzKhV0oS2Ibj5OBhvaJOaCwMGAC20TmnCrPWR8GmJ4avGVIJ-MQ-WIXbk_zH-uYuXqZ_YGZL-LF8JsLlROIcqlTSgJbIAD3pwz5m5A8hp9DwLL'; // This token is obtained in the frontend when the user allows push notifications
        // sendPushNotification(
        //     userDeviceToken,
        //     'Hello',
        //     'This is a test notification'
        // );
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
        console.log(`Error: ${err}`);
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

    io.on('connection', (socket) => {
        socket.on(
            'register',
            (userId: string, role: 'rider' | 'customer', orderId: string) => {
                console.log('registering', userId);
                console.log('registerd users', users);
                users[socket.id] = { userId, role, orderId };
            }
        );

        socket.on(
            'updateLocation',
            (location: { lat: number; long: number }) => {
                console.log('updating location', location);
                const user = users[socket.id];
                console.log(user);
                if (user && user.role === 'rider') {
                    Object.keys(users).forEach((id) => {
                        console.log(id);
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
