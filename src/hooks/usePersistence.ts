import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { loadHistory } from '../store/slices/dailyCheckInSlice';
import { loadHabits } from '../store/slices/habitsSlice';
import { loadGoals } from '../store/slices/goalsSlice';
import { loadBoards } from '../store/slices/visionBoardSlice';
import { loadCoping } from '../store/slices/copingSlice';
import { loadInsights } from '../store/slices/insightsSlice';
import * as db from '../utils/db';

export function usePersistence() {
  const dispatch = useAppDispatch();
  const checkIns = useAppSelector((s) => s.dailyCheckIn.history);
  const habits = useAppSelector((s) => s.habits.habits);
  const completions = useAppSelector((s) => s.habits.completions);
  const goals = useAppSelector((s) => s.goals.goals);
  const boards = useAppSelector((s) => s.visionBoard.boards);
  const insights = useAppSelector((s) => s.insights);

  // Load all data on mount
  useEffect(() => {
    async function loadAll() {
      try {
        const [storedCheckIns, storedHabits, storedCompletions, storedGoals, storedBoards, storedCoping, storedInsights] =
          await Promise.all([
            db.loadCheckIns(),
            db.loadHabits(),
            db.loadCompletions(),
            db.loadGoals(),
            db.loadVisionBoards(),
            db.loadCopingRatings(),
            db.loadInsightsDB(),
          ]);
        if (storedCheckIns.length) dispatch(loadHistory(storedCheckIns));
        if (storedHabits.length || storedCompletions.length) {
          dispatch(loadHabits({ habits: storedHabits, completions: storedCompletions }));
        }
        if (storedGoals.length) dispatch(loadGoals(storedGoals));
        if (storedBoards.length) dispatch(loadBoards(storedBoards));
        if (storedCoping.length) dispatch(loadCoping({ ratings: storedCoping }));
        if (storedInsights) dispatch(loadInsights(storedInsights as never));
      } catch (e) {
        console.warn('IndexedDB load failed:', e);
      }
    }
    loadAll();
  }, [dispatch]);

  // Sync check-ins
  useEffect(() => {
    const latest = checkIns[checkIns.length - 1];
    if (latest) db.saveCheckIn(latest).catch(console.warn);
  }, [checkIns]);

  // Sync habits
  useEffect(() => {
    habits.forEach((h) => db.saveHabit(h).catch(console.warn));
  }, [habits]);

  // Sync completions
  useEffect(() => {
    const latest = completions[completions.length - 1];
    if (latest) db.saveCompletion(latest).catch(console.warn);
  }, [completions]);

  // Sync goals
  useEffect(() => {
    goals.forEach((g) => db.saveGoal(g).catch(console.warn));
  }, [goals]);

  // Sync vision boards
  useEffect(() => {
    boards.forEach((b) => db.saveVisionBoard(b).catch(console.warn));
  }, [boards]);

  // Sync insights
  useEffect(() => {
    db.saveInsights(insights).catch(console.warn);
  }, [insights]);
}
