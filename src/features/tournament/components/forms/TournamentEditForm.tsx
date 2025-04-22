import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Tournament } from '../../types';
import { useTournamentEdit } from '../../hooks/useTournamentEdit';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { FileUploader } from '@/components/file-uploader';
import { Editor } from '@/components/blocks/editor-00/editor';
import { AlertCircle, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';

interface TournamentEditFormProps {
  tournament: Tournament;
  onSuccess?: () => void;
}

export const TournamentEditForm: React.FC<TournamentEditFormProps> = ({
  tournament,
  onSuccess
}) => {
  const t = useTranslations('Dashboard');
  const commonT = useTranslations('Common');

  const {
    // Form state
    name,
    setName,
    description,
    setDescription,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    playersNumber,
    setPlayersNumber,
    editorState,
    setEditorState,
    images,
    setImages,
    uploadedImageUrls,

    // Loading states
    isSubmitting,
    isUploading,

    // Actions
    handleImageUpload,
    removeImage,
    handleSubmit,
    reset
  } = useTournamentEdit(tournament, onSuccess);

  // Reset form when tournament changes
  useEffect(() => {
    reset();
  }, [tournament, reset]);

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Image Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('tournament')} {t('images')}*
          </CardTitle>
          <CardDescription>{t('uploadImages')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <FileUploader
              value={images}
              onValueChange={setImages}
              maxFiles={1}
              maxSize={5 * 1024 * 1024}
              disabled={isUploading}
            />

            <div className='flex justify-end'>
              <Button
                type='button'
                onClick={handleImageUpload}
                disabled={isUploading || images.length === 0}
              >
                {isUploading ? t('uploading') : t('uploadImage')}
              </Button>
            </div>

            {uploadedImageUrls.length > 0 && (
              <div className='mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3'>
                {uploadedImageUrls.map((url, index) => (
                  <div
                    key={index}
                    className='group relative aspect-video w-full overflow-hidden rounded-md border bg-muted'
                  >
                    <Image
                      src={url}
                      alt={`${t('tournamentImage')} ${index}`}
                      fill
                      sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw'
                      className='rounded-md object-cover'
                    />
                    <Button
                      size='icon'
                      variant='destructive'
                      className='absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100'
                      onClick={() => removeImage(index)}
                      type='button'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {uploadedImageUrls.length === 0 && (
              <Alert>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{t('uploadImageFirst')}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tournament Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('tournament')} {t('details')}
          </CardTitle>
          <CardDescription>{commonT('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='name'>
                {t('tournament')} {commonT('name')}*
              </Label>
              <Input
                id='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('enterTournamentName')}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='playersNumber'>{t('numberOfPlayers')}*</Label>
              <Input
                id='playersNumber'
                type='number'
                value={playersNumber}
                onChange={(e) => setPlayersNumber(e.target.value)}
                placeholder={t('enterNumberOfPlayers')}
                required
              />
            </div>

            <div className='space-y-2 md:col-span-2'>
              <Label htmlFor='description'>{commonT('description')}*</Label>
              <Textarea
                id='description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('briefDescription')}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='startDate'>{t('startDate')}*</Label>
              <Input
                id='startDate'
                type='datetime-local'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='endDate'>{t('endDate')}*</Label>
              <Input
                id='endDate'
                type='datetime-local'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Description Section with Rich Text Editor */}
      <Card>
        <CardHeader>
          <CardTitle>{t('fullDescription')}</CardTitle>
          <CardDescription>{t('detailedDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <Label htmlFor='fullDescription'>{t('fullDescription')}</Label>
            {editorState && (
              <Editor
                editorSerializedState={editorState}
                onSerializedChange={(value) => setEditorState(value)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-end space-x-2'>
        <Button
          variant='outline'
          onClick={reset}
          type='button'
          disabled={isSubmitting}
        >
          {commonT('reset')}
        </Button>
        <Button
          type='submit'
          disabled={isSubmitting || uploadedImageUrls.length === 0}
        >
          {isSubmitting ? t('updating') : t('update')}
        </Button>
      </div>
    </form>
  );
};
