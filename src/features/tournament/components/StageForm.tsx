'use client';

import React, { useState, useEffect } from 'react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  TournamentStage,
  StageType,
  StageStatus
} from '@/features/tournament/api/types';

interface StageFormProps {
  tournamentId: string;
  stage?: TournamentStage;
  onComplete: (stageData: Partial<TournamentStage>) => void;
  onCancel: () => void;
  t: any;
  existingStages: TournamentStage[];
}

export function StageForm({
  tournamentId,
  stage,
  onComplete,
  onCancel,
  t,
  existingStages
}: StageFormProps) {
  const isEdit = !!stage;

  // Define the form schema
  const formSchema = z
    .object({
      name: z.string().min(2, { message: t('nameMinError', { min: 2 }) }),
      description: z.string().optional(),
      stage_type: z.enum(['group', 'elimination']),
      order: z.number().min(1),
      status: z.enum(['planned', 'in_progress', 'completed']),
      start_date: z.date(),
      end_date: z.date()
    })
    .refine(
      (data) => {
        return data.start_date <= data.end_date;
      },
      {
        message: t('startDateBeforeEndDate'),
        path: ['end_date']
      }
    );

  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: stage?.name || '',
      description: stage?.description || '',
      stage_type: stage?.stage_type || 'group',
      order: stage?.order || getNextOrder(),
      status: stage?.status || 'planned',
      start_date: stage?.start_date ? new Date(stage.start_date) : new Date(),
      end_date: stage?.end_date ? new Date(stage.end_date) : new Date()
    }
  });

  // Get the next order number based on existing stages
  function getNextOrder(): number {
    if (existingStages.length === 0) return 1;
    return Math.max(...existingStages.map((s) => s.order)) + 1;
  }

  // Handle form submission
  function onSubmit(data: z.infer<typeof formSchema>) {
    // Create simple default rules based on stage type
    const rules = {
      group_formation: stage?.rules?.group_formation || {
        method: 'equal_distribution',
        number_of_groups: 2
      },
      match_scheduling: stage?.rules?.match_scheduling || {
        format:
          data.stage_type === 'group' ? 'round_robin' : 'single_elimination',
        matches_per_couple: 1
      },
      advancement: stage?.rules?.advancement || {
        top_n_per_group: 2,
        tiebreakers: ['matches_won', 'games_differential']
      },
      scoring: stage?.rules?.scoring || {
        win_points: 3,
        draw_points: 1,
        loss_points: 0
      }
    };

    // Prepare the stage data with formatted dates
    const stageData: Partial<TournamentStage> = {
      ...data,
      start_date: format(data.start_date, 'yyyy-MM-dd'),
      end_date: format(data.end_date, 'yyyy-MM-dd'),
      rules
    };

    onComplete(stageData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('stageName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('enterStageName')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('description')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('enterStageDescription')}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='stage_type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('stageType')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectStageType')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='group'>{t('groupStage')}</SelectItem>
                    <SelectItem value='elimination'>
                      {t('eliminationStage')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='order'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('stageOrder')}</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='start_date'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel>{t('startDate')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant='outline'
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>{t('selectDate')}</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='end_date'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel>{t('endDate')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant='outline'
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>{t('selectDate')}</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isEdit && (
          <FormField
            control={form.control}
            name='status'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('status')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectStatus')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='planned'>{t('planned')}</SelectItem>
                    <SelectItem value='in_progress'>
                      {t('inProgress')}
                    </SelectItem>
                    <SelectItem value='completed'>{t('completed')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className='flex justify-end space-x-4'>
          <Button variant='outline' type='button' onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button type='submit'>
            {isEdit ? t('updateStage') : t('createStage')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
