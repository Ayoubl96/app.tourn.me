import { useState, useMemo } from 'react';
import { StagingMatch } from '@/api/tournaments/types';

export interface MatchFilters {
  status: string[];
  courts: number[];
  groups: number[];
  brackets: number[];
  search: string;
}

export const initialFilters: MatchFilters = {
  status: ['pending', 'completed', 'time_expired', 'forfeited'],
  courts: [],
  groups: [],
  brackets: [],
  search: ''
};

export function useMatchFilters(initialState: MatchFilters = initialFilters) {
  const [filters, setFilters] = useState<MatchFilters>(initialState);

  // Toggle status filter
  const toggleStatusFilter = (status: string) => {
    setFilters((prev) => {
      if (prev.status.includes(status)) {
        return { ...prev, status: prev.status.filter((s) => s !== status) };
      } else {
        return { ...prev, status: [...prev.status, status] };
      }
    });
  };

  // Toggle court filter
  const toggleCourtFilter = (courtId: number) => {
    setFilters((prev) => {
      if (prev.courts.includes(courtId)) {
        return { ...prev, courts: prev.courts.filter((c) => c !== courtId) };
      } else {
        return { ...prev, courts: [...prev.courts, courtId] };
      }
    });
  };

  // Toggle group filter
  const toggleGroupFilter = (groupId: number) => {
    setFilters((prev) => {
      if (prev.groups.includes(groupId)) {
        return { ...prev, groups: prev.groups.filter((g) => g !== groupId) };
      } else {
        return { ...prev, groups: [...prev.groups, groupId] };
      }
    });
  };

  // Toggle bracket filter
  const toggleBracketFilter = (bracketId: number) => {
    setFilters((prev) => {
      if (prev.brackets.includes(bracketId)) {
        return {
          ...prev,
          brackets: prev.brackets.filter((b) => b !== bracketId)
        };
      } else {
        return { ...prev, brackets: [...prev.brackets, bracketId] };
      }
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters(initialFilters);
  };

  // Count of active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status.length < 4) count++; // 4 is the total number of possible statuses
    if (filters.courts.length > 0) count++;
    if (filters.groups.length > 0) count++;
    if (filters.brackets.length > 0) count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

  // Filter matches based on filters
  const filterMatches = (
    matches: StagingMatch[],
    getCoupleName: (id: number) => string,
    getCourtName: (match: StagingMatch) => string,
    getGroupName: (match: StagingMatch) => string
  ) => {
    return matches.filter((match) => {
      // Status filter
      if (!filters.status.includes(match.match_result_status)) {
        return false;
      }

      // Court filter
      if (
        filters.courts.length > 0 &&
        match.court_id &&
        !filters.courts.includes(match.court_id)
      ) {
        return false;
      }

      // Group filter
      if (
        filters.groups.length > 0 &&
        match.group_id &&
        !filters.groups.includes(match.group_id)
      ) {
        return false;
      }

      // Bracket filter
      if (
        filters.brackets.length > 0 &&
        match.bracket_id &&
        !filters.brackets.includes(match.bracket_id)
      ) {
        return false;
      }

      // Search filter (match number, couple names)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchIdStr = match.id.toString();
        const couple1Name = getCoupleName(match.couple1_id).toLowerCase();
        const couple2Name = getCoupleName(match.couple2_id).toLowerCase();
        const courtName = getCourtName(match).toLowerCase();
        const groupName = getGroupName(match).toLowerCase();

        return (
          matchIdStr.includes(searchLower) ||
          couple1Name.includes(searchLower) ||
          couple2Name.includes(searchLower) ||
          courtName.includes(searchLower) ||
          groupName.includes(searchLower)
        );
      }

      return true;
    });
  };

  return {
    filters,
    setFilters,
    toggleStatusFilter,
    toggleCourtFilter,
    toggleGroupFilter,
    toggleBracketFilter,
    clearFilters,
    activeFilterCount,
    filterMatches
  };
}
