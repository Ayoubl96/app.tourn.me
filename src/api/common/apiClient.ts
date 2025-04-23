'use client';

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
 * This is a lower-level function that doesn't include auth tokens
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

  return fetchWithLogout(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });
}
