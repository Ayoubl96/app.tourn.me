'use client';

import { useTranslations } from 'next-intl';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PasswordValidation, PasswordStrength } from '@/api/auth/types';
import {
  validatePassword,
  getPasswordStrengthLabel,
  getPasswordStrengthColor
} from '../utils/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export default function PasswordStrengthIndicator({
  password,
  className
}: PasswordStrengthIndicatorProps) {
  const t = useTranslations();
  const validation = validatePassword(password);

  if (!password) return null;

  const strengthLabel = getPasswordStrengthLabel(validation.strength);
  const strengthColor = getPasswordStrengthColor(validation.strength);

  const requirements = [
    {
      label: t('Registration.passwordMinLength'),
      met: validation.hasMinLength,
      key: 'minLength'
    },
    {
      label: t('Registration.passwordHasNumber'),
      met: validation.hasNumber,
      key: 'hasNumber'
    },
    {
      label: t('Registration.passwordHasLowerCase'),
      met: validation.hasLowerCase,
      key: 'hasLowerCase'
    },
    {
      label: t('Registration.passwordHasUpperCase'),
      met: validation.hasUpperCase,
      key: 'hasUpperCase'
    },
    {
      label: t('Registration.passwordHasSpecialChar'),
      met: validation.hasSpecialChar,
      key: 'hasSpecialChar'
    }
  ];

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength Indicator */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-muted-foreground'>
            {t('Registration.passwordStrength')}
          </span>
          <span
            className={cn(
              'font-medium',
              validation.strength >= PasswordStrength.MEDIUM
                ? 'text-green-600'
                : 'text-orange-600'
            )}
          >
            {t(
              `Registration.passwordStrength${strengthLabel.replace(' ', '')}`
            )}
          </span>
        </div>

        {/* Progress Bar */}
        <div className='flex space-x-1'>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-2 flex-1 rounded-full transition-all duration-300',
                index < validation.score ? strengthColor : 'bg-gray-200'
              )}
            />
          ))}
        </div>
      </div>

      {/* Requirements List */}
      <div className='space-y-2'>
        <p className='text-sm font-medium text-muted-foreground'>
          {t('Registration.passwordRequirements')}
        </p>
        <ul className='space-y-1'>
          {requirements.map((requirement) => (
            <li
              key={requirement.key}
              className='flex items-center gap-2 text-sm'
            >
              {requirement.met ? (
                <Check className='h-4 w-4 text-green-500' />
              ) : (
                <X className='h-4 w-4 text-red-500' />
              )}
              <span
                className={cn(
                  requirement.met ? 'text-green-700' : 'text-red-700'
                )}
              >
                {requirement.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
