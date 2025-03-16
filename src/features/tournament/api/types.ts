export interface Tournament {
  id: number;
  name: string;
  description: string;
  images: string[];
  company_id: number;
  start_date: string;
  end_date: string;
  players_number: number;
  full_description?: any;
}

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

export interface TournamentPlayer {
  id: number;
  tournament_id: number;
  player_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  player: Player;
  couple_id: number | null;
}

export interface Couple {
  id: number;
  tournament_id: number;
  first_player_id: number;
  second_player_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  first_player: Player;
  second_player: Player;
}

export interface PlaytomicPlayer {
  user_id: string;
  full_name: string;
  gender: string;
  picture: string;
  additional_data?: Array<{
    level_value: number;
  }>;
}

export type TournamentStatus = 'ended' | 'ongoing' | 'upcoming';
