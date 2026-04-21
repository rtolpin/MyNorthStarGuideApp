import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { initProfile, loadProfile } from '../store/slices/userProfileSlice';
import { loadHistory } from '../store/slices/dailyCheckInSlice';
import { loadHabits } from '../store/slices/habitsSlice';
import { loadGoals } from '../store/slices/goalsSlice';
import { loadBoards } from '../store/slices/visionBoardSlice';
import { loadCoping } from '../store/slices/copingSlice';
import { loadInsights } from '../store/slices/insightsSlice';
import type { Habit, Goal, VisionBoard } from '../types';
import * as fdb from '../utils/firestoreDb';

export function usePersistence(uid: string) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.userProfile.profile);
  const checkIns = useAppSelector((s) => s.dailyCheckIn.history);
  const habits = useAppSelector((s) => s.habits.habits);
  const completions = useAppSelector((s) => s.habits.completions);
  const goals = useAppSelector((s) => s.goals.goals);
  const boards = useAppSelector((s) => s.visionBoard.boards);
  const insights = useAppSelector((s) => s.insights);

  const prevHabits = useRef<Habit[]>([]);
  const prevGoals = useRef<Goal[]>([]);
  const prevBoards = useRef<VisionBoard[]>([]);
  const initialized = useRef(false);

  // Load all data on mount
  useEffect(() => {
    initialized.current = false;
    prevHabits.current = [];
    prevGoals.current = [];
    prevBoards.current = [];

    async function loadAll() {
      try {
        const [
          storedProfile,
          storedCheckIns,
          storedHabits,
          storedCompletions,
          storedGoals,
          storedBoards,
          storedCoping,
          storedInsights,
        ] = await Promise.all([
          fdb.loadProfile(uid),
          fdb.loadCheckIns(uid),
          fdb.loadHabits(uid),
          fdb.loadCompletions(uid),
          fdb.loadGoals(uid),
          fdb.loadVisionBoards(uid),
          fdb.loadCopingRatings(uid),
          fdb.loadInsights(uid),
        ]);

        if (storedProfile) {
          dispatch(loadProfile(storedProfile));
        } else {
          dispatch(initProfile(uid));
        }

        // Always reset collections before loading so switching users is clean
        dispatch(loadHistory(storedCheckIns));
        dispatch(loadHabits({ habits: storedHabits, completions: storedCompletions }));
        dispatch(loadGoals(storedGoals));
        dispatch(loadBoards(storedBoards));
        dispatch(loadCoping({ ratings: storedCoping }));
        if (storedInsights) dispatch(loadInsights(storedInsights as never));

        prevHabits.current = storedHabits;
        prevGoals.current = storedGoals;
        prevBoards.current = storedBoards;
        initialized.current = true;
      } catch (e) {
        console.warn('Firestore load failed:', e);
        dispatch(initProfile(uid));
        initialized.current = true;
      }
    }
    loadAll();
  }, [uid, dispatch]);

  // Sync profile
  useEffect(() => {
    if (!initialized.current || !profile) return;
    fdb.saveProfile(uid, profile).catch(console.warn);
  }, [uid, profile]);

  // Sync check-ins
  useEffect(() => {
    if (!initialized.current) return;
    const latest = checkIns[checkIns.length - 1];
    if (latest) fdb.saveCheckIn(uid, latest).catch(console.warn);
  }, [uid, checkIns]);

  // Sync habits — save new/updated, delete removed
  useEffect(() => {
    if (!initialized.current) return;
    habits.forEach((h) => fdb.saveHabit(uid, h).catch(console.warn));
    const currentIds = new Set(habits.map((h) => h.id));
    prevHabits.current.forEach((h) => {
      if (!currentIds.has(h.id)) fdb.deleteHabit(uid, h.id).catch(console.warn);
    });
    prevHabits.current = habits;
  }, [uid, habits]);

  // Sync completions
  useEffect(() => {
    if (!initialized.current) return;
    const latest = completions[completions.length - 1];
    if (latest) fdb.saveCompletion(uid, latest).catch(console.warn);
  }, [uid, completions]);

  // Sync goals — save new/updated, delete removed
  useEffect(() => {
    if (!initialized.current) return;
    goals.forEach((g) => fdb.saveGoal(uid, g).catch(console.warn));
    const currentIds = new Set(goals.map((g) => g.id));
    prevGoals.current.forEach((g) => {
      if (!currentIds.has(g.id)) fdb.deleteGoal(uid, g.id).catch(console.warn);
    });
    prevGoals.current = goals;
  }, [uid, goals]);

  // Sync vision boards — save new/updated, delete removed
  useEffect(() => {
    if (!initialized.current) return;
    boards.forEach((b) => fdb.saveVisionBoard(uid, b).catch(console.warn));
    const currentIds = new Set(boards.map((b) => b.id));
    prevBoards.current.forEach((b) => {
      if (!currentIds.has(b.id)) fdb.deleteVisionBoard(uid, b.id).catch(console.warn);
    });
    prevBoards.current = boards;
  }, [uid, boards]);

  // Sync insights
  useEffect(() => {
    if (!initialized.current) return;
    fdb.saveInsights(uid, insights).catch(console.warn);
  }, [uid, insights]);
}
