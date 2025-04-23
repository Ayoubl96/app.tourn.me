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

  // Remove image from uploaded images
  const removeImage = useCallback((index: number) => {
    setUploadedImageUrls((currentUrls) => {
      const newUrls = [...currentUrls];
      newUrls.splice(index, 1);
      return newUrls;
    });
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

      // Check if we have either existing uploaded images or new images to upload
      if (uploadedImageUrls.length === 0 && images.length === 0) {
        toast.error('Please upload at least one image');
        return;
      }

      try {
        setIsSubmitting(true);

        // Process any new images if they exist
        let allImageUrls = [...uploadedImageUrls]; // Start with existing images

        if (images.length > 0) {
          try {
            // Upload all new images
            const uploadPromises = images.map((image) =>
              uploadCourtImage(callApi, image)
            );
            const uploadResults = await Promise.all(uploadPromises);

            // Extract and add new image URLs
            const newImageUrls = uploadResults
              .filter((result) => result.image_url)
              .map((result) => result.image_url);

            if (newImageUrls.length === 0 && uploadedImageUrls.length === 0) {
              toast.error('Failed to upload images');
              setIsSubmitting(false);
              return;
            }

            // Add new image URLs to the existing ones
            allImageUrls = [...allImageUrls, ...newImageUrls];
          } catch (error) {
            console.error('Error uploading images:', error);
            if (uploadedImageUrls.length === 0) {
              toast.error('Failed to upload images');
              setIsSubmitting(false);
              return;
            }
          }
        }

        // Prepare update data
        const updateData = {
          name,
          description,
          images: allImageUrls,
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
          players_number: parseInt(playersNumber, 10),
          ...(editorState && { full_description: editorState })
        };

        // Call API to update tournament
        await updateTournament(callApi, tournament.id.toString(), updateData);

        // Update state with the uploaded images
        setUploadedImageUrls(allImageUrls);
        setImages([]); // Clear the image selection after upload

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
      images,
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

    // Actions
    removeImage,
    handleSubmit,
    reset
  };
};
