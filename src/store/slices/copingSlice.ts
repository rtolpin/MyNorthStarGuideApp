import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CopingStrategy, CopingRating, CopingSituation } from '../../types';
import { v4 as uuid } from 'uuid';

interface CopingState {
  strategies: CopingStrategy[];
  ratings: CopingRating[];
  personalTop5: string[];
  activeSituation: CopingSituation | null;
}

const defaultStrategies: CopingStrategy[] = [
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    category: 'anxious',
    technique: 'breathing',
    description: 'Regulate your nervous system with controlled breathing cycles.',
    duration: 300,
    steps: ['Inhale for 4 counts', 'Hold for 4 counts', 'Exhale for 4 counts', 'Hold for 4 counts'],
    hasTimer: true,
  },
  {
    id: 'grounding-5-4-3-2-1',
    name: '5-4-3-2-1 Grounding',
    category: 'overwhelmed',
    technique: 'grounding',
    description: 'Anchor yourself in the present moment using your senses.',
    steps: [
      'Name 5 things you can SEE',
      'Name 4 things you can TOUCH',
      'Name 3 things you can HEAR',
      'Name 2 things you can SMELL',
      'Name 1 thing you can TASTE',
    ],
    hasTimer: false,
  },
  {
    id: 'body-scan',
    name: 'Body Scan Meditation',
    category: 'anxious',
    technique: 'somatic',
    description: 'Systematically release tension held in your body.',
    duration: 600,
    hasTimer: true,
  },
  {
    id: 'gratitude-reframe',
    name: 'Gratitude Reframe',
    category: 'sad',
    technique: 'cognitive',
    description: 'Shift your perspective by anchoring in what is good right now.',
    steps: [
      'Write 3 things you are grateful for',
      'For each one, ask: why does this matter to me?',
      'Sit with the feeling of appreciation for 60 seconds',
    ],
    hasTimer: false,
  },
  {
    id: 'movement-break',
    name: 'Movement Break',
    category: 'unfocused',
    technique: 'movement',
    description: 'Get your body moving to reset your energy and focus.',
    duration: 300,
    steps: [
      '10 jumping jacks',
      '10 shoulder rolls',
      'Walk briskly for 2 minutes',
      'Return and take 3 deep breaths',
    ],
    hasTimer: true,
  },
  {
    id: 'cold-water',
    name: 'Cold Water Reset',
    category: 'overwhelmed',
    technique: 'somatic',
    description: 'Splash cold water on your face to trigger the dive reflex and calm your system.',
    steps: ['Get a glass of cold water', 'Splash face or hold wrists under cold water for 30 seconds', 'Breathe slowly as you dry off'],
    hasTimer: false,
  },
  {
    id: 'journaling-prompt',
    name: 'Journaling Prompt',
    category: 'sad',
    technique: 'journaling',
    description: 'Process your feelings through writing.',
    steps: [
      'Write: What am I feeling right now?',
      'Write: What triggered this feeling?',
      'Write: What do I need in this moment?',
      'Write: One compassionate thing I can tell myself',
    ],
    hasTimer: false,
  },
  {
    id: 'cognitive-defusion',
    name: 'Cognitive Defusion',
    category: 'anxious',
    technique: 'cognitive',
    description: 'Create distance from anxious thoughts by observing them.',
    steps: [
      'Notice the anxious thought',
      'Say: "I am having the thought that..."',
      'Imagine the thought on a leaf floating down a stream',
      'Watch it drift away without following it',
    ],
    hasTimer: false,
  },
  {
    id: 'social-connection',
    name: 'Reach Out',
    category: 'lonely',
    technique: 'social',
    description: 'Connect with someone you trust.',
    steps: [
      'Think of one person who cares about you',
      'Send them a text or give them a call',
      'You don\'t need to explain — just say hi',
    ],
    hasTimer: false,
  },
  {
    id: 'mindful-minute',
    name: 'One Mindful Minute',
    category: 'burnt out',
    technique: 'mindfulness',
    description: 'A single minute of complete presence to restore clarity.',
    duration: 60,
    steps: [
      'Close your eyes or soften your gaze',
      'Breathe naturally and notice the breath',
      'When thoughts arise, gently return to breathing',
    ],
    hasTimer: true,
  },
];

const initialState: CopingState = {
  strategies: defaultStrategies,
  ratings: [],
  personalTop5: [],
  activeSituation: null,
};

const copingSlice = createSlice({
  name: 'coping',
  initialState,
  reducers: {
    setActiveSituation: (state, action: PayloadAction<CopingSituation | null>) => {
      state.activeSituation = action.payload;
    },
    rateStrategy: (
      state,
      action: PayloadAction<{
        strategyId: string;
        situationTag: CopingSituation;
        rating: 'yes' | 'somewhat' | 'no';
      }>
    ) => {
      state.ratings.push({
        id: uuid(),
        strategyId: action.payload.strategyId,
        situationTag: action.payload.situationTag,
        rating: action.payload.rating,
        date: new Date().toISOString(),
      });
      state.personalTop5 = computeTop5(state.ratings);
    },
    loadCoping: (state, action: PayloadAction<{ ratings: CopingRating[] }>) => {
      state.ratings = action.payload.ratings;
      state.personalTop5 = computeTop5(action.payload.ratings);
    },
  },
});

function computeTop5(ratings: CopingRating[]): string[] {
  const scores: Record<string, number> = {};
  ratings.forEach((r) => {
    const pts = r.rating === 'yes' ? 2 : r.rating === 'somewhat' ? 1 : -1;
    scores[r.strategyId] = (scores[r.strategyId] ?? 0) + pts;
  });
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);
}

export const { setActiveSituation, rateStrategy, loadCoping } = copingSlice.actions;
export default copingSlice.reducer;
