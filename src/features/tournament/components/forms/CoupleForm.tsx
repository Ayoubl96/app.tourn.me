import React from 'react';
import { useTranslations } from 'next-intl';
import { Couple, Player } from '../../types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Info } from 'lucide-react';

// Import components from separate files
import { PlayerCard } from '../player/PlayerCard';
import { DropdownSelection } from './couple-form/DropdownSelection';
import { DragAndDropSelection } from './couple-form/DragAndDropSelection';
import { useCoupleForm } from '../../hooks/useCoupleForm';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';

interface CoupleFormProps {
  availablePlayers: Player[];
  isLoading: boolean;
  onSubmit: (data: {
    first_player_id: number;
    second_player_id: number;
    name: string;
    couple_id?: number;
  }) => Promise<void>;
  onCancel: () => void;
  editingCouple?: Couple | null;
  resetForm?: boolean;
  maxCouples?: number;
  currentCouplesCount?: number;
}

/**
 * CoupleForm component
 *
 * Allows users to create or edit a couple consisting of two players.
 * Provides two selection methods: drag-and-drop or dropdown.
 */
export const CoupleForm: React.FC<CoupleFormProps> = ({
  availablePlayers,
  isLoading,
  onSubmit,
  onCancel,
  editingCouple = null,
  resetForm = false,
  maxCouples = 0,
  currentCouplesCount = 0
}) => {
  const t = useTranslations('Dashboard');

  // Use custom hooks for form state and drag-and-drop
  const {
    name,
    setName,
    selectedPlayers,
    setSelectedPlayers,
    showSelectMethod,
    setShowSelectMethod,
    isCouplesLimitReached,
    resetFormState,
    filteredAvailablePlayers,
    handleRemovePlayer,
    handleSelectPlayer
  } = useCoupleForm(
    availablePlayers,
    editingCouple,
    resetForm,
    maxCouples,
    currentCouplesCount
  );

  const { sensors, activePlayer, handleDragStart, handleDragEnd } =
    useDragAndDrop(availablePlayers, selectedPlayers, setSelectedPlayers);

  // Render a player for drag and drop UI
  const renderPlayer = (player: Player) => (
    <PlayerCard
      player={player}
      onRemove={
        selectedPlayers.includes(player)
          ? () => handleRemovePlayer(player.id)
          : undefined
      }
      showRemoveButton={selectedPlayers.includes(player)}
    />
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPlayers.length !== 2) {
      return; // Need exactly 2 players
    }

    await onSubmit({
      first_player_id: selectedPlayers[0].id,
      second_player_id: selectedPlayers[1].id,
      name:
        name.trim() ||
        `${selectedPlayers[0].nickname} & ${selectedPlayers[1].nickname}`,
      couple_id: editingCouple?.id
    });

    if (resetForm && !editingCouple) {
      resetFormState();
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {/* Limit warning */}
      {isCouplesLimitReached && (
        <Alert variant='destructive' className='mb-4'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            {t('couplesLimitReached', { number: maxCouples })}
          </AlertDescription>
        </Alert>
      )}

      {/* Name field */}
      <div className='space-y-2'>
        <Label htmlFor='couple-name'>{t('coupleName')}</Label>
        <Input
          id='couple-name'
          placeholder={t('enterCoupleName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
        <p className='text-xs text-muted-foreground'>{t('coupleNameHint')}</p>
      </div>

      {/* Player selection */}
      <div className='space-y-2 pt-4'>
        {/* Toggle selection method button */}
        <div className='flex items-center justify-between'>
          <Label>{t('selectPlayers')}</Label>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => setShowSelectMethod(!showSelectMethod)}
            className='text-xs'
          >
            {showSelectMethod ? t('useDragAndDrop') : t('useDropdown')}
          </Button>
        </div>

        <p className='mb-2 text-xs text-muted-foreground'>
          {showSelectMethod ? t('selectTwoPlayers') : t('dragTwoPlayers')}
        </p>

        {/* Selection method based on user preference */}
        {showSelectMethod ? (
          <DropdownSelection
            availablePlayers={availablePlayers}
            selectedPlayers={selectedPlayers}
            handleSelectPlayer={handleSelectPlayer}
            handleRemovePlayer={handleRemovePlayer}
            isLoading={isLoading}
          />
        ) : (
          <DragAndDropSelection
            availablePlayers={availablePlayers}
            selectedPlayers={selectedPlayers}
            sensors={sensors}
            activePlayer={activePlayer}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
            filteredAvailablePlayers={filteredAvailablePlayers}
            renderPlayer={renderPlayer}
          />
        )}

        {/* Help text */}
        <div className='mt-4 flex items-start gap-2 rounded-md bg-muted p-3'>
          <Info className='mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground' />
          <p className='text-xs text-muted-foreground'>{t('coupleFormHelp')}</p>
        </div>
      </div>

      {/* Form actions */}
      <div className='flex justify-end gap-2 pt-4'>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={isLoading}
        >
          {t('cancel')}
        </Button>
        <Button
          type='submit'
          disabled={
            selectedPlayers.length !== 2 || isLoading || isCouplesLimitReached
          }
        >
          {isLoading
            ? editingCouple
              ? t('updating')
              : t('creating')
            : editingCouple
              ? t('update')
              : t('create')}
        </Button>
      </div>
    </form>
  );
};
