import { ApiCaller } from '@/api/common/types';
import { handleApiResponse } from '@/api/common/apiClient';
import { LoginCredentials, LoginResponse, CompanyProfile } from './types';

/**
 * Authentication API functions
 */

/**
 * Login with username and password
 */
export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
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
};

/**
 * Get the current user/company profile
 */
export const getProfile = async (
  callApi: ApiCaller
): Promise<CompanyProfile> => {
  const response = await callApi('/companies/me/');
  return handleApiResponse<CompanyProfile>(response);
};

/**
 * Validate token
 */
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/token/validate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.ok;
  } catch (error) {
    return false;
  }
};
