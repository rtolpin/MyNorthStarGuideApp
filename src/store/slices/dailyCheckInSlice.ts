import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { MoodCheckIn, MoodType, CheckInTag } from '../../types';
import { v4 as uuid } from 'uuid';

interface DailyCheckInState {
  today: MoodCheckIn | null;
  history: MoodCheckIn[];
}

const initialState: DailyCheckInState = {
  today: null,
  history: [],
};

const todayKey = () => new Date().toISOString().split('T')[0];

const dailyCheckInSlice = createSlice({
  name: 'dailyCheckIn',
  initialState,
  reducers: {
    startCheckIn: (state, action: PayloadAction<{ mood: MoodType; energy: number; focus: number }>) => {
      state.today = {
        id: uuid(),
        date: new Date().toISOString(),
        mood: action.payload.mood,
        energy: action.payload.energy,
        focus: action.payload.focus,
        tags: [],
        freeText: '',
      };
    },
    updateCheckIn: (state, action: PayloadAction<Partial<MoodCheckIn>>) => {
      if (state.today) {
        state.today = { ...state.today, ...action.payload };
      }
    },
    setTags: (state, action: PayloadAction<CheckInTag[]>) => {
      if (state.today) state.today.tags = action.payload;
    },
    setFreeText: (state, action: PayloadAction<string>) => {
      if (state.today) state.today.freeText = action.payload;
    },
    setAIMorningBrief: (state, action: PayloadAction<string>) => {
      if (state.today) state.today.aiMorningBrief = action.payload;
    },
    saveCheckIn: (state) => {
      if (!state.today) return;
      const key = todayKey();
      const idx = state.history.findIndex((c) => c.date.startsWith(key));
      if (idx >= 0) {
        state.history[idx] = state.today;
      } else {
        state.history.push(state.today);
      }
    },
    loadHistory: (state, action: PayloadAction<MoodCheckIn[]>) => {
      state.history = action.payload;
      const key = todayKey();
      const todaysEntry = action.payload.find((c) => c.date.startsWith(key));
      if (todaysEntry) state.today = todaysEntry;
    },
  },
});

export const {
  startCheckIn, updateCheckIn, setTags, setFreeText,
  setAIMorningBrief, saveCheckIn, loadHistory,
} = dailyCheckInSlice.actions;
export default dailyCheckInSlice.reducer;
