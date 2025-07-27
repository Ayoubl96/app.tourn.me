'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import FlexibleCountrySelector from '@/features/auth/components/flexible-country-selector';
import { combinePhoneNumber } from '../utils/data-parsing';

interface EditablePhoneFieldProps {
  label: string;
  countryCode: string;
  phoneNumber: string;
  onSave: (fullPhoneNumber: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export default function EditablePhoneField({
  label,
  countryCode,
  phoneNumber,
  onSave,
  disabled = false,
  className
}: EditablePhoneFieldProps) {
  const t = useTranslations('Profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editCountryCode, setEditCountryCode] = useState(countryCode);
  const [editPhoneNumber, setEditPhoneNumber] = useState(phoneNumber);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    setEditCountryCode(countryCode);
    setEditPhoneNumber(phoneNumber);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditCountryCode(countryCode);
    setEditPhoneNumber(phoneNumber);
    setIsEditing(false);
  };

  const handleSave = async () => {
    const currentFullNumber = combinePhoneNumber(phoneNumber, countryCode);
    const newFullNumber = combinePhoneNumber(editPhoneNumber, editCountryCode);

    if (newFullNumber === currentFullNumber) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onSave(newFullNumber);
      setIsEditing(false);
    } catch (error) {
      // Error is handled by parent component
      setEditCountryCode(countryCode);
      setEditPhoneNumber(phoneNumber);
    } finally {
      setIsLoading(false);
    }
  };

  const displayValue = phoneNumber
    ? combinePhoneNumber(phoneNumber, countryCode)
    : t('notSet');

  return (
    <div className={cn('space-y-2', className)}>
      <Label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
        {label}
      </Label>

      {!isEditing ? (
        // Display Mode
        <div className='flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-800/50'>
          <span
            className={cn(
              'text-sm',
              phoneNumber
                ? 'text-gray-900 dark:text-gray-100'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {displayValue}
          </span>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleEdit}
            disabled={disabled}
            className='h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700'
          >
            <Edit2 className='h-4 w-4' />
          </Button>
        </div>
      ) : (
        // Edit Mode
        <div className='space-y-3'>
          <div className='grid grid-cols-2 gap-2'>
            <FlexibleCountrySelector
              value={editCountryCode}
              onValueChange={setEditCountryCode}
              type='phone'
              disabled={isLoading}
              placeholder={t('selectCountry')}
            />

            <Input
              type='tel'
              value={editPhoneNumber}
              onChange={(e) => {
                // Allow only digits and some formatting characters
                const value = e.target.value.replace(/[^\d\s\-\(\)]/g, '');
                setEditPhoneNumber(value);
              }}
              placeholder={t('phonePlaceholder')}
              disabled={isLoading}
              className='border-blue-200 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-700 dark:focus:border-blue-400 dark:focus:ring-blue-400'
            />
          </div>

          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              onClick={handleSave}
              disabled={isLoading || !editCountryCode || !editPhoneNumber}
              className='h-8 px-3'
            >
              <Check className='mr-1 h-4 w-4' />
              {isLoading ? t('saving') : t('save')}
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={handleCancel}
              disabled={isLoading}
              className='h-8 px-3'
            >
              <X className='mr-1 h-4 w-4' />
              {t('cancel')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
