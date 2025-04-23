import { ApiCaller } from '@/api/common/types';
import { handleApiResponse } from '@/api/common/apiClient';
import { Court, CreateCourtParams, UpdateCourtParams } from './types';

/**
 * Courts API functions
 */

// Fetch all courts
export const fetchCourts = async (callApi: ApiCaller): Promise<Court[]> => {
  const response = await callApi('/courts/');
  return handleApiResponse<Court[]>(response);
};

// Fetch a court by ID
export const fetchCourt = async (
  callApi: ApiCaller,
  courtId: number
): Promise<Court> => {
  const response = await callApi(`/courts/${courtId}`);
  return handleApiResponse<Court>(response);
};

// Create a new court
export const createCourt = async (
  callApi: ApiCaller,
  params: CreateCourtParams
): Promise<Court> => {
  const response = await callApi('/courts/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  return handleApiResponse<Court>(response);
};

// Update an existing court
export const updateCourt = async (
  callApi: ApiCaller,
  courtId: number,
  params: UpdateCourtParams
): Promise<Court> => {
  const response = await callApi(`/courts/${courtId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  return handleApiResponse<Court>(response);
};

// Delete a court
export const deleteCourt = async (
  callApi: ApiCaller,
  courtId: number
): Promise<void> => {
  const response = await callApi(`/courts/${courtId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Failed to delete court');
  }
};

// Upload a court image
export const uploadCourtImage = async (
  callApi: ApiCaller,
  files: File
): Promise<{ image_url: string }> => {
  const formData = new FormData();
  formData.append('files', files);

  const response = await callApi('/courts/upload_image/', {
    method: 'POST',
    body: formData
  });

  const result = await handleApiResponse<{ image_urls: string[] }>(response);

  // Extract the first URL from the array and return it in the expected format
  return { image_url: result.image_urls[0] };
};
