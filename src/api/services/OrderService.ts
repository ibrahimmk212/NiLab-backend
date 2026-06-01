import mongoose from 'mongoose';
console.log('OrderService module loading...');

import OrderRepository from '../repositories/OrderRepository';
import { Order } from '../models/Order';
import ConfigurationService from './ConfigurationService';
import WalletService from './WalletService';
import PaymentService from './PaymentService';
import {
    generateReference,
    generateShortCode
} from '../../utils/keygen/idGenerator';
import SettlementService from './SettlementService';
import ProductModel from '../models/Product';
import VendorModel from '../models/Vendor';
import UserRepository from '../repositories/UserRepository';
import { calculateStraightDistance } from '../../utils/helpers';
import DeliveryRepository from '../repositories/DeliveryRepository';
import DeliveryModel from '../models/Delivery';
import DispatchRepository from '../repositories/DispatchRepository';
import NotificationService from './NotificationService';
import emails from '../libraries/emails';
import VehicleTypeModel from '../models/VehicleType';
import VehicleTypeService from './VehicleTypeService';
import DispatchService from './DispatchService';
import RiderModel from '../models/Rider';
import RiderLocationModel from '../models/RiderLocation';

class OrderService {
    private roundToTwo(num: number): number {
        return Math.round((num + Number.EPSILON) * 100) / 100;
    }

    async createOrder(data: any): Promise<Order> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const config = await ConfigurationService.getConfiguration();
            if (!config) throw new Error('System configuration not found');

            const pricing = await this.calculateProductOrderDetails(
                {
                    vendorId: data.vendor,
                    userId: data.user,
                    addressId: data.addressId,
                    products: data.products
                },
                session
            );

            // 5. ASSEMBLE PAYLOAD
            const orderPayload: any = {
                ...data,
                code: generateShortCode(),
                paymentReference: generateReference('ORD'),
                vendor: pricing.vendorId,
                user: pricing.customerId,
                products: pricing.enrichedProducts,
                pickup: pricing.pickup,
                pickupLocation: pricing.pickup.coordinates,
                deliveryLocation: pricing.destination.coordinates,
                destination: pricing.destination,
                deliveryFee: pricing.deliveryFee,
                serviceFee: pricing.serviceFee,
                vat: pricing.vat,
                amount: pricing.subtotal,
                totalAmount: pricing.totalAmount,
                distance: pricing.distance,
                commission: pricing.commission,
                orderType: 'products',
                status: 'pending'
            };

            // 6. PAY FOR ME LOGIC
            if (data.paymentType === 'pay-for-me') {
                orderPayload.payForMeToken = generateReference('PFM'); // Using similar generator
                // Set expiry to 40 minutes from now
                orderPayload.payForMeExpiresAt = new Date(
                    Date.now() + 40 * 60 * 1000
                );
                orderPayload.payForMeStatus = 'pending';
            }

            const order = await OrderRepository.createOrder(
                orderPayload,
                session
            );

            // ✅ AUTOMATIC STOCK REDUCTION
            const stockUpdatePromises = order.products.map((item: any) =>
                ProductModel.findByIdAndUpdate(
                    item.product,
                    { $inc: { stock: -item.quantity } },
                    { session, new: true } // Return updated product to check stock
                ).then(async (updatedProduct) => {
                    if (updatedProduct && updatedProduct.stock < 5) {
                        // Notify Vendor about low stock
                        await NotificationService.create({
                            userId: pricing.vendor.userId,
                            vendorId: pricing.vendor._id,
                            role: 'vendor',
                            title: 'Low Stock Alert',
                            message: `Product "${updatedProduct.name}" is running low on stock (${updatedProduct.stock} left).`,
                            status: 'unread'
                        });
                    }
                })
            );
            await Promise.all(stockUpdatePromises);

            // Payment handling and notifications are now deferred to PaymentService.
            // Notifications are triggered externally when payment is completed.

            await session.commitTransaction();
            return order;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async createPackageOrder(data: any): Promise<Order> {
        // check vehicle Type
        const vehicleType = await VehicleTypeService.getVehicleTypeById(
            data.vehicleType
        );
        if (!vehicleType) throw new Error('Vehicle type not found');
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const config = await ConfigurationService.getConfiguration();
            if (!config) throw new Error('System configuration not found');

            // data.vehicleType should be 'bike', 'car', etc.
            const deliveryFee = await this.calculateDeliveryFee(
                data.distance ?? 0,
                data.vehicleType
            );

            const serviceFee = 0; // Service fee is applicable to vendor orders only
            const totalAmount = this.roundToTwo(
                (data.amount || 0) + deliveryFee + serviceFee
            );

            const orderData: any = {
                ...data,
                amount: data.amount || 0,
                vehicleType: data.vehicleType,
                code: generateReference('PKG'),
                paymentReference: generateReference('ORD'),
                orderType: 'package',
                deliveryFee,
                serviceFee,
                totalAmount,
                status: 'pending'
            };

            const order = await OrderRepository.createOrder(orderData, session);

            await session.commitTransaction();
            return order;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async previewOrder(data: any): Promise<any> {
        return await this.calculateProductOrderDetails({
            vendorId: data.vendor,
            userId: data.user,
            addressId: data.addressId,
            products: data.products
        });
    }

    /**
     * Package Delivery Preview — pure price calculation, no order is created.
     *
     * Accepts EITHER:
     *   • Minimal:  { pickup, destination, vehicleTypeId?, packageValue? }
     *   • Full:     The exact same payload as POST /orders/package
     *               (vehicleType alias for vehicleTypeId, amount alias for packageValue)
     *
     * Returns pricing quotes + echoes back all submitted details so the client
     * can display a full confirmation screen before placing the order.
     */
    async previewPackageOrder(data: {
        pickup: { coordinates: [number, number]; address?: string; [key: string]: any };
        destination: { coordinates: [number, number]; address?: string; [key: string]: any };
        vehicleTypeId?: string;
        packageValue?: number;
        // full-payload extras (echoed back in response)
        package?: {
            description?: string;
            image?: string;
            weight?: number;
            size?: 'small' | 'medium' | 'large' | 'extra-large';
            isFragile?: boolean;
            packageType?: string;
        };
        senderDetails?: { name?: string; contactNumber?: string };
        receiverDetails?: { name?: string; contactNumber?: string };
        pickupTime?: string;
    }): Promise<any> {
        const config = await ConfigurationService.getConfiguration();
        if (!config) throw new Error('System configuration not found');

        const {
            pickup,
            destination,
            vehicleTypeId,
            packageValue = 0,
            package: pkg,
            senderDetails,
            receiverDetails,
            pickupTime
        } = data;

        if (
            !pickup?.coordinates ||
            pickup.coordinates.length !== 2 ||
            !destination?.coordinates ||
            destination.coordinates.length !== 2
        ) {
            throw new Error(
                'Both pickup.coordinates and destination.coordinates ([lng, lat]) are required.'
            );
        }

        // Straight-line distance in km (same method used in createPackageOrder)
        const distanceKm = calculateStraightDistance(
            pickup.coordinates[1],   // lat
            pickup.coordinates[0],   // lng
            destination.coordinates[1],
            destination.coordinates[0]
        );
        // Distance in meters (as stored on the order)
        const distanceMeters = distanceKm * 1000;

        const serviceFee = 0; // Service fee is applicable to vendor orders only

        const buildQuote = (vehicle: any) => {
            const calculatedFee = this.roundToTwo(distanceKm * vehicle.feePerKm);
            const deliveryFee = this.roundToTwo(
                Math.max(calculatedFee, vehicle.baseDeliveryFee ?? 0)
            );
            const totalAmount = this.roundToTwo(
                packageValue + deliveryFee + serviceFee
            );

            return {
                vehicleTypeId: vehicle._id,
                vehicleType: vehicle.name,
                vehicleSlug: vehicle.slug,
                vehicleIcon: vehicle.icon ?? null,
                feePerKm: vehicle.feePerKm,
                deliveryFee,
                serviceFee,
                packageValue,
                totalAmount
            };
        };

        let quotes: any[];

        if (vehicleTypeId) {
            // Single vehicle quote
            const vehicle = await VehicleTypeModel.findOne({
                _id: vehicleTypeId,
                active: true
            });
            if (!vehicle) throw new Error('Vehicle type not found or inactive');
            quotes = [buildQuote(vehicle)];
        } else {
            // All active vehicle types — sorted cheapest first
            const vehicles = await VehicleTypeModel.find({ active: true }).sort({ feePerKm: 1 });
            if (!vehicles.length) throw new Error('No active vehicle types configured');
            quotes = vehicles.map(buildQuote);
        }

        return {
            // Addresses — pass through any extra fields (street, city, etc.) from the full payload
            pickup,
            destination,
            distanceKm: this.roundToTwo(distanceKm),
            distanceMeters: this.roundToTwo(distanceMeters),
            // Echo back full-payload extras when provided
            ...(pkg         && { package: pkg }),
            ...(senderDetails   && { senderDetails }),
            ...(receiverDetails && { receiverDetails }),
            ...(pickupTime  && { pickupTime }),
            quotes
        };
    }

    private async calculateProductOrderDetails(
        params: {
            vendorId: string;
            userId: string;
            addressId: string;
            products: any[];
        },
        session?: mongoose.ClientSession
    ): Promise<any> {
        const config = await ConfigurationService.getConfiguration();
        if (!config) throw new Error('System configuration not found');

        // 1. Get Vendor (Pickup) and Customer (Destination)
        const vendor = await VendorModel.findById(params.vendorId).session(
            session as mongoose.ClientSession
        );
        if (!vendor) throw new Error('Vendor not found');

        const customer = await UserRepository.findUserById(params.userId);
        if (!customer) throw new Error('Customer not found');

        const deliveryAddress = customer.addresses.find(
            (addr: any) => addr._id.toString() === params.addressId
        );

        if (!deliveryAddress) throw new Error('Delivery address not found');

        // 2. ENRICH PRODUCTS & CALCULATE SUBTOTAL
        const productIds = params.products.map((p: any) => p.product);
        const dbProducts = await ProductModel.find({
            _id: { $in: productIds }
        }).session(session as mongoose.ClientSession);

        let subtotal = 0;
        const enrichedProducts = params.products.map((p: any) => {
            const dbP = dbProducts.find(
                (item) => item._id.toString() === p.product
            );
            if (!dbP) throw new Error(`Product not found: ${p.product}`);

            // ✅ STOCK CHECK
            if (dbP.stock < p.quantity) {
                throw new Error(`Insufficient stock for ${dbP.name}. Available: ${dbP.stock}`);
            }

            const lineTotal = dbP.price * p.quantity;
            subtotal += lineTotal;

            return {
                product: dbP._id,
                name: dbP.name,
                category: dbP.category,
                price: dbP.price,
                quantity: p.quantity
            };
        });

        // 3. LOGISTICS (Hybrid Math)
        if (
            !vendor.location ||
            !vendor.location.coordinates ||
            vendor.location.coordinates.length < 2
        ) {
            throw new Error('Vendor location is not properly set');
        }

        if (
            !deliveryAddress.coordinates ||
            deliveryAddress.coordinates.length < 2
        ) {
            throw new Error('Delivery address coordinates are not set');
        }

        const straightKm = calculateStraightDistance(
            vendor.location.coordinates[1],
            vendor.location.coordinates[0],
            deliveryAddress.coordinates[1],
            deliveryAddress.coordinates[0]
        );

        const estimatedRoadKm = straightKm; // Road Factor
        const feePerKm = config.feePerKm || 50;
        const baseDeliveryFee = config.baseDeliveryFee || 200;
        const baseServiceFee = 0; // Service fee removed entirely

        let deliveryFee = this.roundToTwo(feePerKm * estimatedRoadKm);

        // Ensure it doesn't drop below base fee if configured
        if (deliveryFee < baseDeliveryFee) {
            deliveryFee = baseDeliveryFee;
        }

        const vat = 0;
        const totalAmount = this.roundToTwo(
            subtotal + deliveryFee + baseServiceFee + vat
        );

        return {
            vendor,
            customer,
            vendorId: vendor._id,
            vendorName: vendor.name,
            customerId: customer._id,
            pickup: {
                coordinates: vendor.location.coordinates,
                street: vendor.address
            },
            destination: {
                coordinates: deliveryAddress.coordinates,
                street: deliveryAddress.street,
                city: deliveryAddress.city,
                label: deliveryAddress.label
            },
            products: enrichedProducts,
            subtotal,
            deliveryFee,
            serviceFee: baseServiceFee,
            vat,
            totalAmount,
            distance: this.roundToTwo(estimatedRoadKm),
            chargePerKm: feePerKm,
            commission: config.vendorCommission
        };
    }

    async completeOrder(orderId: string, riderUserId: string): Promise<any> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const order = await OrderRepository.findOrderById(orderId);
            if (!order || order.isSettled) {
                await session.abortTransaction();
                return order;
            }

            // 1. FINANCIALS (Ensure session is passed here!)
            await SettlementService.settleOrder(order, riderUserId, session);

            // 2. ORDER UPDATE
            const updatedOrder = await OrderRepository.updateOrder(
                orderId,
                {
                    status: 'delivered',
                    completed: true,
                    completedBy: order.completedBy,
                    deliveredAt: new Date(),
                    isSettled: true
                },
                session
            );

            // 2.5 INCREMENT PRODUCT SALES COUNT
            if (order.products && order.products.length > 0) {
                const updatePromises = order.products.map((item) =>
                    ProductModel.findByIdAndUpdate(
                        item.product,
                        { $inc: { salesCount: item.quantity } },
                        { session }
                    )
                );
                await Promise.all(updatePromises);
            }

            // 3. DELIVERY UPDATE
            const delivery = await DeliveryRepository.getDeliveryByOrder(
                orderId
            );
            if (delivery) {
                await DeliveryRepository.updateDelivery(
                    delivery.id,
                    {
                        status: 'delivered',
                        actualDeliveryTime: new Date()
                    },
                    session
                );

                // 4. DISPATCH AUTO-COMPLETE
                if (delivery.dispatch) {
                    const dispatchId = delivery.dispatch.toString();

                    const pendingCount = await DeliveryModel.countDocuments({
                        dispatch: dispatchId,
                        status: { $ne: 'delivered' },
                        _id: { $ne: delivery._id } // Exclude current
                    }).session(session);

                    if (pendingCount === 0) {
                        // Pass session to repository!
                        await DispatchRepository.updateDispatch(
                            dispatchId,
                            {
                                status: 'completed',
                                endTime: new Date()
                            },
                            session
                        );
                    }
                }
            }

            await session.commitTransaction();

            // Notifications after commit
            try {
                // Determine User ID (order.user is populated?)
                // OrderRepository.findOrderById populates user and vendor
                const populatedOrder: any = order;

                if (populatedOrder.user) {
                    // In-App
                    await NotificationService.create({
                        userId: populatedOrder.user._id || populatedOrder.user,
                        title: 'Order Delivered',
                        message: `Your order ${populatedOrder.code} has been delivered. Enjoy!`,
                        status: 'unread'
                    });
                }

                if (populatedOrder.vendor) {
                    await NotificationService.create({
                        userId:
                            populatedOrder.vendor.userId ||
                            populatedOrder.vendor, // Check Vendor model for user link
                        vendorId: populatedOrder.vendor._id || populatedOrder.vendor,
                        role: 'vendor',
                        title: 'Order Delivered',
                        message: `Order ${populatedOrder.code} has been successfully delivered.`,
                        status: 'unread'
                    });
                }
            } catch (err) {
                console.error('Completion Notification Error:', err);
            }

            return updatedOrder;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async assignRider(orderId: string, riderId: string) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const order: any = await OrderRepository.findOrderById(orderId);
            if (!order) throw new Error('Order not found');

            // 1. Update Order
            order.rider = new mongoose.Types.ObjectId(riderId);
            order.deliveryAccepted = true; // Mark as accepted since admin is forcing it
            await order.save({ session });

            // 2. Update Delivery if exists
            const delivery = await DeliveryRepository.getDeliveryByOrder(orderId);
            if (delivery) {
                // 3. Manage Dispatch (Ensure DispatchService supports sessions)
                let dispatch = await DispatchService.getActiveDispatch(riderId);
                if (!dispatch) {
                    dispatch = await DispatchService.createDispatch(
                        { rider: new mongoose.Types.ObjectId(riderId) },
                        session
                    );
                }

                delivery.rider = new mongoose.Types.ObjectId(riderId);
                delivery.dispatch = dispatch._id;
                delivery.status = 'accepted';
                await delivery.save({ session });

                // 4. Add Delivery to Dispatch
                await DispatchService.addDeliveriesToDispatch(
                    dispatch._id,
                    [delivery._id.toString()],
                    session
                );
            }

            // Update rider's last assigned time for round-robin
            await RiderModel.findByIdAndUpdate(riderId, { lastAssignedAt: new Date() }, { session });

            await session.commitTransaction();
            return order;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async autoAssignRider(orderId: string) {
        try {
            const order: any = await OrderRepository.findOrderById(orderId);
            if (!order) return;
            if (order.rider) return; // Already assigned

            // Safely get pickup coordinates (fallback to new schema order.pickup.coordinates)
            const pickupCoords = order.pickup?.coordinates || order.pickupLocation || [];
            const orderLng = pickupCoords[0];
            const orderLat = pickupCoords[1];
            
            if (!orderLng || !orderLat) {
                console.log(`[AutoAssign] Skipped for order ${orderId}: Missing pickup coordinates`);
                return;
            }

            // 1. Get all available riders in the vendor's state
            const vendorState = order.vendor?.state;
            if (!vendorState) return;

            const availableRiders = await RiderModel.find({
                available: true
            }).select('_id userId lastAssignedAt');
            
            if (availableRiders.length === 0) {
                const vendorUserId = typeof order.vendor.user === 'object' ? order.vendor.user._id : order.vendor.user;
                await NotificationService.create({
                    userId: vendorUserId,
                    vendorId: order.vendor._id,
                    role: 'vendor',
                    title: 'No Active Riders Available',
                    message: `No active riders are currently available in your area for order ${order.code}. Please check back later.`,
                    channels: ['in_app'],
                    status: 'unread',
                    orderId: order._id,
                    orderCode: order.code
                });
                return;
            }

            // 2. Pick the available rider in the state with the oldest lastAssignedAt (Round-Robin)
            availableRiders.sort((a, b) => {
                if (!a.lastAssignedAt) return -1;
                if (!b.lastAssignedAt) return 1;
                return a.lastAssignedAt.getTime() - b.lastAssignedAt.getTime();
            });
            
            const selectedRider = availableRiders[0];

            // 3. Assign them
            await this.assignRider(orderId, selectedRider._id.toString());

            // NOTE: Notification is no longer sent automatically here. 
            // The vendor must manually click "Send for Dispatch" to trigger the notification.
        } catch (error) {
            console.error('Auto-assign rider failed:', error);
        }
    }

    /**
     * Standard status update wrapper
     */
    async updateOrderStatus(
        orderId: string,
        riderUserId: string,
        updateData: any
    ) {
        // If the update is specifically setting status to delivered,
        // redirect to the completeOrder method to ensure settlement happens.
        if (updateData.status === 'delivered') {
            return await this.completeOrder(orderId, riderUserId);
        }

        return this.updateOrder(orderId, { status: updateData.status });
    }

    /**
     * Calculation logic using System Config
     */
    async calculateDeliveryFee(
        distanceInMeters: number,
        vehicleTypeId?: string
    ): Promise<number> {
        if (typeof distanceInMeters !== 'number' || isNaN(distanceInMeters) || distanceInMeters < 0) {
            throw new Error('Invalid distance provided for delivery fee calculation');
        }

        const distanceInKm = distanceInMeters / 1000;

        // 1. If it's a product delivery (no vehicle specified), use global config
        if (!vehicleTypeId) {
            const config = await ConfigurationService.getConfiguration();
            return Math.max(
                this.roundToTwo(
                    config.baseDeliveryFee + distanceInKm * config.feePerKm
                ),
                config.baseDeliveryFee
            );
        }

        // 2. For packages, find the specific vehicle "table" entry
        const vehicle = await VehicleTypeModel.findOne({
            _id: vehicleTypeId,
            active: true
        });
        if (!vehicle) throw new Error('Invalid vehicle type');

        const calculatedFee = distanceInKm * vehicle.feePerKm;
        return this.roundToTwo(calculatedFee);
    }

    async calculateServiceFee(subTotal: number): Promise<number> {
        const config = await ConfigurationService.getConfiguration();
        if (!config) return 0;

        // vendorCommission is a percentage (e.g. 15)
        return (subTotal * config.vendorCommission) / 100;
    }

    // --- Standard Repository Wrappers ---

    async getOrderById(orderId: string) {
        return await OrderRepository.findOrderById(orderId);
    }

    async getOrderforPaymentAndCheckout(orderId: string) {
        const order: any = await OrderRepository.findOrderById(orderId);
        return {
            ...order,
            user: order.user.id,
            vendor: order.vendor.id,
            products: order.products
        };
    }

    async getOrderByCode(code: string) {
        return await OrderRepository.findOrderByCode(code);
    }
    async updateOrder(orderId: string, update: any, reason?: string) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const order: any = await OrderRepository.findOrderById(orderId);
            if (!order) throw new Error('Order not found');

            // 1. Logic for CANCELLATION
            if (['canceled', 'cancelled'].includes(update.status)) {
                if (!reason)
                    throw new Error('Reason is required for cancellation');
                if (order.status === 'delivered' || order.isSettled) {
                    throw new Error('Cannot cancel a completed/settled order');
                }
                // Trigger Refund
                await SettlementService.cancelOrder(
                    order,
                    order.user._id.toString(),
                    reason || 'Cancelled by vendor'
                );
            }

            // 2. Logic for PREPARED (Delivery Creation)
            if (update.status === 'prepared' && order.status !== 'prepared') {
                const existingDelivery =
                    await DeliveryRepository.getDeliveryByOrder(orderId);
                if (!existingDelivery) {
                    const generatedDeliveryCode = generateShortCode(6);

                    await DeliveryModel.create(
                        [
                            {
                                order: order._id,
                                status: 'pending',
                                deliveryCode: generatedDeliveryCode,
                                deliveryFee: order.deliveryFee,
                                vehicleType: order.vehicleType,
                                rider: null,
                                pickup: {
                                    ...order.pickup,
                                    state: order.vendor.state,
                                    coordinates:
                                        order.vendor.location.coordinates,
                                    street: order.vendor.address
                                },
                                state: order.vendor.state,
                                destination: order.destination,
                                senderDetails: {
                                    name: order.vendor.name,
                                    address: order.vendor.address,
                                    contactNumber: order.vendor.phoneNumber
                                },
                                receiverDetails: {
                                    name: `${order.user.firstName} ${order.user.lastName}`,
                                    address: order.destination.street,
                                    contactNumber: order.user.phoneNumber
                                }
                            }
                        ],
                        { session }
                    );
                }
                update.preparedAt = Date.now();
                
                // Trigger auto-assignment asynchronously (outside of transaction)
                if (!order.rider && !update.rider) {
                    // Running this without await so it doesn't block the update response
                    // and executes after the transaction
                    setTimeout(() => {
                        this.autoAssignRider(orderId).catch(err => console.error(err));
                    }, 500);
                }
            }

            // 3. Perform the actual update
            const updatedOrder = await OrderRepository.updateOrder(
                orderId,
                update,
                session
            );

            await session.commitTransaction();
            return updatedOrder;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async getAll(options: any) {
        return await OrderRepository.findAll(options);
    }

    async vendorAnalytics(vendorId: string, startDate: Date, endDate: Date) {
        return await OrderRepository.vendorAnalytics(
            vendorId,
            startDate,
            endDate
        );
    }

    async deleteAll() {
        // for testing only TODO delete this after dev
        return await OrderRepository.deleteAll();
    }

    // --- PAY FOR ME HELPERS ---

    async getOrderByPayForMeToken(token: string) {
        // Use Repository to find by token
        const order = await OrderRepository.findOrderByPayForMeToken(token);

        if (!order) throw new Error('Invalid payment link');

        // Check if pending
        if (order.payForMeStatus !== 'pending') {
            throw new Error(`This payment link is ${order.payForMeStatus}`);
        }

        // Check Expiry
        if (order.payForMeExpiresAt && order.payForMeExpiresAt < new Date()) {
            // Optionally update to expired if not already
            if (order.payForMeStatus === 'pending') {
                await OrderRepository.updateOrder(order._id as string, {
                    payForMeStatus: 'expired'
                });
            }
            throw new Error('Payment link has expired');
        }

        return order;
    }

    async completePayForMeOrder(
        orderId: string,
        payerId: string,
        paymentMethod: 'wallet' | 'online' = 'wallet'
    ): Promise<Order | any> {
        // 1. Fetch Order
        const order = await OrderRepository.findOrderById(orderId);
        if (!order) throw new Error('Order not found');

        // 2. Validate State
        if (order.payForMeStatus !== 'pending') {
            console.log(order.payForMeStatus);
            throw new Error('Order is not valid for Pay For Me completion');
        }
        if (order.paymentCompleted) {
            throw new Error('Order is already paid');
        }

        // 3. Process Payment based on Method

        if (paymentMethod === 'online') {
            // Fetch Payer Details
            const payer = await UserRepository.findUserById(payerId);
            if (!payer) throw new Error('Payer account not found');

            // Initiate Monnify Payment for this Payer
            // We need to ensure the webhook can identify this is a Pay For Me flow
            // The existing webhook checks "ORD-" reference.
            // If we use the SAME order reference, it will look like the original user paid.
            // But we want to record the Payer.
            // However, for MVP, as long as it is PAID, we update the order.
            // We just need to ensure the webhook updates `payForMePayer` as well?
            // Or we rely on the webhook detecting it's consistent.

            // Calling existing service
            return await PaymentService.initiateMonnifyPayment(order, payer);
        }

        // Default: Wallet Payment
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Check & Debit Payer's Wallet
            const debitResult = await WalletService.initDebitAccount(
                {
                    amount: order.totalAmount,
                    owner: payerId,
                    role: 'user'
                },
                session
            );

            if (!debitResult.success) {
                throw new Error(
                    'Insufficient wallet balance to pay for this order'
                );
            }

            // Move funds to System Escrow
            await WalletService.initCreditAccount(
                {
                    amount: order.totalAmount,
                    owner: 'system',
                    role: 'system'
                },
                session
            );

            // 4. Update Order
            const updatedOrder = await OrderRepository.updateOrder(
                orderId,
                {
                    payForMePayer: new mongoose.Types.ObjectId(payerId),
                    payForMeStatus: 'completed',
                    paymentCompleted: true,
                    status: 'pending', // Keep pending until vendor accepts
                    transactionReference: generateReference('TXN') // Generate a transaction ref
                },
                session
            );

            if (!updatedOrder) throw new Error('Failed to update order');

            await session.commitTransaction();
            return updatedOrder;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}

export default new OrderService();
