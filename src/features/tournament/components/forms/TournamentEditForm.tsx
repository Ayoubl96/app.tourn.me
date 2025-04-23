import React, { useEffect, useState } from 'react';
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
  CardTitle
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
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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

    // Actions
    removeImage,
    handleSubmit,
    reset
  } = useTournamentEdit(tournament, onSuccess);

  // Reset form when tournament changes
  useEffect(() => {
    reset();
    // Clear any existing preview URLs
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
  }, [tournament, reset]);

  // Handle image change and create previews
  const handleImagesChange = (files: File[]) => {
    // Clear previous preview URLs before creating new ones
    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    // Create preview URLs for the images
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));

    setPreviewUrls(newPreviewUrls);
    setImages(files);
  };

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
              onValueChange={(files) => handleImagesChange(files as File[])}
              maxFiles={1}
              maxSize={5 * 1024 * 1024}
              disabled={isSubmitting}
            />

            {/* Current uploaded images */}
            {uploadedImageUrls.length > 0 && (
              <div className='mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3'>
                <p className='text-sm text-muted-foreground md:col-span-3'>
                  {t('currentImages', { fallback: 'Current images' })}:
                </p>
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
                      onClick={(e) => {
                        // Prevent the event from propagating to parent elements
                        e.preventDefault();
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      type='button'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* New image previews */}
            {previewUrls.length > 0 && (
              <div className='mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3'>
                <p className='text-sm text-muted-foreground md:col-span-3'>
                  {t('newImages', { fallback: 'New images to upload' })}:
                </p>
                {previewUrls.map((url, index) => (
                  <div
                    key={index}
                    className='relative aspect-video w-full overflow-hidden rounded-md border bg-muted'
                  >
                    <Image
                      src={url}
                      alt={`${t('newImage')} ${index}`}
                      fill
                      sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw'
                      className='rounded-md object-cover'
                    />
                  </div>
                ))}
              </div>
            )}

            {uploadedImageUrls.length === 0 && previewUrls.length === 0 && (
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
          disabled={
            isSubmitting ||
            (uploadedImageUrls.length === 0 && images.length === 0)
          }
        >
          {isSubmitting ? t('updating') : t('update')}
        </Button>
      </div>
    </form>
  );
};
