'use client';

import { useState, useEffect } from 'react';
import { useApi } from './useApi';
import { getDashboardOverview, DashboardResponse } from '@/api/dashboard';

export function useDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const callApi = useApi();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await getDashboardOverview(callApi);
      setData(dashboardData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch dashboard data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Refresh every 5 minutes for real-time updates
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);

    // Refresh when user returns to tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData
  };
}
