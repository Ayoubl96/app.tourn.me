'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { TournamentGroup, GroupCouple } from '@/api/tournaments/types';
import { useTournamentContext } from '@/features/tournament/context/TournamentContext';
import { useTournamentStaging } from '@/features/tournament/hooks/useTournamentStaging';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { EmptyState } from '../../shared/EmptyState';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Couple } from '@/features/tournament/types';
import {
  UsersRound,
  ShuffleIcon,
  MoveUp,
  Trash2,
  PlusCircle,
  Edit,
  MoveRight
} from 'lucide-react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { DropZone, DraggableItem } from '@/components/dnd';
import { useCoupleDragAndDrop } from '@/features/tournament/hooks/useCoupleDragAndDrop';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/features/tournament/utils/formatters';
import { toast } from 'sonner';

interface IntegratedGroupManagementProps {
  stageId: number;
  tournamentId: string | number;
}

export function IntegratedGroupManagement({
  stageId,
  tournamentId
}: IntegratedGroupManagementProps) {
  const t = useTranslations('Dashboard');
  const { couples } = useTournamentContext();

  // State for group management
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupToDelete, setGroupToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // State for couple assignment
  const [isAutoAssignDialogOpen, setIsAutoAssignDialogOpen] = useState(false);
  const [assignMethod, setAssignMethod] = useState<'random' | 'balanced'>(
    'balanced'
  );
  const [isRemovingCouple, setIsRemovingCouple] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get tournament staging hook
  const {
    groups,
    groupCouples,
    isLoading,
    isCreatingGroup,
    loadGroups,
    loadGroupCouples,
    handleCreateGroup,
    handleDeleteGroup,
    handleAddCoupleToGroup,
    handleRemoveCoupleFromGroup,
    handleAutoAssignCouples
  } = useTournamentStaging({
    tournamentId
  });

  // Filter groups that belong to this stage
  const stageGroups = groups.filter((group) => group.stage_id === stageId);

  // Load groups
  useEffect(() => {
    loadGroups(stageId);
  }, [stageId, loadGroups]);

  // Helper function to refresh data
  const refreshData = useCallback(async () => {
    if (stageGroups.length > 0) {
      const promises = stageGroups.map((group) => loadGroupCouples(group.id));
      await Promise.all(promises);
      setRefreshTrigger((prev) => prev + 1);
    }
  }, [stageGroups, loadGroupCouples]);

  // Load couples for each group - only run on initial mount and when groups change
  useEffect(() => {
    // Only load couples data when we have groups and after initial load
    const groupIds = stageGroups.map((group) => group.id).join(',');
    if (groupIds) {
      refreshData();
    }
  }, [stageGroups.length]); // Only depend on the length to detect when groups are added/removed

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

  // Handle group creation
  const handleCreateGroupSubmit = async () => {
    if (!newGroupName.trim()) {
      toast.error(
        `${t('groupName', { defaultValue: 'Group name' })} ${t('isRequired')}`
      );
      return;
    }

    try {
      const result = await handleCreateGroup(stageId, newGroupName);
      if (result) {
        setNewGroupName('');
        setIsCreateDialogOpen(false);
        toast.success(
          t('groupCreated', { defaultValue: 'Group created successfully' })
        );
      }
    } catch (error) {
      console.error('Failed to create group:', error);
      // Error is handled by the hook with a toast
    }
  };

  // Handle group deletion
  const confirmDeleteGroup = async () => {
    if (groupToDelete === null) return;

    try {
      const success = await handleDeleteGroup(groupToDelete);
      if (success) {
        setGroupToDelete(null);
        setIsDeleteDialogOpen(false);
        toast.success(
          t('groupDeleted', { defaultValue: 'Group deleted successfully' })
        );
      }
    } catch (error) {
      console.error('Failed to delete group:', error);
      // Error is handled by the hook with a toast
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (groupId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setGroupToDelete(groupId);
    setIsDeleteDialogOpen(true);
  };

  // Handle manual couple assignment
  const handleAssignCouple = async (groupId: number, coupleId: number) => {
    try {
      await handleAddCoupleToGroup(groupId, coupleId);
      await refreshData(); // Refresh data after assignment
    } catch (error) {
      console.error('Failed to assign couple:', error);
    }
  };

  // Handle couple removal from group
  const handleRemoveCouple = async (groupId: number, coupleId: number) => {
    setIsRemovingCouple(true);
    try {
      await handleRemoveCoupleFromGroup(groupId, coupleId);
      await refreshData(); // Refresh data after removal
    } catch (error) {
      console.error('Failed to remove couple:', error);
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
      console.error('Failed to auto-assign couples:', error);
    }
  };

  // Drag and drop functionality
  const { sensors, activeCouple, handleDragStart, handleDragEnd } =
    useCoupleDragAndDrop(
      couples,
      stageGroups,
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
          <h3 className='text-lg font-medium'>
            {t('stageGroupsAndAssignment', {
              defaultValue: 'Stage Groups & Assignment'
            })}
          </h3>
          <div className='flex gap-2'>
            <Button
              onClick={() => setIsAutoAssignDialogOpen(true)}
              variant='outline'
              disabled={
                unassignedCouples.length === 0 || stageGroups.length === 0
              }
            >
              <ShuffleIcon className='mr-2 h-4 w-4' />
              {t('autoAssign')}
            </Button>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className='flex items-center gap-1'
            >
              <PlusCircle className='h-4 w-4' />
              {t('createGroup', { defaultValue: 'Create Group' })}
            </Button>
          </div>
        </div>

        {stageGroups.length === 0 ? (
          <EmptyState
            icon={<UsersRound className='h-8 w-8' />}
            title={t('noGroups', { defaultValue: 'No Groups Created' })}
            description={t('noGroupsDescription', {
              defaultValue:
                'Create your first group to assign couples and generate matches'
            })}
            action={
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <PlusCircle className='mr-2 h-4 w-4' />
                {t('createGroup', { defaultValue: 'Create Group' })}
              </Button>
            }
          />
        ) : (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {stageGroups.map((group) => {
              const groupCouplesList = getCouplesInGroup(group.id);
              return (
                <Card key={group.id} className='transition-colors'>
                  <CardHeader className='pb-2'>
                    <div className='flex items-center justify-between'>
                      <CardTitle>{group.name}</CardTitle>
                      <div className='flex gap-2'>
                        <Badge>
                          {groupCouplesList.length} {t('couples')}
                        </Badge>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={(e) => openDeleteDialog(group.id, e)}
                          className='h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive/90'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className='flex-grow'>
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
          <div className='mb-4 flex items-center justify-between'>
            <h3 className='text-lg font-medium'>
              {t('unassignedCouples')} ({unassignedCouples.length})
            </h3>
            <div className='text-sm text-muted-foreground'>
              {t('dragDropInstruction', {
                defaultValue: 'Drag and drop couples to assign them to groups'
              })}
            </div>
          </div>

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

        {/* Create Group Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t('createGroup', { defaultValue: 'Create Group' })}
              </DialogTitle>
              <DialogDescription>
                {t('createGroupDescription', {
                  defaultValue:
                    'Create a new group to organize couples and generate matches'
                })}
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='group-name'>
                  {t('groupName', { defaultValue: 'Group Name' })}
                </Label>
                <Input
                  id='group-name'
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder={t('groupNamePlaceholder', {
                    defaultValue: 'e.g., Group A, Beginners, etc.'
                  })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsCreateDialogOpen(false)}
              >
                {t('cancel', { namespace: 'Common' })}
              </Button>
              <Button
                onClick={handleCreateGroupSubmit}
                disabled={isCreatingGroup}
              >
                {isCreatingGroup
                  ? t('creating')
                  : t('createGroup', { defaultValue: 'Create Group' })}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Group Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t('deleteGroup', { defaultValue: 'Delete Group' })}
              </DialogTitle>
              <DialogDescription>
                {t('deleteGroupConfirmation', {
                  defaultValue:
                    'Are you sure you want to delete this group? This action cannot be undone and will remove all couples and matches associated with this group.'
                })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                {t('cancel', { namespace: 'Common' })}
              </Button>
              <Button variant='destructive' onClick={confirmDeleteGroup}>
                {t('delete', { namespace: 'Common' })}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
              <Label>{t('assignmentMethod')}</Label>
              <RadioGroup
                value={assignMethod}
                onValueChange={(v) =>
                  setAssignMethod(v as 'random' | 'balanced')
                }
                className='mt-2'
              >
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='random' id='random' />
                  <Label htmlFor='random'>{t('randomAssignment')}</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='balanced' id='balanced' />
                  <Label htmlFor='balanced'>{t('balancedAssignment')}</Label>
                </div>
              </RadioGroup>
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
