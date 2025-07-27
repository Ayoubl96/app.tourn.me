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
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import * as z from 'zod';
import { initiatePasswordReset } from '@/api/auth';
import { PasswordResetInitiateResponse } from '@/api/auth/types';
import { Mail } from 'lucide-react';

interface PasswordResetFormProps {
  onSuccess: (email: string, expirationTime: number) => void;
  onError: (error: string) => void;
}

export default function PasswordResetForm({
  onSuccess,
  onError
}: PasswordResetFormProps) {
  const t = useTranslations();
  const [loading, startTransition] = useTransition();

  const formSchema = z.object({
    email: z
      .string()
      .min(1, { message: t('PasswordReset.emailRequired') })
      .email({ message: t('PasswordReset.invalidEmail') })
  });

  type PasswordResetFormValue = z.infer<typeof formSchema>;

  const form = useForm<PasswordResetFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data: PasswordResetFormValue) => {
    startTransition(async () => {
      try {
        const response = await initiatePasswordReset({
          email: data.email
        });

        // Calculate expiration time
        const expirationTime =
          Date.now() + response.expires_in_minutes * 60 * 1000;

        toast.success(t('PasswordReset.resetCodeSentSuccess'));
        onSuccess(data.email, expirationTime);
      } catch (error: any) {
        console.error('Password reset initiation failed:', error);
        const errorMessage = getErrorMessage(error.message || error.toString());
        onError(errorMessage);
        toast.error(errorMessage);
      }
    });
  };

  const getErrorMessage = (error: string): string => {
    const errorMappings: Record<string, string> = {
      'Too many password reset requests. Please try again later.': t(
        'PasswordReset.rateLimited'
      ),
      'Email service is not configured. Please contact support.': t(
        'PasswordReset.serviceUnavailable'
      ),
      'Invalid email address': t('PasswordReset.invalidEmail'),
      'Network error': t('PasswordReset.networkError')
    };

    return errorMappings[error] || error || t('PasswordReset.unknownError');
  };

  return (
    <div className='w-full space-y-6'>
      {/* Header */}
      <div className='space-y-2 text-center'>
        <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
          <Mail className='h-6 w-6 text-primary' />
        </div>
        <h2 className='text-2xl font-semibold tracking-tight'>
          {t('PasswordReset.resetPasswordTitle')}
        </h2>
        <p className='text-sm text-muted-foreground'>
          {t('PasswordReset.resetPasswordSubtitle')}
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('PasswordReset.emailLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder={t('PasswordReset.emailPlaceholder')}
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={loading} className='w-full' type='submit'>
            {loading
              ? t('PasswordReset.sendingResetLink')
              : t('PasswordReset.sendResetLink')}
          </Button>
        </form>
      </Form>

      {/* Helper text */}
      <div className='text-center text-sm text-muted-foreground'>
        <p>{t('PasswordReset.emailNotFound')}</p>
      </div>
    </div>
  );
}
