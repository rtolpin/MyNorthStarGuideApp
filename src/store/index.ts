import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import userProfileReducer from './slices/userProfileSlice';
import dailyCheckInReducer from './slices/dailyCheckInSlice';
import habitsReducer from './slices/habitsSlice';
import goalsReducer from './slices/goalsSlice';
import visionBoardReducer from './slices/visionBoardSlice';
import insightsReducer from './slices/insightsSlice';
import copingReducer from './slices/copingSlice';

export const store = configureStore({
  reducer: {
    userProfile: userProfileReducer,
    dailyCheckIn: dailyCheckInReducer,
    habits: habitsReducer,
    goals: goalsReducer,
    visionBoard: visionBoardReducer,
    insights: insightsReducer,
    coping: copingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
