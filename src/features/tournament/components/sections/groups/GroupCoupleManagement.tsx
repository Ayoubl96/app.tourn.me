'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { TournamentGroup, GroupCouple } from '@/api/tournaments/types';
import { useTournamentContext } from '@/features/tournament/context/TournamentContext';
import { useTournamentStaging } from '@/features/tournament/hooks/useTournamentStaging';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { EmptyState } from '../../shared/EmptyState';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Couple } from '@/features/tournament/types';
import { UsersRound, ShuffleIcon, MoveUp, Trash2 } from 'lucide-react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { DropZone, DraggableItem } from '@/components/dnd';
import { useCoupleDragAndDrop } from '@/features/tournament/hooks/useCoupleDragAndDrop';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/features/tournament/utils/formatters';

interface GroupCoupleManagementProps {
  stageId: number;
  groups: TournamentGroup[];
  tournamentId: string | number;
}

export function GroupCoupleManagement({
  stageId,
  groups,
  tournamentId
}: GroupCoupleManagementProps) {
  const t = useTranslations('Dashboard');
  const { couples } = useTournamentContext();
  const [isAutoAssignDialogOpen, setIsAutoAssignDialogOpen] = useState(false);
  const [assignMethod, setAssignMethod] = useState<'random' | 'balanced'>(
    'balanced'
  );
  const [isRemovingCouple, setIsRemovingCouple] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get tournament staging hook
  const {
    groupCouples,
    loadGroupCouples,
    handleAddCoupleToGroup,
    handleRemoveCoupleFromGroup,
    handleAutoAssignCouples,
    isLoading
  } = useTournamentStaging({
    tournamentId
  });

  // Helper function to refresh data
  const refreshData = useCallback(async () => {
    if (groups.length > 0) {
      const promises = groups.map((group) => loadGroupCouples(group.id));
      await Promise.all(promises);
      setRefreshTrigger((prev) => prev + 1);
    }
  }, [groups, loadGroupCouples]);

  // Load couples for each group
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Get couples in a specific group
  const getCouplesInGroup = (groupId: number) => {
    return groupCouples[groupId] || [];
  };

  // Get couples not assigned to any group
  const getUnassignedCouples = () => {
    // Get all assigned couple IDs - using the id field directly from the API response
    const assignedCoupleIds = Object.values(groupCouples)
      .flat()
      .map((gc: any) => gc.id);

    // Return couples not in any group
    return couples.filter((couple) => !assignedCoupleIds.includes(couple.id));
  };

  const unassignedCouples = getUnassignedCouples();

  // Handle manual couple assignment
  const handleAssignCouple = async (groupId: number, coupleId: number) => {
    try {
      await handleAddCoupleToGroup(groupId, coupleId);
      await refreshData(); // Refresh data after assignment
    } catch (error) {
      // Error handling removed
    }
  };

  // Handle couple removal from group
  const handleRemoveCouple = async (groupId: number, coupleId: number) => {
    setIsRemovingCouple(true);
    try {
      await handleRemoveCoupleFromGroup(groupId, coupleId);
      await refreshData(); // Refresh data after removal
    } catch (error) {
      // Error handling removed
    } finally {
      setIsRemovingCouple(false);
    }
  };

  // Handle auto-assignment
  const handleAutoAssign = async () => {
    try {
      await handleAutoAssignCouples(stageId, assignMethod);
      setIsAutoAssignDialogOpen(false);
      await refreshData(); // Refresh data after auto-assignment
    } catch (error) {
      // Error handling removed
    }
  };

  // Drag and drop functionality
  const { sensors, activeCouple, handleDragStart, handleDragEnd } =
    useCoupleDragAndDrop(
      couples,
      groups,
      handleAssignCouple,
      handleRemoveCouple
    );

  // Render a couple item (used for both group items and unassigned items)
  const renderCoupleItem = (couple: any, groupId?: number) => {
    // Make sure we have a valid couple ID
    const safeCoupleId = Number(couple.id);

    return (
      <div className='flex items-center justify-between rounded-md bg-muted/50 p-2'>
        <div className='flex items-center gap-2'>
          <Avatar className='h-8 w-8'>
            <AvatarFallback>{getInitials(couple.name)}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='text-sm font-medium'>{couple.name}</span>
            <div className='flex gap-1 text-xs text-muted-foreground'>
              <span>{couple.first_player?.nickname || 'Player 1'}</span>
              <span>&</span>
              <span>{couple.second_player?.nickname || 'Player 2'}</span>
            </div>
          </div>
        </div>

        {groupId && !isNaN(groupId) && !isNaN(safeCoupleId) && (
          <Button
            variant='ghost'
            size='icon'
            onClick={() => handleRemoveCouple(groupId, safeCoupleId)}
            disabled={isRemovingCouple}
            className='h-6 w-6'
          >
            <Trash2 className='h-3.5 w-3.5' />
          </Button>
        )}
      </div>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-medium'>{t('couplesAssignment')}</h3>
          <div className='flex gap-2'>
            <Button
              onClick={() => setIsAutoAssignDialogOpen(true)}
              variant='outline'
              disabled={unassignedCouples.length === 0 || groups.length === 0}
            >
              <ShuffleIcon className='mr-2 h-4 w-4' />
              {t('autoAssign')}
            </Button>
          </div>
        </div>

        {groups.length === 0 ? (
          <EmptyState
            icon={<UsersRound className='h-8 w-8' />}
            title={t('noGroups')}
            description={t('createGroupsFirst')}
          />
        ) : (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {groups.map((group) => {
              const groupCouplesList = getCouplesInGroup(group.id);
              return (
                <Card key={group.id} className='transition-colors'>
                  <CardHeader className='pb-2'>
                    <div className='flex items-center justify-between'>
                      <CardTitle>{group.name}</CardTitle>
                      <Badge>
                        {groupCouplesList.length} {t('couples')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className='pt-0'>
                    <DropZone
                      id={`group-${group.id}`}
                      className='min-h-[150px] rounded-md border border-dashed p-2'
                      activeClassName='border-primary/80 bg-primary/5'
                    >
                      {groupCouplesList.length === 0 ? (
                        <div className='flex h-full items-center justify-center py-4 text-center text-muted-foreground'>
                          <p>{t('noCouplesInGroup')}</p>
                        </div>
                      ) : (
                        <div className='space-y-2'>
                          {groupCouplesList.map((couple: any, index) => {
                            // Make sure we have valid IDs
                            const safeGroupId = Number(group.id);
                            const safeCoupleId = Number(couple.id);

                            // Skip invalid IDs
                            if (isNaN(safeGroupId) || isNaN(safeCoupleId)) {
                              // Error logging removed
                              return null;
                            }

                            // Always include index in key to ensure uniqueness
                            return (
                              <DraggableItem
                                key={`group-${safeGroupId}-couple-${safeCoupleId}-index-${index}`}
                                id={`group-couple-${safeGroupId}-${safeCoupleId}`}
                              >
                                {renderCoupleItem(couple, safeGroupId)}
                              </DraggableItem>
                            );
                          })}
                        </div>
                      )}
                    </DropZone>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Unassigned couples section */}
        <div className='mt-6'>
          <h3 className='mb-4 text-lg font-medium'>
            {t('unassignedCouples')} ({unassignedCouples.length})
          </h3>

          {unassignedCouples.length === 0 ? (
            <Alert>
              <AlertDescription>{t('allCouplesAssigned')}</AlertDescription>
            </Alert>
          ) : (
            <DropZone
              id='unassigned-dropzone'
              className='rounded-md border border-dashed p-4'
              activeClassName='border-primary/80 bg-primary/5'
            >
              <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
                {unassignedCouples.map((couple: Couple, index) => {
                  // Make sure we have a valid ID
                  const safeCoupleId = Number(couple.id);

                  // Skip invalid IDs
                  if (isNaN(safeCoupleId)) {
                    // Error logging removed
                    return null;
                  }

                  // Always include index in key to ensure uniqueness
                  return (
                    <DraggableItem
                      key={`couple-${safeCoupleId}-index-${index}`}
                      id={`couple-${safeCoupleId}`}
                    >
                      {renderCoupleItem(couple)}
                    </DraggableItem>
                  );
                })}
              </div>
            </DropZone>
          )}
        </div>

        {/* Auto-assign dialog */}
        <Dialog
          open={isAutoAssignDialogOpen}
          onOpenChange={setIsAutoAssignDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('autoAssignCouples')}</DialogTitle>
              <DialogDescription>
                {t('autoAssignCouplesDescription')}
              </DialogDescription>
            </DialogHeader>

            <div className='py-4'>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label>{t('assignmentMethod')}</Label>
                  <RadioGroup
                    value={assignMethod}
                    onValueChange={(value) =>
                      setAssignMethod(value as 'random' | 'balanced')
                    }
                    className='flex flex-col space-y-1'
                  >
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='balanced' id='balanced' />
                      <Label htmlFor='balanced'>
                        {t('balancedDistribution')}
                      </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='random' id='random' />
                      <Label htmlFor='random'>{t('randomDistribution')}</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Alert>
                  <AlertDescription>{t('autoAssignWarning')}</AlertDescription>
                </Alert>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsAutoAssignDialogOpen(false)}
              >
                {t('cancel')}
              </Button>
              <Button onClick={handleAutoAssign} disabled={isLoading}>
                {isLoading ? t('assigning') : t('assignCouples')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Drag overlay */}
        <DragOverlay>
          {activeCouple ? (
            <div className='w-full max-w-md rounded-md border bg-card p-2 opacity-80'>
              <div className='flex items-center gap-2'>
                <Badge className='mr-2'>
                  <MoveUp className='mr-1 h-3 w-3' />
                  {t('dragging')}
                </Badge>
                <span>{activeCouple.name}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
