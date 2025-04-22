import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface CreatePlayerFormProps {
  onPlayerCreated: (formData: {
    nickname: string;
    gender: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CreatePlayerForm: React.FC<CreatePlayerFormProps> = ({
  onPlayerCreated,
  onCancel,
  isLoading = false
}) => {
  const t = useTranslations('Dashboard');
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
    if (!formData.nickname.trim()) {
      return; // Don't submit if nickname is empty
    }
    await onPlayerCreated(formData); // Pass the actual form data to parent
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
};
