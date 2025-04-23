'use client';

import { fetchWithLogout } from '@/lib/fetchWithLogout';
import { apiClient } from './apiClient';

/**
 * Client-side version of apiClient that uses fetchWithLogout for 401 handling
 * This can only be used in client components
 */
export async function clientApiClient(
  endpoint: string,
  init?: RequestInit
): Promise<Response> {
  // Ensure endpoint starts with '/'
  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
  const fullUrl = `${baseUrl}${normalizedEndpoint}`;

  // Use fetchWithLogout for client-side 401 handling
  return fetchWithLogout(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });
}
