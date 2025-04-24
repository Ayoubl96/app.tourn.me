/**
 * Login credentials
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Login response from backend
 */
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/**
 * Company/User profile
 */
export interface CompanyProfile {
  id: number;
  name: string;
  login: string;
  address: string;
  email: string;
  phone_number: string;
  created_at: string;
  updated_at?: string;
}

/**
 * User with token for authentication
 */
export interface AuthenticatedUser {
  id: string; // NextAuth expects id to be a string
  name: string;
  login: string;
  token: string;
  refreshToken: string;
  address: string;
  email: string;
  phone_number: string;
  created_at: string;
  updated_at?: string;
}
