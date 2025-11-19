// apps/admin-panel/src/hooks/useOrders.ts
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders';
import { useState } from 'react';

export const useOrders = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [status, setStatus] = useState<string | undefined>(undefined);

    const query = useQuery({
        queryKey: ['orders', page, limit, status],
        queryFn: () => ordersApi.getAll(page, limit, status),
        placeholderData: (previousData) => previousData,
    });

    return { ...query, page, setPage, limit, setLimit, status, setStatus };
};
