// apps/admin-panel/src/hooks/useUsers.ts
import { useQuery } from '@tanstack/react-query';
import { usersApi, UserQueryParams } from '@/api/users';
import { useState } from 'react';

export const useUsers = () => {
  // Local state for table controls
  const [params, setParams] = useState<UserQueryParams>({
    page: 1,
    limit: 10,
    role: undefined,
    search: undefined,
  });

  // The Query
  const query = useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.getAll(params),
    placeholderData: (previousData) => previousData, // Keep data while fetching new page
  });

  return {
    ...query,
    params,
    setParams, // Expose this to update filters/pages from the UI
  };
};