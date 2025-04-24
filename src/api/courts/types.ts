/**
 * Court entity type
 */
export interface Court {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  images: string[];
}

/**
 * Court creation parameters
 */
export interface CreateCourtParams {
  name: string;
  images?: string[];
}

/**
 * Court update parameters
 */
export interface UpdateCourtParams extends Partial<CreateCourtParams> {}
