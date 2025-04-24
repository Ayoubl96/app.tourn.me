'use client';

import React, { useState } from 'react';
import {
  Tournament,
  StageConfig,
  ScoringType,
  BracketType,
  TiebreakerMethod,
  WinCriteria,
  SchedulingPriority,
  StageType,
  TournamentStage
} from '@/api/tournaments/types';
import { useTournamentStaging } from '@/features/tournament/hooks/useTournamentStaging';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { Separator } from '@/components/ui/separator';
import {
  PlusCircle,
  Trash2,
  Edit,
  Group,
  Share2,
  Calendar,
  FileSpreadsheet,
  Trophy,
  ArrowLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CreateStageSidebar } from './CreateStageSidebar';
import { StageDetailView } from './StageDetailView';
import { EmptyState } from '../shared/EmptyState';
import { TournamentProvider } from '../../context/TournamentContext';

interface TournamentStagingProps {
  tournament: Tournament;
}

export function TournamentStaging({ tournament }: TournamentStagingProps) {
  const t = useTranslations('Dashboard');
  const [activeTab, setActiveTab] = useState('stages');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stageToDelete, setStageToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailView, setIsDetailView] = useState(false);

  // Use the tournament staging hook
  const {
    stages,
    selectedStage,
    groups,
    brackets,
    isLoading,
    error,
    isCreatingStage,
    setSelectedStage,
    handleCreateStage,
    handleDeleteStage
  } = useTournamentStaging({
    tournamentId: tournament.id
  });

  // Handle delete confirmation
  const confirmDeleteStage = async () => {
    if (stageToDelete) {
      const success = await handleDeleteStage(stageToDelete);
      if (success) {
        setStageToDelete(null);
        setIsDeleteDialogOpen(false);
      }
      // If not successful, keep dialog open and the toast error is shown by the hook
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (stageId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the stage when clicking delete
    setStageToDelete(stageId);
    setIsDeleteDialogOpen(true);
  };

  // Handle stage selection
  const handleStageSelect = (stage: TournamentStage) => {
    setSelectedStage(stage);
    setIsDetailView(true);
  };

  // Handle back to stages list
  const handleBackToStages = () => {
    setIsDetailView(false);
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-40 w-full' />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // If a stage is selected and detail view is active, show the stage detail view
  if (selectedStage && isDetailView) {
    return (
      <TournamentProvider tournamentId={tournament.id.toString()}>
        <StageDetailView
          stage={selectedStage}
          tournament={tournament}
          onBack={handleBackToStages}
        />
      </TournamentProvider>
    );
  }

  // Otherwise show the list of stages
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>{t('tournamentStaging')}</h2>
        <Button
          onClick={() => setIsSidebarOpen(true)}
          className='flex items-center gap-1'
        >
          <PlusCircle className='h-4 w-4' />
          {t('createStage')}
        </Button>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {stages.length === 0 ? (
          <div className='md:col-span-2 lg:col-span-3'>
            <EmptyState
              icon={<Trophy className='h-8 w-8' />}
              title={t('noStages')}
              description={t('noStagesDescription')}
              action={
                <Button onClick={() => setIsSidebarOpen(true)}>
                  <PlusCircle className='mr-2 h-4 w-4' />
                  {t('createStage')}
                </Button>
              }
            />
          </div>
        ) : (
          stages.map((stage) => (
            <Card
              key={stage.id}
              className='cursor-pointer transition-colors hover:bg-accent/50'
              onClick={() => handleStageSelect(stage)}
            >
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <CardTitle>{stage.name}</CardTitle>
                  <div className='flex items-center gap-2'>
                    <Badge>
                      {stage.stage_type === 'group'
                        ? t('groupStage')
                        : t('eliminationBracket')}
                    </Badge>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={(e) => openDeleteDialog(stage.id, e)}
                      className='h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive/90'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {t('order')}: {stage.order}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stage.stage_type === 'group' ? (
                  <div className='text-sm'>
                    <div className='mb-2'>
                      <strong>{t('advancingTeams')}:</strong>{' '}
                      {stage.config.advancement_rules.top_n}{' '}
                      {t('fromEachGroup')}
                    </div>
                    <div className='mb-2'>
                      <strong>{t('matchesPerRival')}:</strong>{' '}
                      {stage.config.match_rules.matches_per_opponent}
                    </div>
                    <div>
                      <strong>{t('gamesPerMatch')}:</strong>{' '}
                      {stage.config.match_rules.games_per_match}
                    </div>
                  </div>
                ) : (
                  <div className='text-sm'>
                    <div>{t('eliminationBracketDescription')}</div>
                  </div>
                )}
              </CardContent>
              <CardFooter className='pt-0'>
                <div className='flex items-center text-sm text-muted-foreground'>
                  <div className='mr-4'>
                    <Group className='mr-1 inline h-4 w-4' />
                    {stage.stage_type === 'group' ? t('groups') : t('brackets')}
                    :{' '}
                    {stage.stage_type === 'group'
                      ? groups.filter((g) => g.stage_id === stage.id).length
                      : brackets.filter((b) => b.stage_id === stage.id).length}
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <CreateStageSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSubmit={handleCreateStage}
        isCreating={isCreatingStage}
        stagesCount={stages.length}
      />

      {/* Delete Stage Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteStage')}</DialogTitle>
            <DialogDescription>
              {t('deleteStageConfirmation')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t('cancel', { namespace: 'Common' })}
            </Button>
            <Button variant='destructive' onClick={confirmDeleteStage}>
              {t('confirmDelete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
