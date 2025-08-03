'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { StagingMatch } from '@/api/tournaments/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, CheckCircle, Calendar } from 'lucide-react';

interface MatchCategoriesProps {
  live: StagingMatch[];
  next: StagingMatch[];
  upcoming: StagingMatch[];
  completed: StagingMatch[];
}

interface MatchAccordionLayoutProps {
  matches: MatchCategoriesProps;
  renderMatchList: (matches: StagingMatch[]) => React.ReactNode;
}

/**
 * Shared accordion layout for displaying matches in a 2x2 grid
 * Used by both StageMatches and TournamentMatches for consistent UI
 */
export const MatchAccordionLayout: React.FC<MatchAccordionLayoutProps> = ({
  matches,
  renderMatchList
}) => {
  const t = useTranslations('Dashboard');
  const { live, next, upcoming, completed } = matches;

  return (
    <div className='space-y-6'>
      {/* First Row: Live and Next matches */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Live Matches */}
        <div className='space-y-4'>
          <Accordion
            type='multiple'
            defaultValue={live.length > 0 ? ['live'] : []}
            className='w-full'
          >
            {live.length > 0 && (
              <AccordionItem value='live'>
                <AccordionTrigger className='hover:no-underline'>
                  <div className='flex items-center gap-2'>
                    <Play className='h-4 w-4 text-red-500' />
                    <span className='font-semibold'>
                      {t('live', { defaultValue: 'Live' })}
                    </span>
                    <Badge variant='destructive' className='text-xs'>
                      {live.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='pt-4'>
                  {renderMatchList(live)}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>

        {/* Next Matches */}
        <div className='space-y-4'>
          <Accordion
            type='multiple'
            defaultValue={next.length > 0 ? ['next'] : []}
            className='w-full'
          >
            {next.length > 0 && (
              <AccordionItem value='next'>
                <AccordionTrigger className='hover:no-underline'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4 text-orange-500' />
                    <span className='font-semibold'>
                      {t('next', { defaultValue: 'Next' })}
                    </span>
                    <Badge variant='secondary' className='text-xs'>
                      {next.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='pt-4'>
                  {renderMatchList(next)}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </div>

      {/* Second Row: Upcoming and Completed matches */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Upcoming Matches */}
        <div className='space-y-4'>
          <Accordion type='multiple' defaultValue={[]} className='w-full'>
            {upcoming.length > 0 && (
              <AccordionItem value='upcoming'>
                <AccordionTrigger className='hover:no-underline'>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-blue-500' />
                    <span className='font-semibold'>
                      {t('upcoming', { defaultValue: 'Upcoming' })}
                    </span>
                    <Badge variant='secondary' className='text-xs'>
                      {upcoming.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='pt-4'>
                  {renderMatchList(upcoming)}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>

        {/* Completed Matches */}
        <div className='space-y-4'>
          <Accordion type='multiple' defaultValue={[]} className='w-full'>
            {completed.length > 0 && (
              <AccordionItem value='completed'>
                <AccordionTrigger className='hover:no-underline'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4 text-green-500' />
                    <span className='font-semibold'>
                      {t('completed', { defaultValue: 'Completed' })}
                    </span>
                    <Badge variant='secondary' className='text-xs'>
                      {completed.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='pt-4'>
                  {renderMatchList(completed)}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </div>
    </div>
  );
};
