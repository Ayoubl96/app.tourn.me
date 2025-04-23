import { fetchWithLogout } from '@/lib/fetchWithLogout';
import { ApiError } from './types';

// The base URL is read from environment variable
const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

/**
 * Handles API call response and extracts JSON data or throws appropriate error
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Unknown error occurred' }));
    const error: ApiError = {
      message:
        errorData.message || errorData.detail || 'Unknown error occurred',
      status: response.status,
      details: errorData
    };
    throw error;
  }

  return await response.json();
}

/**
 * Makes an API call with consistent error handling and base URL
 * This works in both client and server contexts
 */
export async function apiClient(
  endpoint: string,
  init?: RequestInit
): Promise<Response> {
  // Ensure endpoint starts with '/'
  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;
  const fullUrl = `${baseUrl}${normalizedEndpoint}`;

  // Use standard fetch for now - we'll add a client-specific wrapper
  return fetch(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });
}
