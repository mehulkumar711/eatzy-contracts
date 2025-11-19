import { api } from '@/lib/api';

export interface Vendor {
    id: string;
    name: string;
    is_active: boolean;
    createdAt: string;
    menuItemCount?: number;
}

export interface MenuItem {
    id: string;
    name: string;
    pricePaise: number;
}

export const vendorsApi = {
    getAll: async () => {
        const { data } = await api.get<Vendor[]>('/vendors'); // Proxied to order-service
        return data;
    },
    getMenu: async (id: string) => {
        const { data } = await api.get<MenuItem[]>(`/vendors/${id}/menu`);
        return data;
    }
};
