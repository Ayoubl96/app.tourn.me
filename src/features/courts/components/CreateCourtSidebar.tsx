'use client';

import React, { useState, FormEvent } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/useApi';
import { Input } from '@/components/ui/input';
import { uploadCourtImage, createCourt } from '@/api/courts';
// If you have a toast utility, import it here:
// import { toast } from "react-hot-toast"; // Example
// or wherever your toast is from

interface CreateCourtSidebarProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCourtSidebar({
  onClose,
  onSuccess
}: CreateCourtSidebarProps) {
  const callApi = useApi();
  const [name, setName] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadSuccessful, setUploadSuccessful] = useState(false);

  // 1) Upload images
  async function handleUpload() {
    if (!files || files.length === 0) {
      setError('Please select at least one image.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Upload each file one by one
      const uploadedImages = [];
      for (let i = 0; i < files.length; i++) {
        const result = await uploadCourtImage(callApi, files[i]);
        if (result.image_url) {
          uploadedImages.push(result.image_url);
        }
      }

      setUploadedUrls(uploadedImages);
      setUploadSuccessful(true);
      // if you have a toast:
      // toast.success("Images uploaded!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  // 2) Create the court
  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      setIsCreating(true);

      await createCourt(callApi, {
        name,
        images: uploadedUrls.length > 0 ? uploadedUrls : undefined
      });

      // toast.success("Court created!");
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className='fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-card p-4 text-card-foreground shadow'>
      <Button
        variant='ghost'
        onClick={onClose}
        className='mb-2 ml-auto flex items-center space-x-2 p-2'
      >
        <X className='h-4 w-4' />
        <span>Close</span>
      </Button>

      <h2 className='mb-4 text-lg font-semibold'>Create a New Court</h2>

      <form onSubmit={handleCreate} className='flex flex-col gap-3'>
        <label className='block text-sm font-medium'>
          Court Name
          <input
            type='text'
            className='mt-1 block w-full rounded border border-input bg-background p-2 text-foreground'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label className='block text-sm font-medium'>
          Images
          <Input
            type='file'
            multiple
            accept='image/*'
            className='mt-1 block w-full text-sm'
            onChange={(e) => setFiles(e.target.files)}
          />
        </label>

        {/* Upload button */}
        <Button
          type='button'
          onClick={handleUpload}
          disabled={isUploading || !files?.length}
        >
          {isUploading ? 'Uploading...' : 'Upload Images'}
        </Button>

        {/* If the user has uploaded images successfully, they can create the court */}
        <Button
          type='submit'
          disabled={!uploadSuccessful || isCreating}
          className='bg-primary text-primary-foreground'
        >
          {isCreating ? 'Creating...' : 'Create the court'}
        </Button>

        {error && <div className='text-sm text-destructive'>{error}</div>}
      </form>
    </div>
  );
}
