import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './vendor.entity';
import { MenuItem } from './menu-item.entity';

@Injectable()
export class VendorsService {
    private readonly logger = new Logger(VendorsService.name);

    constructor(
        @InjectRepository(Vendor) private vendorRepo: Repository<Vendor>,
        @InjectRepository(MenuItem) private menuRepo: Repository<MenuItem>,
    ) { }

    async findAll() {
        try {
            return await this.vendorRepo.createQueryBuilder('vendor')
                .loadRelationCountAndMap('vendor.menuItemCount', 'vendor.menuItems')
                .orderBy('vendor.createdAt', 'DESC')
                .getMany();
        } catch (error) {
            this.logger.error('Failed to fetch vendors', error.stack);
            throw new InternalServerErrorException('Could not fetch vendor list');
        }
    }

    async getMenu(vendorId: string) {
        try {
            return await this.menuRepo.find({ where: { vendorId } });
        } catch (error) {
            this.logger.error(`Failed to fetch menu for vendor ${vendorId}`, error.stack);
            throw new InternalServerErrorException('Could not fetch menu items');
        }
    }

    async createVendor(name: string) {
        try {
            const vendor = this.vendorRepo.create({ name });
            return await this.vendorRepo.save(vendor);
        } catch (error) {
            this.logger.error(`Failed to create vendor ${name}`, error.stack);
            throw new InternalServerErrorException('Could not create vendor');
        }
    }
}
