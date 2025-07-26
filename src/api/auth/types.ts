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

/**
 * Country code for phone numbers
 */
export interface CountryCode {
  code: string;
  country: string;
  prefix: string;
  flag: string;
}

/**
 * Registration form data (including confirmations)
 */
export interface RegistrationFormData {
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
  name: string;
  address: string;
  phone_number: string;
  country_code: string;
}

/**
 * Registration data sent to API (processed form data)
 */
export interface RegistrationApiData {
  email: string;
  password: string;
  name: string;
  address: string;
  phone_number: string; // This will be country_code + phone_number combined
}

/**
 * Registration initiation response
 */
export interface RegistrationInitiateResponse {
  message: string;
  email: string;
  expires_in_minutes: number;
}

/**
 * Registration verification request
 */
export interface RegistrationVerifyRequest {
  email: string;
  code: string;
}

/**
 * Registration verification response (same as CompanyProfile)
 */
export interface RegistrationVerifyResponse extends CompanyProfile {}

/**
 * Resend verification request
 */
export interface ResendVerificationRequest {
  email: string;
}

/**
 * Resend verification response
 */
export interface ResendVerificationResponse {
  message: string;
  expires_in_minutes: number;
}

/**
 * Registration step enum
 */
export enum RegistrationStep {
  FORM = 'form',
  EMAIL_SENT = 'email_sent',
  VERIFICATION = 'verification',
  COMPLETED = 'completed',
  ERROR = 'error'
}

/**
 * Registration state
 */
export interface RegistrationState {
  step: RegistrationStep;
  email: string;
  expirationTime: number;
  attemptsRemaining: number;
  errorMessage: string;
  successMessage: string;
}

/**
 * Password strength levels
 */
export enum PasswordStrength {
  VERY_WEAK = 0,
  WEAK = 1,
  MEDIUM = 2,
  STRONG = 3,
  VERY_STRONG = 4
}

/**
 * Password validation result
 */
export interface PasswordValidation {
  strength: PasswordStrength;
  hasMinLength: boolean;
  hasNumber: boolean;
  hasLetter: boolean;
  hasLowerCase: boolean;
  hasUpperCase: boolean;
  hasSpecialChar: boolean;
  score: number;
}
