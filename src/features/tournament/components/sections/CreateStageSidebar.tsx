'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  StageConfig,
  StageType,
  BracketType,
  WinCriteria,
  SchedulingPriority,
  TiebreakerMethod
} from '@/api/tournaments/types';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface CreateStageSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    stageType: StageType,
    config: StageConfig
  ) => Promise<any>;
  isCreating: boolean;
  stagesCount: number;
}

export function CreateStageSidebar({
  isOpen,
  onClose,
  onSubmit,
  isCreating,
  stagesCount
}: CreateStageSidebarProps) {
  const t = useTranslations('Dashboard');

  const [stageName, setStageName] = useState('');
  const [stageType, setStageType] = useState<StageType>('group');
  const [useCustomSettings, setUseCustomSettings] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Default configurations
  const defaultGroupConfig: StageConfig = {
    scoring_system: {
      type: 'points',
      win: 3,
      draw: 1,
      loss: 0,
      game_win: 1,
      game_loss: 0
    },
    match_rules: {
      matches_per_opponent: 1,
      games_per_match: 3,
      win_criteria: 'best_of',
      time_limited: false,
      time_limit_minutes: 90,
      break_between_matches: 30
    },
    advancement_rules: {
      top_n: 2,
      to_bracket: 'main',
      tiebreaker: ['points', 'head_to_head', 'games_diff', 'games_won']
    },
    scheduling: {
      auto_schedule: true,
      overlap_allowed: false,
      scheduling_priority: 'court_efficiency'
    }
  };

  const defaultEliminationConfig: StageConfig = {
    scoring_system: {
      type: 'points',
      win: 1,
      draw: 0,
      loss: 0,
      game_win: 1,
      game_loss: 0
    },
    match_rules: {
      matches_per_opponent: 1,
      games_per_match: 3,
      win_criteria: 'best_of',
      time_limited: false,
      time_limit_minutes: 90,
      break_between_matches: 30
    },
    advancement_rules: {
      top_n: 1,
      to_bracket: 'main',
      tiebreaker: ['points']
    },
    scheduling: {
      auto_schedule: true,
      overlap_allowed: false,
      scheduling_priority: 'court_efficiency'
    }
  };

  // Custom settings state
  const [customConfig, setCustomConfig] = useState<StageConfig>(
    stageType === 'group'
      ? { ...defaultGroupConfig }
      : { ...defaultEliminationConfig }
  );

  // Update custom config when stage type changes
  const handleStageTypeChange = (value: StageType) => {
    setStageType(value);
    setCustomConfig(
      value === 'group'
        ? { ...defaultGroupConfig }
        : { ...defaultEliminationConfig }
    );
  };

  const handleSubmit = async () => {
    // Clear previous validation errors
    setValidationError(null);

    if (!stageName.trim()) {
      setValidationError(`${t('stageName')} ${t('isRequired')}`);
      return;
    }

    const config = useCustomSettings
      ? customConfig
      : stageType === 'group'
        ? defaultGroupConfig
        : defaultEliminationConfig;

    try {
      await onSubmit(stageName, stageType, config);
      // Reset form state on success
      setStageName('');
      setStageType('group');
      setUseCustomSettings(false);
      setCustomConfig(defaultGroupConfig);
      onClose();
      // Success is handled by the hook's toast
    } catch (error) {
      console.error('Failed to create stage:', error);
      toast.error(
        t('failedToCreateStage', { defaultValue: 'Failed to create stage' })
      );
      // Keep the sidebar open for user to try again
    }
  };

  // Helper function to update nested values in customConfig
  const updateConfig = (
    section: keyof StageConfig,
    field: string,
    value: any
  ) => {
    setCustomConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Check if the current stage type is group
  const isGroupStage = stageType === 'group';

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='overflow-y-auto sm:max-w-md md:max-w-lg'>
        <SheetHeader className='mb-4'>
          <SheetTitle>{t('createStage')}</SheetTitle>
          <SheetDescription>{t('createStageDescription')}</SheetDescription>
        </SheetHeader>

        <div className='space-y-6'>
          {validationError && (
            <Alert variant='destructive' className='my-2'>
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='stage-name'>{t('stageName')}</Label>
              <Input
                id='stage-name'
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                placeholder={t('groupStageOrElimination')}
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='stage-type'>{t('stageType')}</Label>
              <Select
                value={stageType}
                onValueChange={(value: StageType) =>
                  handleStageTypeChange(value)
                }
              >
                <SelectTrigger id='stage-type'>
                  <SelectValue placeholder={t('selectStageType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='group'>{t('groupStage')}</SelectItem>
                  <SelectItem value='elimination'>
                    {t('eliminationBracket')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2 pt-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='custom-settings'
                  checked={useCustomSettings}
                  onCheckedChange={(checked) => setUseCustomSettings(!!checked)}
                />
                <label
                  htmlFor='custom-settings'
                  className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  {t('customSettings')}
                </label>
              </div>

              {!useCustomSettings && (
                <div className='mt-4 rounded-md border p-3 text-sm text-muted-foreground'>
                  <p className='mb-2 font-medium'>{t('defaultSettings')}</p>
                  <div className='space-y-2'>
                    <div>
                      <strong>{t('scoringSystem')}:</strong>
                      <ul className='mt-1 list-disc space-y-1 pl-5 text-xs'>
                        <li>
                          {t('pointsForWin')}:{' '}
                          {stageType === 'group'
                            ? defaultGroupConfig.scoring_system.win
                            : defaultEliminationConfig.scoring_system.win}
                        </li>
                        {isGroupStage && (
                          <>
                            <li>
                              {t('pointsForDraw')}:{' '}
                              {defaultGroupConfig.scoring_system.draw}
                            </li>
                            <li>
                              {t('pointsForLoss')}:{' '}
                              {defaultGroupConfig.scoring_system.loss}
                            </li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div>
                      <strong>{t('matchRules')}:</strong>
                      <ul className='mt-1 list-disc space-y-1 pl-5 text-xs'>
                        {isGroupStage && (
                          <li>
                            {t('matchesPerOpponent')}:{' '}
                            {
                              defaultGroupConfig.match_rules
                                .matches_per_opponent
                            }
                          </li>
                        )}
                        <li>
                          {t('gamesPerMatch')}:{' '}
                          {stageType === 'group'
                            ? defaultGroupConfig.match_rules.games_per_match
                            : defaultEliminationConfig.match_rules
                                .games_per_match}
                        </li>
                        <li>
                          {t('winCriteria')}:{' '}
                          {stageType === 'group'
                            ? defaultGroupConfig.match_rules.win_criteria
                            : defaultEliminationConfig.match_rules.win_criteria}
                        </li>
                      </ul>
                    </div>

                    <div>
                      <strong>{t('advancementRules')}:</strong>
                      <ul className='mt-1 list-disc space-y-1 pl-5 text-xs'>
                        {isGroupStage ? (
                          <li>
                            {t('advancingTeams')}:{' '}
                            {defaultGroupConfig.advancement_rules.top_n}{' '}
                            {t('fromEachGroup')}
                          </li>
                        ) : (
                          <li>
                            {t('advancingTeams')}:{' '}
                            {defaultEliminationConfig.advancement_rules.top_n}
                          </li>
                        )}
                        <li>
                          {t('toBracket')}:{' '}
                          {stageType === 'group'
                            ? defaultGroupConfig.advancement_rules.to_bracket
                            : defaultEliminationConfig.advancement_rules
                                .to_bracket}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {useCustomSettings && (
                <div className='mt-4 space-y-4'>
                  <Accordion type='single' collapsible className='w-full'>
                    <AccordionItem value='scoring'>
                      <AccordionTrigger>{t('scoringSystem')}</AccordionTrigger>
                      <AccordionContent>
                        <div className='space-y-3'>
                          <div className='grid grid-cols-3 gap-4'>
                            <div className='space-y-1.5'>
                              <Label>{t('pointsForWin')}</Label>
                              <Input
                                type='number'
                                min='0'
                                value={customConfig.scoring_system.win}
                                onChange={(e) =>
                                  updateConfig(
                                    'scoring_system',
                                    'win',
                                    parseInt(e.target.value) || 0
                                  )
                                }
                              />
                            </div>
                            {isGroupStage && (
                              <>
                                <div className='space-y-1.5'>
                                  <Label>{t('pointsForDraw')}</Label>
                                  <Input
                                    type='number'
                                    min='0'
                                    value={customConfig.scoring_system.draw}
                                    onChange={(e) =>
                                      updateConfig(
                                        'scoring_system',
                                        'draw',
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                  />
                                </div>
                                <div className='space-y-1.5'>
                                  <Label>{t('pointsForLoss')}</Label>
                                  <Input
                                    type='number'
                                    min='0'
                                    value={customConfig.scoring_system.loss}
                                    onChange={(e) =>
                                      updateConfig(
                                        'scoring_system',
                                        'loss',
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                  />
                                </div>
                              </>
                            )}
                          </div>
                          <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-1.5'>
                              <Label>{t('pointsGameWin')}</Label>
                              <Input
                                type='number'
                                min='0'
                                value={customConfig.scoring_system.game_win}
                                onChange={(e) =>
                                  updateConfig(
                                    'scoring_system',
                                    'game_win',
                                    parseInt(e.target.value) || 0
                                  )
                                }
                              />
                            </div>
                            <div className='space-y-1.5'>
                              <Label>{t('pointsGameLoss')}</Label>
                              <Input
                                type='number'
                                min='0'
                                value={customConfig.scoring_system.game_loss}
                                onChange={(e) =>
                                  updateConfig(
                                    'scoring_system',
                                    'game_loss',
                                    parseInt(e.target.value) || 0
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value='match-rules'>
                      <AccordionTrigger>{t('matchRules')}</AccordionTrigger>
                      <AccordionContent>
                        <div className='space-y-3'>
                          <div className='grid grid-cols-2 gap-4'>
                            {isGroupStage && (
                              <div className='space-y-1.5'>
                                <Label>{t('matchesPerRival')}</Label>
                                <Input
                                  type='number'
                                  min='1'
                                  value={
                                    customConfig.match_rules
                                      .matches_per_opponent
                                  }
                                  onChange={(e) =>
                                    updateConfig(
                                      'match_rules',
                                      'matches_per_opponent',
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                />
                              </div>
                            )}
                            <div className={isGroupStage ? '' : 'col-span-2'}>
                              <div className='space-y-1.5'>
                                <Label>{t('gamesPerMatch')}</Label>
                                <Input
                                  type='number'
                                  min='1'
                                  value={
                                    customConfig.match_rules.games_per_match
                                  }
                                  onChange={(e) =>
                                    updateConfig(
                                      'match_rules',
                                      'games_per_match',
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          <div className='space-y-1.5'>
                            <Label htmlFor='win-criteria'>
                              {t('winCriteria')}
                            </Label>
                            <Select
                              value={customConfig.match_rules.win_criteria}
                              onValueChange={(value: WinCriteria) =>
                                updateConfig(
                                  'match_rules',
                                  'win_criteria',
                                  value
                                )
                              }
                            >
                              <SelectTrigger id='win-criteria'>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='best_of'>
                                  {t('bestOf')}
                                </SelectItem>
                                <SelectItem value='all_games'>
                                  {t('allGames')}
                                </SelectItem>
                                <SelectItem value='time_based'>
                                  {t('timeBased')}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className='space-y-2'>
                            <div className='flex items-center space-x-2'>
                              <Checkbox
                                id='time-limited'
                                checked={customConfig.match_rules.time_limited}
                                onCheckedChange={(checked) =>
                                  updateConfig(
                                    'match_rules',
                                    'time_limited',
                                    !!checked
                                  )
                                }
                              />
                              <label
                                htmlFor='time-limited'
                                className='text-sm font-medium leading-none'
                              >
                                {t('timeLimited')}
                              </label>
                            </div>

                            {customConfig.match_rules.time_limited && (
                              <div className='mt-2'>
                                <Label>{t('timeLimit')}</Label>
                                <Input
                                  type='number'
                                  min='1'
                                  value={
                                    customConfig.match_rules.time_limit_minutes
                                  }
                                  onChange={(e) =>
                                    updateConfig(
                                      'match_rules',
                                      'time_limit_minutes',
                                      parseInt(e.target.value) || 30
                                    )
                                  }
                                />
                              </div>
                            )}
                          </div>

                          <div className='space-y-1.5'>
                            <Label>{t('breakBetweenMatches')}</Label>
                            <Input
                              type='number'
                              min='0'
                              value={
                                customConfig.match_rules.break_between_matches
                              }
                              onChange={(e) =>
                                updateConfig(
                                  'match_rules',
                                  'break_between_matches',
                                  parseInt(e.target.value) || 0
                                )
                              }
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value='advancement'>
                      <AccordionTrigger>
                        {t('advancementRules')}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className='space-y-4'>
                          <div className='space-y-1.5'>
                            <Label>
                              {isGroupStage
                                ? `${t('advancingTeams')} ${t('fromEachGroup')}`
                                : t('advancingTeams')}
                            </Label>
                            <Input
                              type='number'
                              min='1'
                              value={customConfig.advancement_rules.top_n}
                              onChange={(e) =>
                                updateConfig(
                                  'advancement_rules',
                                  'top_n',
                                  parseInt(e.target.value) || 1
                                )
                              }
                            />
                          </div>

                          <div className='space-y-1.5'>
                            <Label htmlFor='to-bracket'>{t('toBracket')}</Label>
                            <Select
                              value={customConfig.advancement_rules.to_bracket}
                              onValueChange={(value: BracketType) =>
                                updateConfig(
                                  'advancement_rules',
                                  'to_bracket',
                                  value
                                )
                              }
                            >
                              <SelectTrigger id='to-bracket'>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='main'>
                                  {t('mainBracket')}
                                </SelectItem>
                                <SelectItem value='silver'>
                                  {t('silverBracket')}
                                </SelectItem>
                                <SelectItem value='bronze'>
                                  {t('bronzeBracket')}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {isGroupStage && (
                            <div className='space-y-1.5'>
                              <Label>{t('tiebreakers')}</Label>
                              <div className='space-y a-2 rounded-md border p-3'>
                                <div className='flex items-center space-x-2'>
                                  <Checkbox
                                    id='tiebreaker-points'
                                    checked={customConfig.advancement_rules.tiebreaker.includes(
                                      'points'
                                    )}
                                    onCheckedChange={(checked) => {
                                      const tiebreakers = [
                                        ...customConfig.advancement_rules
                                          .tiebreaker
                                      ];
                                      if (checked) {
                                        if (!tiebreakers.includes('points')) {
                                          tiebreakers.push('points');
                                        }
                                      } else {
                                        const index =
                                          tiebreakers.indexOf('points');
                                        if (index > -1)
                                          tiebreakers.splice(index, 1);
                                      }
                                      setCustomConfig({
                                        ...customConfig,
                                        advancement_rules: {
                                          ...customConfig.advancement_rules,
                                          tiebreaker: tiebreakers
                                        }
                                      });
                                    }}
                                  />
                                  <label
                                    htmlFor='tiebreaker-points'
                                    className='text-sm'
                                  >
                                    {t('points')}
                                  </label>
                                </div>

                                <div className='flex items-center space-x-2'>
                                  <Checkbox
                                    id='tiebreaker-head-to-head'
                                    checked={customConfig.advancement_rules.tiebreaker.includes(
                                      'head_to_head'
                                    )}
                                    onCheckedChange={(checked) => {
                                      const tiebreakers = [
                                        ...customConfig.advancement_rules
                                          .tiebreaker
                                      ];
                                      if (checked) {
                                        if (
                                          !tiebreakers.includes('head_to_head')
                                        ) {
                                          tiebreakers.push('head_to_head');
                                        }
                                      } else {
                                        const index =
                                          tiebreakers.indexOf('head_to_head');
                                        if (index > -1)
                                          tiebreakers.splice(index, 1);
                                      }
                                      setCustomConfig({
                                        ...customConfig,
                                        advancement_rules: {
                                          ...customConfig.advancement_rules,
                                          tiebreaker: tiebreakers
                                        }
                                      });
                                    }}
                                  />
                                  <label
                                    htmlFor='tiebreaker-head-to-head'
                                    className='text-sm'
                                  >
                                    {t('headToHead')}
                                  </label>
                                </div>

                                <div className='flex items-center space-x-2'>
                                  <Checkbox
                                    id='tiebreaker-games-diff'
                                    checked={customConfig.advancement_rules.tiebreaker.includes(
                                      'games_diff'
                                    )}
                                    onCheckedChange={(checked) => {
                                      const tiebreakers = [
                                        ...customConfig.advancement_rules
                                          .tiebreaker
                                      ];
                                      if (checked) {
                                        if (
                                          !tiebreakers.includes('games_diff')
                                        ) {
                                          tiebreakers.push('games_diff');
                                        }
                                      } else {
                                        const index =
                                          tiebreakers.indexOf('games_diff');
                                        if (index > -1)
                                          tiebreakers.splice(index, 1);
                                      }
                                      setCustomConfig({
                                        ...customConfig,
                                        advancement_rules: {
                                          ...customConfig.advancement_rules,
                                          tiebreaker: tiebreakers
                                        }
                                      });
                                    }}
                                  />
                                  <label
                                    htmlFor='tiebreaker-games-diff'
                                    className='text-sm'
                                  >
                                    {t('gamesDiff')}
                                  </label>
                                </div>

                                <div className='flex items-center space-x-2'>
                                  <Checkbox
                                    id='tiebreaker-games-won'
                                    checked={customConfig.advancement_rules.tiebreaker.includes(
                                      'games_won'
                                    )}
                                    onCheckedChange={(checked) => {
                                      const tiebreakers = [
                                        ...customConfig.advancement_rules
                                          .tiebreaker
                                      ];
                                      if (checked) {
                                        if (
                                          !tiebreakers.includes('games_won')
                                        ) {
                                          tiebreakers.push('games_won');
                                        }
                                      } else {
                                        const index =
                                          tiebreakers.indexOf('games_won');
                                        if (index > -1)
                                          tiebreakers.splice(index, 1);
                                      }
                                      setCustomConfig({
                                        ...customConfig,
                                        advancement_rules: {
                                          ...customConfig.advancement_rules,
                                          tiebreaker: tiebreakers
                                        }
                                      });
                                    }}
                                  />
                                  <label
                                    htmlFor='tiebreaker-games-won'
                                    className='text-sm'
                                  >
                                    {t('gamesWon')}
                                  </label>
                                </div>

                                <div className='flex items-center space-x-2'>
                                  <Checkbox
                                    id='tiebreaker-matches-won'
                                    checked={customConfig.advancement_rules.tiebreaker.includes(
                                      'matches_won'
                                    )}
                                    onCheckedChange={(checked) => {
                                      const tiebreakers = [
                                        ...customConfig.advancement_rules
                                          .tiebreaker
                                      ];
                                      if (checked) {
                                        if (
                                          !tiebreakers.includes('matches_won')
                                        ) {
                                          tiebreakers.push('matches_won');
                                        }
                                      } else {
                                        const index =
                                          tiebreakers.indexOf('matches_won');
                                        if (index > -1)
                                          tiebreakers.splice(index, 1);
                                      }
                                      setCustomConfig({
                                        ...customConfig,
                                        advancement_rules: {
                                          ...customConfig.advancement_rules,
                                          tiebreaker: tiebreakers
                                        }
                                      });
                                    }}
                                  />
                                  <label
                                    htmlFor='tiebreaker-matches-won'
                                    className='text-sm'
                                  >
                                    {t('matchesWon')}
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value='scheduling'>
                      <AccordionTrigger>{t('scheduling')}</AccordionTrigger>
                      <AccordionContent>
                        <div className='space-y-3'>
                          <div className='flex items-center space-x-2'>
                            <Checkbox
                              id='auto-schedule'
                              checked={customConfig.scheduling.auto_schedule}
                              onCheckedChange={(checked) =>
                                updateConfig(
                                  'scheduling',
                                  'auto_schedule',
                                  !!checked
                                )
                              }
                            />
                            <label
                              htmlFor='auto-schedule'
                              className='text-sm font-medium leading-none'
                            >
                              {t('autoSchedule')}
                            </label>
                          </div>

                          <div className='flex items-center space-x-2'>
                            <Checkbox
                              id='overlap-allowed'
                              checked={customConfig.scheduling.overlap_allowed}
                              onCheckedChange={(checked) =>
                                updateConfig(
                                  'scheduling',
                                  'overlap_allowed',
                                  !!checked
                                )
                              }
                            />
                            <label
                              htmlFor='overlap-allowed'
                              className='text-sm font-medium leading-none'
                            >
                              {t('overlapAllowed')}
                            </label>
                          </div>

                          <div className='space-y-1.5'>
                            <Label htmlFor='scheduling-priority'>
                              {t('schedulingPriority')}
                            </Label>
                            <Select
                              value={
                                customConfig.scheduling.scheduling_priority
                              }
                              onValueChange={(value: SchedulingPriority) =>
                                updateConfig(
                                  'scheduling',
                                  'scheduling_priority',
                                  value
                                )
                              }
                            >
                              <SelectTrigger id='scheduling-priority'>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='court_efficiency'>
                                  {t('courtEfficiency')}
                                </SelectItem>
                                <SelectItem value='player_rest'>
                                  {t('playerRest')}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
            </div>
          </div>

          <div className='mt-6 flex justify-end space-x-4'>
            <Button variant='outline' onClick={onClose}>
              {t('cancel', { namespace: 'Common' })}
            </Button>
            <Button disabled={isCreating} onClick={handleSubmit}>
              {isCreating ? t('creating') : t('createStage')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
