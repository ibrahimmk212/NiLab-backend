import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import Logger from '../../utils/logger';

class SocketService {
    private io: SocketIOServer | null = null;
    private users: Map<string, string> = new Map(); // Map<userId, socketId>

    init(server: HttpServer): void {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: true, // Allow any origin and reflect it
                credentials: true
            }
        });

        this.io.on('connection', (socket: Socket) => {
            Logger.debug(`New socket connection: ${socket.id}`);

            socket.on('join', (userId: string) => {
                if (!userId) return;

                // Join a room specific to the user
                socket.join(`user:${userId}`);
                socket.join('global:customers'); // Default join is for customers
                Logger.debug(
                    `User ${userId} joined room user:${userId} and global:customers`
                );

                // Also optionally store in map if needed for direct access,
                // but rooms are better for multi-device support
                this.users.set(userId, socket.id);
            });

            socket.on('join_vendor', (vendorId: string) => {
                if (!vendorId) return;
                socket.join(`vendor:${vendorId}`);
                socket.join('global:vendors');
                Logger.debug(
                    `Vendor ${vendorId} joined room vendor:${vendorId} and global:vendors`
                );
            });

            socket.on('join_rider', (riderId: string) => {
                if (!riderId) return;
                socket.join(`rider:${riderId}`);
                socket.join('global:riders');
                Logger.debug(
                    `Rider ${riderId} joined room rider:${riderId} and global:riders`
                );
            });

            socket.on('join_admin', (adminId: string) => {
                if (!adminId) return;
                socket.join(`admin:${adminId}`); // Admins are also users potentially
                socket.join('global:admins');
                Logger.debug(
                    `Admin ${adminId} joined room admin:${adminId} and global:admins`
                );
            });

            // Register legacy event listeners locally or refactor them here if needed
            // For now, we keep the previous logic available via a method or reimplement it
            this.handleLegacyEvents(socket);

            socket.on('disconnect', () => {
                Logger.debug(`Socket disconnected: ${socket.id}`);
                // Cleanup logic if needed
            });
        });
    }

    private handleLegacyEvents(socket: Socket) {
        socket.on(
            'updateLocation',
            async (data: { lat: number; long?: number; lng?: number; orderId?: string; riderId?: string }) => {
                const lat = data.lat;
                const lng = data.long !== undefined ? data.long : data.lng;
                const riderId = data.riderId || (socket.handshake.query.userId as string);
                const orderId = data.orderId;

                if (lat === undefined || lng === undefined || !riderId) return;

                const locationData = {
                    riderId,
                    orderId: orderId || null,
                    coordinates: [Number(lng), Number(lat)],
                    timestamp: new Date()
                };

                // Broadcast location to relevant rooms
                this.broadcastToRoom('global:admins', 'rider_location_updated', locationData);
                this.broadcastToRoom(`rider:${riderId}`, 'rider_location_updated', locationData);

                if (orderId) {
                    this.broadcastToRoom(`order:${orderId}`, 'rider_location_updated', locationData);

                    try {
                        const { default: OrderModel } = await import('../models/Order');
                        const order = await OrderModel.findById(orderId);
                        if (order && order.vendor) {
                            this.broadcastToRoom(`vendor:${order.vendor.toString()}`, 'rider_location_updated', locationData);
                        }
                    } catch (err) {
                        Logger.error('Error fetching order for socket location updates: ' + err);
                    }
                }
            }
        );
    }

    // Emit event to a specific user
    emitToUser(userId: string, event: string, data: any): void {
        if (!this.io) {
            Logger.warn('Socket.io not initialized');
            return;
        }
        this.io.to(`user:${userId}`).emit(event, data);
    }

    emitToAdmin(adminId: string, event: string, data: any): void {
        if (!this.io) {
            Logger.warn('Socket.io not initialized');
            return;
        }
        this.io.to(`admin:${adminId}`).emit(event, data);
    }

    emitToVendor(vendorId: string, event: string, data: any): void {
        if (!this.io) {
            Logger.warn('Socket.io not initialized');
            return;
        }
        this.io.to(`vendor:${vendorId}`).emit(event, data);
    }

    emitToRider(riderId: string, event: string, data: any): void {
        if (!this.io) {
            Logger.warn('Socket.io not initialized');
            return;
        }
        this.io.to(`rider:${riderId}`).emit(event, data);
    }

    // Broadcast to all users (e.g. for system-wide alerts)
    broadcast(event: string, data: any): void {
        if (!this.io) return;
        this.io.emit(event, data);
    }

    broadcastToRoom(room: string, event: string, data: any): void {
        if (!this.io) return;
        this.io.to(room).emit(event, data);
    }
}

export default new SocketService();
