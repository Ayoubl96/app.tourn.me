'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useApi } from '@/hooks/useApi';
import { fetchCourts } from '@/api/courts/api';
import { fetchTournament } from '@/api/tournaments/api';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Court } from '@/api/courts/types';
import {
  AddCourtToTournamentParams,
  Tournament
} from '@/api/tournaments/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

// Form schema
const addCourtFormSchema = z
  .object({
    court_id: z.string().min(1, { message: 'Please select a court' }),
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

type AddCourtFormValues = z.infer<typeof addCourtFormSchema>;

interface AddCourtSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentId: string;
  tournamentCourtIds: string[];
  onAddCourt: (params: AddCourtToTournamentParams) => Promise<boolean | void>;
  isAdding: boolean;
}

export function AddCourtSidebar({
  open,
  onOpenChange,
  tournamentId,
  tournamentCourtIds,
  onAddCourt,
  isAdding
}: AddCourtSidebarProps) {
  const t = useTranslations('Dashboard');
  const callApi = useApi();
  const [availableCourts, setAvailableCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(false);
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
  const form = useForm<AddCourtFormValues>({
    resolver: zodResolver(addCourtFormSchema),
    defaultValues: {
      court_id: '',
      useTournamentDuration: true,
      availability_start: formatDateForInput(new Date()),
      availability_end: formatDateForInput(
        new Date(Date.now() + 24 * 60 * 60 * 1000)
      ) // Tomorrow
    }
  });

  // Get tournament details when sidebar opens
  useEffect(() => {
    const loadTournament = async () => {
      if (!open || !tournamentId) return;

      try {
        const tournamentData = await fetchTournament(callApi, tournamentId);
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
  }, [open, tournamentId, callApi, form]);

  // Load available courts when sidebar opens
  useEffect(() => {
    const loadAvailableCourts = async () => {
      if (!open) return;

      setLoading(true);
      try {
        // Direct call to the courts API endpoint
        const response = await fetchCourts(callApi);

        let allCourts = [];

        // Handle various response cases
        if (response && Array.isArray(response)) {
          allCourts = response;
        } else if (response && typeof response === 'object') {
          // Some APIs nest the array response
          // Try to find an array property
          const possibleArrays = Object.values(response).filter((val) =>
            Array.isArray(val)
          );
          if (possibleArrays.length > 0) {
            allCourts = possibleArrays[0];
          }
        }

        // Filter out courts already in tournament
        const filteredCourts = allCourts.filter(
          (court) =>
            court &&
            typeof court.id !== 'undefined' &&
            !tournamentCourtIds.includes(String(court.id))
        );

        setAvailableCourts(filteredCourts);
      } catch (error) {
        setAvailableCourts([]);
      } finally {
        setLoading(false);
      }
    };

    loadAvailableCourts();
  }, [open, callApi, tournamentCourtIds]);

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
  }, [useTournamentDuration, tournament, form]);

  // Function to ensure courts are valid for the dropdown
  const getProcessedCourts = () => {
    if (!availableCourts || !Array.isArray(availableCourts)) return [];

    return availableCourts
      .filter((court) => court && typeof court.id !== 'undefined') // Ensure valid courts with IDs
      .map((court) => ({
        id: court.id,
        name: court.name || `Court ${court.id}`,
        value: String(court.id)
      }));
  };

  // Get processed courts
  const processedCourts = getProcessedCourts();

  // Handle form submission
  const handleSubmit = async (values: AddCourtFormValues) => {
    try {
      // Get the selected court ID
      const selectedCourtId = parseInt(values.court_id);

      // Ensure dates are properly converted to UTC when sending to backend
      const startDate = new Date(values.availability_start);
      const endDate = new Date(values.availability_end);

      // Create the params object with the real ID
      const params = {
        court_id: selectedCourtId,
        availability_start: startDate.toISOString(),
        availability_end: endDate.toISOString()
      };

      const success = await onAddCourt(params);

      // Only reset form and close sidebar if the API call was successful
      if (success !== false) {
        form.reset({
          court_id: '',
          useTournamentDuration: true,
          availability_start: formatDateForInput(new Date()),
          availability_end: formatDateForInput(
            new Date(Date.now() + 24 * 60 * 60 * 1000)
          )
        });
        onOpenChange(false);
      }
    } catch (err) {
      // Keep the sidebar open on error
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-[400px] overflow-y-auto sm:w-[540px]'>
        <SheetHeader>
          <SheetTitle>{t('addCourt') || 'Add Court'}</SheetTitle>
          <SheetDescription>
            {t('addCourtDescription') || 'Add a court to your tournament.'}
          </SheetDescription>
        </SheetHeader>

        <div className='py-6'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-6'
            >
              <FormField
                control={form.control}
                name='court_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('selectCourt') || 'Select Court'}</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loading
                                ? t('loading') || 'Loading...'
                                : t('selectCourtPlaceholder') ||
                                  'Select a court'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {loading ? (
                            <div className='px-4 py-6 text-center'>
                              <div className='mx-auto mb-2 h-4 w-24 animate-pulse rounded bg-muted'></div>
                              <div className='text-sm text-muted-foreground'>
                                {t('loading') || 'Loading'}...
                              </div>
                            </div>
                          ) : processedCourts.length === 0 ? (
                            <div className='px-4 py-6 text-center'>
                              <div className='text-sm text-muted-foreground'>
                                {t('noCourtsAvailable') ||
                                  'No Courts Available'}
                              </div>
                              <div className='mt-2 text-xs text-muted-foreground'>
                                {t('noAvailableCourtsDescription') ||
                                  'No available courts found to add'}
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Debug info */}
                              <div className='border-b px-2 py-1 text-xs text-muted-foreground'>
                                {processedCourts.length}{' '}
                                {t('courtsAvailable') || 'courts available'}
                              </div>

                              {processedCourts.map((court) => (
                                <SelectItem key={court.id} value={court.value}>
                                  {court.name}
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='useTournamentDuration'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>
                        {t('useTournamentDuration') ||
                          'Use Tournament Duration'}
                      </FormLabel>
                      <FormDescription>
                        {t('useTournamentDurationDescription') ||
                          'When enabled, court availability will match the tournament duration'}
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
                      <FormLabel>
                        {t('availabilityStart') || 'Start Time'}
                      </FormLabel>
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
                      <FormLabel>
                        {t('availabilityEnd') || 'End Time'}
                      </FormLabel>
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
                <Button type='submit' disabled={isAdding || loading}>
                  {isAdding ? t('adding') || 'Adding...' : t('add') || 'Add'}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
