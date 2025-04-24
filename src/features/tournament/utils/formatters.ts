import { Tournament } from '../types';

// Format date to display in a readable format
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Format time to display in a readable format
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Get tournament status based on start and end dates
export function getTournamentStatus(
  tourney: Tournament
): 'ended' | 'ongoing' | 'upcoming' {
  const now = new Date();
  const startDate = new Date(tourney.start_date);
  const endDate = new Date(tourney.end_date);

  if (now < startDate) return 'upcoming';
  if (now > endDate) return 'ended';
  return 'ongoing';
}

// Extract initials from a name
export function getInitials(nickname: string | undefined | null): string {
  if (!nickname) {
    return 'NA';
  }

  return nickname
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// Format player level to display with decimal point
export function formatPlayerLevel(level: number): string {
  // Divide by 100 and format with 2 decimal places
  return (level / 100).toFixed(2);
}
