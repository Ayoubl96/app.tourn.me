'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { PasswordResetStep } from '@/api/auth/types';
import PasswordResetForm from './password-reset-form';
import PasswordResetVerification from './password-reset-verification';
import PasswordResetComplete from './password-reset-complete';
import AuthSideImage from './auth-side-image';
import AuthHeader from './auth-header';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/navigation';

export default function PasswordResetView() {
  const t = useTranslations();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<PasswordResetStep>(
    PasswordResetStep.INITIATE
  );
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [expirationTime, setExpirationTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInitiateSuccess = useCallback(
    (userEmail: string, expiration: number) => {
      setEmail(userEmail);
      setExpirationTime(expiration);
      setCurrentStep(PasswordResetStep.VERIFY_CODE);
      setErrorMessage('');
    },
    []
  );

  const handleInitiateError = useCallback((error: string) => {
    setErrorMessage(error);
  }, []);

  const handleVerificationSuccess = useCallback((token: string) => {
    setResetToken(token);
    setCurrentStep(PasswordResetStep.SET_PASSWORD);
    setErrorMessage('');
  }, []);

  const handleVerificationError = useCallback((error: string) => {
    setErrorMessage(error);
  }, []);

  const handleExpirationUpdate = useCallback((newExpirationTime: number) => {
    setExpirationTime(newExpirationTime);
  }, []);

  const handleVerificationBack = useCallback(() => {
    setCurrentStep(PasswordResetStep.INITIATE);
    setErrorMessage('');
  }, []);

  const handleResetComplete = useCallback(() => {
    setCurrentStep(PasswordResetStep.COMPLETED);
    setErrorMessage('');

    // Clear all sensitive state
    setEmail('');
    setResetToken('');
    setExpirationTime(0);

    // Redirect to login page after a short delay
    setTimeout(() => {
      router.push('/signin?message=password-reset-complete');
    }, 3000);
  }, [router]);

  const handleResetError = useCallback((error: string) => {
    setErrorMessage(error);
  }, []);

  const handleTokenExpired = useCallback(() => {
    setCurrentStep(PasswordResetStep.INITIATE);
    setErrorMessage(t('PasswordReset.tokenExpired'));

    // Clear state
    setEmail('');
    setResetToken('');
    setExpirationTime(0);
  }, [t]);

  const handleStartOver = useCallback(() => {
    setCurrentStep(PasswordResetStep.INITIATE);
    setEmail('');
    setResetToken('');
    setExpirationTime(0);
    setErrorMessage('');
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case PasswordResetStep.INITIATE:
        return (
          <PasswordResetForm
            onSuccess={handleInitiateSuccess}
            onError={handleInitiateError}
          />
        );

      case PasswordResetStep.VERIFY_CODE:
        return (
          <PasswordResetVerification
            email={email}
            expirationTime={expirationTime}
            onSuccess={handleVerificationSuccess}
            onError={handleVerificationError}
            onBack={handleVerificationBack}
            onExpirationUpdate={handleExpirationUpdate}
          />
        );

      case PasswordResetStep.SET_PASSWORD:
        return (
          <PasswordResetComplete
            resetToken={resetToken}
            onSuccess={handleResetComplete}
            onError={handleResetError}
            onTokenExpired={handleTokenExpired}
          />
        );

      case PasswordResetStep.COMPLETED:
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

      default:
        return null;
    }
  };

  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <AuthHeader variant='forgot-password' />
      <AuthSideImage />
      <div className='flex h-full items-center p-4 lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]'>
          {/* Error Message Display */}
          {errorMessage && (
            <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-red-700'>
              <p className='text-sm'>{errorMessage}</p>
              {currentStep === PasswordResetStep.INITIATE && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setErrorMessage('')}
                  className='mt-2 text-red-700 hover:text-red-800'
                >
                  {t('Common.dismiss')}
                </Button>
              )}
            </div>
          )}

          {/* Current Step Component */}
          {renderStep()}

          {/* Back to Sign In Link - only show on initiate step */}
          {currentStep === PasswordResetStep.INITIATE && (
            <div className='text-center'>
              <Link
                href='/signin'
                className='text-sm text-primary hover:underline'
              >
                {t('PasswordReset.backToSignIn')}
              </Link>
            </div>
          )}

          {/* Start Over Link - show on error states */}
          {(currentStep === PasswordResetStep.SET_PASSWORD ||
            (errorMessage && currentStep !== PasswordResetStep.INITIATE)) && (
            <div className='text-center'>
              <Button
                variant='ghost'
                onClick={handleStartOver}
                className='text-sm text-muted-foreground hover:text-primary'
              >
                {t('PasswordReset.startOver')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
