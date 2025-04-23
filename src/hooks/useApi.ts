'use client';

import { useSession } from 'next-auth/react';
import { clientApiClient } from '@/api/common/clientApi';
import { useCallback } from 'react';

export function useApi() {
  const { data: session } = useSession();
  const token = session?.accessToken || '';

  /**
   * Generic call function that merges the user's bearer token
   * into headers. Also calls the client API client to handle base URL + logout-on-401.
   */
  const callApi = useCallback(
    async (endpoint: string, init?: RequestInit) => {
      return clientApiClient(endpoint, {
        ...init,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(init?.headers ?? {})
        }
      });
    },
    [token]
  );

  return callApi;
}
