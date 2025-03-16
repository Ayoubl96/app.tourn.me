import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';
import { createPlayer } from '../api/tournamentApi';

interface CreatePlayerFormProps {
  onPlayerCreated: (playerId: number) => void;
  onCancel: () => void;
  t: any; // Translation function
}

// Component for creating a new player
export function CreatePlayerForm({
  onPlayerCreated,
  onCancel,
  t
}: CreatePlayerFormProps) {
  const callApi = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    gender: '1' // 1 = male, 2 = female
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const newPlayer = await createPlayer(
        callApi,
        formData.nickname,
        parseInt(formData.gender)
      );

      toast.success(t('playerCreated'));
      onPlayerCreated(newPlayer.id);
    } catch (error) {
      console.error('Error creating player:', error);
      toast.error(
        error instanceof Error ? error.message : t('failedToCreatePlayer')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='nickname'>{t('nickname')} *</Label>
        <Input
          id='nickname'
          name='nickname'
          value={formData.nickname}
          onChange={handleChange}
          required
          placeholder={t('enterNickname')}
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='gender'>{t('gender')}</Label>
        <Select
          name='gender'
          value={formData.gender}
          onValueChange={(value) => handleSelectChange('gender', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('selectGender')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='1'>{t('male')}</SelectItem>
            <SelectItem value='2'>{t('female')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='flex justify-end space-x-2 pt-4'>
        <Button type='button' variant='outline' onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? t('creating') : t('createPlayer')}
        </Button>
      </div>
    </form>
  );
}
