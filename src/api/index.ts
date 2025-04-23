/**
 * API Module
 *
 * This module provides a consistent interface for making API calls to the backend.
 * It's organized by domain (tournaments, players, courts) and ensures consistent
 * error handling and response parsing.
 */

// Re-export sub-modules
export * from './tournaments';
export * from './players';
export * from './courts';
export * from './auth';
export * from './common/types';

// Re-export API utilities (which now work in both client and server)
export { apiClient, handleApiResponse } from './common/apiClient';

// Export client-specific API utilities
export { clientApiClient } from './common/clientApi';
