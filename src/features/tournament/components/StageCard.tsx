'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CalendarDays,
  Users,
  Trophy,
  Edit,
  Trash2,
  Play,
  CheckCircle
} from 'lucide-react';
import { formatDate } from '@/features/tournament/api/utils';
import { TournamentStage } from '@/features/tournament/api/types';

interface StageCardProps {
  stage: TournamentStage;
  t: any;
  onEdit: (stage: TournamentStage) => void;
  onDelete: (stageId: number) => void;
  onManage: (stage: TournamentStage) => void;
  isActive: boolean;
}

export function StageCard({
  stage,
  t,
  onEdit,
  onDelete,
  onManage,
  isActive
}: StageCardProps) {
  const getStageTypeIcon = (type: string) => {
    switch (type) {
      case 'group':
        return <Users className='mr-1 h-4 w-4' />;
      case 'elimination':
        return <Trophy className='mr-1 h-4 w-4' />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planned':
        return (
          <Badge variant='outline' className='ml-2'>
            {t('planned')}
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant='default' className='ml-2'>
            {t('inProgress')}
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant='secondary' className='ml-2'>
            {t('completed')}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={isActive ? 'border-primary' : ''}>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div>
          <CardTitle className='flex items-center'>
            {getStageTypeIcon(stage.stage_type)}
            {stage.name}
            {getStatusBadge(stage.status)}
          </CardTitle>
          <CardDescription className='mt-1'>
            {stage.description}
          </CardDescription>
        </div>
        <div className='flex space-x-2'>
          <Button variant='outline' size='icon' onClick={() => onEdit(stage)}>
            <Edit className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='text-destructive'
            onClick={() => onDelete(stage.id)}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className='mb-4 space-y-2'>
          <div className='flex items-center text-sm text-muted-foreground'>
            <CalendarDays className='mr-2 h-4 w-4' />
            {formatDate(new Date(stage.start_date))} -{' '}
            {formatDate(new Date(stage.end_date))}
          </div>
          <div className='flex items-center text-sm text-muted-foreground'>
            <Users className='mr-2 h-4 w-4' />
            {t('stage')} #{stage.order}
          </div>
        </div>

        <Button
          className='mt-2 w-full'
          onClick={() => onManage(stage)}
          variant={isActive ? 'default' : 'secondary'}
        >
          {stage.status === 'planned' ? (
            <>
              <Play className='mr-2 h-4 w-4' />
              {t('setupStage')}
            </>
          ) : stage.status === 'in_progress' ? (
            <>
              <Play className='mr-2 h-4 w-4' />
              {t('manageStage')}
            </>
          ) : (
            <>
              <CheckCircle className='mr-2 h-4 w-4' />
              {t('viewResults')}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
