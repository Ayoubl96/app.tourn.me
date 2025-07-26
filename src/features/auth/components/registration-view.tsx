'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@/lib/navigation';
import { CheckCircle } from 'lucide-react';
import { RegistrationStep } from '@/api/auth/types';
import RegistrationForm from './registration-form';
import EmailVerification from './email-verification';
import AuthSideImage from './auth-side-image';
import AuthHeader from './auth-header';

export default function RegistrationViewPage() {
  const t = useTranslations();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(
    RegistrationStep.FORM
  );
  const [email, setEmail] = useState('');
  const [expirationTime, setExpirationTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFormSuccess = (userEmail: string, expiration: number) => {
    setEmail(userEmail);
    setExpirationTime(expiration);
    setCurrentStep(RegistrationStep.EMAIL_SENT);
    setErrorMessage('');
  };

  const handleFormError = (error: string) => {
    setErrorMessage(error);
  };

  const handleVerificationSuccess = (company: any) => {
    setCurrentStep(RegistrationStep.COMPLETED);
    setErrorMessage('');

    // Redirect to login page after a short delay
    setTimeout(() => {
      router.push('/signin?message=registration-complete');
    }, 3000);
  };

  const handleVerificationError = (error: string) => {
    setErrorMessage(error);

    // If the error indicates we need to restart, go back to form
    if (
      error.includes('start registration again') ||
      error.includes('Verification record not found')
    ) {
      setTimeout(() => {
        setCurrentStep(RegistrationStep.FORM);
      }, 2000);
    }
  };

  const handleBackToForm = () => {
    setCurrentStep(RegistrationStep.FORM);
    setErrorMessage('');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case RegistrationStep.FORM:
        return (
          <RegistrationForm
            onSuccess={handleFormSuccess}
            onError={handleFormError}
          />
        );

      case RegistrationStep.EMAIL_SENT:
        return (
          <EmailVerification
            email={email}
            expirationTime={expirationTime}
            onSuccess={handleVerificationSuccess}
            onError={handleVerificationError}
            onBack={handleBackToForm}
          />
        );

      case RegistrationStep.COMPLETED:
        return (
          <div className='space-y-6 text-center'>
            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
            <div className='space-y-2'>
              <h2 className='text-2xl font-semibold tracking-tight text-green-800'>
                {t('Registration.registrationComplete')}
              </h2>
              <p className='text-sm text-muted-foreground'>
                {t('Registration.redirectingToLogin')}
              </p>
            </div>
            <div className='animate-pulse text-sm text-muted-foreground'>
              {t('Registration.pleaseWait')}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case RegistrationStep.FORM:
        return t('Registration.createAccount');
      case RegistrationStep.EMAIL_SENT:
        return t('Registration.verifyYourEmail');
      case RegistrationStep.COMPLETED:
        return t('Registration.welcomeAboard');
      default:
        return t('Registration.createAccount');
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case RegistrationStep.FORM:
        return t('Registration.fillOutForm');
      case RegistrationStep.EMAIL_SENT:
        return t('Registration.enterVerificationCode');
      case RegistrationStep.COMPLETED:
        return t('Registration.successfullyRegistered');
      default:
        return t('Registration.fillOutForm');
    }
  };

  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      {/* Header with theme toggle and navigation */}
      <AuthHeader variant='register' />

      {/* Left side - emotional images */}
      <AuthSideImage />

      {/* Right side - registration form */}
      <div className='flex h-full items-center p-4 lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]'>
          {/* Progress indicator */}
          <div className='mb-4 flex justify-center space-x-2'>
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                currentStep === RegistrationStep.FORM
                  ? 'bg-primary'
                  : 'bg-muted'
              )}
            />
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                currentStep === RegistrationStep.EMAIL_SENT
                  ? 'bg-primary'
                  : 'bg-muted'
              )}
            />
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                currentStep === RegistrationStep.COMPLETED
                  ? 'bg-primary'
                  : 'bg-muted'
              )}
            />
          </div>

          {/* Step title and description */}
          <div className='flex flex-col space-y-2 text-center'>
            <h1 className='text-2xl font-semibold tracking-tight'>
              {getStepTitle()}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {getStepDescription()}
            </p>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className='rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600'>
              {errorMessage}
            </div>
          )}

          {/* Current step content */}
          {renderCurrentStep()}

          {/* Terms and privacy */}
          {currentStep === RegistrationStep.FORM && (
            <p className='px-8 text-center text-sm text-muted-foreground'>
              {t('Auth.termsIntro')}{' '}
              <Link
                href='/terms'
                className='underline underline-offset-4 hover:text-primary'
              >
                {t('Auth.termsOfService')}
              </Link>{' '}
              {t('Auth.and')}{' '}
              <Link
                href='/privacy'
                className='underline underline-offset-4 hover:text-primary'
              >
                {t('Auth.privacyPolicy')}
              </Link>
              .
            </p>
          )}

          {/* Already have account link */}
          {currentStep === RegistrationStep.FORM && (
            <>
              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-background px-2 text-muted-foreground'>
                    {t('Registration.alreadyHaveAccount')}
                  </span>
                </div>
              </div>

              <div className='text-center'>
                <Link
                  href='/signin'
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'w-full'
                  )}
                >
                  {t('Registration.signInInstead')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
