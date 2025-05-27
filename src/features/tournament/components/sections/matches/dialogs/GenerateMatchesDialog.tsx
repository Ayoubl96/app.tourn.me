import React from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface GenerateMatchesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stageType: 'group' | 'elimination';
  isGenerating: boolean;
  hasGroups: boolean;
  hasBrackets: boolean;
  selectedGroupId: number | null;
  selectedBracketId: number | null;
  onGenerateMatches: () => Promise<void>;
}

export function GenerateMatchesDialog({
  isOpen,
  onClose,
  stageType,
  isGenerating,
  hasGroups,
  hasBrackets,
  selectedGroupId,
  selectedBracketId,
  onGenerateMatches
}: GenerateMatchesDialogProps) {
  const t = useTranslations('Dashboard');

  const canGenerate =
    (stageType === 'group' && hasGroups && selectedGroupId) ||
    (stageType === 'elimination' && hasBrackets && selectedBracketId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('generateMatches', { defaultValue: 'Generate Matches' })}
          </DialogTitle>
          <DialogDescription>
            {stageType === 'group'
              ? t('generateGroupMatchesDescription', {
                  defaultValue:
                    'This will generate all matches for all groups in this stage based on the configured match rules.'
                })
              : t('generateBracketMatchesDescription', {
                  defaultValue:
                    'This will generate all matches for all brackets in this stage.'
                })}
          </DialogDescription>
        </DialogHeader>

        <div className='py-4'>
          <Alert variant='destructive'>
            <AlertTitle>{t('warning', { defaultValue: 'Warning' })}</AlertTitle>
            <AlertDescription>
              {t('generateMatchesWarning', {
                defaultValue:
                  'This action will generate matches for the entire stage. If matches already exist, this may create duplicates.'
              })}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            {t('cancel', { namespace: 'Common' })}
          </Button>
          <Button
            onClick={onGenerateMatches}
            disabled={isGenerating || !canGenerate}
          >
            {isGenerating ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {t('generating', { defaultValue: 'Generating...' })}
              </>
            ) : (
              <>
                <PlayCircle className='mr-2 h-4 w-4' />
                {t('generateMatches', { defaultValue: 'Generate Matches' })}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
