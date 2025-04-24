import { ApiCaller } from '@/api/common/types';
import { handleApiResponse } from '@/api/common/apiClient';
import { LoginCredentials, LoginResponse, CompanyProfile } from './types';

/**
 * Authentication API functions
 */

/**
 * Login with username and password (works on both client and server)
 */
export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        username,
        password
      })
    }
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Login failed' }));
    throw new Error(errorData.message || errorData.detail || 'Login failed');
  }

  return response.json();
}

/**
 * Get the current user/company profile - client-side version
 */
export async function getProfile(callApi: ApiCaller): Promise<CompanyProfile> {
  const response = await callApi('/companies/me/');
  return handleApiResponse<CompanyProfile>(response);
}

/**
 * Get the current user/company profile - server-side version
 * This function can be used in server components and auth.config.ts
 */
export async function getProfileServer(
  accessToken: string
): Promise<CompanyProfile> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
  const response = await fetch(`${baseUrl}/companies/me`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Failed to get profile' }));
    throw new Error(
      errorData.message || errorData.detail || 'Failed to get profile'
    );
  }

  return response.json();
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(
  refreshToken: string
): Promise<LoginResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/refresh`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    }
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Token refresh failed' }));
    throw new Error(
      errorData.message || errorData.detail || 'Token refresh failed'
    );
  }

  return response.json();
}
