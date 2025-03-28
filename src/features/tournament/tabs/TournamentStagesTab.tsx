import React, { useState, useEffect } from 'react';
import { Users, Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

import { useTournament } from '@/features/tournament/context/TournamentContext';
import {
  TournamentStage,
  StageGroup,
  Match,
  StageStatsResponse,
  Couple
} from '@/features/tournament/api/types';
import { StageCard } from '@/features/tournament/components/StageCard';
import { StageForm } from '@/features/tournament/components/StageForm';
import { MatchCard } from '@/features/tournament/components/MatchCard';

// Import API functions
import {
  fetchTournamentStages,
  createStage,
  updateStage,
  deleteStage,
  fetchStageGroups,
  formGroups,
  generateMatches,
  fetchStageMatches,
  updateMatchResult,
  advanceToNextStage,
  fetchStageStats,
  checkStageStatus,
  fetchGroupCouples,
  deleteAllStageMatches,
  deleteGroup,
  deleteMatch,
  removeCoupleFromGroup,
  addCoupleToGroup,
  fetchTournamentCouples
} from '@/features/tournament/api/tournamentApi';

interface TournamentStagesTabProps {
  t: (key: string, params?: Record<string, any>) => string;
  commonT: (key: string, params?: Record<string, any>) => string;
}

// Extended StageGroup type with couples for rendering
interface StageGroupWithCouples extends StageGroup {
  couples: Array<{
    id: number;
    player1?: {
      id?: number;
      nickname?: string;
      name?: string;
      level?: number;
    };
    player2?: {
      id?: number;
      nickname?: string;
      name?: string;
      level?: number;
    };
  }>;
}

// Interface for the API response that includes group_couples
interface StageGroupWithApiCouples extends StageGroup {
  group_couples?: Array<{
    id: number;
    couple_id: number;
    group_id: number;
    created_at: string;
    couple?: {
      id: number;
      name?: string;
      first_player?: {
        id: number;
        nickname?: string;
        name?: string;
        level?: number;
      };
      second_player?: {
        id: number;
        nickname?: string;
        name?: string;
        level?: number;
      };
    };
  }>;
}

export default function TournamentStagesTab({
  t,
  commonT
}: TournamentStagesTabProps) {
  const callApi = useApi();
  const { tournamentId, tournament } = useTournament();

  // Stage management states
  const [stages, setStages] = useState<TournamentStage[]>([]);
  const [loadingStages, setLoadingStages] = useState(false);
  const [isStageFormOpen, setIsStageFormOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<TournamentStage | undefined>(
    undefined
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [stageToDelete, setStageToDelete] = useState<number | null>(null);
  const [deletingStage, setDeletingStage] = useState(false);

  // Stage management states
  const [selectedStage, setSelectedStage] = useState<TournamentStage | null>(
    null
  );
  const [isManagingStage, setIsManagingStage] = useState(false);
  const [stageGroups, setStageGroups] = useState<StageGroupWithCouples[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [formingGroups, setFormingGroups] = useState(false);
  const [generatingMatches, setGeneratingMatches] = useState(false);

  // Match management states
  const [stageMatches, setStageMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [updatingMatch, setUpdatingMatch] = useState(false);
  const [advancingStage, setAdvancingStage] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [stageStats, setStageStats] = useState<StageStatsResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Add a new state for group deletion
  const [deletingGroupId, setDeletingGroupId] = useState<number | null>(null);

  // Add a state for tracking the match being deleted
  const [deletingMatchId, setDeletingMatchId] = useState<number | null>(null);

  // Add state variables for the confirmation dialogs
  const [showDeleteGroupDialog, setShowDeleteGroupDialog] = useState(false);
  const [showDeleteMatchDialog, setShowDeleteMatchDialog] = useState(false);
  const [
    showDeleteStageWithDependenciesDialog,
    setShowDeleteStageWithDependenciesDialog
  ] = useState(false);
  const [
    showDeleteGroupWithMatchesDialog,
    setShowDeleteGroupWithMatchesDialog
  ] = useState(false);
  const [stageWithDependenciesToDelete, setStageWithDependenciesToDelete] =
    useState<number | null>(null);
  const [groupWithMatchesToDelete, setGroupWithMatchesToDelete] = useState<
    number | null
  >(null);
  const [matchToDelete, setMatchToDelete] = useState<number | null>(null);

  // Add state for the form groups dialog
  const [showFormGroupsDialog, setShowFormGroupsDialog] = useState(false);
  const [groupDistributionType, setGroupDistributionType] = useState<
    'equal_size' | 'by_level' | 'random'
  >('equal_size');
  const [numberOfGroups, setNumberOfGroups] = useState(2);

  // States for adding a couple to a group
  const [showAddCoupleDialog, setShowAddCoupleDialog] = useState(false);
  const [selectedGroupForAddCouple, setSelectedGroupForAddCouple] = useState<
    number | null
  >(null);
  const [availableCouples, setAvailableCouples] = useState<Couple[]>([]);
  const [selectedCoupleId, setSelectedCoupleId] = useState<number | null>(null);
  const [loadingAvailableCouples, setLoadingAvailableCouples] = useState(false);
  const [addingCouple, setAddingCouple] = useState(false);

  // Load tournament stages when component mounts
  useEffect(() => {
    if (tournament) {
      loadTournamentStages();
    }
  }, [tournament]);

  // Load stage groups when a stage is selected
  useEffect(() => {
    if (selectedStage) {
      loadStageGroups();
      loadStageMatches();
      checkStageProgress();
    }
  }, [selectedStage]);

  // Load tournament stages
  const loadTournamentStages = async () => {
    try {
      setLoadingStages(true);
      const data = await fetchTournamentStages(callApi, tournamentId);
      setStages(data);
    } catch (error) {
      console.error('Error fetching tournament stages:', error);
      toast.error(t('failedLoadStages'));
    } finally {
      setLoadingStages(false);
    }
  };

  // Load stage groups
  const loadStageGroups = async () => {
    if (!selectedStage) return;

    try {
      setLoadingGroups(true);
      // Cast the API response to the interface that includes group_couples
      const groups = (await fetchStageGroups(
        callApi,
        tournamentId,
        selectedStage.id
      )) as StageGroupWithApiCouples[];

      // Process groups with their included couples data
      const groupsWithCouples: StageGroupWithCouples[] = groups.map((group) => {
        // Check if group_couples exists in the response
        if (group.group_couples && Array.isArray(group.group_couples)) {
          return {
            ...group,
            couples: group.group_couples.map(
              (gc: {
                id: number;
                couple_id: number;
                group_id: number;
                created_at: string;
                couple?: {
                  id: number;
                  name?: string;
                  first_player?: {
                    id: number;
                    nickname?: string;
                    name?: string;
                    level?: number;
                  };
                  second_player?: {
                    id: number;
                    nickname?: string;
                    name?: string;
                    level?: number;
                  };
                };
              }) => ({
                id: gc.couple?.id || 0,
                player1: {
                  id: gc.couple?.first_player?.id,
                  nickname: gc.couple?.first_player?.nickname || 'Unknown',
                  name: gc.couple?.first_player?.name || '',
                  level: (gc.couple?.first_player?.level || 0) / 100
                },
                player2: {
                  id: gc.couple?.second_player?.id,
                  nickname: gc.couple?.second_player?.nickname || 'Unknown',
                  name: gc.couple?.second_player?.name || '',
                  level: (gc.couple?.second_player?.level || 0) / 100
                }
              })
            )
          };
        } else {
          // Fallback to the old method for backwards compatibility
          return {
            ...group,
            couples: []
          };
        }
      });

      // For groups that don't have couples data, fetch them separately (backwards compatibility)
      const finalGroupsWithCouples = await Promise.all(
        groupsWithCouples.map(async (group) => {
          if (group.couples.length === 0) {
            try {
              const couples = await fetchGroupCouples(
                callApi,
                tournamentId,
                selectedStage.id,
                group.id
              );
              return {
                ...group,
                couples: couples.map((couple) => ({
                  id: couple.id,
                  player1: {
                    id: couple.first_player?.id,
                    nickname: couple.first_player?.nickname || 'Unknown',
                    name: couple.first_player?.name || '',
                    level: (couple.first_player?.level || 0) / 100
                  },
                  player2: {
                    id: couple.second_player?.id,
                    nickname: couple.second_player?.nickname || 'Unknown',
                    name: couple.second_player?.name || '',
                    level: (couple.second_player?.level || 0) / 100
                  }
                }))
              };
            } catch (error) {
              console.error(
                `Error fetching couples for group ${group.id}:`,
                error
              );
              return group;
            }
          }
          return group;
        })
      );

      setStageGroups(finalGroupsWithCouples);
    } catch (error) {
      console.error('Error fetching stage groups:', error);
      toast.error(t('failedLoadGroups'));
    } finally {
      setLoadingGroups(false);
    }
  };

  // Load stage matches
  const loadStageMatches = async () => {
    if (!selectedStage) return;

    try {
      setLoadingMatches(true);
      const data = await fetchStageMatches(
        callApi,
        tournamentId,
        selectedStage.id,
        selectedGroupId || undefined
      );
      setStageMatches(data);
    } catch (error) {
      console.error('Error fetching stage matches:', error);
      toast.error(t('failedLoadMatches'));
    } finally {
      setLoadingMatches(false);
    }
  };

  // Check stage progress
  const checkStageProgress = async () => {
    if (!selectedStage) return;

    try {
      setLoadingStats(true);
      const data = await checkStageStatus(
        callApi,
        tournamentId,
        selectedStage.id
      );
      setStageStats(data);
    } catch (error) {
      console.error('Error fetching stage stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Function to handle opening the stage form for creation
  const handleOpenStageForm = () => {
    setEditingStage(undefined);
    setIsStageFormOpen(true);
  };

  // Function to handle opening the stage form for editing
  const handleEditStage = (stage: TournamentStage) => {
    setEditingStage(stage);
    setIsStageFormOpen(true);
  };

  // Function to handle stage creation/update completion
  const handleStageFormComplete = async (
    stageData: Partial<TournamentStage>
  ) => {
    try {
      if (editingStage) {
        // Update existing stage
        await updateStage(callApi, tournamentId, editingStage.id, stageData);
        toast.success(t('stageUpdated'));
      } else {
        // Create new stage
        await createStage(callApi, tournamentId, stageData as any);
        toast.success(t('stageCreated'));
      }
      setIsStageFormOpen(false);
      loadTournamentStages();
    } catch (error) {
      console.error('Error saving stage:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : editingStage
            ? t('failedUpdateStage')
            : t('failedCreateStage')
      );
    }
  };

  // Function to initiate stage deletion
  const handleDeleteStage = (stageId: number) => {
    setStageToDelete(stageId);
    setShowDeleteDialog(true);
  };

  // Function to confirm and execute stage deletion
  const confirmDeleteStage = async () => {
    if (!stageToDelete) return;

    setDeletingStage(true);
    try {
      // First try to delete the stage directly
      await deleteStage(callApi, tournamentId!, stageToDelete);

      // If successful, update UI and show success message
      setStages((prevStages) =>
        prevStages.filter((s) => s.id !== stageToDelete)
      );
      toast.success(t('stageDeleted'));

      // Reset states
      setShowDeleteDialog(false);
      setStageToDelete(null);
    } catch (error: any) {
      console.error('Error deleting stage:', error);

      // If the error indicates that we need to delete matches or groups first
      if (
        error.message?.includes('matches') ||
        error.message?.includes('groups')
      ) {
        // Show the dialog for dependencies instead of using browser confirm
        setStageWithDependenciesToDelete(stageToDelete);
        setShowDeleteStageWithDependenciesDialog(true);
      } else {
        toast.error(t('errorDeletingStage'));
      }

      // Reset states
      setShowDeleteDialog(false);
      setStageToDelete(null);
    } finally {
      setDeletingStage(false);
    }
  };

  // Function to handle confirmation to delete stage with dependencies
  const confirmDeleteStageWithDependencies = async () => {
    if (!stageWithDependenciesToDelete) return;

    setDeletingStage(true);
    try {
      // Delete all matches for this stage
      await deleteAllStageMatches(
        callApi,
        tournamentId!,
        stageWithDependenciesToDelete
      );

      // Try to delete stage again
      await deleteStage(callApi, tournamentId!, stageWithDependenciesToDelete);

      // Update UI and show success message
      setStages((prevStages) =>
        prevStages.filter((s) => s.id !== stageWithDependenciesToDelete)
      );
      toast.success(t('stageDeleted'));
    } catch (secondError) {
      console.error('Error in cascade delete:', secondError);
      toast.error(t('errorDeletingStage'));
    } finally {
      setDeletingStage(false);
      setShowDeleteStageWithDependenciesDialog(false);
      setStageWithDependenciesToDelete(null);
    }
  };

  // Function to manage a stage
  const handleManageStage = (stage: TournamentStage) => {
    setSelectedStage(stage);
    setIsManagingStage(true);
  };

  // Function to open the form groups dialog
  const openFormGroupsDialog = () => {
    setShowFormGroupsDialog(true);
  };

  // Function to form groups for a stage
  const handleFormGroups = async () => {
    if (!selectedStage) return;

    try {
      setFormingGroups(true);
      await formGroups(
        callApi,
        tournamentId,
        selectedStage.id,
        groupDistributionType,
        numberOfGroups
      );
      toast.success(t('groupsFormed'));
      loadStageGroups();
      setShowFormGroupsDialog(false);
    } catch (error) {
      console.error('Error forming groups:', error);
      toast.error(
        error instanceof Error ? error.message : t('failedFormGroups')
      );
    } finally {
      setFormingGroups(false);
    }
  };

  // Function to generate matches for a stage
  const handleGenerateMatches = async () => {
    if (!selectedStage) return;

    try {
      setGeneratingMatches(true);
      await generateMatches(callApi, tournamentId, selectedStage.id);
      toast.success(t('matchesGenerated'));
      loadStageMatches();
    } catch (error) {
      console.error('Error generating matches:', error);
      toast.error(
        error instanceof Error ? error.message : t('failedGenerateMatches')
      );
    } finally {
      setGeneratingMatches(false);
    }
  };

  // Function to update match result
  const handleUpdateMatchResult = async (
    matchId: number,
    couple1Score: number,
    couple2Score: number
  ) => {
    if (!selectedStage) return;

    try {
      setUpdatingMatch(true);

      // Convert simple scores to games format
      const games = [
        {
          set: 1,
          couple1: couple1Score,
          couple2: couple2Score
        }
      ];

      // Determine winner based on scores
      const winnerCoupleId =
        couple1Score > couple2Score
          ? stageMatches.find((m) => m.id === matchId)?.couple1_id
          : couple2Score > couple1Score
            ? stageMatches.find((m) => m.id === matchId)?.couple2_id
            : null;

      if (winnerCoupleId === undefined) {
        throw new Error('Could not determine winner couple ID');
      }

      await updateMatchResult(
        callApi,
        tournamentId!,
        matchId,
        games,
        winnerCoupleId || 0 // 0 indicates no winner (tie or error)
      );

      toast.success(t('matchResultUpdated'));
      loadStageMatches();
      checkStageProgress();
    } catch (error) {
      console.error('Error updating match result:', error);
      toast.error(
        error instanceof Error ? error.message : t('failedUpdateMatchResult')
      );
    } finally {
      setUpdatingMatch(false);
    }
  };

  // Function to advance to next stage
  const handleAdvanceToNextStage = async (nextStageId: number) => {
    if (!selectedStage) return;

    try {
      setAdvancingStage(true);
      await advanceToNextStage(
        callApi,
        tournamentId,
        selectedStage.id,
        nextStageId,
        {
          top_n_per_group: 2
        }
      );
      toast.success(t('advancedToNextStage'));

      // Refresh both stages
      loadTournamentStages();

      // If we're still viewing the current stage, refresh its data
      if (selectedStage) {
        loadStageGroups();
        loadStageMatches();
        checkStageProgress();
      }
    } catch (error) {
      console.error('Error advancing to next stage:', error);
      toast.error(
        error instanceof Error ? error.message : t('failedAdvanceToNextStage')
      );
    } finally {
      setAdvancingStage(false);
    }
  };

  // Function to view matches for a specific group
  const handleViewGroupMatches = (groupId: number) => {
    setSelectedGroupId(groupId);
    loadStageMatches();
  };

  // Function to view all matches for the stage
  const handleViewAllMatches = () => {
    setSelectedGroupId(null);
    loadStageMatches();
  };

  // Function to handle group deletion
  const handleDeleteGroup = async (groupId: number) => {
    console.log('handleDeleteGroup called with ID:', groupId);
    if (!selectedStage) return;

    setDeletingGroupId(groupId);
    setShowDeleteGroupDialog(true);
  };

  // Function to confirm and execute group deletion
  const confirmDeleteGroup = async () => {
    console.log('confirmDeleteGroup called with ID:', deletingGroupId);
    if (!selectedStage || !deletingGroupId) return;

    try {
      // Attempt to delete the group
      await deleteGroup(
        callApi,
        tournamentId!,
        selectedStage.id,
        deletingGroupId
      );

      // Update the UI by removing the deleted group
      setStageGroups((groups) =>
        groups.filter((g) => g.id !== deletingGroupId)
      );

      toast.success(t('groupDeleted'));

      // If we were viewing matches for this group, reset to view all matches
      if (selectedGroupId === deletingGroupId) {
        setSelectedGroupId(null);
        loadStageMatches();
      }
    } catch (error: any) {
      console.error('Error deleting group:', error);

      // If the error indicates we need to delete matches first
      if (error.message?.includes('matches')) {
        setGroupWithMatchesToDelete(deletingGroupId);
        setShowDeleteGroupWithMatchesDialog(true);
      } else {
        toast.error(t('errorDeletingGroup'));
      }
    } finally {
      setShowDeleteGroupDialog(false);
    }
  };

  // Function to confirm and execute group with matches deletion
  const confirmDeleteGroupWithMatches = async () => {
    if (!selectedStage || !groupWithMatchesToDelete) return;

    try {
      // Find all matches for this group
      const groupMatches = stageMatches.filter(
        (m) => m.group_id === groupWithMatchesToDelete
      );

      // Delete all matches for this group
      await Promise.all(
        groupMatches.map((match) =>
          deleteMatch(callApi, tournamentId!, match.id)
        )
      );

      // Try deleting the group again
      await deleteGroup(
        callApi,
        tournamentId!,
        selectedStage.id,
        groupWithMatchesToDelete
      );

      // Update UI
      setStageGroups((groups) =>
        groups.filter((g) => g.id !== groupWithMatchesToDelete)
      );
      setStageMatches((matches) =>
        matches.filter((m) => m.group_id !== groupWithMatchesToDelete)
      );

      toast.success(t('groupDeleted'));

      // Reset group selection if needed
      if (selectedGroupId === groupWithMatchesToDelete) {
        setSelectedGroupId(null);
      }
    } catch (nestedError) {
      console.error('Error during cascade delete:', nestedError);
      toast.error(t('errorDeletingGroup'));
    } finally {
      setShowDeleteGroupWithMatchesDialog(false);
      setGroupWithMatchesToDelete(null);
      setDeletingGroupId(null);
    }
  };

  // Function to handle match deletion
  const handleDeleteMatch = async (matchId: number) => {
    setMatchToDelete(matchId);
    setShowDeleteMatchDialog(true);
  };

  // Function to confirm and execute match deletion
  const confirmDeleteMatch = async () => {
    if (!matchToDelete) return;

    try {
      setDeletingMatchId(matchToDelete);

      // Delete the match
      await deleteMatch(callApi, tournamentId!, matchToDelete);

      // Update the UI by removing the deleted match
      setStageMatches((matches) =>
        matches.filter((m) => m.id !== matchToDelete)
      );

      // Refresh stage stats
      checkStageProgress();

      toast.success(t('matchDeleted'));
    } catch (error) {
      console.error('Error deleting match:', error);
      toast.error(t('errorDeletingMatch'));
    } finally {
      setDeletingMatchId(null);
      setMatchToDelete(null);
      setShowDeleteMatchDialog(false);
    }
  };

  // Function to remove a couple from a group
  const handleRemoveCoupleFromGroup = async (
    groupId: number,
    coupleId: number
  ) => {
    if (!selectedStage) return;

    try {
      // Remove the couple from the group
      await removeCoupleFromGroup(
        callApi,
        tournamentId!,
        selectedStage.id,
        groupId,
        coupleId
      );

      // Update the UI by removing the couple from the group
      setStageGroups((prevGroups) =>
        prevGroups.map((group) => {
          if (group.id === groupId) {
            return {
              ...group,
              couples: group.couples.filter((couple) => couple.id !== coupleId)
            };
          }
          return group;
        })
      );

      toast.success(t('coupleRemovedFromGroup'));
    } catch (error) {
      console.error('Error removing couple from group:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : t('errorRemovingCoupleFromGroup')
      );
    }
  };

  // Function to open the add couple dialog
  const handleOpenAddCoupleDialog = async (groupId: number) => {
    if (!selectedStage) return;

    setSelectedGroupForAddCouple(groupId);
    setSelectedCoupleId(null);
    setShowAddCoupleDialog(true);

    try {
      setLoadingAvailableCouples(true);

      // Fetch all couples for the tournament
      const tournamentCouples = await fetchTournamentCouples(
        callApi,
        tournamentId!
      );

      // Get all couples that are already in groups
      const couplesInGroups = stageGroups.flatMap((group) =>
        group.couples.map((couple) => couple.id)
      );

      // Filter out couples that are already in groups
      const available = tournamentCouples.filter(
        (couple) => !couplesInGroups.includes(couple.id)
      );

      setAvailableCouples(available);
    } catch (error) {
      console.error('Error fetching available couples:', error);
      toast.error(t('errorFetchingCouples'));
    } finally {
      setLoadingAvailableCouples(false);
    }
  };

  // Function to add a couple to a group
  const handleAddCoupleToGroup = async () => {
    if (!selectedStage || !selectedGroupForAddCouple || !selectedCoupleId)
      return;

    try {
      setAddingCouple(true);

      // Add the couple to the group
      await addCoupleToGroup(
        callApi,
        tournamentId!,
        selectedStage.id,
        selectedGroupForAddCouple,
        selectedCoupleId
      );

      // Find the couple details from available couples
      const addedCouple = availableCouples.find(
        (couple) => couple.id === selectedCoupleId
      );

      if (addedCouple) {
        // Update the UI by adding the couple to the group
        setStageGroups((prevGroups) =>
          prevGroups.map((group) => {
            if (group.id === selectedGroupForAddCouple) {
              return {
                ...group,
                couples: [
                  ...group.couples,
                  {
                    id: addedCouple.id,
                    player1: {
                      id: addedCouple.first_player?.id,
                      nickname: addedCouple.first_player?.nickname || 'Unknown',
                      name: addedCouple.first_player?.name || '',
                      level: (addedCouple.first_player?.level || 0) / 100
                    },
                    player2: {
                      id: addedCouple.second_player?.id,
                      nickname:
                        addedCouple.second_player?.nickname || 'Unknown',
                      name: addedCouple.second_player?.name || '',
                      level: (addedCouple.second_player?.level || 0) / 100
                    }
                  }
                ]
              };
            }
            return group;
          })
        );
      }

      // Close the dialog and reset states
      setShowAddCoupleDialog(false);
      setSelectedGroupForAddCouple(null);
      setSelectedCoupleId(null);

      toast.success(t('coupleAddedToGroup'));
    } catch (error) {
      console.error('Error adding couple to group:', error);
      toast.error(
        error instanceof Error ? error.message : t('errorAddingCoupleToGroup')
      );
    } finally {
      setAddingCouple(false);
    }
  };

  // Default view: list of stages
  const renderDialogs = () => (
    <>
      {/* Delete Stage Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteStage')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteStageConfirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingStage}>
              {commonT('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteStage}
              disabled={deletingStage}
              className='bg-destructive hover:bg-destructive/90'
            >
              {deletingStage ? t('deleting') : commonT('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Stage with Dependencies Confirmation Dialog */}
      <AlertDialog
        open={showDeleteStageWithDependenciesDialog}
        onOpenChange={setShowDeleteStageWithDependenciesDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteStage')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteStageWithDependencies')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingStage}>
              {commonT('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteStageWithDependencies}
              disabled={deletingStage}
              className='bg-destructive hover:bg-destructive/90'
            >
              {deletingStage ? t('deleting') : commonT('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Form Groups Dialog */}
      <Dialog
        open={showFormGroupsDialog}
        onOpenChange={setShowFormGroupsDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('formGroups')}</DialogTitle>
            <DialogDescription>
              {t('formGroupsDescription') ||
                'Configure how you want to form groups for this stage.'}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='distribution-type'>
                {t('distributionType') || 'Distribution Type'}
              </Label>
              <Select
                value={groupDistributionType}
                onValueChange={(value) =>
                  setGroupDistributionType(
                    value as 'equal_size' | 'by_level' | 'random'
                  )
                }
              >
                <SelectTrigger id='distribution-type'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='equal_size'>
                    {t('equalDistribution') || 'Equal Distribution'}
                  </SelectItem>
                  <SelectItem value='by_level'>
                    {t('byLevel') || 'By Level'}
                  </SelectItem>
                  <SelectItem value='random'>
                    {t('random') || 'Random'}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className='text-sm text-muted-foreground'>
                {groupDistributionType === 'equal_size'
                  ? t('equalDistributionDescription') ||
                    'Distribute players evenly across groups.'
                  : groupDistributionType === 'by_level'
                    ? t('byLevelDistributionDescription') ||
                      'Group players based on their skill level.'
                    : t('randomDistributionDescription') ||
                      'Randomly assign players to groups.'}
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='players-per-group'>
                {t('numberOfGroups') || 'Number of Groups'}
              </Label>
              <Select
                value={numberOfGroups.toString()}
                onValueChange={(value) => setNumberOfGroups(parseInt(value))}
              >
                <SelectTrigger id='players-per-group'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='2'>2</SelectItem>
                  <SelectItem value='3'>3</SelectItem>
                  <SelectItem value='4'>4</SelectItem>
                  <SelectItem value='6'>6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowFormGroupsDialog(false)}
            >
              {t('cancel')}
            </Button>
            <Button onClick={handleFormGroups} disabled={formingGroups}>
              {formingGroups ? t('formingGroups') : t('formGroups')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirmation Dialog */}
      <AlertDialog
        open={showDeleteGroupDialog}
        onOpenChange={setShowDeleteGroupDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteGroup')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteGroup')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingGroupId !== null}>
              {commonT('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteGroup}
              disabled={deletingGroupId === null}
              className='bg-destructive hover:bg-destructive/90'
            >
              {deletingGroupId !== null ? t('deleting') : commonT('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Group with Matches Confirmation Dialog */}
      <AlertDialog
        open={showDeleteGroupWithMatchesDialog}
        onOpenChange={setShowDeleteGroupWithMatchesDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteGroup')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteGroupWithMatches')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={groupWithMatchesToDelete !== null}>
              {commonT('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteGroupWithMatches}
              disabled={groupWithMatchesToDelete === null}
              className='bg-destructive hover:bg-destructive/90'
            >
              {groupWithMatchesToDelete !== null
                ? t('deleting')
                : commonT('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Match Confirmation Dialog */}
      <AlertDialog
        open={showDeleteMatchDialog}
        onOpenChange={setShowDeleteMatchDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteMatch')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteMatch')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingMatchId !== null}>
              {commonT('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMatch}
              disabled={deletingMatchId !== null}
              className='bg-destructive hover:bg-destructive/90'
            >
              {deletingMatchId !== null ? t('deleting') : commonT('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Couple to Group Dialog */}
      <Dialog open={showAddCoupleDialog} onOpenChange={setShowAddCoupleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addCoupleToGroup')}</DialogTitle>
            <DialogDescription>
              {t('addCoupleToGroupDescription') ||
                'Select a couple to add to this group.'}
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            {loadingAvailableCouples ? (
              <div className='space-y-2'>
                <Skeleton className='h-12 w-full' />
                <Skeleton className='h-12 w-full' />
              </div>
            ) : availableCouples.length === 0 ? (
              <div className='rounded-md border py-3 text-center'>
                <p className='text-sm text-muted-foreground'>
                  {t('noAvailableCouples')}
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                <Label htmlFor='couple-select'>{t('selectCouple')}</Label>
                <Select
                  value={selectedCoupleId?.toString() || ''}
                  onValueChange={(value) =>
                    setSelectedCoupleId(parseInt(value))
                  }
                >
                  <SelectTrigger id='couple-select'>
                    <SelectValue placeholder={t('selectCouple')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCouples.map((couple) => (
                      <SelectItem key={couple.id} value={couple.id.toString()}>
                        {couple.name ||
                          `${couple.first_player?.nickname || 'Unknown'} & ${couple.second_player?.nickname || 'Unknown'}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCoupleId && (
                  <div className='mt-4 rounded-md border p-3'>
                    <p className='text-sm font-medium'>
                      {availableCouples.find((c) => c.id === selectedCoupleId)
                        ?.name ||
                        `${availableCouples.find((c) => c.id === selectedCoupleId)?.first_player?.nickname || 'Unknown'} & 
                        ${availableCouples.find((c) => c.id === selectedCoupleId)?.second_player?.nickname || 'Unknown'}`}
                    </p>
                    <div className='mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground'>
                      <div>
                        <p>
                          <span className='font-medium'>{t('player')} 1:</span>{' '}
                          {availableCouples.find(
                            (c) => c.id === selectedCoupleId
                          )?.first_player?.name ||
                            availableCouples.find(
                              (c) => c.id === selectedCoupleId
                            )?.first_player?.nickname}
                        </p>
                        {availableCouples.find((c) => c.id === selectedCoupleId)
                          ?.first_player?.level && (
                          <p>
                            <span className='font-medium'>{t('level')}:</span>{' '}
                            {
                              availableCouples.find(
                                (c) => c.id === selectedCoupleId
                              )?.first_player?.level
                            }
                          </p>
                        )}
                      </div>
                      <div>
                        <p>
                          <span className='font-medium'>{t('player')} 2:</span>{' '}
                          {availableCouples.find(
                            (c) => c.id === selectedCoupleId
                          )?.second_player?.name ||
                            availableCouples.find(
                              (c) => c.id === selectedCoupleId
                            )?.second_player?.nickname}
                        </p>
                        {availableCouples.find((c) => c.id === selectedCoupleId)
                          ?.second_player?.level && (
                          <p>
                            <span className='font-medium'>{t('level')}:</span>{' '}
                            {
                              availableCouples.find(
                                (c) => c.id === selectedCoupleId
                              )?.second_player?.level
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowAddCoupleDialog(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleAddCoupleToGroup}
              disabled={!selectedCoupleId || addingCouple}
            >
              {addingCouple ? t('adding') : '+'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  // If tournament is not loaded yet
  if (!tournament) {
    return null;
  }

  // If we're managing a stage, show the stage management view
  if (isManagingStage && selectedStage) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <Button
            variant='outline'
            size='sm'
            className='gap-1'
            onClick={() => {
              setIsManagingStage(false);
              setSelectedStage(null);
              setSelectedGroupId(null);
            }}
          >
            <ArrowLeft className='h-4 w-4' />
            {t('backToStages')}
          </Button>
          <h2 className='text-xl font-semibold'>
            {selectedStage.name || t('stage')} {t('management')}
          </h2>
          <div className='w-[100px]'></div> {/* Spacer for alignment */}
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* Groups Card */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <div>
                <CardTitle>{t('groups')}</CardTitle>
                <CardDescription className='mt-1.5'>
                  {stageGroups.length} {t('groups').toLowerCase()}
                </CardDescription>
              </div>
              <Button
                size='sm'
                className='gap-1'
                onClick={openFormGroupsDialog}
                disabled={formingGroups}
              >
                <Plus className='h-4 w-4' />
                {formingGroups ? t('formingGroups') : t('formGroups')}
              </Button>
            </CardHeader>
            <CardContent>
              {loadingGroups ? (
                <div className='space-y-2'>
                  <Skeleton className='h-12 w-full' />
                  <Skeleton className='h-12 w-full' />
                </div>
              ) : stageGroups.length === 0 ? (
                <div className='rounded-md border py-8 text-center'>
                  <p className='mb-4 text-muted-foreground'>
                    {t('noGroupsFormed')}
                  </p>
                  <Button
                    size='sm'
                    className='gap-1'
                    onClick={openFormGroupsDialog}
                    disabled={formingGroups}
                  >
                    <Plus className='h-4 w-4' />
                    {formingGroups ? t('formingGroups') : t('formGroups')}
                  </Button>
                </div>
              ) : (
                <div className='space-y-2'>
                  <div className='flex flex-wrap gap-2'>
                    <Button
                      variant={selectedGroupId === null ? 'default' : 'outline'}
                      size='sm'
                      onClick={handleViewAllMatches}
                    >
                      {t('allGroups')}
                    </Button>
                    {stageGroups.map((group) => (
                      <Button
                        key={group.id}
                        variant={
                          selectedGroupId === group.id ? 'default' : 'outline'
                        }
                        size='sm'
                        onClick={() => handleViewGroupMatches(group.id)}
                      >
                        {t('group')} {group.name}
                      </Button>
                    ))}
                  </div>
                  <Separator className='my-4' />
                  <div className='grid grid-cols-1 gap-4'>
                    {stageGroups
                      .filter(
                        (group) =>
                          selectedGroupId === null ||
                          group.id === selectedGroupId
                      )
                      .map((group) => (
                        <div
                          key={group.id}
                          className='rounded-md border p-4 shadow-sm'
                        >
                          <div className='mb-2 flex items-center justify-between'>
                            <h3 className='font-medium'>
                              {t('group')} {group.name}
                            </h3>
                            <div className='flex items-center space-x-1'>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-6 w-6 text-primary hover:bg-primary/10'
                                onClick={() =>
                                  handleOpenAddCoupleDialog(group.id)
                                }
                                title={t('addCoupleToGroup')}
                              >
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  width='16'
                                  height='16'
                                  viewBox='0 0 24 24'
                                  fill='none'
                                  stroke='currentColor'
                                  strokeWidth='2'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  className='lucide lucide-user-plus'
                                >
                                  <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                                  <circle cx='9' cy='7' r='4' />
                                  <line x1='19' x2='19' y1='8' y2='14' />
                                  <line x1='22' x2='16' y1='11' y2='11' />
                                </svg>
                              </Button>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-6 w-6 text-destructive hover:bg-destructive/10'
                                onClick={() => handleDeleteGroup(group.id)}
                                title={t('deleteGroup')}
                              >
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  width='16'
                                  height='16'
                                  viewBox='0 0 24 24'
                                  fill='none'
                                  stroke='currentColor'
                                  strokeWidth='2'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  className='lucide lucide-trash-2'
                                >
                                  <path d='M3 6h18' />
                                  <path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' />
                                  <path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' />
                                  <line x1='10' x2='10' y1='11' y2='17' />
                                  <line x1='14' x2='14' y1='11' y2='17' />
                                </svg>
                              </Button>
                            </div>
                          </div>
                          <div className='space-y-2 text-sm'>
                            {group.couples.map((couple) => (
                              <div
                                key={couple.id}
                                className='flex items-center rounded-md border p-2 hover:bg-muted'
                              >
                                <div className='flex-1'>
                                  <div className='flex items-center justify-between'>
                                    <div className='font-medium'>
                                      {couple.player1?.nickname || 'Unknown'} &{' '}
                                      {couple.player2?.nickname || 'Unknown'}
                                    </div>
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      className='h-5 w-5 text-destructive hover:bg-destructive/10'
                                      onClick={() =>
                                        handleRemoveCoupleFromGroup(
                                          group.id,
                                          couple.id
                                        )
                                      }
                                      title={t('removeCouple')}
                                    >
                                      <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='14'
                                        height='14'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        className='lucide lucide-x'
                                      >
                                        <path d='M18 6 6 18' />
                                        <path d='m6 6 12 12' />
                                      </svg>
                                    </Button>
                                  </div>
                                  <div className='mt-1 text-xs text-muted-foreground'>
                                    <div className='grid grid-cols-2 gap-1'>
                                      <div>
                                        <span className='font-medium'>
                                          {couple.player1?.name ||
                                            couple.player1?.nickname}
                                        </span>
                                        {couple.player1?.level ? (
                                          <span className='ml-1 rounded-full bg-secondary px-1.5 py-0.5 text-[10px]'>
                                            {t('level')} {couple.player1.level}
                                          </span>
                                        ) : null}
                                      </div>
                                      <div>
                                        <span className='font-medium'>
                                          {couple.player2?.name ||
                                            couple.player2?.nickname}
                                        </span>
                                        {couple.player2?.level ? (
                                          <span className='ml-1 rounded-full bg-secondary px-1.5 py-0.5 text-[10px]'>
                                            {t('level')} {couple.player2.level}
                                          </span>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Matches Card */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <div>
                <CardTitle>{t('matches')}</CardTitle>
                <CardDescription className='mt-1.5'>
                  {stageMatches.length} {t('matches').toLowerCase()}
                </CardDescription>
              </div>
              <Button
                size='sm'
                className='gap-1'
                onClick={handleGenerateMatches}
                disabled={generatingMatches || stageGroups.length === 0}
              >
                <Plus className='h-4 w-4' />
                {generatingMatches
                  ? t('generatingMatches')
                  : t('generateMatches')}
              </Button>
            </CardHeader>
            <CardContent>
              {loadingMatches ? (
                <div className='space-y-2'>
                  <Skeleton className='h-20 w-full' />
                  <Skeleton className='h-20 w-full' />
                </div>
              ) : stageMatches.length === 0 ? (
                <div className='rounded-md border py-8 text-center'>
                  <p className='mb-4 text-muted-foreground'>
                    {stageGroups.length === 0
                      ? t('formGroupsFirst')
                      : t('noMatchesGenerated')}
                  </p>
                  {stageGroups.length > 0 && (
                    <Button
                      size='sm'
                      className='gap-1'
                      onClick={handleGenerateMatches}
                      disabled={generatingMatches}
                    >
                      <Plus className='h-4 w-4' />
                      {generatingMatches
                        ? t('generatingMatches')
                        : t('generateMatches')}
                    </Button>
                  )}
                </div>
              ) : (
                <div className='space-y-4'>
                  {loadingStats ? (
                    <Skeleton className='h-8 w-full' />
                  ) : (
                    stageStats && (
                      <div className='mb-4'>
                        <div className='mb-1 flex justify-between text-sm'>
                          <span>
                            {t('matchesCompleted')}:{' '}
                            {stageStats.matches_completed} /{' '}
                            {stageStats.matches_total}
                          </span>
                          <span>
                            {Math.round(
                              (stageStats.matches_completed /
                                stageStats.matches_total) *
                                100
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            (stageStats.matches_completed /
                              stageStats.matches_total) *
                            100
                          }
                          className='h-2'
                        />
                      </div>
                    )
                  )}

                  <div className='space-y-4'>
                    {stageMatches.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        onUpdateScore={handleUpdateMatchResult}
                        onDelete={handleDeleteMatch}
                        editable={!updatingMatch}
                        deleting={deletingMatchId === match.id}
                        t={t}
                      />
                    ))}
                  </div>

                  {stageStats &&
                    stageStats.matches_completed === stageStats.matches_total &&
                    stageStats.matches_total > 0 && (
                      <div className='mt-6 rounded-md border bg-muted p-4'>
                        <h3 className='mb-2 font-medium'>
                          {t('advanceToNextStage')}
                        </h3>
                        <div className='space-y-4'>
                          <p className='text-sm text-muted-foreground'>
                            {t('allMatchesCompleted')}
                          </p>

                          {stages.filter(
                            (s) => s.order > (selectedStage?.order || 0)
                          ).length > 0 ? (
                            <>
                              <div className='space-y-2'>
                                <Label htmlFor='next-stage'>
                                  {t('selectNextStage')}
                                </Label>
                                <Select
                                  onValueChange={(value) =>
                                    handleAdvanceToNextStage(parseInt(value))
                                  }
                                  disabled={advancingStage}
                                >
                                  <SelectTrigger id='next-stage'>
                                    <SelectValue
                                      placeholder={t('selectStage')}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {stages
                                      .filter(
                                        (s) =>
                                          s.order > (selectedStage?.order || 0)
                                      )
                                      .map((stage) => (
                                        <SelectItem
                                          key={stage.id}
                                          value={stage.id.toString()}
                                        >
                                          {stage.name ||
                                            `${t('stage')} ${stage.order}`}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <p className='text-xs text-muted-foreground'>
                                {t('advanceToNextStageDescription')}
                              </p>
                            </>
                          ) : (
                            <p className='text-sm font-medium'>
                              {t('finalStageCompleted')}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Render dialogs */}
        {renderDialogs()}
      </div>
    );
  }

  // Default view: list of stages
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <div>
            <CardTitle>{t('tournamentStages')}</CardTitle>
            <CardDescription className='mt-1.5'>
              {stages.length} {t('stages').toLowerCase()}
            </CardDescription>
          </div>
          <Button size='sm' className='gap-1' onClick={handleOpenStageForm}>
            <Plus className='h-4 w-4' />
            {t('createStage')}
          </Button>
        </CardHeader>
        <CardContent>
          {loadingStages ? (
            <div className='space-y-4'>
              <Skeleton className='h-24 w-full' />
              <Skeleton className='h-24 w-full' />
            </div>
          ) : stages.length === 0 ? (
            <div className='rounded-md border py-8 text-center'>
              <p className='mb-4 text-muted-foreground'>
                {t('noStagesCreated')}
              </p>
              <Button size='sm' className='gap-1' onClick={handleOpenStageForm}>
                <Plus className='h-4 w-4' />
                {t('createStage')}
              </Button>
            </div>
          ) : (
            <div className='space-y-4'>
              {stages
                .sort((a, b) => a.order - b.order)
                .map((stage) => (
                  <StageCard
                    key={stage.id}
                    stage={stage}
                    onManage={handleManageStage}
                    onEdit={handleEditStage}
                    onDelete={handleDeleteStage}
                    t={t}
                    isActive={selectedStage?.id === stage.id}
                  />
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stage Form Sheet */}
      <Sheet open={isStageFormOpen} onOpenChange={setIsStageFormOpen}>
        <SheetContent
          side='right'
          className='w-full overflow-y-auto sm:max-w-md'
        >
          <SheetHeader>
            <SheetTitle>
              {editingStage ? t('editStage') : t('createStage')}
            </SheetTitle>
          </SheetHeader>
          <div className='mt-6'>
            <StageForm
              tournamentId={tournamentId}
              stage={editingStage}
              onComplete={handleStageFormComplete}
              onCancel={() => setIsStageFormOpen(false)}
              existingStages={stages}
              t={t}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Render dialogs */}
      {renderDialogs()}
    </div>
  );
}
