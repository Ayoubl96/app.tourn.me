/**
 * Common API types and interfaces
 */

// Basic API response type
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Error response
export interface ApiError {
  message: string;
  status?: number;
  details?: Record<string, any>;
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// Pagination response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API caller function type
export type ApiCaller = (
  endpoint: string,
  options?: RequestInit
) => Promise<Response>;
