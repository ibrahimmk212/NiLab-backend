// scripts/initializeSystem.ts
import WalletRepository from '../api/repositories/WalletRepository';
import ConfigurationModel from '../api/models/Configuration';

export const initializePointZero = async () => {
    try {
        // 1. Ensure System Wallet exists
        const systemWallet = await WalletRepository.getWalletByOwner('system');
        if (systemWallet) {
            console.log('✅ System Wallet Ready:', systemWallet._id);
        }

        // 2. Ensure Default Configuration exists
        const configCount = await ConfigurationModel.countDocuments();
        if (configCount === 0) {
            await ConfigurationModel.create({
                vendorCommission: 15, // 15% platform fee on products
                riderCommission: 10, // 10% platform fee on delivery
                baseDeliveryFee: 500, // Starting price for delivery
                feePerKm: 150, // Extra charge per kilometer
                serviceFee: 100, // Flat customer service fee
                maxDeliveryFee: 3000,
                maxServiceFee: 500
            });
            console.log('✅ System Configuration Initialized');
        }
    } catch (error) {
        console.error('❌ Initialization failed:', error);
    }
};
