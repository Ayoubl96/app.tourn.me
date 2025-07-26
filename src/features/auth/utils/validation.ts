import {
  PasswordStrength,
  PasswordValidation,
  CountryCode
} from '@/api/auth/types';

/**
 * Validates password strength based on various criteria
 */
export function validatePassword(password: string): PasswordValidation {
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLetter = hasLowerCase || hasUpperCase;
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  // Calculate score based on criteria
  let score = 0;
  if (hasMinLength) score += 1;
  if (hasNumber) score += 1;
  if (hasLetter) score += 1;
  if (hasSpecialChar) score += 1;

  // Additional scoring for length and complexity
  if (password.length >= 12) score += 1;
  if (hasUpperCase && hasLowerCase) score += 1;

  // Determine strength level
  let strength: PasswordStrength;
  if (score <= 1) {
    strength = PasswordStrength.VERY_WEAK;
  } else if (score === 2) {
    strength = PasswordStrength.WEAK;
  } else if (score === 3) {
    strength = PasswordStrength.MEDIUM;
  } else if (score === 4) {
    strength = PasswordStrength.STRONG;
  } else {
    strength = PasswordStrength.VERY_STRONG;
  }

  return {
    strength,
    hasMinLength,
    hasNumber,
    hasLetter,
    hasLowerCase,
    hasUpperCase,
    hasSpecialChar,
    score: Math.min(score, 5)
  };
}

/**
 * Gets the password strength label
 */
export function getPasswordStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case PasswordStrength.VERY_WEAK:
      return 'Very Weak';
    case PasswordStrength.WEAK:
      return 'Weak';
    case PasswordStrength.MEDIUM:
      return 'Medium';
    case PasswordStrength.STRONG:
      return 'Strong';
    case PasswordStrength.VERY_STRONG:
      return 'Very Strong';
    default:
      return 'Unknown';
  }
}

/**
 * Gets the password strength color
 */
export function getPasswordStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case PasswordStrength.VERY_WEAK:
      return 'bg-red-500';
    case PasswordStrength.WEAK:
      return 'bg-orange-500';
    case PasswordStrength.MEDIUM:
      return 'bg-yellow-500';
    case PasswordStrength.STRONG:
      return 'bg-blue-500';
    case PasswordStrength.VERY_STRONG:
      return 'bg-green-500';
    default:
      return 'bg-gray-300';
  }
}

/**
 * Common country codes for phone numbers
 */
export const COUNTRY_CODES: CountryCode[] = [
  { code: 'US', country: 'United States', prefix: '+1', flag: '🇺🇸' },
  { code: 'GB', country: 'United Kingdom', prefix: '+44', flag: '🇬🇧' },
  { code: 'ES', country: 'Spain', prefix: '+34', flag: '🇪🇸' },
  { code: 'IT', country: 'Italy', prefix: '+39', flag: '🇮🇹' },
  { code: 'FR', country: 'France', prefix: '+33', flag: '🇫🇷' },
  { code: 'DE', country: 'Germany', prefix: '+49', flag: '🇩🇪' },
  { code: 'PT', country: 'Portugal', prefix: '+351', flag: '🇵🇹' },
  { code: 'NL', country: 'Netherlands', prefix: '+31', flag: '🇳🇱' },
  { code: 'BE', country: 'Belgium', prefix: '+32', flag: '🇧🇪' },
  { code: 'CH', country: 'Switzerland', prefix: '+41', flag: '🇨🇭' },
  { code: 'AT', country: 'Austria', prefix: '+43', flag: '🇦🇹' },
  { code: 'SE', country: 'Sweden', prefix: '+46', flag: '🇸🇪' },
  { code: 'NO', country: 'Norway', prefix: '+47', flag: '🇳🇴' },
  { code: 'DK', country: 'Denmark', prefix: '+45', flag: '🇩🇰' },
  { code: 'FI', country: 'Finland', prefix: '+358', flag: '🇫🇮' },
  { code: 'IE', country: 'Ireland', prefix: '+353', flag: '🇮🇪' },
  { code: 'GR', country: 'Greece', prefix: '+30', flag: '🇬🇷' },
  { code: 'PL', country: 'Poland', prefix: '+48', flag: '🇵🇱' },
  { code: 'CZ', country: 'Czech Republic', prefix: '+420', flag: '🇨🇿' },
  { code: 'HU', country: 'Hungary', prefix: '+36', flag: '🇭🇺' },
  { code: 'HR', country: 'Croatia', prefix: '+385', flag: '🇭🇷' },
  { code: 'SI', country: 'Slovenia', prefix: '+386', flag: '🇸🇮' },
  { code: 'SK', country: 'Slovakia', prefix: '+421', flag: '🇸🇰' },
  { code: 'BG', country: 'Bulgaria', prefix: '+359', flag: '🇧🇬' },
  { code: 'RO', country: 'Romania', prefix: '+40', flag: '🇷🇴' },
  { code: 'LT', country: 'Lithuania', prefix: '+370', flag: '🇱🇹' },
  { code: 'LV', country: 'Latvia', prefix: '+371', flag: '🇱🇻' },
  { code: 'EE', country: 'Estonia', prefix: '+372', flag: '🇪🇪' },
  { code: 'CY', country: 'Cyprus', prefix: '+357', flag: '🇨🇾' },
  { code: 'MT', country: 'Malta', prefix: '+356', flag: '🇲🇹' },
  { code: 'LU', country: 'Luxembourg', prefix: '+352', flag: '🇱🇺' },
  { code: 'MX', country: 'Mexico', prefix: '+52', flag: '🇲🇽' },
  { code: 'CA', country: 'Canada', prefix: '+1', flag: '🇨🇦' },
  { code: 'BR', country: 'Brazil', prefix: '+55', flag: '🇧🇷' },
  { code: 'AR', country: 'Argentina', prefix: '+54', flag: '🇦🇷' },
  { code: 'CL', country: 'Chile', prefix: '+56', flag: '🇨🇱' },
  { code: 'CO', country: 'Colombia', prefix: '+57', flag: '🇨🇴' },
  { code: 'PE', country: 'Peru', prefix: '+51', flag: '🇵🇪' },
  { code: 'UY', country: 'Uruguay', prefix: '+598', flag: '🇺🇾' },
  { code: 'AU', country: 'Australia', prefix: '+61', flag: '🇦🇺' },
  { code: 'NZ', country: 'New Zealand', prefix: '+64', flag: '🇳🇿' },
  { code: 'JP', country: 'Japan', prefix: '+81', flag: '🇯🇵' },
  { code: 'KR', country: 'South Korea', prefix: '+82', flag: '🇰🇷' },
  { code: 'CN', country: 'China', prefix: '+86', flag: '🇨🇳' },
  { code: 'IN', country: 'India', prefix: '+91', flag: '🇮🇳' },
  { code: 'SG', country: 'Singapore', prefix: '+65', flag: '🇸🇬' },
  { code: 'MY', country: 'Malaysia', prefix: '+60', flag: '🇲🇾' },
  { code: 'TH', country: 'Thailand', prefix: '+66', flag: '🇹🇭' },
  { code: 'ID', country: 'Indonesia', prefix: '+62', flag: '🇮🇩' },
  { code: 'PH', country: 'Philippines', prefix: '+63', flag: '🇵🇭' },
  { code: 'VN', country: 'Vietnam', prefix: '+84', flag: '🇻🇳' },
  { code: 'AE', country: 'United Arab Emirates', prefix: '+971', flag: '🇦🇪' },
  { code: 'SA', country: 'Saudi Arabia', prefix: '+966', flag: '🇸🇦' },
  { code: 'EG', country: 'Egypt', prefix: '+20', flag: '🇪🇬' },
  { code: 'ZA', country: 'South Africa', prefix: '+27', flag: '🇿🇦' },
  { code: 'MA', country: 'Morocco', prefix: '+212', flag: '🇲🇦' },
  { code: 'TN', country: 'Tunisia', prefix: '+216', flag: '🇹🇳' },
  { code: 'IL', country: 'Israel', prefix: '+972', flag: '🇮🇱' },
  { code: 'TR', country: 'Turkey', prefix: '+90', flag: '🇹🇷' },
  { code: 'RU', country: 'Russia', prefix: '+7', flag: '🇷🇺' },
  { code: 'UA', country: 'Ukraine', prefix: '+380', flag: '🇺🇦' }
];

/**
 * Validates phone number format (basic validation)
 */
export function validatePhoneNumber(
  phoneNumber: string,
  countryCode: string
): boolean {
  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // Basic length validation (most phone numbers are 7-15 digits)
  if (cleanNumber.length < 7 || cleanNumber.length > 15) {
    return false;
  }

  // Country-specific validation (basic)
  const country = COUNTRY_CODES.find((c) => c.code === countryCode);
  if (!country) return false;

  // Simple validation based on common patterns
  switch (countryCode) {
    case 'US':
    case 'CA':
      return cleanNumber.length === 10;
    case 'ES':
      return cleanNumber.length === 9;
    case 'IT':
      return cleanNumber.length >= 9 && cleanNumber.length <= 11;
    case 'FR':
      return cleanNumber.length === 10;
    case 'DE':
      return cleanNumber.length >= 10 && cleanNumber.length <= 12;
    case 'GB':
      return cleanNumber.length === 10 || cleanNumber.length === 11;
    default:
      // General validation for other countries
      return cleanNumber.length >= 7 && cleanNumber.length <= 15;
  }
}

/**
 * Formats phone number for display
 */
export function formatPhoneNumber(
  phoneNumber: string,
  countryCode: string
): string {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const country = COUNTRY_CODES.find((c) => c.code === countryCode);

  if (!country) return phoneNumber;

  return `${country.prefix} ${cleanNumber}`;
}

/**
 * Combines country code prefix with phone number
 */
export function combinePhoneNumber(
  phoneNumber: string,
  countryCode: string
): string {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const country = COUNTRY_CODES.find((c) => c.code === countryCode);

  if (!country) return phoneNumber;

  return `${country.prefix}${cleanNumber}`;
}
