'use client';

import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Phone,
  Receipt,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import EditableField from './editable-field';
import EditablePhoneField from './editable-phone-field';
import EditableVatField from './editable-vat-field';
import { CompanyUpdateRequest } from '@/api/auth';
import { parsePhoneNumber, parseVatNumber } from '../utils/data-parsing';
import { useCompanyProfile } from '../hooks/useCompanyProfile';

interface CompanyInfoFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function CompanyInfoForm({
  onSuccess,
  onError
}: CompanyInfoFormProps) {
  const t = useTranslations('Profile');
  const {
    profile,
    isLoading,
    isRefreshing,
    error,
    refreshProfile,
    updateInfo
  } = useCompanyProfile();

  // Handle loading state
  if (isLoading) {
    return (
      <Card className='border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-900'>
        <CardContent className='p-8'>
          <div className='flex items-center justify-center space-x-2'>
            <RefreshCw className='h-5 w-5 animate-spin text-blue-600' />
            <span className='text-sm text-muted-foreground'>
              {t('loadingProfile')}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (error && !profile) {
    return (
      <Card className='border-red-200 shadow-sm dark:border-red-800 dark:bg-gray-900'>
        <CardContent className='p-8'>
          <div className='flex items-center justify-center space-x-2 text-red-600 dark:text-red-400'>
            <AlertCircle className='h-5 w-5' />
            <span className='text-sm'>{error}</span>
            <Button
              variant='outline'
              size='sm'
              onClick={refreshProfile}
              disabled={isRefreshing}
              className='ml-4'
            >
              <RefreshCw
                className={`mr-1 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              {t('retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  // Parse phone and VAT numbers - handle null/undefined values
  const { countryCode, phoneNumber } = parsePhoneNumber(
    profile.phone_number || ''
  );
  const { vatCountryCode, vatNumber } = parseVatNumber(
    profile.vat_number || ''
  );

  const handleFieldUpdate = async (
    field: keyof CompanyUpdateRequest,
    value: string
  ) => {
    try {
      const updateData: CompanyUpdateRequest = { [field]: value };
      await updateInfo(updateData);

      toast.success(t('informationUpdatedSuccess'));
      if (onSuccess) onSuccess();
    } catch (error: any) {
      const errorMessage = error.message || t('failedToUpdateInformation');
      if (onError) onError(errorMessage);
      toast.error(errorMessage);
      throw error; // Re-throw to handle in EditableField
    }
  };

  const handlePhoneUpdate = async (fullPhoneNumber: string) => {
    await handleFieldUpdate('phone_number', fullPhoneNumber);
  };

  const handleVatUpdate = async (fullVatNumber: string) => {
    await handleFieldUpdate('vat_number', fullVatNumber);
  };

  return (
    <Card className='border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-900'>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900'>
              <Building2 className='h-5 w-5 text-blue-600 dark:text-blue-400' />
            </div>
            <div>
              <CardTitle className='text-xl text-gray-900 dark:text-gray-100'>
                {t('companyInformation')}
              </CardTitle>
              <p className='text-sm text-muted-foreground'>
                {t('companyInfoDescription')}
              </p>
            </div>
          </div>

          {/* Refresh button */}
          <Button
            variant='outline'
            size='sm'
            onClick={refreshProfile}
            disabled={isRefreshing}
            className='flex items-center gap-2 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800'
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            {t('refresh')}
          </Button>
        </div>

        {profile.updated_at && (
          <div className='flex items-center gap-2 pt-2'>
            <Badge
              variant='secondary'
              className='bg-gray-100 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            >
              {t('lastUpdated')}:{' '}
              {new Date(profile.updated_at).toLocaleDateString()}
            </Badge>
          </div>
        )}

        {error && (
          <div className='flex items-center gap-2 pt-2'>
            <Badge
              variant='destructive'
              className='flex items-center gap-1 bg-red-100 text-xs text-red-700 dark:bg-red-900 dark:text-red-300'
            >
              <AlertCircle className='h-3 w-3' />
              {error}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Basic Information Section */}
        <div>
          <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
            <Building2 className='h-5 w-5 text-gray-600 dark:text-gray-400' />
            {t('basicInformation')}
          </h3>
          <div className='grid gap-6 md:grid-cols-2'>
            <div className='flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-800/50'>
              <div>
                <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  {t('loginId')}
                </p>
                <p className='text-sm text-gray-900 dark:text-gray-100'>
                  {profile.login || t('notAvailable')}
                </p>
              </div>
              <Badge
                variant='secondary'
                className='bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              >
                {t('readOnly')}
              </Badge>
            </div>
            <EditableField
              label={t('companyName')}
              value={profile.name || ''}
              onSave={(value) => handleFieldUpdate('name', value)}
              placeholder={t('companyNamePlaceholder')}
            />

            <EditableField
              label={t('emailAddress')}
              value={profile.email || ''}
              onSave={(value) => handleFieldUpdate('email', value)}
              placeholder={t('emailPlaceholder')}
              type='email'
            />
          </div>
        </div>

        <Separator className='dark:border-gray-700' />

        {/* Contact Information Section */}
        <div>
          <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
            <Phone className='h-5 w-5 text-gray-600 dark:text-gray-400' />
            {t('contactInformation')}
          </h3>
          <div className='grid gap-6 md:grid-cols-2'>
            <EditablePhoneField
              label={t('phoneNumber')}
              countryCode={countryCode}
              phoneNumber={phoneNumber}
              onSave={handlePhoneUpdate}
            />

            <EditableField
              label={t('address')}
              value={profile.address || ''}
              onSave={(value) => handleFieldUpdate('address', value)}
              placeholder={t('addressPlaceholder')}
            />
          </div>
        </div>

        <Separator className='dark:border-gray-700' />

        {/* Business Information Section */}
        <div>
          <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
            <Receipt className='h-5 w-5 text-gray-600 dark:text-gray-400' />
            {t('businessInformation')}
          </h3>
          <div className='grid gap-6 md:grid-cols-2'>
            <EditableVatField
              label={t('vatNumber')}
              vatCountryCode={vatCountryCode}
              vatNumber={vatNumber}
              onSave={handleVatUpdate}
            />
          </div>
        </div>

        {/* Account Information Section */}
        <Separator className='dark:border-gray-700' />

        <div>
          <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
            {t('accountDetails')}
          </h3>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='rounded-lg border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-800/50'>
              <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                {t('accountCreated')}
              </p>
              <p className='text-sm text-gray-900 dark:text-gray-100'>
                {profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : t('notAvailable')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
