/* eslint-disable @typescript-eslint/no-explicit-any */
import BannerRepository from '../repositories/BannerRepository';
import { Banner } from '../models/Banner';

class BannerService {
    async create(data: any): Promise<Banner> {
        return await BannerRepository.createBanner(data);
    }

    async getAll(options: any, isAdmin = false): Promise<any> {
        return await BannerRepository.findAll(options, isAdmin);
    }

    async getById(id: string, isAdmin = false): Promise<Banner | null> {
        if (isAdmin) {
             return await BannerRepository.findBannerById(id);
        }
        return await BannerRepository.findActiveBannerById(id);
    }

    async update(id: string, data: any): Promise<Banner | null> {
        return await BannerRepository.updateBanner(id, data);
    }

    async delete(id: string): Promise<Banner | null> {
        return await BannerRepository.deleteBanner(id);
    }
}

export default new BannerService();
