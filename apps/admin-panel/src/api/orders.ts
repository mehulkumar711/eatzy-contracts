// apps/admin-panel/src/api/orders.ts
import { api } from '@/lib/api';

export enum OrderStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

export interface Order {
    id: string;
    user_id: string;
    vendor_id: string;
    total_amount_paise: number;
    status: OrderStatus;
    created_at: string;
}

export const ordersApi = {
    getAll: async (page = 1, limit = 10, status?: string) => {
        const params = { page, limit, status };
        // Note: Order Service runs on port 3000, proxied via /api/orders
        const { data } = await api.get('/orders', { params });
        return data;
    },
};
