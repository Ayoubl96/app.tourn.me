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
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import * as z from 'zod';
import { completePasswordReset } from '@/api/auth';
import { PasswordResetCompleteResponse } from '@/api/auth/types';
import { Lock, Eye, EyeOff } from 'lucide-react';
import PasswordStrengthIndicator from './password-strength-indicator';
import { validatePassword } from '@/features/auth/utils/validation';
import { PasswordStrength } from '@/api/auth/types';

interface PasswordResetCompleteProps {
  resetToken: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  onTokenExpired: () => void;
}

export default function PasswordResetComplete({
  resetToken,
  onSuccess,
  onError,
  onTokenExpired
}: PasswordResetCompleteProps) {
  const t = useTranslations();
  const [loading, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formSchema = z
    .object({
      newPassword: z
        .string()
        .min(8, { message: t('Registration.passwordMinLength') })
        .refine(
          (password) => {
            const validation = validatePassword(password);
            return validation.strength >= PasswordStrength.MEDIUM;
          },
          { message: t('PasswordReset.weakPassword') }
        ),
      confirmPassword: z
        .string()
        .min(1, { message: t('PasswordReset.confirmPasswordRequired') })
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('PasswordReset.passwordsDoNotMatch'),
      path: ['confirmPassword']
    });

  type PasswordResetCompleteFormValue = z.infer<typeof formSchema>;

  const form = useForm<PasswordResetCompleteFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: ''
    }
  });

  const watchedPassword = form.watch('newPassword');
  const passwordValidation = validatePassword(watchedPassword || '');

  const onSubmit = async (data: PasswordResetCompleteFormValue) => {
    startTransition(async () => {
      try {
        await completePasswordReset({
          token: resetToken,
          new_password: data.newPassword
        });

        toast.success(t('PasswordReset.passwordResetComplete'));
        onSuccess();
      } catch (error: any) {
        console.error('Password reset completion failed:', error);
        const errorMessage = getErrorMessage(error.message);

        // Handle token expiry
        if (
          error.message.includes('Invalid or expired reset token') ||
          error.message.includes('expired')
        ) {
          onTokenExpired();
        } else {
          onError(errorMessage);
          toast.error(errorMessage);
        }
      }
    });
  };

  const getErrorMessage = (error: string): string => {
    const errorMappings: Record<string, string> = {
      'Invalid or expired reset token': t('PasswordReset.invalidToken'),
      'Password must contain at least one digit': t(
        'PasswordReset.weakPassword'
      ),
      'Password must contain at least one letter': t(
        'PasswordReset.weakPassword'
      ),
      'Network error': t('PasswordReset.networkError')
    };

    return errorMappings[error] || error || t('PasswordReset.unknownError');
  };

  return (
    <div className='w-full space-y-6'>
      {/* Header */}
      <div className='space-y-2 text-center'>
        <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
          <Lock className='h-6 w-6 text-primary' />
        </div>
        <h2 className='text-2xl font-semibold tracking-tight'>
          {t('PasswordReset.createNewPassword')}
        </h2>
        <p className='text-sm text-muted-foreground'>
          {t('PasswordReset.createNewPasswordSubtitle')}
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='newPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('PasswordReset.newPasswordLabel')}</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('PasswordReset.newPasswordPlaceholder')}
                      disabled={loading}
                      {...field}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className='h-4 w-4' />
                      ) : (
                        <Eye className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
                {field.value && (
                  <PasswordStrengthIndicator password={field.value} />
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('PasswordReset.confirmPasswordLabel')}</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t(
                        'PasswordReset.confirmPasswordPlaceholder'
                      )}
                      disabled={loading}
                      {...field}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className='h-4 w-4' />
                      ) : (
                        <Eye className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={loading} className='w-full' type='submit'>
            {loading
              ? t('PasswordReset.updatingPassword')
              : t('PasswordReset.updatePassword')}
          </Button>
        </form>
      </Form>
    </div>
  );
}
