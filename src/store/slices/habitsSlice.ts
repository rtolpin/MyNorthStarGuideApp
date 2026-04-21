import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Habit, HabitCompletion } from '../../types';
import { v4 as uuid } from 'uuid';

interface HabitsState {
  habits: Habit[];
  completions: HabitCompletion[];
}

const initialState: HabitsState = {
  habits: [],
  completions: [],
};

const habitsSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    addHabit: (state, action: PayloadAction<Omit<Habit, 'id' | 'createdAt'>>) => {
      state.habits.push({
        ...action.payload,
        id: uuid(),
        createdAt: new Date().toISOString(),
      });
    },
    updateHabit: (state, action: PayloadAction<Partial<Habit> & { id: string }>) => {
      const idx = state.habits.findIndex((h) => h.id === action.payload.id);
      if (idx >= 0) state.habits[idx] = { ...state.habits[idx], ...action.payload };
    },
    deleteHabit: (state, action: PayloadAction<string>) => {
      state.habits = state.habits.filter((h) => h.id !== action.payload);
    },
    toggleHabitActive: (state, action: PayloadAction<string>) => {
      const h = state.habits.find((h) => h.id === action.payload);
      if (h) h.isActive = !h.isActive;
    },
    completeHabit: (
      state,
      action: PayloadAction<{ habitId: string; rating?: number; note?: string }>
    ) => {
      const today = new Date().toISOString().split('T')[0];
      const existing = state.completions.find(
        (c) => c.habitId === action.payload.habitId && c.date.startsWith(today)
      );
      if (!existing) {
        state.completions.push({
          id: uuid(),
          habitId: action.payload.habitId,
          date: new Date().toISOString(),
          rating: action.payload.rating ?? 0,
          note: action.payload.note,
        });
      }
    },
    uncompleteHabit: (state, action: PayloadAction<string>) => {
      const today = new Date().toISOString().split('T')[0];
      state.completions = state.completions.filter(
        (c) => !(c.habitId === action.payload && c.date.startsWith(today))
      );
    },
    updateCompletionRating: (
      state,
      action: PayloadAction<{ habitId: string; rating: number; note?: string }>
    ) => {
      const today = new Date().toISOString().split('T')[0];
      const comp = state.completions.find(
        (c) => c.habitId === action.payload.habitId && c.date.startsWith(today)
      );
      if (comp) {
        comp.rating = action.payload.rating;
        if (action.payload.note) comp.note = action.payload.note;
      }
    },
    loadHabits: (state, action: PayloadAction<{ habits: Habit[]; completions: HabitCompletion[] }>) => {
      state.habits = action.payload.habits;
      state.completions = action.payload.completions;
    },
  },
});

export const {
  addHabit, updateHabit, deleteHabit, toggleHabitActive,
  completeHabit, uncompleteHabit, updateCompletionRating, loadHabits,
} = habitsSlice.actions;
export default habitsSlice.reducer;
