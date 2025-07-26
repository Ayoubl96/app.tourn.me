import {
  PasswordStrength,
  PasswordValidation,
  CountryData
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
  const country = COUNTRIES_DATA.find((c) => c.code === countryCode);
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
  const country = COUNTRIES_DATA.find((c) => c.code === countryCode);

  if (!country) return phoneNumber;

  return `${country.phonePrefix} ${cleanNumber}`;
}

/**
 * Combines country code prefix with phone number
 */
export function combinePhoneNumber(
  phoneNumber: string,
  countryCode: string
): string {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const country = COUNTRIES_DATA.find((c) => c.code === countryCode);

  if (!country) return phoneNumber;

  return `${country.phonePrefix}${cleanNumber}`;
}

/**
 * Validates VAT number format (basic validation)
 */
export function validateVatNumber(
  vatNumber: string,
  countryCode: string
): boolean {
  // Remove all non-alphanumeric characters
  const cleanVat = vatNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  // Basic length validation
  if (cleanVat.length < 4 || cleanVat.length > 20) {
    return false;
  }

  // Country-specific validation (basic patterns)
  switch (countryCode) {
    case 'DE': // Germany - 9 digits
      return /^\d{9}$/.test(cleanVat);
    case 'FR': // France - 2 letters + 9 digits or 11 digits
      return /^[A-Z]{2}\d{9}$/.test(cleanVat) || /^\d{11}$/.test(cleanVat);
    case 'IT': // Italy - 11 digits
      return /^\d{11}$/.test(cleanVat);
    case 'ES': // Spain - 1 letter + 7 digits + 1 letter or 8 digits + 1 letter
      return (
        /^[A-Z]\d{7}[A-Z]$/.test(cleanVat) || /^\d{8}[A-Z]$/.test(cleanVat)
      );
    case 'NL': // Netherlands - 12 digits with B in between
      return /^\d{9}B\d{2}$/.test(cleanVat);
    case 'BE': // Belgium - 10 digits
      return /^\d{10}$/.test(cleanVat);
    case 'GB': // UK - 9 or 12 digits
      return /^\d{9}$/.test(cleanVat) || /^\d{12}$/.test(cleanVat);
    case 'AT': // Austria - 8 digits
      return /^\d{8}$/.test(cleanVat);
    case 'PT': // Portugal - 9 digits
      return /^\d{9}$/.test(cleanVat);
    case 'SE': // Sweden - 12 digits
      return /^\d{12}$/.test(cleanVat);
    case 'DK': // Denmark - 8 digits
      return /^\d{8}$/.test(cleanVat);
    case 'FI': // Finland - 8 digits
      return /^\d{8}$/.test(cleanVat);
    case 'NO': // Norway - 9 digits + "MVA"
      return /^\d{9}MVA$/.test(cleanVat) || /^\d{9}$/.test(cleanVat);
    case 'CH': // Switzerland - 6 digits
      return /^\d{6}$/.test(cleanVat);
    case 'PL': // Poland - 10 digits
      return /^\d{10}$/.test(cleanVat);
    case 'CZ': // Czech Republic - 8-10 digits
      return /^\d{8,10}$/.test(cleanVat);
    case 'HU': // Hungary - 8 digits
      return /^\d{8}$/.test(cleanVat);
    case 'US': // United States - EIN format XX-XXXXXXX
      return /^\d{2}\d{7}$/.test(cleanVat);
    default:
      // General validation for other countries - alphanumeric, 4-20 characters
      return /^[A-Z0-9]{4,20}$/.test(cleanVat);
  }
}

/**
 * Formats VAT number for display
 */
export function formatVatNumber(
  vatNumber: string,
  countryCode: string
): string {
  const cleanVat = vatNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const country = COUNTRIES_DATA.find((c) => c.code === countryCode);
  const prefix = country?.vatPrefix;

  if (!prefix) return vatNumber;

  return `${prefix}${cleanVat}`;
}

/**
 * Merged country data with both phone and VAT prefixes
 */
export const COUNTRIES_DATA: CountryData[] = [
  {
    code: 'US',
    country: 'United States',
    phonePrefix: '+1',
    vatPrefix: 'US',
    flag: '🇺🇸'
  },
  {
    code: 'GB',
    country: 'United Kingdom',
    phonePrefix: '+44',
    vatPrefix: 'GB',
    flag: '🇬🇧'
  },
  {
    code: 'ES',
    country: 'Spain',
    phonePrefix: '+34',
    vatPrefix: 'ES',
    flag: '🇪🇸'
  },
  {
    code: 'IT',
    country: 'Italy',
    phonePrefix: '+39',
    vatPrefix: 'IT',
    flag: '🇮🇹'
  },
  {
    code: 'FR',
    country: 'France',
    phonePrefix: '+33',
    vatPrefix: 'FR',
    flag: '🇫🇷'
  },
  {
    code: 'DE',
    country: 'Germany',
    phonePrefix: '+49',
    vatPrefix: 'DE',
    flag: '🇩🇪'
  },
  {
    code: 'PT',
    country: 'Portugal',
    phonePrefix: '+351',
    vatPrefix: 'PT',
    flag: '🇵🇹'
  },
  {
    code: 'NL',
    country: 'Netherlands',
    phonePrefix: '+31',
    vatPrefix: 'NL',
    flag: '🇳🇱'
  },
  {
    code: 'BE',
    country: 'Belgium',
    phonePrefix: '+32',
    vatPrefix: 'BE',
    flag: '🇧🇪'
  },
  {
    code: 'CH',
    country: 'Switzerland',
    phonePrefix: '+41',
    vatPrefix: 'CHE',
    flag: '🇨🇭'
  },
  {
    code: 'AT',
    country: 'Austria',
    phonePrefix: '+43',
    vatPrefix: 'ATU',
    flag: '🇦🇹'
  },
  {
    code: 'SE',
    country: 'Sweden',
    phonePrefix: '+46',
    vatPrefix: 'SE',
    flag: '🇸🇪'
  },
  {
    code: 'NO',
    country: 'Norway',
    phonePrefix: '+47',
    vatPrefix: 'NO',
    flag: '🇳🇴'
  },
  {
    code: 'DK',
    country: 'Denmark',
    phonePrefix: '+45',
    vatPrefix: 'DK',
    flag: '🇩🇰'
  },
  {
    code: 'FI',
    country: 'Finland',
    phonePrefix: '+358',
    vatPrefix: 'FI',
    flag: '🇫🇮'
  },
  {
    code: 'IE',
    country: 'Ireland',
    phonePrefix: '+353',
    vatPrefix: 'IE',
    flag: '🇮🇪'
  },
  {
    code: 'GR',
    country: 'Greece',
    phonePrefix: '+30',
    vatPrefix: 'EL',
    flag: '🇬🇷'
  },
  {
    code: 'PL',
    country: 'Poland',
    phonePrefix: '+48',
    vatPrefix: 'PL',
    flag: '🇵🇱'
  },
  {
    code: 'CZ',
    country: 'Czech Republic',
    phonePrefix: '+420',
    vatPrefix: 'CZ',
    flag: '🇨🇿'
  },
  {
    code: 'HU',
    country: 'Hungary',
    phonePrefix: '+36',
    vatPrefix: 'HU',
    flag: '🇭🇺'
  },
  {
    code: 'HR',
    country: 'Croatia',
    phonePrefix: '+385',
    vatPrefix: 'HR',
    flag: '🇭🇷'
  },
  {
    code: 'SI',
    country: 'Slovenia',
    phonePrefix: '+386',
    vatPrefix: 'SI',
    flag: '🇸🇮'
  },
  {
    code: 'SK',
    country: 'Slovakia',
    phonePrefix: '+421',
    vatPrefix: 'SK',
    flag: '🇸🇰'
  },
  {
    code: 'BG',
    country: 'Bulgaria',
    phonePrefix: '+359',
    vatPrefix: 'BG',
    flag: '🇧🇬'
  },
  {
    code: 'RO',
    country: 'Romania',
    phonePrefix: '+40',
    vatPrefix: 'RO',
    flag: '🇷🇴'
  },
  {
    code: 'LT',
    country: 'Lithuania',
    phonePrefix: '+370',
    vatPrefix: 'LT',
    flag: '🇱🇹'
  },
  {
    code: 'LV',
    country: 'Latvia',
    phonePrefix: '+371',
    vatPrefix: 'LV',
    flag: '🇱🇻'
  },
  {
    code: 'EE',
    country: 'Estonia',
    phonePrefix: '+372',
    vatPrefix: 'EE',
    flag: '🇪🇪'
  },
  {
    code: 'CY',
    country: 'Cyprus',
    phonePrefix: '+357',
    vatPrefix: 'CY',
    flag: '🇨🇾'
  },
  {
    code: 'MT',
    country: 'Malta',
    phonePrefix: '+356',
    vatPrefix: 'MT',
    flag: '🇲🇹'
  },
  {
    code: 'LU',
    country: 'Luxembourg',
    phonePrefix: '+352',
    vatPrefix: 'LU',
    flag: '🇱🇺'
  },
  {
    code: 'MX',
    country: 'Mexico',
    phonePrefix: '+52',
    vatPrefix: 'MX',
    flag: '🇲🇽'
  },
  {
    code: 'CA',
    country: 'Canada',
    phonePrefix: '+1',
    vatPrefix: 'CA',
    flag: '🇨🇦'
  },
  {
    code: 'BR',
    country: 'Brazil',
    phonePrefix: '+55',
    vatPrefix: 'BR',
    flag: '🇧🇷'
  },
  {
    code: 'AR',
    country: 'Argentina',
    phonePrefix: '+54',
    vatPrefix: 'AR',
    flag: '🇦🇷'
  },
  {
    code: 'CL',
    country: 'Chile',
    phonePrefix: '+56',
    vatPrefix: 'CL',
    flag: '🇨🇱'
  },
  {
    code: 'CO',
    country: 'Colombia',
    phonePrefix: '+57',
    vatPrefix: 'CO',
    flag: '🇨🇴'
  },
  {
    code: 'PE',
    country: 'Peru',
    phonePrefix: '+51',
    vatPrefix: 'PE',
    flag: '🇵🇪'
  },
  {
    code: 'UY',
    country: 'Uruguay',
    phonePrefix: '+598',
    vatPrefix: 'UY',
    flag: '🇺🇾'
  },
  {
    code: 'AU',
    country: 'Australia',
    phonePrefix: '+61',
    vatPrefix: 'AU',
    flag: '🇦🇺'
  },
  {
    code: 'NZ',
    country: 'New Zealand',
    phonePrefix: '+64',
    vatPrefix: 'NZ',
    flag: '🇳🇿'
  },
  {
    code: 'JP',
    country: 'Japan',
    phonePrefix: '+81',
    vatPrefix: 'JP',
    flag: '🇯🇵'
  },
  {
    code: 'KR',
    country: 'South Korea',
    phonePrefix: '+82',
    vatPrefix: 'KR',
    flag: '🇰🇷'
  },
  {
    code: 'CN',
    country: 'China',
    phonePrefix: '+86',
    vatPrefix: 'CN',
    flag: '🇨🇳'
  },
  {
    code: 'IN',
    country: 'India',
    phonePrefix: '+91',
    vatPrefix: 'IN',
    flag: '🇮🇳'
  },
  {
    code: 'SG',
    country: 'Singapore',
    phonePrefix: '+65',
    vatPrefix: 'SG',
    flag: '🇸🇬'
  },
  {
    code: 'MY',
    country: 'Malaysia',
    phonePrefix: '+60',
    vatPrefix: 'MY',
    flag: '🇲🇾'
  },
  {
    code: 'TH',
    country: 'Thailand',
    phonePrefix: '+66',
    vatPrefix: 'TH',
    flag: '🇹🇭'
  },
  {
    code: 'ID',
    country: 'Indonesia',
    phonePrefix: '+62',
    vatPrefix: 'ID',
    flag: '🇮🇩'
  },
  {
    code: 'PH',
    country: 'Philippines',
    phonePrefix: '+63',
    vatPrefix: 'PH',
    flag: '🇵🇭'
  },
  {
    code: 'VN',
    country: 'Vietnam',
    phonePrefix: '+84',
    vatPrefix: 'VN',
    flag: '🇻🇳'
  },
  {
    code: 'AE',
    country: 'United Arab Emirates',
    phonePrefix: '+971',
    vatPrefix: 'AE',
    flag: '🇦🇪'
  },
  {
    code: 'SA',
    country: 'Saudi Arabia',
    phonePrefix: '+966',
    vatPrefix: 'SA',
    flag: '🇸🇦'
  },
  {
    code: 'EG',
    country: 'Egypt',
    phonePrefix: '+20',
    vatPrefix: 'EG',
    flag: '🇪🇬'
  },
  {
    code: 'ZA',
    country: 'South Africa',
    phonePrefix: '+27',
    vatPrefix: 'ZA',
    flag: '🇿🇦'
  },
  {
    code: 'MA',
    country: 'Morocco',
    phonePrefix: '+212',
    vatPrefix: 'MA',
    flag: '🇲🇦'
  },
  {
    code: 'TN',
    country: 'Tunisia',
    phonePrefix: '+216',
    vatPrefix: 'TN',
    flag: '🇹🇳'
  },
  {
    code: 'IL',
    country: 'Israel',
    phonePrefix: '+972',
    vatPrefix: 'IL',
    flag: '🇮🇱'
  },
  {
    code: 'TR',
    country: 'Turkey',
    phonePrefix: '+90',
    vatPrefix: 'TR',
    flag: '🇹🇷'
  },
  {
    code: 'RU',
    country: 'Russia',
    phonePrefix: '+7',
    vatPrefix: 'RU',
    flag: '🇷🇺'
  },
  {
    code: 'UA',
    country: 'Ukraine',
    phonePrefix: '+380',
    vatPrefix: 'UA',
    flag: '🇺🇦'
  }
];

/**
 * Combines country VAT prefix with VAT number
 */
export function combineVatNumber(
  vatNumber: string,
  countryCode: string
): string {
  const cleanVat = vatNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const country = COUNTRIES_DATA.find((c) => c.code === countryCode);
  const prefix = country?.vatPrefix;

  if (!prefix || !cleanVat) return cleanVat;

  // Check if the VAT number already has the prefix
  if (cleanVat.startsWith(prefix)) {
    return cleanVat;
  }

  return `${prefix}${cleanVat}`;
}
