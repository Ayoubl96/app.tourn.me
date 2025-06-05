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
import { useTransition, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import * as z from 'zod';
import { verifyRegistration, resendVerificationCode } from '@/api/auth';
import { RegistrationVerifyResponse } from '@/api/auth/types';
import { Clock, Mail, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailVerificationProps {
  email: string;
  expirationTime: number;
  onSuccess: (company: RegistrationVerifyResponse) => void;
  onError: (error: string) => void;
  onBack: () => void;
}

export default function EmailVerification({
  email,
  expirationTime,
  onSuccess,
  onError,
  onBack
}: EmailVerificationProps) {
  const t = useTranslations();
  const [loading, startTransition] = useTransition();
  const [resendLoading, setResendLoading] = useTransition();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);

  const formSchema = z.object({
    code: z.string().length(6, { message: t('Registration.codeLength') })
  });

  type VerificationFormValue = z.infer<typeof formSchema>;

  const form = useForm<VerificationFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: ''
    }
  });

  // Timer effect
  useEffect(() => {
    const updateTimer = () => {
      const remaining = Math.max(0, expirationTime - Date.now());
      setTimeRemaining(remaining);
      setCanResend(remaining === 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expirationTime]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data: VerificationFormValue) => {
    startTransition(async () => {
      try {
        const response = await verifyRegistration({
          email,
          code: data.code
        });

        toast.success(t('Registration.registrationComplete'));
        onSuccess(response);
      } catch (error: any) {
        console.error('Email verification failed:', error);
        const errorMessage = getErrorMessage(error.message);

        // Handle attempts remaining
        if (error.message.includes('attempts remaining')) {
          const match = error.message.match(/(\d+) attempts remaining/);
          if (match) {
            setAttemptsRemaining(parseInt(match[1]));
          }
        } else if (error.message.includes('Too many failed attempts')) {
          setAttemptsRemaining(0);
        }

        form.setError('code', { message: errorMessage });
        onError(errorMessage);
      }
    });
  };

  const handleResend = async () => {
    setResendLoading(async () => {
      try {
        const response = await resendVerificationCode({ email });

        // Reset form and attempts
        form.reset();
        setAttemptsRemaining(3);

        // Update expiration time
        const newExpirationTime =
          Date.now() + response.expires_in_minutes * 60 * 1000;
        setTimeRemaining(newExpirationTime - Date.now());
        setCanResend(false);

        toast.success(t('Registration.newCodeSent'));
      } catch (error: any) {
        console.error('Resend verification failed:', error);
        const errorMessage = getErrorMessage(error.message);
        toast.error(errorMessage);
        onError(errorMessage);
      }
    });
  };

  const getErrorMessage = (error: string): string => {
    const errorMappings: Record<string, string> = {
      'Verification record not found': t('Registration.verificationNotFound'),
      'Verification code expired': t('Registration.codeExpired'),
      'Invalid verification code': t('Registration.invalidCode'),
      'Too many failed attempts': t('Registration.tooManyAttempts'),
      'Email already registered': t('Registration.emailAlreadyRegistered'),
      'No pending verification for this email': t(
        'Registration.noPendingVerification'
      ),
      'Failed to send verification email': t('Registration.failedToSendEmail')
    };

    return (
      errorMappings[error] || error || t('Registration.verificationFailed')
    );
  };

  return (
    <div className='w-full space-y-6'>
      {/* Header */}
      <div className='space-y-2 text-center'>
        <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
          <Mail className='h-6 w-6 text-primary' />
        </div>
        <h2 className='text-2xl font-semibold tracking-tight'>
          {t('Registration.checkYourEmail')}
        </h2>
        <p className='text-sm text-muted-foreground'>
          {t('Registration.verificationCodeSentTo')} <strong>{email}</strong>
        </p>
      </div>

      {/* Time remaining / Expired indicator */}
      <div
        className={cn(
          'flex items-center justify-center gap-2 rounded-lg p-3',
          timeRemaining > 0
            ? 'bg-blue-50 text-blue-700'
            : 'bg-red-50 text-red-700'
        )}
      >
        <Clock className='h-4 w-4' />
        <span className='text-sm font-medium'>
          {timeRemaining > 0
            ? `${t('Registration.expiresIn')} ${formatTime(timeRemaining)}`
            : t('Registration.codeExpired')}
        </span>
      </div>

      {/* Attempts remaining */}
      {attemptsRemaining < 3 && attemptsRemaining > 0 && (
        <div className='text-center text-sm text-amber-600'>
          {t('Registration.attemptsRemaining', { count: attemptsRemaining })}
        </div>
      )}

      {/* Verification form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='code'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Registration.verificationCodeLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    placeholder={t('Registration.verificationCodePlaceholder')}
                    disabled={loading || timeRemaining === 0}
                    className='text-center text-lg tracking-widest'
                    maxLength={6}
                    {...field}
                    onChange={(e) => {
                      // Only allow digits
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            disabled={loading || timeRemaining === 0 || attemptsRemaining === 0}
            className='w-full'
            type='submit'
          >
            {loading
              ? t('Registration.verifying')
              : t('Registration.verifyAndComplete')}
          </Button>
        </form>
      </Form>

      {/* Actions */}
      <div className='space-y-3'>
        {/* Resend button */}
        <div className='text-center'>
          <Button
            type='button'
            variant='ghost'
            disabled={!canResend || resendLoading}
            onClick={handleResend}
            className='text-sm'
          >
            <RefreshCw
              className={cn('mr-2 h-4 w-4', resendLoading && 'animate-spin')}
            />
            {resendLoading
              ? t('Registration.resending')
              : t('Registration.resendCode')}
          </Button>
        </div>

        {/* Back to form button */}
        <div className='text-center'>
          <Button
            type='button'
            variant='outline'
            onClick={onBack}
            className='text-sm'
          >
            {t('Registration.backToForm')}
          </Button>
        </div>
      </div>

      {/* Help text */}
      <div className='space-y-1 text-center text-xs text-muted-foreground'>
        <p>{t('Registration.didntReceiveCode')}</p>
        <p>{t('Registration.checkSpamFolder')}</p>
      </div>
    </div>
  );
}
