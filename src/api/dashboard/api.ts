import { handleApiResponse } from '../common/apiClient';
import { ApiCaller } from '../common/types';
import { DashboardResponse } from './types';

/**
 * Get dashboard overview data
 * Client-side version that uses the provided API caller for token refresh handling
 */
export async function getDashboardOverview(
  callApi: ApiCaller
): Promise<DashboardResponse> {
  const response = await callApi('dashboard/overview');
  return handleApiResponse<DashboardResponse>(response);
}

/**
 * Server-side version of getDashboardOverview
 * Can be used in server components and API routes
 */
export async function getDashboardOverviewServer(
  accessToken: string
): Promise<DashboardResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
  const response = await fetch(`${baseUrl}dashboard/overview`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Failed to get dashboard data' }));
    throw new Error(
      errorData.message || errorData.detail || 'Failed to get dashboard data'
    );
  }

  return response.json();
}
