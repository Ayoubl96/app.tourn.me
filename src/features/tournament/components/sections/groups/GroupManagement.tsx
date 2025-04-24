'use client';

import React, { useState } from 'react';
import { TournamentGroup } from '@/api/tournaments/types';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, UsersRound, Trash2, Edit, MoveRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { EmptyState } from '../../shared/EmptyState';

interface GroupManagementProps {
  stageId: number;
  groups: TournamentGroup[];
  onCreateGroup: (
    stageId: number,
    name: string
  ) => Promise<TournamentGroup | null>;
  onDeleteGroup: (groupId: number) => Promise<boolean>;
}

export function GroupManagement({
  stageId,
  groups,
  onCreateGroup,
  onDeleteGroup
}: GroupManagementProps) {
  const t = useTranslations('Dashboard');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Handle group creation
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error(
        `${t('groupName', { defaultValue: 'Group name' })} ${t('isRequired')}`
      );
      return;
    }

    setIsCreating(true);
    try {
      const result = await onCreateGroup(stageId, newGroupName);
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
    } finally {
      setIsCreating(false);
    }
  };

  // Handle group deletion
  const handleDeleteGroup = async () => {
    if (groupToDelete === null) return;

    try {
      const success = await onDeleteGroup(groupToDelete);
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

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-medium'>
          {t('stageGroups', { defaultValue: 'Stage Groups' })}
        </h3>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className='flex items-center gap-1'
        >
          <PlusCircle className='h-4 w-4' />
          {t('createGroup', { defaultValue: 'Create Group' })}
        </Button>
      </div>

      {groups.length === 0 ? (
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
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {groups.map((group) => (
            <Card
              key={group.id}
              className='cursor-pointer transition-colors hover:bg-accent/50'
            >
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <CardTitle>{group.name}</CardTitle>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={(e) => openDeleteDialog(group.id, e)}
                    className='h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive/90'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-sm'>
                  <p>
                    {t('couplesInGroup', { defaultValue: 'Couples in group' })}:
                    0
                  </p>
                  <p>
                    {t('matchesGenerated', {
                      defaultValue: 'Matches generated'
                    })}
                    : 0
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant='secondary' size='sm' className='w-full'>
                  {t('manageGroup', { defaultValue: 'Manage Group' })}
                  <MoveRight className='ml-2 h-4 w-4' />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

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
            <Button onClick={handleCreateGroup} disabled={isCreating}>
              {isCreating
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
            <Button variant='destructive' onClick={handleDeleteGroup}>
              {t('delete', { namespace: 'Common' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
