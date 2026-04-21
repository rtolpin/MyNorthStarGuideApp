import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import type { MoodCheckIn, Habit, HabitCompletion, Goal, VisionBoard, CopingRating, InsightsState } from '../types';

const DB_NAME = 'mynorthstar';
const DB_VERSION = 1;

type NorthStarDB = {
  checkIns: { key: string; value: MoodCheckIn };
  habits: { key: string; value: Habit };
  completions: { key: string; value: HabitCompletion };
  goals: { key: string; value: Goal };
  visionBoards: { key: string; value: VisionBoard };
  copingRatings: { key: string; value: CopingRating };
  insights: { key: string; value: { key: string; data: Partial<InsightsState> } };
};

let dbPromise: Promise<IDBPDatabase<NorthStarDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<NorthStarDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('checkIns')) db.createObjectStore('checkIns', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('habits')) db.createObjectStore('habits', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('completions')) db.createObjectStore('completions', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('goals')) db.createObjectStore('goals', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('visionBoards')) db.createObjectStore('visionBoards', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('copingRatings')) db.createObjectStore('copingRatings', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('insights')) db.createObjectStore('insights', { keyPath: 'key' });
      },
    });
  }
  return dbPromise;
}

export async function saveCheckIn(checkIn: MoodCheckIn) {
  const db = await getDB();
  await db.put('checkIns', checkIn);
}

export async function loadCheckIns(): Promise<MoodCheckIn[]> {
  const db = await getDB();
  return db.getAll('checkIns');
}

export async function saveHabit(habit: Habit) {
  const db = await getDB();
  await db.put('habits', habit);
}

export async function deleteHabitDB(id: string) {
  const db = await getDB();
  await db.delete('habits', id);
}

export async function loadHabits(): Promise<Habit[]> {
  const db = await getDB();
  return db.getAll('habits');
}

export async function saveCompletion(completion: HabitCompletion) {
  const db = await getDB();
  await db.put('completions', completion);
}

export async function loadCompletions(): Promise<HabitCompletion[]> {
  const db = await getDB();
  return db.getAll('completions');
}

export async function saveGoal(goal: Goal) {
  const db = await getDB();
  await db.put('goals', goal);
}

export async function deleteGoalDB(id: string) {
  const db = await getDB();
  await db.delete('goals', id);
}

export async function loadGoals(): Promise<Goal[]> {
  const db = await getDB();
  return db.getAll('goals');
}

export async function saveVisionBoard(board: VisionBoard) {
  const db = await getDB();
  await db.put('visionBoards', board);
}

export async function deleteVisionBoardDB(id: string) {
  const db = await getDB();
  await db.delete('visionBoards', id);
}

export async function loadVisionBoards(): Promise<VisionBoard[]> {
  const db = await getDB();
  return db.getAll('visionBoards');
}

export async function saveCopingRating(rating: CopingRating) {
  const db = await getDB();
  await db.put('copingRatings', rating);
}

export async function loadCopingRatings(): Promise<CopingRating[]> {
  const db = await getDB();
  return db.getAll('copingRatings');
}

export async function saveInsights(data: Partial<InsightsState>) {
  const db = await getDB();
  await db.put('insights', { key: 'main', data });
}

export async function loadInsightsDB(): Promise<Partial<InsightsState> | null> {
  const db = await getDB();
  const record = await db.get('insights', 'main');
  return record?.data ?? null;
}
