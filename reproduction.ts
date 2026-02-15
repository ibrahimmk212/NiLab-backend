
import { Delivery } from './src/api/models/Delivery';

// Mocking the DeliveryModel and Repository logic essentially to verify filter construction
class DeliveryRepositoryMock {
    async getAll(options: any) {
        const filter: Record<string, any> = {};

        if (options.riderId) filter.rider = options.riderId;

        // If we want "Active", we pass an array of statuses to options.status
        if (options.status) {
            if (Array.isArray(options.status)) {
                filter.status = { $in: options.status };
            } else {
                filter.status = options.status;
            }
        } else if (options.isActiveSearch) {
            // If we just want everything NOT delivered or canceled
            filter.status = { $in: ['accepted', 'picked-up', 'in-transit'] };
        }
        
        // ... lines 36-37 ...
        // if (options.status) filter.status = options.status;
        if (options.riderId) filter.rider = options.riderId;
        
        console.log("Constructed Filter:", JSON.stringify(filter, null, 2));
        return filter;
    }
}

async function run() {
    const repo = new DeliveryRepositoryMock();
    const riderId = "60d0fe4f5311236168a109ca";
    const result = await repo.getAll({
        riderId,
        status: ['accepted', 'picked-up', 'in-transit'],
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: 50,
        page: 1
    });
}

run();
