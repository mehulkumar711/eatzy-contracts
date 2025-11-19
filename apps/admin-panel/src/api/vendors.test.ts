import { describe, it, expect, vi } from 'vitest';
import { vendorsApi } from './vendors';
import { api } from '@/lib/api';

vi.mock('@/lib/api');

describe('vendorsApi', () => {
    it('getAll fetches vendors', async () => {
        const mockData = [{ id: '1', name: 'Vendor 1', is_active: true, createdAt: '2024-01-01' }];
        (api.get as any).mockResolvedValue({ data: mockData });

        const result = await vendorsApi.getAll();
        expect(result).toEqual(mockData);
        expect(api.get).toHaveBeenCalledWith('/vendors');
    });

    it('getMenu fetches menu items', async () => {
        const mockData = [{ id: '1', name: 'Pizza', pricePaise: 50000 }];
        (api.get as any).mockResolvedValue({ data: mockData });

        const result = await vendorsApi.getMenu('v1');
        expect(result).toEqual(mockData);
        expect(api.get).toHaveBeenCalledWith('/vendors/v1/menu');
    });
});
