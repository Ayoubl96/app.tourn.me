import React, { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTournament } from '@/features/tournament/context/TournamentContext';
import { MatchCard } from '@/features/tournament/components/MatchCard';
import {
  Match,
  TournamentStage,
  Couple,
  Court
} from '@/features/tournament/api/types';
import {
  fetchTournamentMatches,
  fetchTournamentStages,
  fetchTournamentCouples,
  fetchCourts,
  deleteMatch,
  createMatch,
  updateMatch
} from '@/features/tournament/api/tournamentApi';
import { PlusCircle, Filter, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface TournamentMatchesTabProps {
  t: (key: string, params?: Record<string, any>) => string;
}

// Form schema for creating/editing matches
const matchFormSchema = z.object({
  couple1_id: z.string().min(1, 'First couple is required'),
  couple2_id: z.string().min(1, 'Second couple is required'),
  stage_id: z.string().optional(),
  group_id: z.string().optional(),
  court_id: z.string().optional(),
  match_date: z.string().optional(),
  match_duration: z.string().optional()
});

export default function TournamentMatchesTab({ t }: TournamentMatchesTabProps) {
  const callApi = useApi();
  const { tournamentId } = useTournament();

  // States
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState<TournamentStage[]>([]);
  const [couples, setCouples] = useState<Couple[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  // Filter states
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  const [coupleFilter, setCoupleFilter] = useState<string | null>(null);
  const [courtFilter, setCourtFilter] = useState<string | null>(null);

  // Add state for tracking match being deleted
  const [deletingMatchId, setDeletingMatchId] = useState<number | null>(null);

  // Add state for delete confirmation dialog
  const [showDeleteMatchDialog, setShowDeleteMatchDialog] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<number | null>(null);

  // Setup form
  const form = useForm<z.infer<typeof matchFormSchema>>({
    resolver: zodResolver(matchFormSchema),
    defaultValues: {
      couple1_id: '',
      couple2_id: '',
      stage_id: '',
      group_id: '',
      court_id: '',
      match_date: '',
      match_duration: ''
    }
  });

  // Load data
  useEffect(() => {
    loadData();
  }, [tournamentId]);

  // Load matches when filters change
  useEffect(() => {
    if (tournamentId) {
      loadMatches();
    }
  }, [tournamentId, stageFilter, coupleFilter, courtFilter]);

  const loadData = async () => {
    if (!tournamentId) return;

    setLoading(true);
    try {
      // Load all data in parallel
      const [matchesData, stagesData, couplesData, courtsData] =
        await Promise.all([
          loadMatches(),
          loadStages(),
          loadCouples(),
          loadCourts()
        ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(t('errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async () => {
    try {
      // Prepare filters
      const filters: {
        stage_id?: number;
        couple_id?: number;
        court_id?: number;
      } = {};

      if (stageFilter) filters.stage_id = parseInt(stageFilter);
      if (coupleFilter) filters.couple_id = parseInt(coupleFilter);
      if (courtFilter) filters.court_id = parseInt(courtFilter);

      const data = await fetchTournamentMatches(
        callApi,
        tournamentId!,
        filters
      );
      setMatches(data);
      return data;
    } catch (error) {
      console.error('Error loading matches:', error);
      toast.error(t('errorLoadingMatches'));
      return [];
    }
  };

  const loadStages = async () => {
    try {
      const data = await fetchTournamentStages(callApi, tournamentId!);
      setStages(data);
      return data;
    } catch (error) {
      console.error('Error loading stages:', error);
      toast.error(t('errorLoadingStages'));
      return [];
    }
  };

  const loadCouples = async () => {
    try {
      const data = await fetchTournamentCouples(callApi, tournamentId!);
      setCouples(data);
      return data;
    } catch (error) {
      console.error('Error loading couples:', error);
      toast.error(t('errorLoadingCouples'));
      return [];
    }
  };

  const loadCourts = async () => {
    try {
      const data = await fetchCourts(callApi);
      setCourts(data);
      return data;
    } catch (error) {
      console.error('Error loading courts:', error);
      toast.error(t('errorLoadingCourts'));
      return [];
    }
  };

  const handleCreateMatch = async (
    formData: z.infer<typeof matchFormSchema>
  ) => {
    try {
      // Convert string IDs to numbers
      const matchData = {
        couple1_id: parseInt(formData.couple1_id),
        couple2_id: parseInt(formData.couple2_id),
        stage_id: formData.stage_id ? parseInt(formData.stage_id) : undefined,
        group_id: formData.group_id ? parseInt(formData.group_id) : undefined,
        court_id: formData.court_id ? parseInt(formData.court_id) : undefined,
        match_date: formData.match_date || undefined,
        match_duration: formData.match_duration
          ? parseInt(formData.match_duration)
          : undefined
      };

      await createMatch(callApi, tournamentId!, matchData);
      toast.success(t('matchCreated'));
      setShowMatchDialog(false);
      form.reset();
      loadMatches();
    } catch (error) {
      console.error('Error creating match:', error);
      toast.error(t('errorCreatingMatch'));
    }
  };

  const handleEditMatch = async (formData: z.infer<typeof matchFormSchema>) => {
    if (!editingMatch) return;

    try {
      // Only include fields that are provided
      const matchData: any = {};

      if (formData.court_id) matchData.court_id = parseInt(formData.court_id);
      if (formData.match_date) matchData.match_date = formData.match_date;
      if (formData.match_duration)
        matchData.match_duration = parseInt(formData.match_duration);

      await updateMatch(callApi, tournamentId!, editingMatch.id, matchData);
      toast.success(t('matchUpdated'));
      setShowMatchDialog(false);
      setEditingMatch(null);
      form.reset();
      loadMatches();
    } catch (error) {
      console.error('Error updating match:', error);
      toast.error(t('errorUpdatingMatch'));
    }
  };

  const handleDeleteMatch = async (matchId: number) => {
    console.log('handleDeleteMatch called with ID:', matchId);
    setMatchToDelete(matchId);
    setShowDeleteMatchDialog(true);
  };

  // Function to confirm and execute match deletion
  const confirmDeleteMatch = async () => {
    console.log('confirmDeleteMatch called with ID:', matchToDelete);
    if (!matchToDelete) return;

    try {
      setDeletingMatchId(matchToDelete);
      await deleteMatch(callApi, tournamentId!, matchToDelete);
      toast.success(t('matchDeleted'));

      // Refresh matches list
      loadMatches();
    } catch (error) {
      console.error('Error deleting match:', error);
      toast.error(t('errorDeletingMatch'));
    } finally {
      setDeletingMatchId(null);
      setMatchToDelete(null);
      setShowDeleteMatchDialog(false);
    }
  };

  const openCreateMatchDialog = () => {
    form.reset();
    setEditingMatch(null);
    setShowMatchDialog(true);
  };

  const openEditMatchDialog = (match: Match) => {
    form.reset({
      couple1_id: match.couple1_id.toString(),
      couple2_id: match.couple2_id.toString(),
      stage_id: match.stage_id ? match.stage_id.toString() : '',
      group_id: match.group_id ? match.group_id.toString() : '',
      court_id: match.court_id ? match.court_id.toString() : '',
      match_date: match.match_date || '',
      match_duration: match.match_duration
        ? match.match_duration.toString()
        : ''
    });
    setEditingMatch(match);
    setShowMatchDialog(true);
  };

  const handleUpdateMatchResult = async (
    match: Match,
    games: Array<{ set: number; couple1: number; couple2: number }>,
    winnerCoupleId: number
  ) => {
    try {
      await updateMatch(callApi, tournamentId!, match.id, {
        games,
        winner_couple_id: winnerCoupleId
      });
      toast.success(t('matchResultUpdated'));
      loadMatches();
    } catch (error) {
      console.error('Error updating match result:', error);
      toast.error(t('errorUpdatingMatchResult'));
    }
  };

  const handleUpdateMatchResultForCard = async (
    matchId: number,
    couple1Score: number,
    couple2Score: number
  ) => {
    try {
      // Find the match
      const match = matches.find((m) => m.id === matchId);
      if (!match) {
        toast.error(t('matchNotFound'));
        return;
      }

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
          ? match.couple1_id
          : couple2Score > couple1Score
            ? match.couple2_id
            : null;

      await handleUpdateMatchResult(match, games, winnerCoupleId || 0);
    } catch (error) {
      console.error('Error updating match result:', error);
      toast.error(t('errorUpdatingMatchResult'));
    }
  };

  const clearFilters = () => {
    setStageFilter(null);
    setCoupleFilter(null);
    setCourtFilter(null);
  };

  const getCoupleName = (coupleId: number) => {
    const couple = couples.find((c) => c.id === coupleId);
    if (!couple) return `Couple #${coupleId}`;

    if (couple.name) return couple.name;

    // Access nickname with optional chaining but without fallback
    return `${couple.first_player?.nickname} / ${couple.second_player?.nickname}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>{t('matches')}</CardTitle>
          <Button onClick={openCreateMatchDialog}>
            <PlusCircle className='mr-2 h-4 w-4' />
            {t('createMatch')}
          </Button>
        </div>
        <CardDescription>{t('matchesDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className='mb-6 rounded-md bg-muted p-4'>
          <div className='mb-3 flex items-center gap-2'>
            <Filter className='h-4 w-4' />
            <h3 className='text-sm font-medium'>{t('filters')}</h3>
            {(stageFilter || coupleFilter || courtFilter) && (
              <Button size='sm' variant='ghost' onClick={clearFilters}>
                <X className='mr-1 h-4 w-4' />
                {t('clearFilters')}
              </Button>
            )}
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div>
              <Label htmlFor='stage-filter'>{t('stage')}</Label>
              <Select
                value={stageFilter || ''}
                onValueChange={(value) => setStageFilter(value || null)}
              >
                <SelectTrigger id='stage-filter'>
                  <SelectValue placeholder={t('allStages')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=''>{t('allStages')}</SelectItem>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id.toString()}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='couple-filter'>{t('couple')}</Label>
              <Select
                value={coupleFilter || ''}
                onValueChange={(value) => setCoupleFilter(value || null)}
              >
                <SelectTrigger id='couple-filter'>
                  <SelectValue placeholder={t('allCouples')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=''>{t('allCouples')}</SelectItem>
                  {couples.map((couple) => (
                    <SelectItem key={couple.id} value={couple.id.toString()}>
                      {couple.name ||
                        `${couple.first_player?.nickname} / ${couple.second_player?.nickname}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='court-filter'>{t('court')}</Label>
              <Select
                value={courtFilter || ''}
                onValueChange={(value) => setCourtFilter(value || null)}
              >
                <SelectTrigger id='court-filter'>
                  <SelectValue placeholder={t('allCourts')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=''>{t('allCourts')}</SelectItem>
                  {courts.map((court) => (
                    <SelectItem key={court.id} value={court.id.toString()}>
                      {court.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Matches list */}
        {loading ? (
          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className='h-32 w-full' />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className='py-10 text-center'>
            <p className='text-muted-foreground'>{t('noMatchesFound')}</p>
            <Button
              variant='outline'
              className='mt-4'
              onClick={openCreateMatchDialog}
            >
              {t('createFirstMatch')}
            </Button>
          </div>
        ) : (
          <div className='space-y-4'>
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onUpdateScore={handleUpdateMatchResultForCard}
                onDelete={handleDeleteMatch}
                editable={true}
                deleting={deletingMatchId === match.id}
                t={t}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Match dialog */}
      <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMatch ? t('editMatch') : t('createMatch')}
            </DialogTitle>
            <DialogDescription>
              {editingMatch ? t('editMatchDesc') : t('createMatchDesc')}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(
                editingMatch ? handleEditMatch : handleCreateMatch
              )}
              className='space-y-4'
            >
              {!editingMatch && (
                <>
                  <FormField
                    control={form.control}
                    name='couple1_id'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('firstCouple')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectCouple')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {couples.map((couple) => (
                              <SelectItem
                                key={couple.id}
                                value={couple.id.toString()}
                              >
                                {couple.name ||
                                  `${couple.first_player?.nickname} / ${couple.second_player?.nickname}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='couple2_id'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('secondCouple')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectCouple')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {couples.map((couple) => (
                              <SelectItem
                                key={couple.id}
                                value={couple.id.toString()}
                              >
                                {couple.name ||
                                  `${couple.first_player?.nickname} / ${couple.second_player?.nickname}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='stage_id'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('stage')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectStage')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value=''>{t('noStage')}</SelectItem>
                            {stages.map((stage) => (
                              <SelectItem
                                key={stage.id}
                                value={stage.id.toString()}
                              >
                                {stage.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name='court_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('court')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectCourt')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value=''>{t('noCourt')}</SelectItem>
                        {courts.map((court) => (
                          <SelectItem
                            key={court.id}
                            value={court.id.toString()}
                          >
                            {court.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='match_date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('matchDate')}</FormLabel>
                    <FormControl>
                      <Input type='datetime-local' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='match_duration'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('matchDuration')} (minutes)</FormLabel>
                    <FormControl>
                      <Input type='number' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setShowMatchDialog(false)}
                >
                  {t('cancel')}
                </Button>
                <Button type='submit'>
                  {editingMatch ? t('saveChanges') : t('createMatch')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMatch}
              disabled={deletingMatchId !== null}
              className='bg-destructive hover:bg-destructive/90'
            >
              {deletingMatchId !== null ? t('deleting') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
