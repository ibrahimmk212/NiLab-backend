import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/handlers/async';
import RiderLocationModel from '../../models/RiderLocation';
import { STATUS } from '../../../constants';
import SocketService from '../../services/SocketService';

class RiderLocationController {
    /**
     * @desc    Update rider current location (Heartbeat)
     * @route   POST /api/v1/riders/locations/heartbeat
     * @access  Private (Rider)
     */
    heartbeat = asyncHandler(async (req: Request, res: Response) => {
        const { rider }: any = req;
        const { lat, long, orderId } = req.body;

        if (lat === undefined || long === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and Longitude are required'
            });
        }

        const riderLocation = await RiderLocationModel.create({
            rider: rider.id,
            order: orderId || null,
            location: {
                type: 'Point',
                coordinates: [Number(long), Number(lat)]
            },
            timestamp: new Date()
        });

        // Broadcast to socket rooms
        const locationData = {
            riderId: rider.id,
            orderId: orderId || null,
            coordinates: [Number(long), Number(lat)],
            timestamp: new Date()
        };

        SocketService.broadcastToRoom('global:admins', 'rider_location_updated', locationData);
        SocketService.broadcastToRoom(`rider:${rider.id}`, 'rider_location_updated', locationData);

        if (orderId) {
            SocketService.broadcastToRoom(`order:${orderId}`, 'rider_location_updated', locationData);
            
            // Broadcast to the vendor of this order
            import('../../models/Order').then(({ default: OrderModel }) => {
                OrderModel.findById(orderId).then((order) => {
                    if (order && order.vendor) {
                        SocketService.broadcastToRoom(`vendor:${order.vendor.toString()}`, 'rider_location_updated', locationData);
                    }
                }).catch((err) => {
                    console.error('Error fetching order for location broadcast:', err);
                });
            });
        }

        res.status(STATUS.CREATED).json({
            success: true,
            message: 'Heartbeat recorded',
            data: riderLocation
        });
    });

    /**
     * @desc    Get rider location history
     * @route   GET /api/v1/riders/locations/history
     * @access  Private (Rider/Admin)
     */
    getHistory = asyncHandler(async (req: Request, res: Response) => {
        const { rider }: any = req;
        const { orderId, limit = 100 } = req.query;

        const query: any = { rider: rider.id };
        if (orderId) query.order = orderId;

        const history = await RiderLocationModel.find(query)
            .sort({ timestamp: -1 })
            .limit(Number(limit));

        res.status(STATUS.OK).json({
            success: true,
            count: history.length,
            data: history
        });
    });
}

export default new RiderLocationController();
