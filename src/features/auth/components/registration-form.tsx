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
import {
  RegistrationFormData,
  RegistrationApiData,
  PasswordStrength
} from '@/api/auth/types';
import { initiateRegistration } from '@/api/auth';
import {
  validatePassword,
  validatePhoneNumber,
  combinePhoneNumber,
  validateVatNumber,
  combineVatNumber,
  COUNTRIES_DATA
} from '../utils/validation';
import PasswordStrengthIndicator from './password-strength-indicator';
import FlexibleCountrySelector from './flexible-country-selector';

interface RegistrationFormProps {
  onSuccess: (email: string, expirationTime: number) => void;
  onError: (error: string) => void;
}

export default function RegistrationForm({
  onSuccess,
  onError
}: RegistrationFormProps) {
  const t = useTranslations();
  const [loading, startTransition] = useTransition();
  const [currentPassword, setCurrentPassword] = useState('');

  const formSchema = z
    .object({
      email: z.string().email({ message: t('Errors.invalidEmail') }),
      confirmEmail: z.string().email({ message: t('Errors.invalidEmail') }),
      password: z
        .string()
        .min(8, { message: t('Errors.passwordMinLength') })
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
          { message: t('Errors.passwordRequirementsDetailed') }
        ),
      confirmPassword: z.string(),
      name: z.string().min(1, { message: t('Errors.requiredCompanyName') }),
      address: z.string().min(1, { message: t('Errors.requiredAddress') }),
      phone_number: z
        .string()
        .min(1, { message: t('Errors.requiredPhoneNumber') }),
      country_code: z
        .string()
        .min(1, { message: t('Errors.requiredCountryCode') }),
      vat_number: z.string().min(1, { message: t('Errors.requiredVatNumber') }),
      vat_country_code: z
        .string()
        .min(1, { message: t('Errors.requiredVatCountryCode') })
    })
    .refine((data) => data.email === data.confirmEmail, {
      message: t('Errors.emailsMustMatch'),
      path: ['confirmEmail']
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('Errors.passwordsMustMatch'),
      path: ['confirmPassword']
    })
    .refine(
      (data) => validatePhoneNumber(data.phone_number, data.country_code),
      {
        message: t('Errors.invalidPhoneNumber'),
        path: ['phone_number']
      }
    )
    .refine(
      (data) => validateVatNumber(data.vat_number, data.vat_country_code),
      {
        message: t('Errors.invalidVatNumber'),
        path: ['vat_number']
      }
    );

  type RegistrationFormValue = z.infer<typeof formSchema>;

  const defaultValues: RegistrationFormValue = {
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    name: '',
    address: '',
    phone_number: '',
    country_code: '', // Default to Italy
    vat_number: '',
    vat_country_code: ''
  };

  const form = useForm<RegistrationFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: RegistrationFormValue) => {
    startTransition(async () => {
      try {
        // Validate password strength
        const passwordValidation = validatePassword(data.password);
        if (passwordValidation.strength < PasswordStrength.MEDIUM) {
          onError(t('Registration.passwordTooWeak'));
          toast.error(t('Registration.passwordTooWeak'));
          return;
        }

        // Combine phone number with country code
        const fullPhoneNumber = combinePhoneNumber(
          data.phone_number,
          data.country_code
        );

        // Combine VAT number with country prefix
        const fullVatNumber = combineVatNumber(
          data.vat_number,
          data.vat_country_code
        );

        // Prepare API data
        const apiData: RegistrationApiData = {
          email: data.email,
          password: data.password,
          name: data.name,
          address: data.address,
          phone_number: fullPhoneNumber,
          vat_number: fullVatNumber
        };

        // Initiate registration
        const response = await initiateRegistration(apiData);

        // Calculate expiration time
        const expirationTime =
          Date.now() + response.expires_in_minutes * 60 * 1000;

        toast.success(t('Registration.verificationCodeSent'));
        onSuccess(data.email, expirationTime);
      } catch (error: any) {
        console.error('Registration initiation failed:', error);
        const errorMessage = getErrorMessage(error.message);
        onError(errorMessage);
        toast.error(errorMessage);
      }
    });
  };

  const getErrorMessage = (error: string): string => {
    const errorMappings: Record<string, string> = {
      'Email already registered': t('Registration.emailAlreadyRegistered'),
      'Email service is not configured': t(
        'Registration.emailServiceNotConfigured'
      ),
      'Failed to send verification email': t('Registration.failedToSendEmail')
    };

    return (
      errorMappings[error] || error || t('Registration.registrationFailed')
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-4'>
        {/* Email Fields */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Registration.emailLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder={t('Registration.emailPlaceholder')}
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='confirmEmail'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Registration.confirmEmailLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder={t('Registration.confirmEmailPlaceholder')}
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Password Fields */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Registration.passwordLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder={t('Registration.passwordPlaceholder')}
                    disabled={loading}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setCurrentPassword(e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Registration.confirmPasswordLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder={t('Registration.confirmPasswordPlaceholder')}
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Password Strength Indicator */}
        {currentPassword && (
          <PasswordStrengthIndicator
            password={currentPassword}
            className='mt-3'
          />
        )}

        {/* Company Name */}
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Registration.companyNameLabel')}</FormLabel>
              <FormControl>
                <Input
                  type='text'
                  placeholder={t('Registration.companyNamePlaceholder')}
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address */}
        <FormField
          control={form.control}
          name='address'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Registration.addressLabel')}</FormLabel>
              <FormControl>
                <Input
                  type='text'
                  placeholder={t('Registration.addressPlaceholder')}
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* VAT Number */}
        <div className='space-y-2'>
          <FormLabel>{t('Registration.vatNumberLabel')}</FormLabel>
          <div className='grid grid-cols-2 gap-2'>
            <FormField
              control={form.control}
              name='vat_country_code'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FlexibleCountrySelector
                      value={field.value}
                      onValueChange={field.onChange}
                      type='vat'
                      disabled={loading}
                      placeholder={t('Registration.selectCountryCode')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='vat_number'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className='relative'>
                      {(() => {
                        const vatCountryCode = form.watch('vat_country_code');
                        const country = COUNTRIES_DATA.find(
                          (c) => c.code === vatCountryCode
                        );
                        const vatPrefix = country?.vatPrefix;

                        return vatPrefix ? (
                          <span className='absolute left-3 top-1/2 -translate-y-1/2 rounded bg-muted px-1 text-sm text-muted-foreground'>
                            {vatPrefix}
                          </span>
                        ) : null;
                      })()}
                      <Input
                        type='text'
                        placeholder={t('Registration.vatNumberPlaceholder')}
                        disabled={loading}
                        className={(() => {
                          const vatCountryCode = form.watch('vat_country_code');
                          const country = COUNTRIES_DATA.find(
                            (c) => c.code === vatCountryCode
                          );
                          return country?.vatPrefix ? 'pl-16' : '';
                        })()}
                        {...field}
                        onChange={(e) => {
                          // Allow alphanumeric characters and some formatting
                          const value = e.target.value
                            .replace(/[^a-zA-Z0-9\-\s]/g, '')
                            .toUpperCase();
                          field.onChange(value);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className='space-y-2'>
          <FormLabel>{t('Registration.phoneLabel')}</FormLabel>
          <div className='grid grid-cols-2 gap-2'>
            <FormField
              control={form.control}
              name='country_code'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FlexibleCountrySelector
                      value={field.value}
                      onValueChange={field.onChange}
                      type='phone'
                      disabled={loading}
                      placeholder={t('Registration.selectCountryCode')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='phone_number'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type='tel'
                      placeholder={t('Registration.phonePlaceholder')}
                      disabled={loading}
                      {...field}
                      onChange={(e) => {
                        // Allow only digits and some formatting characters
                        const value = e.target.value.replace(
                          /[^\d\s\-\(\)]/g,
                          ''
                        );
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button disabled={loading} className='w-full' type='submit'>
          {loading
            ? t('Registration.sendingCode')
            : t('Registration.sendVerificationCode')}
        </Button>
      </form>
    </Form>
  );
}
