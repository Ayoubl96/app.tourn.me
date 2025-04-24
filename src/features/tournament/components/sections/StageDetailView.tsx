'use client';

import React, { useState, useEffect } from 'react';
import {
  Tournament,
  TournamentStage,
  TournamentGroup
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
  Group
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTournamentStaging } from '@/features/tournament/hooks/useTournamentStaging';
import { GroupManagement } from './groups/GroupManagement';
import { GroupCoupleManagement } from './groups/GroupCoupleManagement';

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

  const isGroupStage = stage.stage_type === 'group';

  const {
    groups,
    brackets,
    isLoading,
    loadGroups,
    loadBrackets,
    handleCreateGroup,
    handleDeleteGroup
  } = useTournamentStaging({
    tournamentId: tournament.id
  });

  // Filter groups that belong to this stage
  const stageGroups = groups.filter((group) => group.stage_id === stage.id);
  const stageBrackets = brackets.filter(
    (bracket) => bracket.stage_id === stage.id
  );

  // Load stage-specific data
  useEffect(() => {
    loadGroups(stage.id);
    if (!isGroupStage) {
      loadBrackets(stage.id);
    }
  }, [stage.id, isGroupStage, loadGroups, loadBrackets]);

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
            <>
              <TabsTrigger value='groups'>{t('groups')}</TabsTrigger>
              <TabsTrigger value='couples'>
                {t('couplesAssignment')}
              </TabsTrigger>
            </>
          )}
          {!isGroupStage && (
            <TabsTrigger value='brackets'>{t('brackets')}</TabsTrigger>
          )}
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
          <TabsContent value='groups' className='space-y-4'>
            <GroupManagement
              stageId={stage.id}
              groups={stageGroups}
              onCreateGroup={handleCreateGroup}
              onDeleteGroup={handleDeleteGroup}
            />
          </TabsContent>
        )}

        {/* Couples Assignment Tab Content (for group stages only) */}
        {isGroupStage && (
          <TabsContent value='couples' className='space-y-4'>
            <GroupCoupleManagement
              stageId={stage.id}
              groups={stageGroups}
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
