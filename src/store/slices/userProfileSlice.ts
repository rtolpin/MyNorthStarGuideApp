import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UserProfile, PersonalityTrait, UserPreferences } from '../../types';

interface UserProfileState {
  profile: UserProfile | null;
}

const initialState: UserProfileState = {
  profile: null,
};

function defaultProfile(uid: string): UserProfile {
  return {
    id: uid,
    name: '',
    onboardingCompleted: false,
    personalityTraits: [],
    baselineMood: 5,
    preferences: {
      theme: 'dark',
      aiTone: 'warm',
      notificationsEnabled: false,
    },
    createdAt: new Date().toISOString(),
  };
}

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    initProfile: (state, action: PayloadAction<string>) => {
      if (!state.profile) state.profile = defaultProfile(action.payload);
    },
    loadProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    resetProfile: () => initialState,
    setName: (state, action: PayloadAction<string>) => {
      if (state.profile) state.profile.name = action.payload;
    },
    completeOnboarding: (
      state,
      action: PayloadAction<{ name: string; traits: PersonalityTrait[] }>
    ) => {
      if (state.profile) {
        state.profile.name = action.payload.name;
        state.profile.personalityTraits = action.payload.traits;
        state.profile.onboardingCompleted = true;
      }
    },
    updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      if (state.profile) {
        state.profile.preferences = { ...state.profile.preferences, ...action.payload };
      }
    },
    setAvatar: (state, action: PayloadAction<string>) => {
      if (state.profile) state.profile.avatar = action.payload;
    },
  },
});

export const {
  initProfile, loadProfile, resetProfile,
  setName, completeOnboarding, updatePreferences, setAvatar,
} = userProfileSlice.actions;
export default userProfileSlice.reducer;
