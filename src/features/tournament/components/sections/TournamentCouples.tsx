import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Couple, Player, TournamentResponse } from '../../types';
import { Sidebar } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Pencil, Trash2, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { SidebarHeader } from '@/components/layout/sidebar-header';
import { CoupleForm } from '../forms/CoupleForm';
import { getInitials } from '../../utils/formatters';
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
import { Badge } from '@/components/ui/badge';
import { useTournamentContext } from '../../context/TournamentContext';
import { Progress } from '@/components/ui/progress';

interface TournamentCouplesProps {
  maxCouples?: number;
}

export const TournamentCouples: React.FC<TournamentCouplesProps> = ({
  maxCouples = 0
}) => {
  const t = useTranslations('Dashboard');
  const {
    tournament,
    tournamentPlayers,
    tournamentCouples,
    isLoadingCouples,
    isLoadingPlayers,
    createCouple,
    updateCouple,
    deleteCouple
  } = useTournamentContext();

  // Local state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingCouple, setEditingCouple] = useState<Couple | null>(null);
  const [coupleToDelete, setCoupleToDelete] = useState<Couple | null>(null);

  // Handle couple creation
  const handleCreateCouple = async (data: {
    first_player_id: number;
    second_player_id: number;
    name: string;
  }) => {
    await createCouple(data);
    if (!editingCouple) {
      // Keep sidebar open for continued couple creation
    }
  };

  // Handle couple update
  const handleUpdateCouple = async (data: {
    first_player_id: number;
    second_player_id: number;
    name: string;
    couple_id?: number;
  }) => {
    if (data.couple_id) {
      await updateCouple(data);
      setEditingCouple(null);
      setIsSidebarOpen(false);
    }
  };

  // Handle couple deletion
  const handleDeleteCouple = async () => {
    if (coupleToDelete) {
      await deleteCouple(coupleToDelete.id);
      setCoupleToDelete(null);
    }
  };

  // Sidebar interactions
  const openCreateForm = () => {
    setEditingCouple(null);
    setIsSidebarOpen(true);
  };

  const openEditForm = (couple: Couple) => {
    setEditingCouple(couple);
    setIsSidebarOpen(true);
  };

  // Filter available players (those not in a couple)
  const getAvailablePlayers = (): Player[] => {
    // We want to include the players from the editing couple if we're in edit mode
    const playersInCouples = tournamentCouples
      .filter((couple) => !editingCouple || couple.id !== editingCouple.id)
      .flatMap((couple) => [couple.first_player.id, couple.second_player.id]);

    return tournamentPlayers.filter(
      (player) => !playersInCouples.includes(player.id)
    );
  };

  // Determine if we've reached the max number of couples
  const isCouplesLimitReached =
    maxCouples > 0 && tournamentCouples.length >= maxCouples;

  return (
    <>
      {/* Couples list with add button */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-medium tracking-tight'>
            {t('couples')}
            <Badge variant='outline' className='ml-2'>
              {tournamentCouples.length}
              {maxCouples > 0 ? `/${maxCouples}` : ''}
            </Badge>
          </h3>
          <Button
            size='sm'
            onClick={openCreateForm}
            disabled={
              isCouplesLimitReached ||
              isLoadingCouples ||
              tournamentPlayers.length < 2
            }
          >
            <UserPlus className='mr-2 h-4 w-4' />
            {t('addCouple')}
          </Button>
        </div>

        <div className='mb-4'>
          <div className='mb-1 flex justify-between text-sm'>
            <span>
              {t('couples')}: {tournamentCouples.length} /{' '}
              {maxCouples > 0 ? maxCouples : tournamentPlayers.length / 2}
            </span>
            <span>
              {maxCouples > 0
                ? Math.round((tournamentCouples.length / maxCouples) * 100)
                : 0}
              %
            </span>
          </div>
          <Progress
            value={
              maxCouples > 0 ? (tournamentCouples.length / maxCouples) * 100 : 0
            }
            className='h-2'
          />
        </div>

        {tournamentCouples.length === 0 ? (
          <EmptyState
            title={t('noCouples')}
            description={t('noCouplesDescription')}
            icon={<Users className='h-10 w-10' />}
            action={
              <Button
                onClick={openCreateForm}
                disabled={
                  isCouplesLimitReached ||
                  isLoadingCouples ||
                  tournamentPlayers.length < 2
                }
              >
                <UserPlus className='mr-2 h-4 w-4' />
                {t('addCouple')}
              </Button>
            }
          />
        ) : (
          <div className='grid grid-cols-2 gap-4'>
            {tournamentCouples.map((couple) => (
              <Card key={couple.id} className='h-full'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-base'>{couple.name}</CardTitle>
                  <CardDescription className='line-clamp-1'>
                    {t('coupleId')}: {couple.id}
                  </CardDescription>
                </CardHeader>
                <CardContent className='pb-2'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage
                          src={couple.first_player.picture || ''}
                          alt={couple.first_player.nickname}
                        />
                        <AvatarFallback>
                          {getInitials(couple.first_player.nickname)}
                        </AvatarFallback>
                      </Avatar>
                      <span className='text-sm'>
                        {couple.first_player.nickname}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage
                          src={couple.second_player.picture || ''}
                          alt={couple.second_player.nickname}
                        />
                        <AvatarFallback>
                          {getInitials(couple.second_player.nickname)}
                        </AvatarFallback>
                      </Avatar>
                      <span className='text-sm'>
                        {couple.second_player.nickname}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className='flex justify-end gap-2 pt-2'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => openEditForm(couple)}
                    disabled={isLoadingCouples}
                  >
                    <Pencil className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setCoupleToDelete(couple)}
                    disabled={isLoadingCouples}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar for creating/editing couples */}
      <Sidebar
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        onClose={() => {
          setIsSidebarOpen(false);
          setEditingCouple(null);
        }}
      >
        <SidebarHeader
          title={editingCouple ? t('editCouple') : t('addCouple')}
          description={
            editingCouple
              ? t('editCoupleDescription')
              : t('addCoupleDescription')
          }
        />
        <div className='px-4 py-2'>
          <div className='mb-4'>
            <div className='mb-1 flex justify-between text-sm'>
              <span>
                {t('couples')}: {tournamentCouples.length} /{' '}
                {maxCouples > 0 ? maxCouples : tournamentPlayers.length / 2}
              </span>
              <span>
                {maxCouples > 0
                  ? Math.round((tournamentCouples.length / maxCouples) * 100)
                  : 0}
                %
              </span>
            </div>
            <Progress
              value={
                maxCouples > 0
                  ? (tournamentCouples.length / maxCouples) * 100
                  : 0
              }
              className='h-2'
            />
          </div>

          <CoupleForm
            availablePlayers={getAvailablePlayers()}
            isLoading={isLoadingCouples}
            onSubmit={editingCouple ? handleUpdateCouple : handleCreateCouple}
            onCancel={() => setIsSidebarOpen(false)}
            editingCouple={editingCouple}
            resetForm={false}
            maxCouples={maxCouples}
            currentCouplesCount={tournamentCouples.length}
          />
        </div>
      </Sidebar>

      {/* Confirmation dialog for deleting couples */}
      <AlertDialog
        open={!!coupleToDelete}
        onOpenChange={(open) => !open && setCoupleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteCouple')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteCoupleConfirmation', {
                name: coupleToDelete?.name || ''
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCouple}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
