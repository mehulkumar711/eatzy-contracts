// Path: libs/shared/src/types/pagination.ts

/**
 * @interface PaginatedResponse
 * @description Standardized contract for all paginated API responses.
 * @template T - The type of data array contained in the response.
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}