'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { PasswordResetStep } from '@/api/auth/types';
import { checkPasswordResetTokenStatus } from '@/api/auth';
import PasswordResetComplete from './password-reset-complete';
import AuthSideImage from './auth-side-image';
import AuthHeader from './auth-header';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/navigation';

interface ResetPasswordTokenViewProps {
  token?: string;
}

export default function ResetPasswordTokenView({
  token
}: ResetPasswordTokenViewProps) {
  const t = useTranslations();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [currentStep, setCurrentStep] = useState<PasswordResetStep>(
    PasswordResetStep.INITIATE
  );
  const [errorMessage, setErrorMessage] = useState('');

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setErrorMessage(t('PasswordReset.tokenInvalid'));
        setLoading(false);
        return;
      }

      try {
        const response = await checkPasswordResetTokenStatus(token);

        if (response.valid) {
          setTokenValid(true);
          setCurrentStep(PasswordResetStep.SET_PASSWORD);
        } else {
          setTokenValid(false);
          setErrorMessage(response.message || t('PasswordReset.tokenInvalid'));
        }
      } catch (error: any) {
        console.error('Token validation failed:', error);
        setTokenValid(false);

        // Handle different error types
        if (error.message.includes('expired')) {
          setErrorMessage(t('PasswordReset.tokenExpired'));
        } else {
          setErrorMessage(t('PasswordReset.tokenInvalid'));
        }
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token, t]);

  const handleResetComplete = useCallback(() => {
    setCurrentStep(PasswordResetStep.COMPLETED);
    setErrorMessage('');

    // Redirect to login page after a short delay
    setTimeout(() => {
      router.push('/signin?message=password-reset-complete');
    }, 3000);
  }, [router]);

  const handleResetError = useCallback((error: string) => {
    setErrorMessage(error);
  }, []);

  const handleTokenExpired = useCallback(() => {
    setTokenValid(false);
    setErrorMessage(t('PasswordReset.tokenExpired'));
  }, [t]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className='w-full space-y-6 text-center'>
          <div className='space-y-2'>
            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100'>
              <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
            </div>
            <h2 className='text-2xl font-semibold tracking-tight'>
              {t('Common.loading')}...
            </h2>
            <p className='text-sm text-muted-foreground'>
              {t('PasswordReset.verifying')}...
            </p>
          </div>
        </div>
      );
    }

    if (!tokenValid || errorMessage) {
      return (
        <div className='w-full space-y-6 text-center'>
          <div className='space-y-2'>
            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
              <AlertTriangle className='h-8 w-8 text-red-600' />
            </div>
            <h2 className='text-2xl font-semibold tracking-tight text-red-900'>
              {t('PasswordReset.invalidToken')}
            </h2>
            <p className='text-sm text-muted-foreground'>
              {errorMessage || t('PasswordReset.tokenInvalid')}
            </p>
          </div>

          <div className='space-y-3'>
            <Button asChild className='w-full'>
              <Link href='/forgot-password'>
                {t('PasswordReset.startOver')}
              </Link>
            </Button>

            <Button asChild variant='outline' className='w-full'>
              <Link href='/signin'>{t('PasswordReset.backToSignIn')}</Link>
            </Button>
          </div>

          <div className='text-center text-sm text-muted-foreground'>
            <p>{t('PasswordReset.supportMessage')}</p>
          </div>
        </div>
      );
    }

    if (currentStep === PasswordResetStep.SET_PASSWORD) {
      return (
        <PasswordResetComplete
          resetToken={token!}
          onSuccess={handleResetComplete}
          onError={handleResetError}
          onTokenExpired={handleTokenExpired}
        />
      );
    }

    if (currentStep === PasswordResetStep.COMPLETED) {
      return (
        <div className='w-full space-y-6 text-center'>
          <div className='space-y-2'>
            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
            <h2 className='text-2xl font-semibold tracking-tight text-green-900'>
              {t('PasswordReset.passwordUpdatedTitle')}
            </h2>
            <p className='text-sm text-muted-foreground'>
              {t('PasswordReset.passwordUpdatedMessage')}
            </p>
          </div>

          <Button asChild className='w-full'>
            <Link href='/signin'>{t('PasswordReset.goToSignIn')}</Link>
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <AuthHeader variant='forgot-password' />
      <AuthSideImage />
      <div className='flex h-full items-center p-4 lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]'>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
