import { useCallback, useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import {
  fetchTournamentStages,
  fetchStageGroups,
  fetchStageBrackets,
  fetchGroupStandings,
  fetchGroupCouples,
  createTournamentStage,
  createTournamentGroup,
  createTournamentBracket,
  updateTournamentStage,
  updateTournamentGroup,
  updateTournamentBracket,
  deleteTournamentStage,
  deleteTournamentGroup,
  deleteTournamentBracket,
  addCoupleToGroup,
  removeCoupleFromGroup,
  autoAssignCouples,
  generateGroupMatches,
  generateBracketMatches,
  scheduleMatch,
  unscheduleMatch,
  autoScheduleMatches,
  fetchCourtAvailability
} from '@/api/tournaments/api';
import {
  TournamentStage,
  TournamentGroup,
  TournamentBracket,
  GroupCouple,
  GroupStandingsResponse,
  StageConfig,
  CreateTournamentStageParams,
  CreateTournamentGroupParams,
  CreateTournamentBracketParams,
  StageType,
  BracketType,
  CourtAvailability,
  StagingMatch,
  AutoAssignCouplesParams,
  ScheduleMatchParams,
  AutoScheduleMatchesParams
} from '@/api/tournaments/types';
import { toast } from 'sonner';

interface UseTournamentStagingOptions {
  tournamentId: string | number;
  autoLoad?: boolean;
}

export const useTournamentStaging = ({
  tournamentId,
  autoLoad = true
}: UseTournamentStagingOptions) => {
  const callApi = useApi();

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stages, setStages] = useState<TournamentStage[]>([]);
  const [selectedStage, setSelectedStage] = useState<TournamentStage | null>(
    null
  );
  const [groups, setGroups] = useState<TournamentGroup[]>([]);
  const [brackets, setBrackets] = useState<TournamentBracket[]>([]);
  const [groupStandings, setGroupStandings] = useState<
    Record<number, GroupStandingsResponse>
  >({});
  const [groupCouples, setGroupCouples] = useState<
    Record<number, GroupCouple[]>
  >({});
  const [isCreatingStage, setIsCreatingStage] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isCreatingBracket, setIsCreatingBracket] = useState(false);
  const [isGeneratingMatches, setIsGeneratingMatches] = useState(false);
  const [isSchedulingMatches, setIsSchedulingMatches] = useState(false);
  const [courtAvailability, setCourtAvailability] = useState<
    CourtAvailability[]
  >([]);
  const [createStageSidebarOpen, setCreateStageSidebarOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [stageToDelete, setStageToDelete] = useState<TournamentStage | null>(
    null
  );
  const [createGroupDialogOpen, setCreateGroupDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<TournamentGroup | null>(
    null
  );
  const [deleteGroupConfirmOpen, setDeleteGroupConfirmOpen] = useState(false);

  // Fetch stages
  const fetchStages = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchTournamentStages(callApi, tournamentId);
      setStages(data);
      if (data.length > 0 && !selectedStage) {
        setSelectedStage(data[0]);
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stages');
      toast.error('Failed to load tournament stages');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [callApi, tournamentId, selectedStage]);

  // Call fetchStages on initial load
  useEffect(() => {
    if (autoLoad && tournamentId) {
      fetchStages();
    }
  }, [autoLoad, tournamentId, fetchStages]);

  // Load groups for a stage
  const loadGroups = useCallback(
    async (stageId: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchStageGroups(callApi, stageId);
        setGroups(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load groups');
        toast.error('Failed to load stage groups');
      } finally {
        setIsLoading(false);
      }
    },
    [callApi]
  );

  // Load brackets for a stage
  const loadBrackets = useCallback(
    async (stageId: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchStageBrackets(callApi, stageId);
        setBrackets(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load brackets'
        );
        toast.error('Failed to load stage brackets');
      } finally {
        setIsLoading(false);
      }
    },
    [callApi]
  );

  // Load group standings
  const loadGroupStandings = useCallback(
    async (groupId: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchGroupStandings(callApi, groupId);
        setGroupStandings((prev) => ({
          ...prev,
          [groupId]: data
        }));
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load standings'
        );
        toast.error('Failed to load group standings');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi]
  );

  // Load couples in a group
  const loadGroupCouples = useCallback(
    async (groupId: number) => {
      setIsLoading(true);
      setError(null);
      try {
        // The API returns full couple objects, not just the couple_id references
        const data = await fetchGroupCouples(callApi, groupId);

        // Store the data as-is since it already contains full couple information
        setGroupCouples((prev) => ({
          ...prev,
          [groupId]: data
        }));
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load group couples'
        );
        toast.error('Failed to load couples in group');
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [callApi]
  );

  // Create a new stage
  const handleCreateStage = useCallback(
    async (name: string, stageType: StageType, config: StageConfig) => {
      setIsCreatingStage(true);
      setError(null);
      try {
        const stageParams: CreateTournamentStageParams = {
          tournament_id: Number(tournamentId),
          name,
          stage_type: stageType,
          order: stages.length + 1,
          config
        };

        const newStage = await createTournamentStage(callApi, stageParams);
        setStages((prev) => [...prev, newStage]);
        toast.success(`Stage "${name}" created successfully`);
        return newStage;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create stage');
        toast.error('Failed to create stage');
        return null;
      } finally {
        setIsCreatingStage(false);
      }
    },
    [callApi, tournamentId, stages]
  );

  // Update an existing stage
  const handleUpdateStage = useCallback(
    async (stageId: number, updates: Partial<TournamentStage>) => {
      setIsLoading(true);
      setError(null);
      try {
        const updatedStage = await updateTournamentStage(
          callApi,
          stageId,
          updates
        );
        setStages((prev) =>
          prev.map((stage) => (stage.id === stageId ? updatedStage : stage))
        );

        if (selectedStage?.id === stageId) {
          setSelectedStage(updatedStage);
        }

        toast.success('Stage updated successfully');
        return updatedStage;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update stage');
        toast.error('Failed to update stage');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, selectedStage]
  );

  // Delete a stage
  const handleDeleteStage = useCallback(
    async (stageId: number) => {
      setIsLoading(true);
      setError(null);
      try {
        await deleteTournamentStage(callApi, stageId);
        setStages((prev) => prev.filter((stage) => stage.id !== stageId));

        if (selectedStage?.id === stageId) {
          setSelectedStage(
            stages.length > 1
              ? stages.find((s) => s.id !== stageId) || null
              : null
          );
        }

        toast.success('Stage deleted successfully');
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete stage');
        toast.error('Failed to delete stage');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, selectedStage, stages]
  );

  // Create a new group
  const handleCreateGroup = useCallback(
    async (stageId: number, name: string) => {
      setIsCreatingGroup(true);
      setError(null);
      try {
        const groupParams: CreateTournamentGroupParams = {
          stage_id: stageId,
          name
        };

        const newGroup = await createTournamentGroup(callApi, groupParams);
        setGroups((prev) => [...prev, newGroup]);
        toast.success(`Group "${name}" created successfully`);
        return newGroup;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create group');
        toast.error('Failed to create group');
        return null;
      } finally {
        setIsCreatingGroup(false);
      }
    },
    [callApi]
  );

  // Update a group
  const handleUpdateGroup = useCallback(
    async (groupId: number, name: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const updatedGroup = await updateTournamentGroup(callApi, groupId, {
          name
        });
        setGroups((prev) =>
          prev.map((group) => (group.id === groupId ? updatedGroup : group))
        );
        toast.success('Group updated successfully');
        return updatedGroup;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update group');
        toast.error('Failed to update group');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi]
  );

  // Delete a group
  const handleDeleteGroup = useCallback(
    async (groupId: number) => {
      setIsLoading(true);
      setError(null);
      try {
        await deleteTournamentGroup(callApi, groupId);
        setGroups((prev) => prev.filter((group) => group.id !== groupId));
        toast.success('Group deleted successfully');
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete group');
        toast.error('Failed to delete group');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi]
  );

  // Create a bracket
  const handleCreateBracket = useCallback(
    async (stageId: number, bracketType: BracketType) => {
      setIsCreatingBracket(true);
      setError(null);
      try {
        const bracketParams: CreateTournamentBracketParams = {
          stage_id: stageId,
          bracket_type: bracketType
        };

        const newBracket = await createTournamentBracket(
          callApi,
          bracketParams
        );
        setBrackets((prev) => [...prev, newBracket]);
        toast.success(
          `${bracketType.charAt(0).toUpperCase() + bracketType.slice(1)} bracket created successfully`
        );
        return newBracket;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to create bracket'
        );
        toast.error('Failed to create bracket');
        return null;
      } finally {
        setIsCreatingBracket(false);
      }
    },
    [callApi]
  );

  // Update a bracket
  const handleUpdateBracket = useCallback(
    async (bracketId: number, bracketType: BracketType) => {
      setIsLoading(true);
      setError(null);
      try {
        const updatedBracket = await updateTournamentBracket(
          callApi,
          bracketId,
          { bracket_type: bracketType }
        );
        setBrackets((prev) =>
          prev.map((bracket) =>
            bracket.id === bracketId ? updatedBracket : bracket
          )
        );
        toast.success('Bracket updated successfully');
        return updatedBracket;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update bracket'
        );
        toast.error('Failed to update bracket');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi]
  );

  // Delete a bracket
  const handleDeleteBracket = useCallback(
    async (bracketId: number) => {
      setIsLoading(true);
      setError(null);
      try {
        await deleteTournamentBracket(callApi, bracketId);
        setBrackets((prev) =>
          prev.filter((bracket) => bracket.id !== bracketId)
        );
        toast.success('Bracket deleted successfully');
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to delete bracket'
        );
        toast.error('Failed to delete bracket');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi]
  );

  // Add couple to group
  const handleAddCoupleToGroup = useCallback(
    async (groupId: number, coupleId: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = { group_id: groupId, couple_id: coupleId };

        // Validate the couple_id before sending to API
        if (coupleId === undefined || coupleId === null) {
          throw new Error('Invalid couple ID');
        }

        const newGroupCouple = await addCoupleToGroup(callApi, params);

        // Validate the response data
        if (!newGroupCouple.couple_id) {
          console.error(
            'API returned invalid group couple data:',
            newGroupCouple
          );
          throw new Error('Invalid data received from server');
        }

        // Update group couples state
        setGroupCouples((prev) => {
          const couples = prev[groupId] || [];
          return {
            ...prev,
            [groupId]: [...couples, newGroupCouple]
          };
        });

        toast.success('Couple added to group successfully');
        return newGroupCouple;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to add couple to group'
        );
        toast.error('Failed to add couple to group');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi]
  );

  // Remove couple from group
  const handleRemoveCoupleFromGroup = useCallback(
    async (groupId: number, coupleId: number) => {
      setIsLoading(true);
      setError(null);
      try {
        await removeCoupleFromGroup(callApi, groupId, coupleId);

        // Update group couples state
        setGroupCouples((prev) => {
          const couples = prev[groupId] || [];
          return {
            ...prev,
            [groupId]: couples.filter((c) => c.couple_id !== coupleId)
          };
        });

        toast.success('Couple removed from group successfully');
        return true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to remove couple from group'
        );
        toast.error('Failed to remove couple from group');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi]
  );

  // Auto-assign couples to groups
  const handleAutoAssignCouples = useCallback(
    async (stageId: number, method: 'random' | 'balanced') => {
      setIsLoading(true);
      setError(null);
      try {
        const params: AutoAssignCouplesParams = { method };
        await autoAssignCouples(callApi, stageId, params);

        // Refresh all groups for this stage
        await loadGroups(stageId);

        // Refresh all group couples with a delay to ensure API consistency
        setTimeout(async () => {
          const refreshCouples = groups.map((group) =>
            loadGroupCouples(group.id)
          );
          await Promise.all(refreshCouples);
        }, 500);

        toast.success('Couples assigned to groups successfully');
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to auto-assign couples'
        );
        toast.error('Failed to auto-assign couples to groups');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, loadGroups, loadGroupCouples, groups]
  );

  // Generate matches for a group
  const handleGenerateGroupMatches = useCallback(
    async (groupId: number) => {
      setIsGeneratingMatches(true);
      setError(null);
      try {
        await generateGroupMatches(callApi, groupId);
        toast.success('Group matches generated successfully');
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to generate matches'
        );
        toast.error('Failed to generate group matches');
        return false;
      } finally {
        setIsGeneratingMatches(false);
      }
    },
    [callApi]
  );

  // Generate matches for a bracket
  const handleGenerateBracketMatches = useCallback(
    async (bracketId: number, couples?: number[]) => {
      setIsGeneratingMatches(true);
      setError(null);
      try {
        await generateBracketMatches(callApi, bracketId, couples);
        toast.success('Bracket matches generated successfully');
        return true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to generate bracket matches'
        );
        toast.error('Failed to generate bracket matches');
        return false;
      } finally {
        setIsGeneratingMatches(false);
      }
    },
    [callApi]
  );

  // Schedule a match
  const handleScheduleMatch = useCallback(
    async (matchId: number, params: ScheduleMatchParams) => {
      setIsSchedulingMatches(true);
      setError(null);
      try {
        await scheduleMatch(callApi, matchId, params);
        toast.success('Match scheduled successfully');
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to schedule match'
        );
        toast.error('Failed to schedule match');
        return false;
      } finally {
        setIsSchedulingMatches(false);
      }
    },
    [callApi]
  );

  // Unschedule a match
  const handleUnscheduleMatch = useCallback(
    async (matchId: number) => {
      setIsSchedulingMatches(true);
      setError(null);
      try {
        await unscheduleMatch(callApi, matchId);
        toast.success('Match unscheduled successfully');
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to unschedule match'
        );
        toast.error('Failed to unschedule match');
        return false;
      } finally {
        setIsSchedulingMatches(false);
      }
    },
    [callApi]
  );

  // Load court availability
  const handleLoadCourtAvailability = useCallback(
    async (date: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchCourtAvailability(callApi, tournamentId, date);
        setCourtAvailability(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load court availability'
        );
        toast.error('Failed to load court availability');
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, tournamentId]
  );

  // Auto-schedule matches
  const handleAutoScheduleMatches = useCallback(
    async (startDate: string, endDate?: string) => {
      setIsSchedulingMatches(true);
      setError(null);
      try {
        const params: AutoScheduleMatchesParams = {
          start_date: startDate,
          end_date: endDate
        };

        await autoScheduleMatches(callApi, tournamentId, params);
        toast.success('Matches auto-scheduled successfully');
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to auto-schedule matches'
        );
        toast.error('Failed to auto-schedule matches');
        return false;
      } finally {
        setIsSchedulingMatches(false);
      }
    },
    [callApi, tournamentId]
  );

  // Load data when stage selection changes
  useEffect(() => {
    if (selectedStage) {
      loadGroups(selectedStage.id);
      loadBrackets(selectedStage.id);
    }
  }, [selectedStage, loadGroups, loadBrackets]);

  return {
    // Data
    stages,
    selectedStage,
    groups,
    brackets,
    groupStandings,
    groupCouples,
    courtAvailability,

    // Loading states
    isLoading,
    error,
    isCreatingStage,
    isCreatingGroup,
    isCreatingBracket,
    isGeneratingMatches,
    isSchedulingMatches,

    // Actions
    setSelectedStage,
    loadGroups,
    loadBrackets,
    loadGroupStandings,
    loadGroupCouples,
    handleCreateStage,
    handleUpdateStage,
    handleDeleteStage,
    handleCreateGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleCreateBracket,
    handleUpdateBracket,
    handleDeleteBracket,
    handleAddCoupleToGroup,
    handleRemoveCoupleFromGroup,
    handleAutoAssignCouples,
    handleGenerateGroupMatches,
    handleGenerateBracketMatches,
    handleScheduleMatch,
    handleUnscheduleMatch,
    handleAutoScheduleMatches,
    handleLoadCourtAvailability,
    createStageSidebarOpen,
    setCreateStageSidebarOpen,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    stageToDelete,
    setStageToDelete,
    createGroupDialogOpen,
    setCreateGroupDialogOpen,
    groupToDelete,
    setGroupToDelete,
    deleteGroupConfirmOpen,
    setDeleteGroupConfirmOpen
  };
};
