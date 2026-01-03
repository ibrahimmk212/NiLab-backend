// // import { ConfigService } from 'aws-sdk';
// import { Configuration, ICity, IState } from '../models/Configuration';
// import ConfigurationRepository from '../repositories/ConfigurationRepository';
// interface IConfigurationService {
//     create(payload: any): Promise<any>;
//     getConfiguration(): Promise<any>;
//     update(id: string, data: any): Promise<boolean>;
// }

// class ConfigurationService implements IConfigurationService {
//     async create(payload: Partial<Configuration>): Promise<any> {
//         return ConfigurationRepository.createConfiguration(payload);
//     }

//     async getConfiguration(): Promise<Configuration | null> {
//         let configuration = await ConfigurationRepository.getConfiguration();

//         if (!configuration) {
//             configuration = await this.create({
//                 deliveryFee: 20,
//                 maxDeliveryFee: 500,
//                 packageDeliveryCommision: 20,
//                 maxPackageDeliveryCommision: 400,
//                 payOnDeliveryDiscount: 5,
//                 serviceFee: 20,
//                 maxServiceFee: 200,
//                 vatRate: 0,
//                 nearbyDistance: 2000,
//                 closingHour: '21:00',
//                 openingHour: '9:00',
//                 serviceCities: [],
//                 serviceStates: []
//             });
//         }

//         return configuration;
//     }

//     async update(id: string, data: Partial<Configuration>): Promise<any> {
//         return ConfigurationRepository.updateConfiguration(id, data);
//     }
//     async addState(id: string, data: IState): Promise<Configuration | null> {
//         return ConfigurationRepository.addNewState(id, data);
//     }
//     async removeState(
//         id: string,
//         stateId: string
//     ): Promise<Configuration | null> {
//         return ConfigurationRepository.deleteState(id, stateId);
//     }

//     async addCity(id: string, data: ICity): Promise<Configuration | null> {
//         return ConfigurationRepository.addNewCity(id, data);
//     }
//     async removeCity(
//         id: string,
//         stateId: string
//     ): Promise<Configuration | null> {
//         return ConfigurationRepository.deleteCity(id, stateId);
//     }
// }
// export default new ConfigurationService();
import { Configuration, ICity, IState } from '../models/Configuration';
import ConfigurationRepository from '../repositories/ConfigurationRepository';

interface IConfigurationService {
    getConfiguration(): Promise<Configuration>;
    update(data: Partial<Configuration>): Promise<Configuration | null>;
    addState(data: IState): Promise<Configuration | null>;
    removeState(stateId: string): Promise<Configuration | null>;
    addCity(data: ICity): Promise<Configuration | null>;
    removeCity(cityId: string): Promise<Configuration | null>;
}

class ConfigurationService implements IConfigurationService {
    // Uses the repo's getOrCreate to ensure we always have data
    async getConfiguration(): Promise<Configuration> {
        return await ConfigurationRepository.getOrCreateConfiguration();
    }

    // Updates the singleton document directly
    async update(data: Partial<Configuration>): Promise<Configuration | null> {
        // Business Rule: Ensure percentages stay within bounds
        if (
            data.vendorCommission !== undefined &&
            (data.vendorCommission < 0 || data.vendorCommission > 100)
        ) {
            throw new Error('Vendor commission must be between 0 and 100');
        }
        return await ConfigurationRepository.updateConfiguration(data);
    }

    async addState(data: IState): Promise<Configuration | null> {
        // Automatically ensure the slug is valid for the repo's uniqueness check
        if (!data.slug) {
            data.slug = data.name.toLowerCase().trim().replace(/\s+/g, '-');
        }
        const result = await ConfigurationRepository.addNewState(data);
        if (!result)
            throw new Error(
                'State with this slug already exists in the system.'
            );
        return result;
    }

    async removeState(stateId: string): Promise<Configuration | null> {
        return await ConfigurationRepository.deleteState(stateId);
    }

    async addCity(data: ICity): Promise<Configuration | null> {
        // Enforce GeoJSON structure before pushing to repo
        if (data.location?.coordinates?.length !== 2) {
            throw new Error(
                'Invalid city location. Requires [longitude, latitude]'
            );
        }

        const result = await ConfigurationRepository.addNewCity(data);
        console.log('Add City Result:', result);
        if (!result)
            throw new Error(
                'City slug already exists or configuration missing.'
            );
        return result;
    }

    async removeCity(cityId: string): Promise<Configuration | null> {
        return await ConfigurationRepository.deleteCity(cityId);
    }
}

export default new ConfigurationService();
