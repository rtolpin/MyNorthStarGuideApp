// ─── User & Profile ───────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  onboardingCompleted: boolean;
  personalityTraits: PersonalityTrait[];
  baselineMood: number;
  preferences: UserPreferences;
  createdAt: string;
}

export interface PersonalityTrait {
  key: string;
  value: string;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  aiTone: 'warm' | 'direct' | 'motivational';
  notificationsEnabled: boolean;
}

// ─── Mood & Check-In ──────────────────────────────────────────────────────────

export type MoodType =
  | 'joy' | 'anxious' | 'foggy' | 'energized' | 'sad'
  | 'calm' | 'grateful' | 'overwhelmed' | 'hopeful' | 'frustrated';

export interface MoodCheckIn {
  id: string;
  date: string;
  mood: MoodType;
  energy: number;
  focus: number;
  tags: CheckInTag[];
  freeText: string;
  aiMorningBrief?: string;
}

export type CheckInTag =
  | 'work stress' | 'relationships' | 'health' | 'finances'
  | 'loneliness' | 'uncertainty';

// ─── Habits ───────────────────────────────────────────────────────────────────

export type HabitCategory =
  | 'Health' | 'Mind' | 'Relationships' | 'Career'
  | 'Creativity' | 'Finance' | 'Spirituality';

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  icon: string;
  color: string;
  createdAt: string;
  isActive: boolean;
  description?: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string;
  rating: number;
  note?: string;
}

export interface HabitStreak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

// ─── Goals ────────────────────────────────────────────────────────────────────

export type GoalCategory =
  | 'Health' | 'Career' | 'Relationships' | 'Finance'
  | 'Personal Growth' | 'Creativity' | 'Travel' | 'Spirituality';

export type GoalStatus = 'active' | 'completed' | 'paused' | 'archived';

export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  description: string;
  targetDate: string;
  milestones: Milestone[];
  status: GoalStatus;
  createdAt: string;
  aiPlan?: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  targetDate: string;
  completedAt?: string;
  order: number;
}

// ─── Vision Board ─────────────────────────────────────────────────────────────

export type VisionItemType = 'image' | 'text' | 'affirmation' | 'goal' | 'color' | 'emoji';
export type VisionItemStatus = 'dreaming' | 'in-progress' | 'achieved';

export interface VisionBoard {
  id: string;
  name: string;
  items: VisionItem[];
  background: string;
  createdAt: string;
  updatedAt: string;
}

export interface VisionItem {
  id: string;
  boardId: string;
  type: VisionItemType;
  content: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  status: VisionItemStatus;
  color?: string;
  fontSize?: number;
}

// ─── Insights & Analytics ─────────────────────────────────────────────────────

export interface WeekAheadPrediction {
  generatedAt: string;
  content: string;
  predictedMoods: { day: string; mood: MoodType; confidence: number }[];
}

export interface HabitImpactReport {
  generatedAt: string;
  rankings: { habitId: string; habitName: string; impact: number; insight: string }[];
}

export interface PatternCorrelation {
  habitId: string;
  habitName: string;
  correlation: number;
  description: string;
}

export interface InflectionPointAlert {
  type: 'streak_risk' | 'mood_drop' | 'goal_stall';
  message: string;
  urgency: 'low' | 'medium' | 'high';
  relatedId?: string;
}

export interface InsightsState {
  predictions: {
    weekAhead?: WeekAheadPrediction;
    decisionForecast?: string;
    futureSelfLetter?: string;
  };
  patterns: {
    correlations: PatternCorrelation[];
    inflectionPoints: InflectionPointAlert[];
  };
  northStarScore: number;
  aiSummaries: {
    weekly?: { date: string; content: string };
    monthly?: { date: string; content: string };
  };
  habitImpactReport?: HabitImpactReport;
}

// ─── Coping ───────────────────────────────────────────────────────────────────

export type CopingSituation =
  | 'overwhelmed' | 'anxious' | 'sad' | 'angry'
  | 'lonely' | 'unfocused' | 'grieving' | 'burnt out';

export type CopingTechnique =
  | 'breathing' | 'grounding' | 'journaling' | 'movement'
  | 'cognitive' | 'somatic' | 'social' | 'mindfulness';

export interface CopingStrategy {
  id: string;
  name: string;
  category: CopingSituation;
  technique: CopingTechnique;
  description: string;
  duration?: number;
  steps?: string[];
  hasTimer: boolean;
}

export interface CopingRating {
  id: string;
  strategyId: string;
  situationTag: CopingSituation;
  rating: 'yes' | 'somewhat' | 'no';
  date: string;
}

// ─── AI Context ───────────────────────────────────────────────────────────────

export interface AIContext {
  recentMoods: MoodCheckIn[];
  habitCompletions: HabitCompletion[];
  activeGoals: Goal[];
  visionBoardItems: VisionItem[];
  currentMood?: MoodCheckIn;
  userPersonality: PersonalityTrait[];
  previousCopingRatings: CopingRating[];
  northStarScore: number;
  userName: string;
  aiTone: 'warm' | 'direct' | 'motivational';
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export interface OnboardingAnswer {
  question: string;
  answer: string;
}
