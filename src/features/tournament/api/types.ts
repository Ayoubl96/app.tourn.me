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

// New types for tournament stages

export type StageType = 'group' | 'elimination';
export type StageStatus = 'planned' | 'in_progress' | 'completed';

export interface TournamentStage {
  id: number;
  tournament_id: number;
  name: string;
  description: string;
  stage_type: StageType;
  order: number;
  rules: StageRules;
  status: StageStatus;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface StageRules {
  group_formation?: GroupFormationRules;
  match_scheduling?: MatchSchedulingRules;
  advancement?: AdvancementRules;
  scoring?: ScoringRules;
}

export interface GroupFormationRules {
  method: 'equal_size' | 'by_level' | 'random';
  number_of_groups: number;
  balancing_criteria?: string[];
}

export interface MatchSchedulingRules {
  format: 'round_robin' | 'single_elimination' | 'double_elimination';
  matches_per_couple: number;
}

export interface AdvancementRules {
  top_n_per_group: number;
  tiebreakers: string[];
}

export interface ScoringRules {
  win_points: number;
  draw_points: number;
  loss_points: number;
}

export interface StageGroup {
  id: number;
  stage_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface StageGroupCouple {
  id: number;
  group_id: number;
  couple_id: number;
  created_at: string;
  updated_at: string;
}

export interface StageCoupleStats {
  id: number;
  stage_id: number;
  couple_id: number;
  group_id: number | null;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  matches_drawn: number;
  games_won: number;
  games_lost: number;
  total_points: number;
  position: number | null;
  last_updated: string;
}

export interface Match {
  id: number;
  tournament_id: number;
  stage_id: number;
  group_id: number | null;
  couple1_id: number;
  couple2_id: number;
  winner_couple_id: number | null;
  court_id: number | null;
  match_date: string | null;
  match_duration: number | null;
  games: MatchGames | null;
  bracket_position: string | null;
  created_at: string;
  updated_at: string;
  couple1?: Couple;
  couple2?: Couple;
  winner?: Couple;
  stage?: TournamentStage;
  group?: StageGroup;
  court?: Court;
}

export type MatchGames =
  | Array<{ set: number; couple1: number; couple2: number }>
  | { sets: Array<{ set: number; couple1: number; couple2: number }> };

export interface StageStatsResponse {
  status: StageStatus;
  matches_total: number;
  matches_completed: number;
  completion_percentage: number;
  groups?: {
    id: number;
    name: string;
    matches_completed: number;
    matches_total: number;
  }[];
  can_advance: boolean;
  message: string;
}

export interface Court {
  id: number;
  name: string;
  images: string[];
  company_id: number;
  created_at: string;
  updated_at: string;
}
