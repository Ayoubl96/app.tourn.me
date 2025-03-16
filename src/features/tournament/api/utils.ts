import { Tournament, TournamentStatus } from './types';

// Helper functions for date formatting and status determination
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getTournamentStatus(tourney: Tournament): TournamentStatus {
  const now = new Date();
  const startDate = new Date(tourney.start_date);
  const endDate = new Date(tourney.end_date);

  if (now < startDate) return 'upcoming';
  if (now > endDate) return 'ended';
  return 'ongoing';
}

// Helper function to get player initials from nickname
export function getInitials(nickname: string): string {
  return nickname
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// Helper function to format player level
export function formatPlayerLevel(level: number): string {
  // Divide by 100 and format with 2 decimal places
  return (level / 100).toFixed(2);
}
