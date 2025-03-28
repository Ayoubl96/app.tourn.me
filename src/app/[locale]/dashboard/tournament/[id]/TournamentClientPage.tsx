'use client';

import React, { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import {
  Calendar,
  Users,
  ArrowLeft,
  Plus,
  UserPlus,
  AlertCircle,
  Search,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/navigation';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Import our API functions and components
import {
  fetchTournament,
  fetchTournamentPlayers,
  fetchTournamentCouples,
  fetchAllPlayers,
  addPlayerToTournament,
  removePlayerFromTournament,
  createCouple,
  updateCouple,
  deleteCouple,
  fetchTournamentStages,
  createStage,
  updateStage,
  deleteStage,
  fetchStageGroups,
  fetchStageMatches,
  formGroups,
  generateMatches,
  updateMatchResult,
  fetchStageStats,
  checkStageStatus,
  advanceToNextStage
} from '@/features/tournament/api/tournamentApi';
import {
  getTournamentStatus,
  formatDate,
  formatTime
} from '@/features/tournament/api/utils';
import {
  Tournament,
  TournamentPlayer,
  Couple,
  Player,
  TournamentStage,
  StageGroup,
  Match,
  StageCoupleStats,
  StageStatsResponse
} from '@/features/tournament/api/types';
import { PlayerCard } from '@/features/tournament/components/PlayerCard';
import { CoupleCard } from '@/features/tournament/components/CoupleCard';
import { CoupleForm } from '@/features/tournament/components/CoupleForm';
import { AddPlayerSelector } from '@/features/tournament/components/AddPlayerSelector';
import { CreatePlayerForm } from '@/features/tournament/components/CreatePlayerForm';
import { ImportPlaytomicPlayer } from '@/features/tournament/components/ImportPlaytomicPlayer';
import { LexicalRenderer } from '@/features/tournament/components/LexicalRenderer';
import { StageCard } from '@/features/tournament/components/StageCard';
import { StageForm } from '@/features/tournament/components/StageForm';
import { MatchCard } from '@/features/tournament/components/MatchCard';
import { GroupCard } from '@/features/tournament/components/GroupCard';

// Import tab components
import TournamentOverviewTab from '@/features/tournament/tabs/TournamentOverviewTab';
import TournamentPlayersTab from '@/features/tournament/tabs/TournamentPlayersTab';
import TournamentStagesTab from '@/features/tournament/tabs/TournamentStagesTab';
import TournamentLeaderboardTab from '@/features/tournament/tabs/TournamentLeaderboardTab';
import TournamentGamesTab from '@/features/tournament/tabs/TournamentGamesTab';

// Import context
import {
  TournamentProvider,
  useTournament
} from '@/features/tournament/context/TournamentContext';

export default function TournamentPageContainer({
  params
}: {
  params: { id: string };
}) {
  return (
    <TournamentProvider>
      <TournamentClientPage />
    </TournamentProvider>
  );
}

function TournamentClientPage() {
  const t = useTranslations('Tournament');
  const commonT = useTranslations('Common');
  const [activeTab, setActiveTab] = useState('overview');

  const { tournament, isLoading, error } = useTournament();

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-12 w-3/4' />
        <Skeleton className='h-[400px] w-full' />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!tournament) {
    return (
      <Alert>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>{t('tournamentNotFound')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-6'>
      <Tabs
        defaultValue='overview'
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-4'
      >
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='overview'>{t('overview')}</TabsTrigger>
          <TabsTrigger value='manage'>{t('manage')}</TabsTrigger>
          <TabsTrigger value='players'>{t('players')}</TabsTrigger>
          <TabsTrigger value='stages'>{t('stages')}</TabsTrigger>
          <TabsTrigger value='leaderboard'>{t('leaderboard')}</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <TournamentOverviewTab t={t} />
        </TabsContent>

        <TabsContent value='manage' className='space-y-4'>
          <div className='rounded-md border p-4'>
            <p className='text-sm text-muted-foreground'>
              {t('managementTabComingSoon')}
            </p>
          </div>
        </TabsContent>

        <TabsContent value='players' className='space-y-4'>
          <TournamentPlayersTab t={t} commonT={commonT} />
        </TabsContent>

        <TabsContent value='stages' className='space-y-4'>
          <TournamentStagesTab t={t} commonT={commonT} />
        </TabsContent>

        <TabsContent value='leaderboard' className='space-y-4'>
          <TournamentLeaderboardTab t={t} />
        </TabsContent>

        <TabsContent value='games' className='space-y-4'>
          <TournamentGamesTab t={t} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
