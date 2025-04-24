'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Calendar, Edit, Trash2 } from 'lucide-react';
import { Tournament } from '@/api/tournaments/types';
import { useTournamentCourts } from '@/features/tournament/hooks/useTournamentCourts';
import { AddCourtSidebar } from '../sidebars/AddCourtSidebar';
import { EditCourtSidebar } from '../sidebars/EditCourtSidebar';
import * as z from 'zod';
import { toast } from 'sonner';

// Form schemas (kept for reference and validation)
const addCourtFormSchema = z
  .object({
    court_id: z.string().min(1, { message: 'Please select a court' }),
    availability_start: z
      .string()
      .min(1, { message: 'Please provide a start date and time' }),
    availability_end: z
      .string()
      .min(1, { message: 'Please provide an end date and time' })
  })
  .refine(
    (data) => {
      const start = new Date(data.availability_start);
      const end = new Date(data.availability_end);
      return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start;
    },
    {
      message: 'End date must be after start date and both dates must be valid',
      path: ['availability_end']
    }
  );

const updateCourtFormSchema = z
  .object({
    availability_start: z
      .string()
      .min(1, { message: 'Please provide a start date and time' }),
    availability_end: z
      .string()
      .min(1, { message: 'Please provide an end date and time' })
  })
  .refine(
    (data) => {
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
type UpdateCourtFormValues = z.infer<typeof updateCourtFormSchema>;

interface TournamentCourtsProps {
  tournament: Tournament;
}

export function TournamentCourts({ tournament }: TournamentCourtsProps) {
  const t = useTranslations('Dashboard');
  const [isAddSidebarOpen, setIsAddSidebarOpen] = useState(false);
  const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);
  const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<any>(null);

  // Use tournament courts hook - we only need tournament courts now
  const {
    tournamentCourts,
    loading,
    error,
    isAdding,
    isRemoving,
    isUpdating,
    courtToRemove,
    setCourtToRemove,
    addCourt,
    updateCourt,
    removeCourt,
    noData
  } = useTournamentCourts(tournament.id.toString(), true);

  // Get IDs of courts already in the tournament
  const tournamentCourtIds = tournamentCourts.map((tc) =>
    tc.court_id.toString()
  );

  // Find selected court when ID changes
  useEffect(() => {
    if (selectedCourtId !== null) {
      const court = tournamentCourts.find(
        (c) => c.court_id === selectedCourtId
      );
      setSelectedCourt(court || null);
    } else {
      setSelectedCourt(null);
    }
  }, [selectedCourtId, tournamentCourts]);

  // Handle adding a court
  const handleAddCourt = async (params: any) => {
    try {
      await addCourt(params);
      toast.success(t('courtAddedSuccessfully') || 'Court added successfully');
      return true; // Signal success to the sidebar
    } catch (err) {
      toast.error(
        t('courtAdditionError') || 'An error occurred while adding the court'
      );
      return false; // Signal failure to the sidebar
    }
  };

  // Handle editing a court
  const handleEditCourt = async (courtId: number, params: any) => {
    try {
      await updateCourt(courtId, params);
      toast.success(
        t('courtUpdatedSuccessfully') || 'Court updated successfully'
      );
      setSelectedCourtId(null);
      return true; // Signal success to the sidebar
    } catch (err) {
      toast.error(t('courtUpdateError') || 'Failed to update court');
      return false; // Signal failure to the sidebar
    }
  };

  // Open edit sidebar with court data
  const openEditSidebar = (courtId: number) => {
    setSelectedCourtId(courtId);
    setIsEditSidebarOpen(true);
  };

  // Handle removing a court
  const handleRemoveCourt = async () => {
    if (courtToRemove === null) return;

    try {
      await removeCourt(courtToRemove);
      toast.success(
        t('courtRemovedSuccessfully') || 'Court removed successfully'
      );
    } catch (err) {
      toast.error(t('courtRemovalError') || 'Failed to remove court');
      setCourtToRemove(null); // Close the dialog on error
    }
  };

  // Loading state
  if (loading && tournamentCourts.length === 0) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-1/4' />
          <Skeleton className='h-10 w-28' />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-32' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-48 w-full' />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='rounded-md bg-destructive/15 p-4 text-destructive'>
        <p>{error}</p>
        <Button
          variant='outline'
          onClick={() => window.location.reload()}
          className='mt-4'
        >
          {t('tryAgain') || 'Try Again'}
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold tracking-tight'>
          {t('courts') || 'Courts'}
        </h2>
        <Button onClick={() => setIsAddSidebarOpen(true)}>
          <PlusCircle className='mr-2 h-4 w-4' />
          {t('addCourt') || 'Add Court'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('tournamentCourts') || 'Tournament Courts'}</CardTitle>
        </CardHeader>
        <CardContent>
          {tournamentCourts.length === 0 || noData ? (
            <div className='flex flex-col items-center justify-center py-6 text-center'>
              <Calendar className='h-12 w-12 text-muted-foreground' />
              <h3 className='mt-4 text-lg font-semibold'>
                {noData
                  ? t('noDataAvailable') || 'No data available'
                  : t('noCourtsYet') || 'No courts added yet'}
              </h3>
              <p className='mt-2 text-sm text-muted-foreground'>
                {noData
                  ? t('noDataDescription') ||
                    'Could not load court data. Try again later.'
                  : t('addCourtsToStart') ||
                    'Add courts to start organizing your tournament.'}
              </p>
              <Button
                className='mt-4'
                onClick={() => setIsAddSidebarOpen(true)}
              >
                <PlusCircle className='mr-2 h-4 w-4' />
                {t('addCourt') || 'Add Court'}
              </Button>
              {noData && (
                <Button
                  variant='outline'
                  onClick={() => window.location.reload()}
                  className='mt-4'
                >
                  {t('refresh') || 'Refresh'}
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name') || 'Name'}</TableHead>
                  <TableHead>
                    {t('availabilityStart') || 'Start Time'}
                  </TableHead>
                  <TableHead>{t('availabilityEnd') || 'End Time'}</TableHead>
                  <TableHead className='text-right'>
                    {t('actions') || 'Actions'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tournamentCourts
                  .filter(
                    (tournamentCourt) =>
                      tournamentCourt && tournamentCourt.court
                  )
                  .map((tournamentCourt) => (
                    <TableRow key={tournamentCourt.id}>
                      <TableCell className='font-medium'>
                        {tournamentCourt.court?.name ||
                          t('unknownCourt') ||
                          'Unknown Court'}
                      </TableCell>
                      <TableCell>
                        {tournamentCourt.availability_start
                          ? format(
                              new Date(tournamentCourt.availability_start),
                              'PPp'
                            )
                          : t('notSpecified') || 'Not specified'}
                      </TableCell>
                      <TableCell>
                        {tournamentCourt.availability_end
                          ? format(
                              new Date(tournamentCourt.availability_end),
                              'PPp'
                            )
                          : t('notSpecified') || 'Not specified'}
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() =>
                            openEditSidebar(tournamentCourt.court_id)
                          }
                        >
                          <Edit className='h-4 w-4' />
                          <span className='sr-only'>{t('edit') || 'Edit'}</span>
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() =>
                            setCourtToRemove(tournamentCourt.court_id)
                          }
                        >
                          <Trash2 className='h-4 w-4' />
                          <span className='sr-only'>
                            {t('remove') || 'Remove'}
                          </span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add court sidebar - now loads its own courts directly */}
      <AddCourtSidebar
        open={isAddSidebarOpen}
        onOpenChange={setIsAddSidebarOpen}
        tournamentId={tournament.id.toString()}
        tournamentCourtIds={tournamentCourtIds}
        onAddCourt={handleAddCourt}
        isAdding={isAdding}
      />

      {/* Edit court sidebar */}
      <EditCourtSidebar
        open={isEditSidebarOpen}
        onOpenChange={setIsEditSidebarOpen}
        selectedCourt={selectedCourt}
        onUpdateCourt={handleEditCourt}
        isUpdating={isUpdating}
      />

      {/* Remove court confirmation dialog */}
      <AlertDialog
        open={courtToRemove !== null}
        onOpenChange={(open) => !open && setCourtToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('removeCourtTitle') || 'Remove Court'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('removeCourtDescription') ||
                'Are you sure you want to remove this court? This cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel') || 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveCourt}
              disabled={isRemoving}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isRemoving
                ? t('removing') || 'Removing...'
                : t('remove') || 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
