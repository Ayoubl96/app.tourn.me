'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import * as z from 'zod';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import {
  CompanyPasswordChangeRequest,
  CompanyPasswordChangeResponse,
  PasswordStrength
} from '@/api/auth/types';
import PasswordStrengthIndicator from '@/features/auth/components/password-strength-indicator';
import { validatePassword } from '@/features/auth/utils/validation';
import { useCompanyProfile } from '../hooks/useCompanyProfile';

interface CompanyPasswordChangeFormProps {
  onSuccess?: (data: CompanyPasswordChangeResponse) => void;
  onError?: (error: string) => void;
}

type CompanyPasswordChangeFormValue = z.infer<typeof formSchema>;

const formSchema = z
  .object({
    current_password: z
      .string()
      .min(1, { message: 'Current password is required' }),
    new_password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .refine(
        (password) => {
          const validation = validatePassword(password);
          return (
            validation.hasNumber &&
            validation.hasLetter &&
            validation.hasUpperCase &&
            validation.hasLowerCase &&
            validation.hasSpecialChar
          );
        },
        {
          message:
            'Password must contain uppercase, lowercase, number and special character'
        }
      ),
    confirm_password: z.string()
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords must match',
    path: ['confirm_password']
  });

export default function CompanyPasswordChangeForm({
  onSuccess,
  onError
}: CompanyPasswordChangeFormProps) {
  const t = useTranslations('Profile');
  const [loading, startTransition] = useTransition();
  const [currentNewPassword, setCurrentNewPassword] = useState('');
  const { changePassword } = useCompanyProfile();

  const defaultValues: CompanyPasswordChangeFormValue = {
    current_password: '',
    new_password: '',
    confirm_password: ''
  };

  const form = useForm<CompanyPasswordChangeFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: CompanyPasswordChangeFormValue) => {
    startTransition(async () => {
      try {
        // Validate password strength before submission
        const passwordValidation = validatePassword(data.new_password);
        if (passwordValidation.strength < PasswordStrength.MEDIUM) {
          const errorMessage = t('passwordTooWeak');
          if (onError) {
            onError(errorMessage);
          }
          toast.error(errorMessage);
          return;
        }

        const response = await changePassword({
          current_password: data.current_password,
          new_password: data.new_password,
          confirm_password: data.confirm_password
        });

        toast.success(t('passwordChangedSuccess'));
        form.reset();
        setCurrentNewPassword('');

        if (onSuccess) {
          onSuccess(response);
        }
      } catch (error: any) {
        console.error('Password change failed:', error);
        let errorMessage = t('failedToChangePassword');

        // Handle specific error messages
        if (error.message?.includes('Current password is incorrect')) {
          errorMessage = t('currentPasswordIncorrect');
        } else if (error.message?.includes('Password confirmation mismatch')) {
          errorMessage = t('passwordConfirmationMismatch');
        } else if (error.message?.includes('Password too short')) {
          errorMessage = t('passwordTooShort');
        } else if (error.message) {
          errorMessage = error.message;
        }

        if (onError) {
          onError(errorMessage);
        }
        toast.error(errorMessage);
      }
    });
  };

  return (
    <Card className='border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-900'>
      <CardHeader className='pb-4'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900'>
            <Shield className='h-5 w-5 text-red-600 dark:text-red-400' />
          </div>
          <div>
            <CardTitle className='text-xl text-gray-900 dark:text-gray-100'>
              {t('changePassword')}
            </CardTitle>
            <p className='text-sm text-muted-foreground'>
              {t('changePasswordDescription')}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Security Notice */}
        <div className='mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950'>
          <div className='flex items-start gap-3'>
            <AlertTriangle className='mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400' />
            <div>
              <h4 className='text-sm font-semibold text-amber-800 dark:text-amber-200'>
                {t('securityReminder')}
              </h4>
              <p className='mt-1 text-sm text-amber-700 dark:text-amber-300'>
                {t('securityReminderText')}
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Current Password Section */}
            <div>
              <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
                <Lock className='h-5 w-5 text-gray-600 dark:text-gray-400' />
                {t('currentPassword')}
              </h3>

              <FormField
                control={form.control}
                name='current_password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700 dark:text-gray-300'>
                      {t('currentPasswordLabel')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder={t('currentPasswordPlaceholder')}
                        disabled={loading}
                        className='border-gray-200 focus:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-gray-500'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* New Password Section */}
            <div>
              <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
                <Shield className='h-5 w-5 text-gray-600 dark:text-gray-400' />
                {t('newPassword')}
              </h3>

              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='new_password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-700 dark:text-gray-300'>
                        {t('newPasswordLabel')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder={t('newPasswordPlaceholder')}
                          disabled={loading}
                          className='border-blue-200 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-700 dark:bg-gray-800 dark:focus:border-blue-400 dark:focus:ring-blue-400'
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setCurrentNewPassword(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='confirm_password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-700 dark:text-gray-300'>
                        {t('confirmNewPassword')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder={t('confirmPasswordPlaceholder')}
                          disabled={loading}
                          className='border-blue-200 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-700 dark:bg-gray-800 dark:focus:border-blue-400 dark:focus:ring-blue-400'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Strength Indicator */}
                {currentNewPassword && (
                  <PasswordStrengthIndicator
                    password={currentNewPassword}
                    className='mt-4'
                  />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex items-center gap-3 border-t border-gray-200 pt-6 dark:border-gray-700'>
              <Button
                type='submit'
                disabled={loading}
                className='min-w-32'
                size='lg'
              >
                {loading ? t('changingPassword') : t('changePassword')}
              </Button>

              <Button
                type='button'
                variant='outline'
                onClick={() => form.reset()}
                disabled={loading}
                size='lg'
                className='border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800'
              >
                {t('clearForm')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
