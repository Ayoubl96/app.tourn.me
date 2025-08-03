// Dashboard API Response Types

export interface DashboardResponse {
  tournament_management: TournamentManagementOverview;
  real_time_progress: RealTimeTournamentProgress;
  match_court_analytics: MatchCourtAnalytics;
  player_performance: PlayerCouplePerformance;
  operational_dashboard: OperationalDashboard;
  generated_at: string; // ISO datetime
}

// Tournament Management Overview
export interface TournamentManagementOverview {
  active_tournaments: number;
  upcoming_tournaments: number;
  completed_this_month: number;
  total_registered_players: number;
  player_change: number;
  player_change_percentage: number;
  matches_played_today: number;
  pending_matches: number;
  court_utilization_rate: number;
  tournament_timeline: TournamentTimelineItem[];
}

export interface TournamentTimelineItem {
  id: number;
  name: string;
  start_date: string; // ISO date
  end_date: string; // ISO date
  players_number: number;
  status: 'active' | 'upcoming' | 'completed';
}

// Real-Time Tournament Progress
export interface RealTimeTournamentProgress {
  tournament_progress: TournamentProgress[];
  match_status_distribution: MatchStatusDistribution;
  top_performing_couples: TopCouple[];
}

export interface TournamentProgress {
  tournament_id: number;
  tournament_name: string;
  completion_percentage: number; // 0-100
  total_matches: number;
  completed_matches: number;
  stages_progress: StageProgress[];
}

export interface StageProgress {
  stage_id: number;
  stage_name: string;
  stage_type: 'group' | 'elimination';
  completion_percentage: number;
  order: number;
}

export interface MatchStatusDistribution {
  scheduled: number;
  in_progress: number;
  completed: number;
  pending: number;
}

export interface TopCouple {
  couple_id: number;
  couple_name: string;
  tournament_name: string;
  matches_played: number;
  matches_won: number;
  win_rate: number; // 0-100 percentage
  total_points: number;
}

// Match & Court Analytics
export interface MatchCourtAnalytics {
  matches_per_day_30d: Record<string, number>; // date -> count
  average_match_duration_minutes: number;
  court_efficiency_matches_per_court_per_day: number;
  peak_playing_hours: Record<string, number>; // hour -> count
  match_results_distribution: MatchResultsDistribution;
}

export interface MatchResultsDistribution {
  wins: number;
  draws: number;
  time_expired: number;
  forfeited: number;
}

// Player & Couple Performance
export interface PlayerCouplePerformance {
  most_active_players: ActivePlayer[];
  best_performing_couples: PerformingCouple[];
  player_level_distribution: Record<string, number>; // level -> count
  player_registration_trends: PlayerRegistrationTrends;
}

export interface ActivePlayer {
  player_id: number;
  name: string;
  tournament_count: number;
}

export interface PerformingCouple {
  couple_id: number;
  couple_name: string;
  tournament_name: string;
  matches_played: number;
  win_rate: number;
  total_points: number;
}

export interface PlayerRegistrationTrends {
  current_month: number;
  last_month: number;
  change: number;
}

// Operational Dashboard
export interface OperationalDashboard {
  upcoming_matches_24h: UpcomingMatch[];
  court_conflicts: CourtConflict[];
  incomplete_match_results: number;
  tournament_deadlines: TournamentDeadline[];
  system_alerts: SystemAlerts;
}

export interface UpcomingMatch {
  match_id: number;
  tournament_name: string;
  couple1_name: string;
  couple2_name: string;
  scheduled_start: string | null; // ISO datetime
  court_name: string | null;
}

export interface CourtConflict {
  court_name: string;
  conflict_matches: ConflictMatch[];
}

export interface ConflictMatch {
  match_id: number;
  tournament: string;
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
}

export interface TournamentDeadline {
  tournament_id: number;
  tournament_name: string;
  end_date: string; // ISO datetime
  days_remaining: number;
}

export interface SystemAlerts {
  court_conflicts: number;
  incomplete_matches: number;
  upcoming_deadlines: number;
  matches_next_24h: number;
}
