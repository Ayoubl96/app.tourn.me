import PageContainer from '@/components/layout/page-container';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Building2, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import CompanyInfoForm from './company-info-form';
import CompanyPasswordChangeForm from './company-password-change-form';

export default function ProfileViewPage() {
  const t = useTranslations('Profile');

  return (
    <PageContainer>
      <div className='space-y-8'>
        {/* Page Header */}
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white dark:from-blue-600 dark:to-blue-700'>
              <Building2 className='h-6 w-6' />
            </div>
            <div>
              <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100'>
                {t('companyProfile')}
              </h1>
              <p className='text-lg text-muted-foreground'>
                {t('profileDescription')}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Badge
              variant='secondary'
              className='flex items-center gap-1 dark:bg-gray-800 dark:text-gray-200'
            >
              <Building2 className='h-3 w-3' />
              {t('companyManagement')}
            </Badge>
            <Badge
              variant='outline'
              className='flex items-center gap-1 dark:border-gray-700 dark:text-gray-300'
            >
              <Shield className='h-3 w-3' />
              {t('securitySettings')}
            </Badge>
          </div>
        </div>

        <Separator className='my-8 dark:border-gray-700' />

        {/* Company Information Section */}
        <CompanyInfoForm />

        <Separator className='my-8 dark:border-gray-700' />

        {/* Password Change Section */}
        <CompanyPasswordChangeForm />
      </div>
    </PageContainer>
  );
}
