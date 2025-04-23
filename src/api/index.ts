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
export * from './common/types';

// Re-export apiClient utility
export { apiClient, handleApiResponse } from './common/apiClient';
