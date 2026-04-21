import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import type {
  MoodCheckIn, Habit, HabitCompletion, Goal, VisionBoard,
  CopingRating, InsightsState, UserProfile,
} from '../types';

function col(uid: string, name: string) {
  return collection(firestore, 'users', uid, name);
}

function docRef(uid: string, colName: string, id: string) {
  return doc(firestore, 'users', uid, colName, id);
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function saveProfile(uid: string, profile: UserProfile) {
  await setDoc(doc(firestore, 'users', uid, 'profile', 'main'), profile);
}

export async function loadProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(firestore, 'users', uid, 'profile', 'main'));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

// ─── Check-Ins ────────────────────────────────────────────────────────────────

export async function saveCheckIn(uid: string, checkIn: MoodCheckIn) {
  await setDoc(docRef(uid, 'checkIns', checkIn.id), checkIn);
}

export async function loadCheckIns(uid: string): Promise<MoodCheckIn[]> {
  const snap = await getDocs(col(uid, 'checkIns'));
  return snap.docs.map((d) => d.data() as MoodCheckIn);
}

// ─── Habits ───────────────────────────────────────────────────────────────────

export async function saveHabit(uid: string, habit: Habit) {
  await setDoc(docRef(uid, 'habits', habit.id), habit);
}

export async function deleteHabit(uid: string, id: string) {
  await deleteDoc(docRef(uid, 'habits', id));
}

export async function loadHabits(uid: string): Promise<Habit[]> {
  const snap = await getDocs(col(uid, 'habits'));
  return snap.docs.map((d) => d.data() as Habit);
}

// ─── Completions ──────────────────────────────────────────────────────────────

export async function saveCompletion(uid: string, completion: HabitCompletion) {
  await setDoc(docRef(uid, 'completions', completion.id), completion);
}

export async function deleteCompletion(uid: string, id: string) {
  await deleteDoc(docRef(uid, 'completions', id));
}

export async function loadCompletions(uid: string): Promise<HabitCompletion[]> {
  const snap = await getDocs(col(uid, 'completions'));
  return snap.docs.map((d) => d.data() as HabitCompletion);
}

// ─── Goals ────────────────────────────────────────────────────────────────────

export async function saveGoal(uid: string, goal: Goal) {
  await setDoc(docRef(uid, 'goals', goal.id), goal);
}

export async function deleteGoal(uid: string, id: string) {
  await deleteDoc(docRef(uid, 'goals', id));
}

export async function loadGoals(uid: string): Promise<Goal[]> {
  const snap = await getDocs(col(uid, 'goals'));
  return snap.docs.map((d) => d.data() as Goal);
}

// ─── Vision Boards ────────────────────────────────────────────────────────────

export async function saveVisionBoard(uid: string, board: VisionBoard) {
  await setDoc(docRef(uid, 'visionBoards', board.id), board);
}

export async function deleteVisionBoard(uid: string, id: string) {
  await deleteDoc(docRef(uid, 'visionBoards', id));
}

export async function loadVisionBoards(uid: string): Promise<VisionBoard[]> {
  const snap = await getDocs(col(uid, 'visionBoards'));
  return snap.docs.map((d) => d.data() as VisionBoard);
}

// ─── Coping Ratings ───────────────────────────────────────────────────────────

export async function saveCopingRating(uid: string, rating: CopingRating) {
  await setDoc(docRef(uid, 'copingRatings', rating.id), rating);
}

export async function loadCopingRatings(uid: string): Promise<CopingRating[]> {
  const snap = await getDocs(col(uid, 'copingRatings'));
  return snap.docs.map((d) => d.data() as CopingRating);
}

// ─── Insights ─────────────────────────────────────────────────────────────────

export async function saveInsights(uid: string, data: Partial<InsightsState>) {
  await setDoc(doc(firestore, 'users', uid, 'insights', 'main'), data);
}

export async function loadInsights(uid: string): Promise<Partial<InsightsState> | null> {
  const snap = await getDoc(doc(firestore, 'users', uid, 'insights', 'main'));
  return snap.exists() ? (snap.data() as Partial<InsightsState>) : null;
}
