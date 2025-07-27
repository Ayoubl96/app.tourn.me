import { COUNTRIES_DATA } from '@/features/auth/utils/validation';

/**
 * Parse a combined phone number into country code and number
 */
export function parsePhoneNumber(combinedPhoneNumber: string): {
  countryCode: string;
  phoneNumber: string;
} {
  if (!combinedPhoneNumber) {
    return { countryCode: '', phoneNumber: '' };
  }

  // Find the country that matches the phone prefix
  for (const country of COUNTRIES_DATA) {
    if (combinedPhoneNumber.startsWith(country.phonePrefix)) {
      return {
        countryCode: country.code,
        phoneNumber: combinedPhoneNumber
          .substring(country.phonePrefix.length)
          .trim()
      };
    }
  }

  // If no country prefix found, return the whole number
  return { countryCode: '', phoneNumber: combinedPhoneNumber };
}

/**
 * Parse a combined VAT number into country code and number
 */
export function parseVatNumber(combinedVatNumber: string): {
  vatCountryCode: string;
  vatNumber: string;
} {
  if (!combinedVatNumber) {
    return { vatCountryCode: '', vatNumber: '' };
  }

  // Find the country that matches the VAT prefix
  for (const country of COUNTRIES_DATA) {
    if (country.vatPrefix && combinedVatNumber.startsWith(country.vatPrefix)) {
      return {
        vatCountryCode: country.code,
        vatNumber: combinedVatNumber.substring(country.vatPrefix.length).trim()
      };
    }
  }

  // If no country prefix found, return the whole number
  return { vatCountryCode: '', vatNumber: combinedVatNumber };
}

/**
 * Combine country code and phone number
 */
export function combinePhoneNumber(
  phoneNumber: string,
  countryCode: string
): string {
  if (!phoneNumber || !countryCode) {
    return phoneNumber || '';
  }

  const country = COUNTRIES_DATA.find((c) => c.code === countryCode);
  if (!country) {
    return phoneNumber;
  }

  return `${country.phonePrefix}${phoneNumber.trim()}`;
}

/**
 * Combine VAT country code and VAT number
 */
export function combineVatNumber(
  vatNumber: string,
  vatCountryCode: string
): string {
  if (!vatNumber || !vatCountryCode) {
    return vatNumber || '';
  }

  const country = COUNTRIES_DATA.find((c) => c.code === vatCountryCode);
  if (!country || !country.vatPrefix) {
    return vatNumber;
  }

  return `${country.vatPrefix}${vatNumber.trim()}`;
}
