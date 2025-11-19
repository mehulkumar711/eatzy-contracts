import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { JwtAuthGuard, RolesGuard, Roles } from '@app/shared';
import { CreateVendorDto } from './create-vendor.dto';

@Controller('api/v1/vendors')
@UseGuards(JwtAuthGuard, RolesGuard) // 🔒 Authentication
@Roles('admin') // 🔒 Authorization - Admin only
export class VendorsController {
    constructor(private readonly vendorsService: VendorsService) { }

    @Get()
    async findAll() {
        return this.vendorsService.findAll();
    }

    @Get(':id/menu')
    async getMenu(@Param('id') id: string) {
        return this.vendorsService.getMenu(id);
    }

    @Post()
    async create(@Body() dto: CreateVendorDto) {
        return this.vendorsService.createVendor(dto.name);
    }
}
