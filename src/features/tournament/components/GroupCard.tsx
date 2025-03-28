'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  StageGroup,
  StageCoupleStats,
  Couple
} from '@/features/tournament/api/types';
import { fetchGroupCouples } from '@/features/tournament/api/tournamentApi';
import { useApi } from '@/hooks/useApi';
import { Skeleton } from '@/components/ui/skeleton';

interface GroupCardProps {
  group: StageGroup;
  stats: StageCoupleStats[];
  couples: Couple[];
  t: any;
  onViewMatches?: (groupId: number) => void;
  tournamentId: string;
  stageId: number;
}

export function GroupCard({
  group,
  stats,
  couples,
  t,
  onViewMatches,
  tournamentId,
  stageId
}: GroupCardProps) {
  const callApi = useApi();
  const [groupCouples, setGroupCouples] = useState<Couple[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch group couples when component mounts
  useEffect(() => {
    const loadGroupCouples = async () => {
      // Only fetch group couples if stats are empty
      if (stats.length === 0) {
        try {
          setLoading(true);
          const data = await fetchGroupCouples(
            callApi,
            tournamentId,
            stageId,
            group.id
          );
          setGroupCouples(data);
        } catch (error) {
          console.error('Error fetching group couples:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadGroupCouples();
  }, [callApi, tournamentId, stageId, group.id, stats.length]);

  // Get couple details by id
  const getCoupleById = (coupleId: number): Couple | undefined => {
    return couples.find((c) => c.id === coupleId);
  };

  // Format the couple name
  const formatCoupleName = (coupleId: number): string => {
    const couple = getCoupleById(coupleId);
    if (!couple) return t('unknown');
    return (
      couple.name ||
      `${couple.first_player?.nickname || t('unknown')} / ${couple.second_player?.nickname || t('unknown')}`
    );
  };

  // Sort stats by position, then by points
  const sortedStats = [...stats].sort((a, b) => {
    if (a.position !== null && b.position !== null) {
      return a.position - b.position;
    }
    return b.total_points - a.total_points;
  });

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle>{group.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('position')}</TableHead>
              <TableHead>{t('couple')}</TableHead>
              <TableHead className='text-center'>{t('played')}</TableHead>
              <TableHead className='text-center'>{t('wins')}</TableHead>
              <TableHead className='text-center'>{t('losses')}</TableHead>
              <TableHead className='text-center'>{t('gamesFor')}</TableHead>
              <TableHead className='text-center'>{t('gamesAgainst')}</TableHead>
              <TableHead className='text-center'>{t('points')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className='h-24'>
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-full' />
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedStats.length > 0 ? (
              sortedStats.map((stat, index) => (
                <TableRow key={stat.id}>
                  <TableCell>{stat.position || index + 1}</TableCell>
                  <TableCell className='font-medium'>
                    {formatCoupleName(stat.couple_id)}
                  </TableCell>
                  <TableCell className='text-center'>
                    {stat.matches_played}
                  </TableCell>
                  <TableCell className='text-center'>
                    {stat.matches_won}
                  </TableCell>
                  <TableCell className='text-center'>
                    {stat.matches_lost}
                  </TableCell>
                  <TableCell className='text-center'>
                    {stat.games_won}
                  </TableCell>
                  <TableCell className='text-center'>
                    {stat.games_lost}
                  </TableCell>
                  <TableCell className='text-center font-bold'>
                    {stat.total_points}
                  </TableCell>
                </TableRow>
              ))
            ) : groupCouples.length > 0 ? (
              groupCouples.map((couple, index) => (
                <TableRow key={couple.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className='font-medium'>
                    {couple.name ||
                      `${couple.first_player?.nickname || t('unknown')} / ${couple.second_player?.nickname || t('unknown')}`}
                  </TableCell>
                  <TableCell className='text-center'>0</TableCell>
                  <TableCell className='text-center'>0</TableCell>
                  <TableCell className='text-center'>0</TableCell>
                  <TableCell className='text-center'>0</TableCell>
                  <TableCell className='text-center'>0</TableCell>
                  <TableCell className='text-center font-bold'>0</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className='h-24 text-center'>
                  {t('noStatsAvailable')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {onViewMatches && (
          <div className='mt-4 text-center'>
            <button
              className='text-sm text-blue-600 hover:underline'
              onClick={() => onViewMatches(group.id)}
            >
              {t('viewGroupMatches')}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
