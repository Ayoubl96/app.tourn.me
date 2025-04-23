'use client';

import React, { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { DataTable } from '@/components/ui/table/data-table';
import { playerColumns } from './player-tables/columns';
import { useApi } from '@/hooks/useApi';
import { Player, fetchPlayers } from '@/api/players';

const PlayerListingPage: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const callApi = useApi();

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const session = await getSession();
        if (!session || !session.accessToken) {
          throw new Error('User is not authenticated');
        }

        const data = await fetchPlayers(callApi);
        setPlayers(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, [callApi]);

  if (loading) {
    return <DataTableSkeleton columnCount={4} rowCount={pageSize} />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const totalItems = players.length;
  const pageStart = (currentPage - 1) * pageSize;
  const pageEnd = pageStart + pageSize;
  const paginatedPlayers = players.slice(pageStart, pageEnd);

  return (
    <DataTable
      columns={playerColumns}
      data={paginatedPlayers}
      totalItems={totalItems}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
    />
  );
};

export default PlayerListingPage;
