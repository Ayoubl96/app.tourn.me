/**
 * Player entity type
 */
export interface Player {
  id: number;
  nickname: string;
  gender: number;
  name: string | null;
  surname: string | null;
  number: string | null;
  email: string | null;
  playtomic_id: number;
  level: number;
  picture: string | null;
}

/**
 * Playtomic player from external API
 */
export interface PlaytomicPlayer {
  user_id: string;
  full_name: string;
  gender: string;
  picture: string;
  additional_data?: Array<{
    level_value: number;
  }>;
}

/**
 * Player creation parameters
 */
export interface CreatePlayerParams {
  nickname: string;
  gender: number;
  name?: string;
  surname?: string;
  number?: string;
  email?: string;
  level?: number;
  picture?: string;
}

/**
 * Player update parameters
 */
export interface UpdatePlayerParams extends Partial<CreatePlayerParams> {}

/**
 * Playtomic player import parameters
 */
export interface ImportPlaytomicPlayerParams {
  user_id: string;
  gender: number;
}
