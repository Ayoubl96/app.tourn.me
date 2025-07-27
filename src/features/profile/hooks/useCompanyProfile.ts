'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  CompanyProfile,
  CompanyUpdateRequest,
  CompanyUpdateResponse,
  CompanyPasswordChangeRequest,
  CompanyPasswordChangeResponse,
  getProfile,
  updateCompanyInfo,
  changeCompanyPassword
} from '@/api/auth';

interface UseCompanyProfileReturn {
  // Data
  profile: CompanyProfile | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  refreshProfile: () => Promise<void>;
  updateInfo: (data: CompanyUpdateRequest) => Promise<CompanyUpdateResponse>;
  changePassword: (
    data: CompanyPasswordChangeRequest
  ) => Promise<CompanyPasswordChangeResponse>;
  clearError: () => void;
}

// Custom API client that properly includes the Authorization header
async function authenticatedApiClient(
  endpoint: string,
  accessToken: string,
  init?: RequestInit
): Promise<Response> {
  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
  const fullUrl = `${baseUrl}${normalizedEndpoint}`;

  return fetch(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {})
    },
    ...init
  });
}

export function useCompanyProfile(): UseCompanyProfileReturn {
  const { data: session, update: updateSession, status } = useSession();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if we've already fetched data to prevent loops
  const hasFetchedRef = useRef(false);
  const lastTokenRef = useRef<string | null>(null);

  // Fetch profile data from API
  const refreshProfile = useCallback(async () => {
    // Don't make API calls if session is still loading or no access token
    if (status === 'loading' || !session?.accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      setIsRefreshing(true);
      setError(null);

      // Create custom API client with token
      const apiClientWithAuth = (endpoint: string, init?: RequestInit) =>
        authenticatedApiClient(endpoint, session.accessToken, init);

      const profileData = await getProfile(apiClientWithAuth);
      setProfile(profileData);

      // Update session with fresh data (don't await to prevent loops)
      updateSession({
        ...session,
        user: {
          ...session.user,
          name: profileData.name,
          email: profileData.email,
          phone_number: profileData.phone_number || '',
          address: profileData.address || '',
          vat_number: profileData.vat_number || '',
          login: profileData.login,
          created_at: profileData.created_at,
          updated_at: profileData.updated_at || ''
        }
      }).catch((err) => console.warn('Session update failed:', err));

      hasFetchedRef.current = true;
      lastTokenRef.current = session.accessToken;
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError(err.message || 'Failed to fetch profile data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [session?.accessToken, status]); // Only depend on accessToken and status

  // Initial load and token changes
  useEffect(() => {
    // Only fetch if:
    // 1. Session is loaded
    // 2. We have an access token
    // 3. We haven't fetched yet OR the token changed
    if (
      status !== 'loading' &&
      session?.accessToken &&
      (!hasFetchedRef.current || lastTokenRef.current !== session.accessToken)
    ) {
      refreshProfile();
    }

    // Handle case where session becomes unavailable
    if (status !== 'loading' && !session?.accessToken) {
      setProfile(null);
      setIsLoading(false);
      setError(null);
      hasFetchedRef.current = false;
      lastTokenRef.current = null;
    }
  }, [session?.accessToken, status, refreshProfile]);

  const updateInfo = useCallback(
    async (data: CompanyUpdateRequest): Promise<CompanyUpdateResponse> => {
      if (!session?.accessToken) {
        throw new Error('No authentication token available');
      }

      setError(null);

      try {
        const apiClientWithAuth = (endpoint: string, init?: RequestInit) =>
          authenticatedApiClient(endpoint, session.accessToken, init);

        const response = await updateCompanyInfo(data, apiClientWithAuth);

        // Update local state
        setProfile((prev) => (prev ? { ...prev, ...response } : response));

        // Update session with new data (don't await)
        updateSession({
          ...session,
          user: {
            ...session.user,
            name: response.name,
            email: response.email,
            phone_number: response.phone_number || '',
            address: response.address || '',
            vat_number: response.vat_number || '',
            updated_at: response.updated_at || new Date().toISOString()
          }
        }).catch((err) => console.warn('Session update failed:', err));

        return response;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to update information';
        setError(errorMessage);
        throw err;
      }
    },
    [session?.accessToken, updateSession]
  );

  const changePassword = useCallback(
    async (
      data: CompanyPasswordChangeRequest
    ): Promise<CompanyPasswordChangeResponse> => {
      if (!session?.accessToken) {
        throw new Error('No authentication token available');
      }

      setError(null);

      try {
        const apiClientWithAuth = (endpoint: string, init?: RequestInit) =>
          authenticatedApiClient(endpoint, session.accessToken, init);

        const response = await changeCompanyPassword(data, apiClientWithAuth);
        return response;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to change password';
        setError(errorMessage);
        throw err;
      }
    },
    [session?.accessToken]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Manual refresh that users can trigger
  const manualRefresh = useCallback(async () => {
    hasFetchedRef.current = false; // Reset the fetch flag
    await refreshProfile();
  }, [refreshProfile]);

  return {
    profile,
    isLoading: isLoading && status !== 'unauthenticated',
    isRefreshing,
    error,
    refreshProfile: manualRefresh,
    updateInfo,
    changePassword,
    clearError
  };
}
