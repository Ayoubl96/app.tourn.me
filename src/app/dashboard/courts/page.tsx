'use client';

import React, { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useApi } from '@/hooks/useApi';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CreateCourtSidebar from '@/features/courts/components/CreateCourtSidebar';
import { Court, fetchCourts } from '@/api/courts';

function CourtCard({ court }: { court: Court }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>{court.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {court.images && court.images.length > 0 && (
          <Carousel className='relative w-full'>
            <CarouselContent>
              <CarouselItem>
                <Image
                  src={court.images[0]}
                  alt={`Court image`}
                  width={640}
                  height={360}
                  className='h-auto w-full object-cover'
                />
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        )}
      </CardContent>
    </Card>
  );
}

export default function CourtsClientPage() {
  const callApi = useApi();
  const [courts, setCourts] = useState<Court[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const loadCourts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchCourts(callApi);
        setCourts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourts();
  }, [callApi]);

  async function refreshCourts() {
    try {
      const data = await fetchCourts(callApi);
      setCourts(data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Courts'
            description='List of courts from your account'
          />
          <Link
            href='#'
            onClick={(e) => {
              e.preventDefault();
              setShowSidebar(true);
            }}
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <Plus className='mr-1 h-4 w-4' />
            Add new Court
          </Link>
        </div>
        <Separator />

        {isLoading && <div className='mt-4 text-sm'>Loading courts...</div>}
        {error && <div className='mt-4 text-sm text-destructive'>{error}</div>}

        {!isLoading && !error && courts.length === 0 && (
          <div className='mt-4'>No courts found.</div>
        )}

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {courts.map((court, idx) => (
            <CourtCard key={`${court.name}-${idx}`} court={court} />
          ))}
        </div>
      </div>

      {showSidebar && (
        <CreateCourtSidebar
          onClose={() => setShowSidebar(false)}
          onSuccess={() => {
            setShowSidebar(false);
            refreshCourts();
          }}
        />
      )}
    </PageContainer>
  );
}
