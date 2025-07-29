'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tournament, TournamentStage } from '@/api/tournaments/types';
import { useApi } from '@/hooks/useApi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface GenerateMatchesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stage: TournamentStage;
  tournament: Tournament;
  onSuccess: () => void;
}

export const GenerateMatchesDialog: React.FC<GenerateMatchesDialogProps> = ({
  isOpen,
  onClose,
  stage,
  tournament,
  onSuccess
}) => {
  const t = useTranslations('Dashboard');
  const callApi = useApi();

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateMatches = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // TODO: Implement actual match generation API call
      // This should call the appropriate API based on stage type
      // For now, simulating with a delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(
        t('matchesGeneratedSuccess', {
          defaultValue: 'Matches generated successfully'
        })
      );

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error generating matches:', error);
      setError(
        t('failedToGenerateMatches', {
          defaultValue: 'Failed to generate matches. Please try again.'
        })
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Zap className='h-5 w-5' />
            {t('generateMatches', { defaultValue: 'Generate Matches' })}
          </DialogTitle>
          <DialogDescription>
            {t('generateMatchesFor', { defaultValue: 'Generate matches for' })}{' '}
            "{stage.name}"
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='text-sm text-muted-foreground'>
            <p>
              {stage.stage_type === 'group'
                ? t('generateGroupMatchesDescription', {
                    defaultValue:
                      'This will generate all matches for the groups in this stage based on the configured match rules.'
                  })
                : t('generateBracketMatchesDescription', {
                    defaultValue:
                      'This will generate all matches for the brackets in this stage.'
                  })}
            </p>
          </div>

          <Alert>
            <AlertTriangle className='h-4 w-4' />
            <AlertTitle>
              {t('important', { defaultValue: 'Important' })}
            </AlertTitle>
            <AlertDescription>
              {t('generateMatchesWarning', {
                defaultValue:
                  'This action will generate matches for the entire stage. Make sure all teams are properly assigned to groups/brackets before proceeding.'
              })}
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={isGenerating}>
            {t('cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button onClick={handleGenerateMatches} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {t('generating', { defaultValue: 'Generating...' })}
              </>
            ) : (
              <>
                <Zap className='mr-2 h-4 w-4' />
                {t('generateMatches', { defaultValue: 'Generate Matches' })}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
