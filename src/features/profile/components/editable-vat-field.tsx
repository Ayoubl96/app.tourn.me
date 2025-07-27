'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import FlexibleCountrySelector from '@/features/auth/components/flexible-country-selector';
import { combineVatNumber } from '../utils/data-parsing';
import { COUNTRIES_DATA } from '@/features/auth/utils/validation';

interface EditableVatFieldProps {
  label: string;
  vatCountryCode: string;
  vatNumber: string;
  onSave: (fullVatNumber: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export default function EditableVatField({
  label,
  vatCountryCode,
  vatNumber,
  onSave,
  disabled = false,
  className
}: EditableVatFieldProps) {
  const t = useTranslations('Profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editVatCountryCode, setEditVatCountryCode] = useState(vatCountryCode);
  const [editVatNumber, setEditVatNumber] = useState(vatNumber);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    setEditVatCountryCode(vatCountryCode);
    setEditVatNumber(vatNumber);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditVatCountryCode(vatCountryCode);
    setEditVatNumber(vatNumber);
    setIsEditing(false);
  };

  const handleSave = async () => {
    const currentFullNumber = combineVatNumber(vatNumber, vatCountryCode);
    const newFullNumber = combineVatNumber(editVatNumber, editVatCountryCode);

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
      setEditVatCountryCode(vatCountryCode);
      setEditVatNumber(vatNumber);
    } finally {
      setIsLoading(false);
    }
  };

  const displayValue = vatNumber
    ? combineVatNumber(vatNumber, vatCountryCode)
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
              vatNumber
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
              value={editVatCountryCode}
              onValueChange={setEditVatCountryCode}
              type='vat'
              disabled={isLoading}
              placeholder={t('selectVatCountry')}
            />

            <div className='relative'>
              {(() => {
                const country = COUNTRIES_DATA.find(
                  (c) => c.code === editVatCountryCode
                );
                const vatPrefix = country?.vatPrefix;

                return vatPrefix ? (
                  <span className='absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded bg-muted px-1 text-sm text-muted-foreground'>
                    {vatPrefix}
                  </span>
                ) : null;
              })()}

              <Input
                type='text'
                value={editVatNumber}
                onChange={(e) => {
                  // Allow alphanumeric characters and some formatting
                  const value = e.target.value
                    .replace(/[^a-zA-Z0-9\-\s]/g, '')
                    .toUpperCase();
                  setEditVatNumber(value);
                }}
                placeholder={t('vatPlaceholder')}
                disabled={isLoading}
                className={cn(
                  'border-blue-200 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-700 dark:focus:border-blue-400 dark:focus:ring-blue-400',
                  (() => {
                    const country = COUNTRIES_DATA.find(
                      (c) => c.code === editVatCountryCode
                    );
                    return country?.vatPrefix ? 'pl-16' : '';
                  })()
                )}
              />
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              onClick={handleSave}
              disabled={isLoading || !editVatCountryCode || !editVatNumber}
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
