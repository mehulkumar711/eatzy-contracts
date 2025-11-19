import { Test, TestingModule } from '@nestjs/testing';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { JwtAuthGuard, RolesGuard } from '@app/shared';

const mockService = {
    findAll: jest.fn().mockResolvedValue([]),
    createVendor: jest.fn(),
    getMenu: jest.fn(),
};

describe('VendorsController', () => {
    let controller: VendorsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [VendorsController],
            providers: [{ provide: VendorsService, useValue: mockService }],
        })
            .overrideGuard(JwtAuthGuard).useValue({ canActivate: jest.fn(() => true) })
            .overrideGuard(RolesGuard).useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<VendorsController>(VendorsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call service.findAll', async () => {
        await controller.findAll();
        expect(mockService.findAll).toHaveBeenCalled();
    });

    it('should call service.getMenu with vendorId', async () => {
        await controller.getMenu('v1');
        expect(mockService.getMenu).toHaveBeenCalledWith('v1');
    });
});
