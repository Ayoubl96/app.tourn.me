import { useState, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { Tournament, updateTournament } from '@/api/tournaments';
import { uploadCourtImage } from '@/api/courts';
import { toast } from 'sonner';
import { SerializedEditorState } from 'lexical';

export const useTournamentEdit = (
  tournament: Tournament | null,
  onSuccess?: () => void
) => {
  const callApi = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Initial form state
  const [name, setName] = useState(tournament?.name || '');
  const [description, setDescription] = useState(tournament?.description || '');
  const [startDate, setStartDate] = useState(() => {
    if (!tournament?.start_date) return '';
    const date = new Date(tournament.start_date);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, -8); // Convert to local datetime-local format
  });
  const [endDate, setEndDate] = useState(() => {
    if (!tournament?.end_date) return '';
    const date = new Date(tournament.end_date);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, -8); // Convert to local datetime-local format
  });
  const [playersNumber, setPlayersNumber] = useState(
    tournament?.players_number?.toString() || ''
  );
  const [editorState, setEditorState] = useState<SerializedEditorState | null>(
    tournament?.full_description || null
  );
  const [images, setImages] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>(
    tournament?.images || []
  );

  // Handle image upload
  const handleImageUpload = useCallback(async () => {
    if (images.length === 0) {
      toast.error('Please select an image to upload');
      return;
    }

    try {
      setIsUploading(true);

      // Upload each image individually using our API
      const imageUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const result = await uploadCourtImage(callApi, images[i]);
        if (result.url) {
          imageUrls.push(result.url);
        }
      }

      // Append new images to existing ones
      setUploadedImageUrls((prev) => [...prev, ...imageUrls]);
      setImages([]); // Clear selected files after upload

      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong'
      );
    } finally {
      setIsUploading(false);
    }
  }, [callApi, images]);

  // Remove image from uploaded images
  const removeImage = useCallback((index: number) => {
    setUploadedImageUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      if (!tournament) {
        toast.error('Tournament not found');
        return;
      }

      if (!name || !description || !startDate || !endDate || !playersNumber) {
        toast.error('Please fill all required fields');
        return;
      }

      if (uploadedImageUrls.length === 0) {
        toast.error('Please upload at least one image');
        return;
      }

      try {
        setIsSubmitting(true);

        // Prepare update data
        const updateData = {
          name,
          description,
          images: uploadedImageUrls,
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
          players_number: parseInt(playersNumber, 10),
          ...(editorState && { full_description: editorState })
        };

        // Call API to update tournament
        await updateTournament(callApi, tournament.id.toString(), updateData);

        toast.success('Tournament updated successfully');
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error('Error updating tournament:', error);
        toast.error(
          error instanceof Error ? error.message : 'Failed to update tournament'
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      callApi,
      tournament,
      name,
      description,
      startDate,
      endDate,
      playersNumber,
      uploadedImageUrls,
      editorState,
      onSuccess
    ]
  );

  const reset = useCallback(() => {
    if (!tournament) return;

    setName(tournament.name);
    setDescription(tournament.description);

    const startDateObj = new Date(tournament.start_date);
    const endDateObj = new Date(tournament.end_date);

    setStartDate(
      new Date(
        startDateObj.getTime() - startDateObj.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, -8)
    );

    setEndDate(
      new Date(endDateObj.getTime() - endDateObj.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, -8)
    );

    setPlayersNumber(tournament.players_number.toString());
    setEditorState(tournament.full_description || null);
    setUploadedImageUrls(tournament.images || []);
    setImages([]);
  }, [tournament]);

  return {
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
  };
};
