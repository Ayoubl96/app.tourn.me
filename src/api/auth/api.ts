import { ApiCaller } from '@/api/common/types';
import { handleApiResponse } from '@/api/common/apiClient';
import {
  LoginCredentials,
  LoginResponse,
  CompanyProfile,
  RegistrationFormData,
  RegistrationApiData,
  RegistrationInitiateResponse,
  RegistrationVerifyRequest,
  RegistrationVerifyResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  PasswordResetInitiateRequest,
  PasswordResetInitiateResponse,
  PasswordResetVerifyRequest,
  PasswordResetVerifyResponse,
  PasswordResetCompleteRequest,
  PasswordResetCompleteResponse,
  PasswordResetTokenStatusResponse
} from './types';

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

/**
 * Registration API functions
 */

/**
 * Initiate company registration process
 * Sends verification code to company email
 */
export async function initiateRegistration(
  formData: RegistrationApiData
): Promise<RegistrationInitiateResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
  const response = await fetch(`${baseUrl}/register/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Registration initiation failed' }));
    throw new Error(
      errorData.detail || errorData.message || 'Registration initiation failed'
    );
  }

  return response.json();
}

/**
 * Verify email and complete registration
 */
export async function verifyRegistration(
  verifyData: RegistrationVerifyRequest
): Promise<RegistrationVerifyResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
  const response = await fetch(`${baseUrl}/register/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(verifyData)
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Registration verification failed' }));
    throw new Error(
      errorData.detail ||
        errorData.message ||
        'Registration verification failed'
    );
  }

  return response.json();
}

/**
 * Resend verification code for registration
 */
export async function resendVerificationCode(
  data: ResendVerificationRequest
): Promise<ResendVerificationResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/registration/resend`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );

  return handleApiResponse<ResendVerificationResponse>(response);
}

/**
 * Password Reset API Functions
 */

/**
 * Initiate password reset - sends verification code to email
 */
export async function initiatePasswordReset(
  data: PasswordResetInitiateRequest
): Promise<PasswordResetInitiateResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/password-reset/initiate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );

  return handleApiResponse<PasswordResetInitiateResponse>(response);
}

/**
 * Verify password reset code and get reset token
 */
export async function verifyPasswordResetCode(
  data: PasswordResetVerifyRequest
): Promise<PasswordResetVerifyResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/password-reset/verify`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );

  return handleApiResponse<PasswordResetVerifyResponse>(response);
}

/**
 * Complete password reset with new password
 */
export async function completePasswordReset(
  data: PasswordResetCompleteRequest
): Promise<PasswordResetCompleteResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/password-reset/complete`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );

  return handleApiResponse<PasswordResetCompleteResponse>(response);
}

/**
 * Check password reset token status (for email links)
 */
export async function checkPasswordResetTokenStatus(
  token: string
): Promise<PasswordResetTokenStatusResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/password-reset/status/${token}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  return handleApiResponse<PasswordResetTokenStatusResponse>(response);
}
