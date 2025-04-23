/**
 * Court entity type
 */
export interface Court {
  id: number;
  name: string;
  size: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  tournament_id: number | null;
  images: string[];
}

/**
 * Court creation parameters
 */
export interface CreateCourtParams {
  name: string;
  size: number;
  active?: boolean;
  tournament_id?: number | null;
  images?: string[];
}

/**
 * Court update parameters
 */
export interface UpdateCourtParams extends Partial<CreateCourtParams> {}
