'use client';

import React, { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { useRouter } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import PageContainer from '@/components/layout/page-container';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Link } from '@/lib/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUploader } from '@/components/file-uploader';
import { SerializedEditorState } from 'lexical';
import { Editor } from '@/components/blocks/editor-00/editor';
import { uploadCourtImage } from '@/api/courts';
import { createTournament } from '@/api/tournaments';

// Initial value for editor
const initialEditorValue = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: '',
            type: 'text',
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1
      }
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1
  }
} as unknown as SerializedEditorState;

export default function CreateTournamentPage() {
  /**
   * Dashboard translations - available keys:
   * - tournament, create, details, images, fullDescription, startDate, endDate
   * - numberOfPlayers, backTo, uploadImages, dragDrop, etc.
   */
  const t = useTranslations('Dashboard');

  /**
   * Common translations - available keys:
   * - name, description, save, cancel, edit, delete, create, etc.
   */
  const commonT = useTranslations('Common');

  /**
   * Error translations - available keys:
   * - failedToLoad, somethingWentWrong, tryAgainLater, etc.
   */
  const errorT = useTranslations('Errors');

  const router = useRouter();
  const callApi = useApi();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editorState, setEditorState] =
    useState<SerializedEditorState>(initialEditorValue);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [playersNumber, setPlayersNumber] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preview selected images immediately
  const handleImagesChange = (files: File[]) => {
    setImages(files);

    // Create preview URLs for the images
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));

    // Clean up any previous preview URLs to avoid memory leaks
    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    setPreviewUrls(newPreviewUrls);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !description || !startDate || !endDate || !playersNumber) {
      toast.error(t('requiredFields'));
      return;
    }

    if (images.length === 0) {
      toast.error(
        t('pleaseSelectImage', {
          fallback:
            'Please select at least one image before creating the tournament'
        })
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // First, upload the images
      const uploadPromises = images.map((image) =>
        uploadCourtImage(callApi, image)
      );
      const uploadResults = await Promise.all(uploadPromises);

      // Extract the image URLs
      const imageUrls = uploadResults
        .filter((result) => result.image_url)
        .map((result) => result.image_url);

      if (imageUrls.length === 0) {
        toast.error(
          t('failedToUploadImages', { fallback: 'Failed to upload images' })
        );
        setIsSubmitting(false);
        return;
      }

      // Create tournament with our centralized API
      await createTournament(callApi, {
        name: name,
        description: description,
        images: imageUrls,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        players_number: parseInt(playersNumber, 10),
        full_description: editorState
      });

      toast.success(commonT('success'));
      window.location.href = '/dashboard/tournament/overview';
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast.error(
        error instanceof Error ? error.message : errorT('somethingWentWrong')
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageContainer scrollable>
      <div className='flex w-full flex-col space-y-6'>
        <div className='flex items-center space-x-2'>
          <Link
            href='/dashboard/tournament/overview'
            className='flex items-center text-sm font-medium text-muted-foreground hover:text-primary'
          >
            <ChevronLeft className='mr-1 h-4 w-4' />
            {t('backTo', { fallback: 'Back to' })}{' '}
            {t('tournament', { fallback: 'Tournament' })}
          </Link>
        </div>

        <div>
          <Heading
            title={`${t('create', { fallback: 'Create' })} ${t('tournament', { fallback: 'Tournament' })}`}
            description={`${t('addNew', { fallback: 'Add New' })} ${t('tournament', { fallback: 'Tournament' }).toLowerCase()} ${commonT('manage', { fallback: 'Manage' }).toLowerCase()}`}
          />
          <Separator className='my-4' />
        </div>

        <form onSubmit={handleSubmit} className='w-full space-y-8'>
          {/* Image Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t('tournament')} {t('images')}*
              </CardTitle>
              <CardDescription>
                {t('uploadImages', {
                  fallback: 'Upload images for your tournament'
                })}
              </CardDescription>
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

                {previewUrls.length > 0 && (
                  <div className='mt-4 grid grid-cols-1 gap-2'>
                    {previewUrls.map((url, index) => (
                      <div
                        key={index}
                        className='relative aspect-video w-full rounded-md border bg-muted'
                      >
                        <Image
                          src={url}
                          alt={`${t('tournamentImage', { fallback: 'Tournament image' })} ${index}`}
                          fill
                          sizes='100vw'
                          className='rounded-md object-cover'
                        />
                      </div>
                    ))}
                  </div>
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
                    placeholder={t('enterTournamentName', {
                      fallback: 'Enter tournament name'
                    })}
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
                    placeholder={t('enterNumberOfPlayers', {
                      fallback: 'Enter number of players'
                    })}
                    required
                  />
                </div>

                <div className='space-y-2 md:col-span-2'>
                  <Label htmlFor='description'>{commonT('description')}*</Label>
                  <Textarea
                    id='description'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('briefDescription', {
                      fallback: 'Brief description of the tournament'
                    })}
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
              <CardDescription>
                {t('detailedTournamentDescription', {
                  fallback: 'Provide a detailed description of your tournament'
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <Label htmlFor='fullDescription'>{t('fullDescription')}</Label>
                <Editor
                  editorSerializedState={editorState}
                  onSerializedChange={(value) => setEditorState(value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className='flex justify-end space-x-2'>
            <Button
              variant='outline'
              onClick={() =>
                (window.location.href = '/dashboard/tournament/overview')
              }
              disabled={isSubmitting}
            >
              {commonT('cancel')}
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting || images.length === 0}
            >
              {isSubmitting
                ? t('creating')
                : `${t('create')} ${t('tournament')}`}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
