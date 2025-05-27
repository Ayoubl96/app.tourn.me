'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useTournamentStaging } from '@/features/tournament/hooks/useTournamentStaging';
import { useTournamentContext } from '@/features/tournament/context/TournamentContext';
import {
  TournamentGroup,
  TournamentBracket,
  StagingMatch,
  StageType
} from '@/api/tournaments/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '../../shared/EmptyState';
import { MatchResultEntry } from './MatchResultEntry';
import {
  PlayCircle,
  Swords,
  Calendar,
  ListChecks,
  Edit,
  Trophy,
  Loader2,
  RotateCcw,
  ArrowUpDown,
  Clock,
  CalendarClock,
  CheckCircle,
  X,
  Timer,
  Pin,
  MapPin,
  Filter,
  Users,
  CircleSlash,
  AlertCircle,
  LayoutGrid,
  List
} from 'lucide-react';
import { toast } from 'sonner';
import {
  format,
  isToday,
  parseISO,
  isAfter,
  isBefore,
  formatDistance
} from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';

// Import components
import { TableView } from './views/TableView';
import { CourtsView } from './views/CourtsView';
import { MatchFiltersPanel } from './filters/MatchFilters';
import { GenerateMatchesDialog } from './dialogs/GenerateMatchesDialog';
import { MatchHeader } from './ui/MatchHeader';
import { CourtCardView } from './views/CourtCardView';
import { GlobalMatchTimer } from './ui/GlobalMatchTimer';

// Import utilities
import {
  useMatchFilters,
  initialFilters
} from '@/features/tournament/utils/matchFilters';
import {
  getCourtName,
  getGroupName,
  getBracketName
} from '@/features/tournament/utils/matchDisplayHelpers';

interface MatchManagementProps {
  stageId: number;
  stageType: StageType;
  tournamentId: string | number;
  stageGroups: TournamentGroup[];
  stageBrackets: TournamentBracket[];
}

interface MatchScores {
  games: any[];
  winner_couple_id: number | null;
  match_result_status: 'completed' | 'time_expired' | 'forfeited';
}

interface MatchFilters {
  status: string[];
  courts: number[];
  groups: number[];
  brackets: number[];
  search: string;
}

// Define view types
type ViewType = 'table' | 'courts' | 'cards';

export function MatchManagement({
  stageId,
  stageType,
  tournamentId,
  stageGroups,
  stageBrackets
}: MatchManagementProps) {
  const t = useTranslations('Dashboard');
  const { couples } = useTournamentContext();

  // State
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedBracketId, setSelectedBracketId] = useState<number | null>(
    null
  );
  const [isGenerateMatchesDialogOpen, setIsGenerateMatchesDialogOpen] =
    useState(false);
  const [selectedMatch, setSelectedMatch] = useState<StagingMatch | null>(null);
  const [isResultEntryOpen, setIsResultEntryOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [viewType, setViewType] = useState<ViewType>('cards');

  // Use the match filters hook
  const {
    filters,
    toggleStatusFilter,
    toggleCourtFilter,
    toggleGroupFilter,
    toggleBracketFilter,
    clearFilters,
    activeFilterCount,
    filterMatches
  } = useMatchFilters(initialFilters);

  // Use the tournament staging hook
  const {
    isGeneratingMatches,
    handleGenerateGroupMatches,
    handleGenerateBracketMatches,
    isLoading,
    error,
    matches,
    isLoadingMatches,
    isUpdatingMatch,
    loadStageMatches,
    loadGroupMatches,
    loadBracketMatches,
    loadMatchById,
    handleUpdateMatch
  } = useTournamentStaging({
    tournamentId
  });

  // Load initial stage matches
  useEffect(() => {
    loadStageMatches(stageId);
  }, [stageId, loadStageMatches]);

  // Select first group/bracket by default if available
  useEffect(() => {
    if (stageGroups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(stageGroups[0].id);
    }
    if (stageBrackets.length > 0 && !selectedBracketId) {
      setSelectedBracketId(stageBrackets[0].id);
    }
  }, [stageGroups, stageBrackets, selectedGroupId, selectedBracketId]);

  // Handle generate matches
  const handleGenerateMatches = async () => {
    if (stageType === 'group' && selectedGroupId) {
      const success = await handleGenerateGroupMatches(selectedGroupId);
      if (success) {
        toast.success(
          t('matchesGeneratedSuccess', {
            defaultValue: 'Matches generated successfully'
          })
        );
        setIsGenerateMatchesDialogOpen(false);
        // Reload matches after generation
        loadStageMatches(stageId);
      }
    } else if (stageType === 'elimination' && selectedBracketId) {
      const success = await handleGenerateBracketMatches(selectedBracketId);
      if (success) {
        toast.success(
          t('matchesGeneratedSuccess', {
            defaultValue: 'Matches generated successfully'
          })
        );
        setIsGenerateMatchesDialogOpen(false);
        // Reload matches after generation
        loadStageMatches(stageId);
      }
    }
  };

  // Get couple name by ID
  const getCoupleName = (coupleId: number) => {
    const couple = couples.find((c) => c.id === coupleId);
    return couple
      ? couple.name
      : `${t('couple', { defaultValue: 'Couple' })} #${coupleId}`;
  };

  // Get group name for a match with proper fallback
  const getGroupNameForMatch = (match: StagingMatch): string => {
    return getGroupName(match, stageGroups);
  };

  // Get bracket name for a match with proper fallback
  const getBracketNameForMatch = (match: StagingMatch): string => {
    return getBracketName(match, stageBrackets);
  };

  // Open result entry dialog
  const handleOpenResultEntry = async (match: StagingMatch) => {
    // Get full match details if not already loaded
    if (!match.games || match.games.length === 0) {
      const fullMatchDetails = await loadMatchById(match.id);
      if (fullMatchDetails) {
        setSelectedMatch(fullMatchDetails);
      } else {
        setSelectedMatch(match);
      }
    } else {
      setSelectedMatch(match);
    }
    setIsResultEntryOpen(true);
  };

  // Handle match result save
  const handleSaveMatchResult = async (
    matchId: number,
    scores: MatchScores
  ): Promise<boolean> => {
    try {
      const result = await handleUpdateMatch(matchId, scores);
      if (result) {
        loadStageMatches(stageId);
      }
      return !!result;
    } catch (error) {
      console.error('Error saving match result:', error);
      return false;
    }
  };

  // Handle timer expiration for multiple matches
  const handleTimeExpired = async (matchIds: number[]) => {
    try {
      // Auto-mark all matches as time expired
      const updatePromises = matchIds.map((matchId) =>
        handleUpdateMatch(matchId, {
          games: [],
          winner_couple_id: null,
          match_result_status: 'time_expired'
        })
      );

      const results = await Promise.all(updatePromises);

      if (results.every((result) => result)) {
        toast.info(
          t('matchesTimeExpired', {
            defaultValue: `${matchIds.length} matches have expired and been marked as time expired`,
            count: matchIds.length
          })
        );
        loadStageMatches(stageId);
      }
    } catch (error) {
      console.error('Error handling time expiration:', error);
      toast.error(
        t('errorHandlingTimeExpiration', {
          defaultValue: 'Failed to handle time expiration'
        })
      );
    }
  };

  // Handle timer updates (optional - for future features like real-time updates)
  const handleTimerUpdate = (
    timeRemaining: number,
    status: string,
    activeMatches: StagingMatch[]
  ) => {
    // This could be used for real-time updates, logging, or other features
    // For now, we'll just log it for debugging
    console.log(
      `Global timer update: ${timeRemaining}s remaining, status: ${status}, active matches: ${activeMatches.length}`
    );
  };

  // Get match status with timing context
  const getMatchTimingStatus = (match: StagingMatch) => {
    if (!match.scheduled_start) return 'not-scheduled';

    const now = new Date();
    const startTime = parseISO(match.scheduled_start);
    const endTime = match.scheduled_end ? parseISO(match.scheduled_end) : null;

    if (endTime && isAfter(now, endTime)) {
      return 'ended';
    } else if (isAfter(now, startTime)) {
      return 'in-progress';
    } else if (
      isAfter(startTime, now) &&
      isBefore(startTime, new Date(now.getTime() + 30 * 60000))
    ) {
      return 'upcoming';
    } else {
      return 'scheduled';
    }
  };

  // Format time for display
  const formatMatchTime = (timeString: string) => {
    if (!timeString) return '';
    const date = parseISO(timeString);
    return format(date, 'h:mm a');
  };

  // Format date for display
  const formatMatchDate = (timeString: string) => {
    if (!timeString) return '';
    const date = parseISO(timeString);
    return isToday(date)
      ? t('today', { defaultValue: 'Today' })
      : format(date, 'MMM d, yyyy');
  };

  // Get status badge
  const getStatusBadge = (match: StagingMatch) => {
    const timingStatus = getMatchTimingStatus(match);

    if (match.match_result_status !== 'pending') {
      switch (match.match_result_status) {
        case 'completed':
          return (
            <Badge className='bg-green-500'>
              {t('completed', { defaultValue: 'Completed' })}
            </Badge>
          );
        case 'time_expired':
          return (
            <Badge className='bg-orange-500'>
              {t('timeExpired', { defaultValue: 'Time Expired' })}
            </Badge>
          );
        case 'forfeited':
          return (
            <Badge className='bg-red-500'>
              {t('forfeited', { defaultValue: 'Forfeited' })}
            </Badge>
          );
        default:
          return <Badge>{match.match_result_status}</Badge>;
      }
    }

    switch (timingStatus) {
      case 'in-progress':
        return (
          <Badge className='bg-red-500'>
            {t('live', { defaultValue: 'LIVE' })}
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge className='bg-amber-500'>
            {t('soon', { defaultValue: 'Starting Soon' })}
          </Badge>
        );
      case 'ended':
        return (
          <Badge variant='secondary'>
            {t('waitingResult', { defaultValue: 'Waiting Result' })}
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge variant='outline'>
            {t('scheduled', { defaultValue: 'Scheduled' })}
          </Badge>
        );
      default:
        return (
          <Badge variant='outline'>
            {t('pending', { defaultValue: 'Pending' })}
          </Badge>
        );
    }
  };

  // Available courts for filtering
  const availableCourts = useMemo(() => {
    const courts = new Set<number>();
    matches.forEach((match) => {
      if (match.court_id) {
        courts.add(match.court_id);
      }
    });
    return Array.from(courts).sort((a, b) => a - b);
  }, [matches]);

  // Available groups for filtering
  const availableGroups = useMemo(() => {
    const groups = new Set<number>();
    matches.forEach((match) => {
      if (match.group_id) {
        groups.add(match.group_id);
      }
    });
    return Array.from(groups);
  }, [matches]);

  // Available brackets for filtering
  const availableBrackets = useMemo(() => {
    const brackets = new Set<number>();
    matches.forEach((match) => {
      if (match.bracket_id) {
        brackets.add(match.bracket_id);
      }
    });
    return Array.from(brackets);
  }, [matches]);

  // Filter matches based on filters
  const filteredMatches = useMemo(() => {
    return filterMatches(
      matches,
      getCoupleName,
      getCourtName,
      getGroupNameForMatch
    );
  }, [matches, filters, getCoupleName, filterMatches]);

  // Set search filter function for input change
  const setSearchFilter = (search: string) => {
    const { setFilters } = useMatchFilters();
    setFilters((prev) => ({ ...prev, search }));
  };

  // Render match management interface
  return (
    <div className='space-y-6'>
      {/* Header with filters and view type selection */}
      <MatchHeader
        activeFilterCount={activeFilterCount}
        viewType={viewType}
        onToggleFilters={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
        onGenerateMatches={() => setIsGenerateMatchesDialogOpen(true)}
        onViewTypeChange={setViewType}
      />

      {/* Filter Drawer */}
      {isFilterDrawerOpen && (
        <MatchFiltersPanel
          filters={filters}
          stageType={stageType}
          availableCourts={availableCourts}
          stageGroups={stageGroups}
          stageBrackets={stageBrackets}
          availableGroups={availableGroups}
          availableBrackets={availableBrackets}
          toggleStatusFilter={toggleStatusFilter}
          toggleCourtFilter={toggleCourtFilter}
          toggleGroupFilter={toggleGroupFilter}
          toggleBracketFilter={toggleBracketFilter}
          setSearchFilter={setSearchFilter}
          onClearFilters={clearFilters}
        />
      )}

      {/* Loading state */}
      {isLoadingMatches && (
        <Card>
          <CardContent className='flex items-center justify-center p-6'>
            <div className='flex flex-col items-center'>
              <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
              <p className='mt-2 text-sm text-muted-foreground'>
                {t('loadingMatches', { defaultValue: 'Loading matches...' })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>{t('error', { namespace: 'Common' })}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* No matches state */}
      {!isLoadingMatches && !error && filteredMatches.length === 0 && (
        <Card>
          <CardContent className='flex items-center justify-center p-6'>
            <div className='flex flex-col items-center'>
              <CalendarClock className='mb-2 h-12 w-12 text-muted-foreground/40' />
              <p className='text-center text-muted-foreground'>
                {t('noMatchesFound', { defaultValue: 'No matches found' })}
              </p>
              <p className='mt-1 text-center text-xs text-muted-foreground/70'>
                {t('createNewMatches', {
                  defaultValue:
                    'Create new matches by clicking the Generate Matches button'
                })}
              </p>
              <Button
                onClick={() => setIsGenerateMatchesDialogOpen(true)}
                variant='outline'
                size='sm'
                className='mt-4'
              >
                <PlayCircle className='mr-2 h-4 w-4' />
                {t('generateMatches', { defaultValue: 'Generate Matches' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Global Timer - Show above all views for active time-limited matches */}
      {!isLoadingMatches && !error && filteredMatches.length > 0 && (
        <GlobalMatchTimer
          matches={filteredMatches}
          couples={couples}
          getCoupleName={getCoupleName}
          onTimeExpired={handleTimeExpired}
          onTimerUpdate={handleTimerUpdate}
        />
      )}

      {/* Card View */}
      {!isLoadingMatches &&
        !error &&
        filteredMatches.length > 0 &&
        viewType === 'cards' && (
          <CourtCardView
            matches={filteredMatches}
            availableCourts={availableCourts}
            couples={couples}
            getCoupleName={getCoupleName}
            getCourtName={getCourtName}
            getGroupName={getGroupNameForMatch}
            getBracketName={getBracketNameForMatch}
            onOpenResultEntry={handleOpenResultEntry}
          />
        )}

      {/* Table View */}
      {!isLoadingMatches &&
        !error &&
        filteredMatches.length > 0 &&
        viewType === 'table' && (
          <TableView
            matches={filteredMatches}
            stageType={stageType}
            isUpdatingMatch={isUpdatingMatch}
            couples={couples}
            getCoupleName={getCoupleName}
            getCourtName={getCourtName}
            getGroupName={getGroupNameForMatch}
            getBracketName={getBracketNameForMatch}
            onOpenResultEntry={handleOpenResultEntry}
          />
        )}

      {/* Court View */}
      {!isLoadingMatches &&
        !error &&
        filteredMatches.length > 0 &&
        viewType === 'courts' && (
          <CourtsView
            matches={filteredMatches}
            stageType={stageType}
            isUpdatingMatch={isUpdatingMatch}
            availableCourts={availableCourts}
            couples={couples}
            getCoupleName={getCoupleName}
            getCourtName={getCourtName}
            getGroupName={getGroupNameForMatch}
            getBracketName={getBracketNameForMatch}
            onOpenResultEntry={handleOpenResultEntry}
          />
        )}

      {/* Generate Matches Dialog */}
      <GenerateMatchesDialog
        isOpen={isGenerateMatchesDialogOpen}
        onClose={() => setIsGenerateMatchesDialogOpen(false)}
        stageType={stageType}
        isGenerating={isGeneratingMatches}
        hasGroups={stageGroups.length > 0}
        hasBrackets={stageBrackets.length > 0}
        selectedGroupId={selectedGroupId}
        selectedBracketId={selectedBracketId}
        onGenerateMatches={handleGenerateMatches}
      />

      {/* Match Result Entry Dialog */}
      {selectedMatch && (
        <MatchResultEntry
          match={selectedMatch}
          isOpen={isResultEntryOpen}
          onClose={() => setIsResultEntryOpen(false)}
          onSave={handleSaveMatchResult}
          couple1Name={getCoupleName(selectedMatch.couple1_id)}
          couple2Name={getCoupleName(selectedMatch.couple2_id)}
        />
      )}
    </div>
  );
}
