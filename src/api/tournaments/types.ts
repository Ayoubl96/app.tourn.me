import { Player } from '@/api/players/types';

/**
 * Tournament entity type
 */
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

/**
 * Tournament player relationship
 */
export interface TournamentPlayer {
  tournament_id: number;
  player_id: number;
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  player: Player;
}

/**
 * Couple entity type
 */
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

/**
 * Tournament status types
 */
export type TournamentStatus = 'ended' | 'ongoing' | 'upcoming';

/**
 * Tournament creation parameters
 */
export interface CreateTournamentParams {
  name: string;
  description: string;
  full_description?: any;
  players_number?: number;
  start_date?: string;
  end_date?: string;
  images?: string[];
}

/**
 * Tournament update parameters
 */
export interface UpdateTournamentParams
  extends Partial<CreateTournamentParams> {}

/**
 * Couple creation parameters
 */
export interface CreateCoupleParams {
  first_player_id: number;
  second_player_id: number;
  name: string;
}

/**
 * Couple update parameters
 */
export interface UpdateCoupleParams extends Partial<CreateCoupleParams> {}

/**
 * Tournament Court type
 */
export interface TournamentCourt {
  id: number;
  court_id: number;
  tournament_id: number;
  availability_start: string;
  availability_end: string;
  created_at: string;
  updated_at: string;
  court: {
    id: number;
    name: string;
    size: number;
    active: boolean;
    images: string[];
  };
}

/**
 * Add Court to Tournament params
 */
export interface AddCourtToTournamentParams {
  court_id: number;
  availability_start: string;
  availability_end: string;
}

/**
 * Update Tournament Court params
 */
export interface UpdateTournamentCourtParams {
  availability_start: string;
  availability_end: string;
}

/**
 * Tournament Stage Types
 */
export type StageType = 'group' | 'elimination';
export type BracketType = 'main' | 'silver' | 'bronze';
export type ScoringType = 'points' | 'games' | 'both';
export type WinCriteria = 'best_of' | 'all_games' | 'time_based';
export type SchedulingPriority = 'court_efficiency' | 'player_rest';
export type TiebreakerMethod =
  | 'points'
  | 'head_to_head'
  | 'games_diff'
  | 'games_won'
  | 'matches_won';
export type MatchResultStatus =
  | 'pending'
  | 'completed'
  | 'time_expired'
  | 'forfeited';

/**
 * Tournament Stage entity
 */
export interface TournamentStage {
  id: number;
  tournament_id: number;
  name: string;
  stage_type: StageType;
  order: number;
  config: StageConfig;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * Tournament Stage Configuration
 */
export interface StageConfig {
  scoring_system: ScoringSystem;
  match_rules: MatchRules;
  advancement_rules: AdvancementRules;
  scheduling: SchedulingOptions;
}

/**
 * Scoring System Configuration
 */
export interface ScoringSystem {
  type: ScoringType;
  win: number;
  draw: number;
  loss: number;
  game_win: number;
  game_loss: number;
}

/**
 * Match Rules Configuration
 */
export interface MatchRules {
  matches_per_opponent: number;
  games_per_match: number;
  win_criteria: WinCriteria;
  time_limited: boolean;
  time_limit_minutes: number;
  break_between_matches: number;
}

/**
 * Advancement Rules Configuration
 */
export interface AdvancementRules {
  top_n: number;
  to_bracket: BracketType;
  tiebreaker: TiebreakerMethod[];
}

/**
 * Scheduling Options Configuration
 */
export interface SchedulingOptions {
  auto_schedule: boolean;
  overlap_allowed: boolean;
  scheduling_priority: SchedulingPriority;
}

/**
 * Tournament Group entity
 */
export interface TournamentGroup {
  id: number;
  stage_id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * Tournament Bracket entity
 */
export interface TournamentBracket {
  id: number;
  stage_id: number;
  bracket_type: BracketType;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * Group Couple Assignment entity
 */
export interface GroupCouple {
  id: number;
  group_id: number;
  couple_id: number;
  created_at: string;
  updated_at: string;
}

/**
 * Group Standings entity
 */
export interface GroupStanding {
  couple_id: number;
  couple_name: string;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  matches_drawn: number;
  games_won: number;
  games_lost: number;
  total_points: number;
  games_diff: number;
  position: number;
}

/**
 * Group Standings Response
 */
export interface GroupStandingsResponse {
  group_id: number;
  group_name: string;
  standings: GroupStanding[];
}

/**
 * Tournament Match with staging information
 */
export interface StagingMatch {
  id: number;
  tournament_id: number;
  couple1_id: number;
  couple2_id: number;
  winner_couple_id: number | null;
  games: MatchGame[];
  stage_id: number;
  group_id: number | null;
  bracket_id: number | null;
  court_id: number | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  is_time_limited: boolean;
  time_limit_minutes: number | null;
  match_result_status: MatchResultStatus;
  // New ordering fields from intelligent match ordering system
  display_order: number | null;
  order_in_stage: number | null;
  order_in_group: number | null;
  bracket_position: number | null;
  round_number: number | null;
  priority_score: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Match Game entity
 */
export interface MatchGame {
  game_number: number;
  couple1_score: number;
  couple2_score: number;
  winner_id: number | null;
  duration_minutes: number | null;
}

/**
 * Court Availability entity
 */
export interface CourtAvailability {
  court_id: number;
  court_name: string;
  day_availability: {
    start: string;
    end: string;
  };
  scheduled_matches: {
    match_id: number;
    start: string;
    end: string;
    couple1_id: number;
    couple2_id: number;
  }[];
  free_slots: {
    start: string;
    end: string;
  }[];
}

/**
 * Create Tournament Stage params
 */
export interface CreateTournamentStageParams {
  tournament_id: number;
  name: string;
  stage_type: StageType;
  order: number;
  config: StageConfig;
}

/**
 * Update Tournament Stage params
 */
export interface UpdateTournamentStageParams
  extends Partial<Omit<CreateTournamentStageParams, 'tournament_id'>> {}

/**
 * Create Tournament Group params
 */
export interface CreateTournamentGroupParams {
  stage_id: number;
  name: string;
}

/**
 * Update Tournament Group params
 */
export interface UpdateTournamentGroupParams {
  name: string;
}

/**
 * Create Tournament Bracket params
 */
export interface CreateTournamentBracketParams {
  stage_id: number;
  bracket_type: BracketType;
}

/**
 * Update Tournament Bracket params
 */
export interface UpdateTournamentBracketParams {
  bracket_type: BracketType;
}

/**
 * Add Couple to Group params
 */
export interface AddCoupleToGroupParams {
  group_id: number;
  couple_id: number;
}

/**
 * Schedule Match params
 */
export interface ScheduleMatchParams {
  court_id: number;
  start_time: string;
  end_time?: string;
  is_time_limited?: boolean;
  time_limit_minutes?: number;
}

/**
 * Auto-assign Couples params
 */
export interface AutoAssignCouplesParams {
  method: 'random' | 'balanced';
}

/**
 * Auto-schedule Matches params
 */
export interface AutoScheduleMatchesParams {
  start_date: string;
  end_date?: string;
}

/**
 * Tournament Standings Stats entity
 */
export interface TournamentStandingStat {
  tournament_id: number;
  couple_id: number;
  group_id: number;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  matches_drawn: number;
  games_won: number;
  games_lost: number;
  total_points: number;
  id: number;
  last_updated: string;
  couple: {
    id: number;
    tournament_id: number;
    first_player_id: number;
    second_player_id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    name: string;
  };
  games_diff: number;
  win_percentage: number;
  position: number;
}

/**
 * Tournament Standings Response
 */
export interface TournamentStandingsResponse {
  tournament_id: number;
  tournament_name: string;
  group_id: number;
  group_name: string;
  stats: TournamentStandingStat[];
  last_updated: string;
}

/**
 * Match Ordering Strategy types
 */
export type MatchOrderingStrategy =
  | 'balanced_load'
  | 'court_efficient'
  | 'time_sequential'
  | 'group_clustered';

/**
 * Tournament Match Order Info Response (Enhanced)
 */
export interface TournamentMatchOrderInfo {
  tournament_id: number;
  tournament_name: string;
  progress_percentage: number;

  // Dynamic match categorization (updates as matches complete)
  live_matches: StagingMatch[];
  next_matches: StagingMatch[];
  all_pending_matches: StagingMatch[];
  completed_matches_by_stage: Record<string, StagingMatch[]>;

  // Comprehensive progress tracking
  quick_stats: {
    matches_in_progress: number;
    matches_waiting: number;
    matches_remaining: number;
    matches_completed: number;
    estimated_completion: string;
  };

  // Enhanced court and stage information
  courts: any[]; // Detailed court info with availability
  stages: any[]; // Complete stage configuration

  // Legacy fields for backward compatibility
  total_matches: number;
  pending_matches: number;
  completed_matches: number;
  total_courts: number;
  total_stages: number;
  current_strategy: MatchOrderingStrategy | null;
  last_calculated: string | null;
  last_updated: string;
}

/**
 * Calculate Match Order Request
 */
export interface CalculateMatchOrderRequest {
  strategy: MatchOrderingStrategy;
  force_recalculate?: boolean;
}

/**
 * Calculate Match Order Response
 */
export interface CalculateMatchOrderResponse {
  success: boolean;
  total_matches_ordered: number;
  strategy_used: MatchOrderingStrategy;
  calculation_time_ms: number;
  message: string;
}
