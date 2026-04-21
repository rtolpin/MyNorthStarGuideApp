import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Goal, Milestone, GoalStatus } from '../../types';
import { v4 as uuid } from 'uuid';

interface GoalsState {
  goals: Goal[];
}

const initialState: GoalsState = { goals: [] };

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    addGoal: (state, action: PayloadAction<Omit<Goal, 'id' | 'createdAt' | 'milestones' | 'status'>>) => {
      state.goals.push({
        ...action.payload,
        id: uuid(),
        createdAt: new Date().toISOString(),
        milestones: [],
        status: 'active',
      });
    },
    updateGoal: (state, action: PayloadAction<Partial<Goal> & { id: string }>) => {
      const idx = state.goals.findIndex((g) => g.id === action.payload.id);
      if (idx >= 0) state.goals[idx] = { ...state.goals[idx], ...action.payload };
    },
    deleteGoal: (state, action: PayloadAction<string>) => {
      state.goals = state.goals.filter((g) => g.id !== action.payload);
    },
    setGoalStatus: (state, action: PayloadAction<{ id: string; status: GoalStatus }>) => {
      const g = state.goals.find((g) => g.id === action.payload.id);
      if (g) g.status = action.payload.status;
    },
    addMilestone: (
      state,
      action: PayloadAction<{ goalId: string; milestone: Omit<Milestone, 'id' | 'goalId'> }>
    ) => {
      const g = state.goals.find((g) => g.id === action.payload.goalId);
      if (g) {
        g.milestones.push({
          ...action.payload.milestone,
          id: uuid(),
          goalId: action.payload.goalId,
        });
      }
    },
    completeMilestone: (state, action: PayloadAction<{ goalId: string; milestoneId: string }>) => {
      const g = state.goals.find((g) => g.id === action.payload.goalId);
      if (g) {
        const m = g.milestones.find((m) => m.id === action.payload.milestoneId);
        if (m) m.completedAt = new Date().toISOString();
      }
    },
    setGoalAIPlan: (state, action: PayloadAction<{ goalId: string; plan: string }>) => {
      const g = state.goals.find((g) => g.id === action.payload.goalId);
      if (g) g.aiPlan = action.payload.plan;
    },
    loadGoals: (state, action: PayloadAction<Goal[]>) => {
      state.goals = action.payload;
    },
  },
});

export const {
  addGoal, updateGoal, deleteGoal, setGoalStatus,
  addMilestone, completeMilestone, setGoalAIPlan, loadGoals,
} = goalsSlice.actions;
export default goalsSlice.reducer;
