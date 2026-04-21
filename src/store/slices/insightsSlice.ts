import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { InsightsState, PatternCorrelation, InflectionPointAlert, HabitImpactReport } from '../../types';

const initialState: InsightsState = {
  predictions: {},
  patterns: {
    correlations: [],
    inflectionPoints: [],
  },
  northStarScore: 0,
  aiSummaries: {},
};

const insightsSlice = createSlice({
  name: 'insights',
  initialState,
  reducers: {
    setWeekAheadPrediction: (state, action: PayloadAction<InsightsState['predictions']['weekAhead']>) => {
      state.predictions.weekAhead = action.payload;
    },
    setDecisionForecast: (state, action: PayloadAction<string>) => {
      state.predictions.decisionForecast = action.payload;
    },
    setFutureSelfLetter: (state, action: PayloadAction<string>) => {
      state.predictions.futureSelfLetter = action.payload;
    },
    setCorrelations: (state, action: PayloadAction<PatternCorrelation[]>) => {
      state.patterns.correlations = action.payload;
    },
    setInflectionPoints: (state, action: PayloadAction<InflectionPointAlert[]>) => {
      state.patterns.inflectionPoints = action.payload;
    },
    setNorthStarScore: (state, action: PayloadAction<number>) => {
      state.northStarScore = action.payload;
    },
    setWeeklySummary: (state, action: PayloadAction<{ date: string; content: string }>) => {
      state.aiSummaries.weekly = action.payload;
    },
    setMonthlySummary: (state, action: PayloadAction<{ date: string; content: string }>) => {
      state.aiSummaries.monthly = action.payload;
    },
    setHabitImpactReport: (state, action: PayloadAction<HabitImpactReport>) => {
      state.habitImpactReport = action.payload;
    },
    loadInsights: (state, action: PayloadAction<InsightsState>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  setWeekAheadPrediction, setDecisionForecast, setFutureSelfLetter,
  setCorrelations, setInflectionPoints, setNorthStarScore,
  setWeeklySummary, setMonthlySummary, setHabitImpactReport, loadInsights,
} = insightsSlice.actions;
export default insightsSlice.reducer;
