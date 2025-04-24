'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  TournamentCourt,
  UpdateTournamentCourtParams
} from '@/api/tournaments/types';
import { Tournament } from '@/api/tournaments/types';
import { fetchTournament } from '@/api/tournaments';
import { useApi } from '@/hooks/useApi';
import { cn } from '@/lib/utils';

// Form schema
const updateCourtFormSchema = z
  .object({
    useTournamentDuration: z.boolean().default(false),
    availability_start: z
      .string()
      .min(1, { message: 'Please provide a start date and time' }),
    availability_end: z
      .string()
      .min(1, { message: 'Please provide an end date and time' })
  })
  .refine(
    (data) => {
      if (data.useTournamentDuration) return true; // Skip validation when using tournament duration

      const start = new Date(data.availability_start);
      const end = new Date(data.availability_end);
      return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start;
    },
    {
      message: 'End date must be after start date and both dates must be valid',
      path: ['availability_end']
    }
  );

type UpdateCourtFormValues = z.infer<typeof updateCourtFormSchema>;

interface EditCourtSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCourt: TournamentCourt | null;
  onUpdateCourt: (
    courtId: number,
    params: UpdateTournamentCourtParams
  ) => Promise<boolean | void>;
  isUpdating: boolean;
}

export function EditCourtSidebar({
  open,
  onOpenChange,
  selectedCourt,
  onUpdateCourt,
  isUpdating
}: EditCourtSidebarProps) {
  const t = useTranslations('Dashboard');
  const callApi = useApi();
  const [tournament, setTournament] = useState<Tournament | null>(null);

  // Format date for input
  const formatDateForInput = (date: string | Date) => {
    const d = new Date(date);
    // Convert UTC dates from backend to local timezone for input field
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16); // Format as YYYY-MM-DDTHH:MM
  };

  // Form
  const form = useForm<UpdateCourtFormValues>({
    resolver: zodResolver(updateCourtFormSchema),
    defaultValues: {
      useTournamentDuration: false,
      availability_start: selectedCourt
        ? formatDateForInput(selectedCourt.availability_start)
        : formatDateForInput(new Date()),
      availability_end: selectedCourt
        ? formatDateForInput(selectedCourt.availability_end)
        : formatDateForInput(new Date(Date.now() + 24 * 60 * 60 * 1000))
    }
  });

  // Get tournament details when sidebar opens
  useEffect(() => {
    const loadTournament = async () => {
      if (!open || !selectedCourt?.tournament_id) return;

      try {
        const tournamentData = await fetchTournament(
          callApi,
          selectedCourt.tournament_id.toString()
        );
        setTournament(tournamentData);

        // If we're using tournament duration, update the date fields
        if (form.getValues().useTournamentDuration) {
          updateDatesFromTournament(tournamentData);
        }
      } catch (error) {
        // Handle error silently
      }
    };

    loadTournament();
  }, [open, selectedCourt, callApi, form]);

  // Update dates from tournament when the toggle changes
  const updateDatesFromTournament = (tournamentData: Tournament | null) => {
    if (!tournamentData) return;

    // If tournament has start and end dates, use them
    if (tournamentData.start_date && tournamentData.end_date) {
      form.setValue(
        'availability_start',
        formatDateForInput(tournamentData.start_date)
      );
      form.setValue(
        'availability_end',
        formatDateForInput(tournamentData.end_date)
      );
    }
  };

  // Watch for changes to the useTournamentDuration field
  const useTournamentDuration = form.watch('useTournamentDuration');

  // Update dates when the toggle changes
  useEffect(() => {
    if (useTournamentDuration && tournament) {
      updateDatesFromTournament(tournament);
    }
  }, [useTournamentDuration, tournament]);

  // Update form values when selectedCourt changes
  useEffect(() => {
    if (selectedCourt) {
      form.reset({
        useTournamentDuration: false,
        availability_start: formatDateForInput(
          selectedCourt.availability_start
        ),
        availability_end: formatDateForInput(selectedCourt.availability_end)
      });
    }
  }, [selectedCourt, form]);

  // Handle form submission
  const handleSubmit = async (values: UpdateCourtFormValues) => {
    if (!selectedCourt) return;

    try {
      // Ensure dates are properly converted to UTC when sending to backend
      const startDate = new Date(values.availability_start);
      const endDate = new Date(values.availability_end);

      const success = await onUpdateCourt(selectedCourt.court_id, {
        availability_start: startDate.toISOString(),
        availability_end: endDate.toISOString()
      });

      // Close sidebar only if the API call was successful
      if (success !== false) {
        onOpenChange(false);
      }
    } catch (err) {
      // Keep the sidebar open on error
    }
  };

  if (!selectedCourt) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-[400px] overflow-y-auto sm:w-[540px]'>
        <SheetHeader>
          <SheetTitle>{t('editCourt')}</SheetTitle>
          <SheetDescription>{t('editCourtDescription')}</SheetDescription>
        </SheetHeader>

        <div className='py-6'>
          <div className='mb-6'>
            <h3 className='text-base font-medium text-foreground'>
              {t('court')}
            </h3>
            <p className='mt-1 text-lg font-semibold'>
              {selectedCourt.court?.name ||
                t('unknownCourt') ||
                'Unknown Court'}
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-6'
            >
              <FormField
                control={form.control}
                name='useTournamentDuration'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>
                        {t('useTournamentDuration')}
                      </FormLabel>
                      <FormDescription>
                        {t('useTournamentDurationDescription')}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div
                className={cn(
                  'space-y-4',
                  useTournamentDuration ? 'opacity-50' : ''
                )}
              >
                <FormField
                  control={form.control}
                  name='availability_start'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('availabilityStart')}</FormLabel>
                      <FormControl>
                        <Input
                          type='datetime-local'
                          {...field}
                          disabled={useTournamentDuration}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='availability_end'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('availabilityEnd')}</FormLabel>
                      <FormControl>
                        <Input
                          type='datetime-local'
                          {...field}
                          disabled={useTournamentDuration}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <SheetFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => onOpenChange(false)}
                >
                  {t('cancel') || 'Cancel'}
                </Button>
                <Button type='submit' disabled={isUpdating}>
                  {isUpdating
                    ? t('updating') || 'Updating...'
                    : t('update') || 'Update'}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
