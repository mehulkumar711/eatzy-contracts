import { Test, TestingModule } from '@nestjs/testing';
import { VendorsService } from './vendors.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vendor } from './vendor.entity';
import { MenuItem } from './menu-item.entity';
import { InternalServerErrorException } from '@nestjs/common';

const mockRepo = () => ({
    createQueryBuilder: jest.fn(() => ({
        loadRelationCountAndMap: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: '1', name: 'Test Vendor' }]),
    })),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
});

describe('VendorsService', () => {
    let service: VendorsService;
    let vendorRepo;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VendorsService,
                { provide: getRepositoryToken(Vendor), useFactory: mockRepo },
                { provide: getRepositoryToken(MenuItem), useFactory: mockRepo },
            ],
        }).compile();

        service = module.get<VendorsService>(VendorsService);
        vendorRepo = module.get(getRepositoryToken(Vendor));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of vendors', async () => {
            const result = await service.findAll();
            expect(result).toEqual([{ id: '1', name: 'Test Vendor' }]);
            expect(vendorRepo.createQueryBuilder).toHaveBeenCalled();
        });

        it('should throw InternalServerErrorException on DB error', async () => {
            jest.spyOn(vendorRepo, 'createQueryBuilder').mockImplementation(() => {
                throw new Error('DB Dead');
            });
            await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('createVendor', () => {
        it('should successfully create a vendor', async () => {
            const dto = { name: 'New Vendor' };
            vendorRepo.create.mockReturnValue(dto);
            vendorRepo.save.mockResolvedValue({ id: '2', ...dto });

            const result = await service.createVendor('New Vendor');
            expect(result).toEqual({ id: '2', name: 'New Vendor' });
        });
    });
});
