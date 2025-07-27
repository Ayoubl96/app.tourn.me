'use client';

import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel';
  disabled?: boolean;
  renderCustomEdit?: (
    value: string,
    onChange: (value: string) => void
  ) => ReactNode;
  className?: string;
}

export default function EditableField({
  label,
  value,
  onSave,
  placeholder,
  type = 'text',
  disabled = false,
  renderCustomEdit,
  className
}: EditableFieldProps) {
  const t = useTranslations('Profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      // Error is handled by parent component
      setEditValue(value); // Reset to original value
    } finally {
      setIsLoading(false);
    }
  };

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
              value
                ? 'text-gray-900 dark:text-gray-100'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {value || t('notSet')}
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
          {renderCustomEdit ? (
            renderCustomEdit(editValue, setEditValue)
          ) : (
            <Input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={placeholder}
              disabled={isLoading}
              className='border-blue-200 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-700 dark:focus:border-blue-400 dark:focus:ring-blue-400'
            />
          )}

          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              onClick={handleSave}
              disabled={isLoading}
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
