import VehicleTypeRepository from '../repositories/VehicleTypeRepository';

class VehicleTypeService {
    async createVehicleType(data: any) {
        return await VehicleTypeRepository.createVehicleType(data);
    }
    async getAllVehicleTypes(options: any) {
        return await VehicleTypeRepository.findAllVehicleTypes(options);
    }
    async getVehicleTypeById(id: string) {
        return await VehicleTypeRepository.findVehicleTypeById(id);
    }
    async updateVehicleType(id: string, data: any) {
        return await VehicleTypeRepository.updateVehicleType(id, data);
    }
    async deleteVehicleType(id: string) {
        return await VehicleTypeRepository.deleteVehicleType(id);
    }
}
//

export default new VehicleTypeService();
