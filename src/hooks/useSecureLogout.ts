'use client';

import { useCallback } from 'react';
import { secureLogout } from '@/lib/secureLogout';

/**
 * Hook that provides secure logout functionality
 * which properly invalidates refresh tokens
 */
export function useSecureLogout() {
  const logout = useCallback((callbackUrl?: string) => {
    return secureLogout({ callbackUrl });
  }, []);

  return logout;
}
