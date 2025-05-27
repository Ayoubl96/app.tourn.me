'use client';

import React, { useState, useEffect } from 'react';
import {
  Tournament,
  TournamentStage,
  TournamentGroup,
  TournamentBracket
} from '@/api/tournaments/types';
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
  ArrowLeft,
  Users,
  UserPlus,
  Calendar,
  Share2,
  Settings,
  Group,
  Flag,
  Swords
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTournamentStaging } from '@/features/tournament/hooks/useTournamentStaging';
import { fetchStageGroups, fetchStageBrackets } from '@/api/tournaments/api';
import { useApi } from '@/hooks/useApi';
import { IntegratedGroupManagement } from './groups/IntegratedGroupManagement';
import { MatchManagement } from './matches/MatchManagement';

interface StageDetailViewProps {
  stage: TournamentStage;
  tournament: Tournament;
  onBack: () => void;
}

export function StageDetailView({
  stage,
  tournament,
  onBack
}: StageDetailViewProps) {
  const t = useTranslations('Dashboard');
  const [activeTab, setActiveTab] = useState('overview');

  // Stage-specific state to avoid conflicts with global hook state
  const [stageGroups, setStageGroups] = useState<TournamentGroup[]>([]);
  const [stageBrackets, setStageBrackets] = useState<TournamentBracket[]>([]);
  const [isLoadingStageData, setIsLoadingStageData] = useState(false);

  const isGroupStage = stage.stage_type === 'group';

  // Get the hook functions but don't use the global state
  const { loadGroups, loadBrackets } = useTournamentStaging({
    tournamentId: tournament.id,
    autoLoad: false // Disable auto-loading to prevent conflicts
  });

  const callApi = useApi();

  // Load stage-specific data with local state management
  useEffect(() => {
    const loadStageData = async () => {
      setIsLoadingStageData(true);
      try {
        // Load groups for this specific stage directly from API
        const groupsData = await fetchStageGroups(callApi, stage.id);
        setStageGroups(groupsData);

        // Load brackets for elimination stages
        if (!isGroupStage) {
          const bracketsData = await fetchStageBrackets(callApi, stage.id);
          setStageBrackets(bracketsData);
        }
      } catch (error) {
        console.error('Error loading stage data:', error);
      } finally {
        setIsLoadingStageData(false);
      }
    };

    loadStageData();
  }, [stage.id, isGroupStage, callApi]);

  return (
    <div className='space-y-6'>
      <div className='flex items-center space-x-4'>
        <Button variant='ghost' onClick={onBack} className='h-9 w-9 p-0'>
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <div>
          <h2 className='text-2xl font-bold'>{stage.name}</h2>
          <p className='text-muted-foreground'>
            <Badge className='mr-2'>
              {isGroupStage ? t('groupStage') : t('eliminationBracket')}
            </Badge>
            {t('order')}: {stage.order}
          </p>
        </div>
      </div>

      <Separator />

      <Tabs
        defaultValue='overview'
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className='w-full justify-start overflow-auto sm:w-auto'>
          <TabsTrigger value='overview'>{t('overview')}</TabsTrigger>
          {isGroupStage && (
            <TabsTrigger value='groups'>{t('groups')}</TabsTrigger>
          )}
          {!isGroupStage && (
            <TabsTrigger value='brackets'>{t('brackets')}</TabsTrigger>
          )}
          <TabsTrigger value='matches'>
            <Swords className='mr-1 h-4 w-4' />
            {t('matches')}
          </TabsTrigger>
          <TabsTrigger value='scheduling'>{t('scheduling')}</TabsTrigger>
          <TabsTrigger value='settings'>{t('settings')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value='overview' className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>{t('stageDetails')}</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className='space-y-4'>
                  <div>
                    <dt className='text-sm font-medium text-muted-foreground'>
                      {t('stageType')}
                    </dt>
                    <dd>
                      {isGroupStage ? t('groupStage') : t('eliminationBracket')}
                    </dd>
                  </div>

                  <div>
                    <dt className='text-sm font-medium text-muted-foreground'>
                      {t('order')}
                    </dt>
                    <dd>{stage.order}</dd>
                  </div>

                  {isGroupStage && (
                    <>
                      <div>
                        <dt className='text-sm font-medium text-muted-foreground'>
                          {t('groups')}
                        </dt>
                        <dd>{stageGroups.length}</dd>
                      </div>
                      <div>
                        <dt className='text-sm font-medium text-muted-foreground'>
                          {t('advancingTeams')}
                        </dt>
                        <dd>
                          {stage.config.advancement_rules.top_n}{' '}
                          {t('fromEachGroup')}
                        </dd>
                      </div>
                    </>
                  )}

                  {!isGroupStage && (
                    <div>
                      <dt className='text-sm font-medium text-muted-foreground'>
                        {t('brackets')}
                      </dt>
                      <dd>{stageBrackets.length}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('matchRules')}</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className='space-y-4'>
                  {isGroupStage && (
                    <div>
                      <dt className='text-sm font-medium text-muted-foreground'>
                        {t('matchesPerRival')}
                      </dt>
                      <dd>{stage.config.match_rules.matches_per_opponent}</dd>
                    </div>
                  )}

                  <div>
                    <dt className='text-sm font-medium text-muted-foreground'>
                      {t('gamesPerMatch')}
                    </dt>
                    <dd>{stage.config.match_rules.games_per_match}</dd>
                  </div>

                  <div>
                    <dt className='text-sm font-medium text-muted-foreground'>
                      {t('winCriteria')}
                    </dt>
                    <dd>{stage.config.match_rules.win_criteria}</dd>
                  </div>

                  {stage.config.match_rules.time_limited && (
                    <div>
                      <dt className='text-sm font-medium text-muted-foreground'>
                        {t('timeLimit')}
                      </dt>
                      <dd>
                        {stage.config.match_rules.time_limit_minutes}{' '}
                        {t('minutes', { defaultValue: 'minutes' })}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Groups Tab Content (for group stages only) */}
        {isGroupStage && (
          <TabsContent value='groups' className='space-y-6'>
            <IntegratedGroupManagement
              stageId={stage.id}
              tournamentId={tournament.id}
            />
          </TabsContent>
        )}

        {/* Brackets Tab Content (for elimination stages only) */}
        {!isGroupStage && (
          <TabsContent value='brackets' className='space-y-4'>
            <Alert>
              <AlertTitle>{t('comingSoon')}</AlertTitle>
              <AlertDescription>
                {t('bracketManagementComingSoon')}
              </AlertDescription>
            </Alert>
          </TabsContent>
        )}

        {/* Matches Tab Content */}
        <TabsContent value='matches' className='space-y-6'>
          <MatchManagement
            stageId={stage.id}
            stageType={stage.stage_type}
            tournamentId={tournament.id}
            stageGroups={stageGroups}
            stageBrackets={stageBrackets}
          />
        </TabsContent>

        {/* Scheduling Tab Content */}
        <TabsContent value='scheduling' className='space-y-4'>
          <Alert>
            <AlertTitle>{t('comingSoon')}</AlertTitle>
            <AlertDescription>
              {t('matchSchedulingComingSoon')}
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Settings Tab Content */}
        <TabsContent value='settings' className='space-y-4'>
          <Alert>
            <AlertTitle>{t('comingSoon')}</AlertTitle>
            <AlertDescription>
              {t('stageSettingsComingSoon', {
                defaultValue: 'Stage settings features will be available soon'
              })}
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}
