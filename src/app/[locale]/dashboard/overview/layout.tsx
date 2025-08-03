import PageContainer from '@/components/layout/page-container';
import React from 'react';
import OverViewClient from './OverViewClient';
import { DashboardOverview } from '@/features/overview/components/dashboard-overview';
import { getTranslations } from 'next-intl/server';
import { defaultLocale } from '@/config/locales';

export default async function OverViewLayout({ params }: { params?: any }) {
  // Simple direct approach - no complex utility functions
  let locale = defaultLocale;

  try {
    // Await params before accessing its properties
    const resolvedParams = await params;
    // Now safely access the locale property
    locale = resolvedParams?.locale || defaultLocale;
  } catch (error) {
    console.error('Error accessing locale:', error);
    // Keep using defaultLocale
  }

  // Pass locale explicitly to getTranslations
  const t = await getTranslations({ locale, namespace: 'Dashboard' });

  return (
    <PageContainer>
      <div className='flex w-full flex-col'>
        <div className='mb-6'>
          <OverViewClient />
        </div>
        <DashboardOverview />
      </div>
    </PageContainer>
  );
}
