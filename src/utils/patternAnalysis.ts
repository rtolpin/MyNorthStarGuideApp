import type { MoodCheckIn, HabitCompletion, Habit, PatternCorrelation, InflectionPointAlert } from '../types';

const moodValues: Record<string, number> = {
  joy: 9, energized: 8, hopeful: 8, grateful: 8, calm: 7,
  foggy: 4, unfocused: 4, anxious: 3, frustrated: 3, sad: 2, overwhelmed: 2,
};

export function moodToNumber(mood: string): number {
  return moodValues[mood] ?? 5;
}

export function computeNorthStarScore(params: {
  checkIns: MoodCheckIn[];
  completions: HabitCompletion[];
  habits: Habit[];
  goalCount: number;
  completedGoalCount: number;
}): number {
  const { checkIns, completions, habits, goalCount, completedGoalCount } = params;

  if (checkIns.length === 0) return 0;

  const last30 = checkIns.slice(-30);
  const avgMood = last30.reduce((sum, c) => sum + moodToNumber(c.mood), 0) / last30.length;
  const moodScore = (avgMood / 10) * 40;

  const activeHabits = habits.filter((h) => h.isActive);
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  let habitScore = 0;
  if (activeHabits.length > 0) {
    let totalCompleted = 0;
    last7Days.forEach((day) => {
      const dayCompletions = completions.filter((c) => c.date.startsWith(day));
      const completedHabits = new Set(dayCompletions.map((c) => c.habitId));
      const dailyRate = activeHabits.filter((h) => completedHabits.has(h.id)).length / activeHabits.length;
      totalCompleted += dailyRate;
    });
    habitScore = (totalCompleted / 7) * 40;
  }

  const goalScore = goalCount > 0 ? (completedGoalCount / goalCount) * 20 : 10;

  return Math.round(Math.min(100, moodScore + habitScore + goalScore));
}

export function computeHabitStreaks(completions: HabitCompletion[], habitId: string): {
  current: number;
  longest: number;
} {
  const dates = completions
    .filter((c) => c.habitId === habitId)
    .map((c) => c.date.split('T')[0])
    .sort()
    .reverse();

  if (dates.length === 0) return { current: 0, longest: 0 };

  let current = 0;
  let longest = 0;
  let streak = 1;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (dates[0] !== today && dates[0] !== yesterday) {
    current = 0;
  } else {
    current = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (prev.getTime() - curr.getTime()) / 86400000;
      if (diff === 1) {
        current++;
        streak++;
      } else {
        break;
      }
    }
  }

  let runStreak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) {
      runStreak++;
      longest = Math.max(longest, runStreak);
    } else {
      runStreak = 1;
    }
  }
  longest = Math.max(longest, streak, 1);

  return { current, longest };
}

export function computeCorrelations(
  checkIns: MoodCheckIn[],
  completions: HabitCompletion[],
  habits: Habit[]
): PatternCorrelation[] {
  if (checkIns.length < 7) return [];

  return habits
    .filter((h) => h.isActive)
    .map((habit) => {
      const pairs = checkIns.slice(-30).map((ci) => {
        const day = ci.date.split('T')[0];
        const completed = completions.some((c) => c.habitId === habit.id && c.date.startsWith(day));
        return { mood: moodToNumber(ci.mood), completed };
      });

      const withHabit = pairs.filter((p) => p.completed).map((p) => p.mood);
      const withoutHabit = pairs.filter((p) => !p.completed).map((p) => p.mood);

      if (withHabit.length === 0 || withoutHabit.length === 0) return null;

      const avgWith = withHabit.reduce((a, b) => a + b, 0) / withHabit.length;
      const avgWithout = withoutHabit.reduce((a, b) => a + b, 0) / withoutHabit.length;
      const correlation = (avgWith - avgWithout) / 10;

      return {
        habitId: habit.id,
        habitName: habit.name,
        correlation: Math.round(correlation * 100) / 100,
        description:
          correlation > 0.1
            ? `Your mood is ${Math.round(correlation * 10 * 10)}% higher on days you complete this`
            : correlation < -0.1
            ? `This habit may need adjustment — consider what would make it feel better`
            : `Consistent practice — keep going`,
      };
    })
    .filter((c): c is PatternCorrelation => c !== null)
    .sort((a, b) => b.correlation - a.correlation);
}

export function detectInflectionPoints(
  checkIns: MoodCheckIn[],
  completions: HabitCompletion[],
  habits: Habit[]
): InflectionPointAlert[] {
  const alerts: InflectionPointAlert[] = [];

  habits.filter((h) => h.isActive).forEach((habit) => {
    const { current, longest } = computeHabitStreaks(completions, habit.id);
    if (current >= 6 && current < longest) {
      alerts.push({
        type: 'streak_risk',
        message: `Don't break your ${current}-day streak for "${habit.name}"! Complete it today.`,
        urgency: 'high',
        relatedId: habit.id,
      });
    }
  });

  if (checkIns.length >= 7) {
    const lastWeek = checkIns.slice(-7).map((c) => moodToNumber(c.mood));
    const lastWeekAvg = lastWeek.reduce((a, b) => a + b, 0) / lastWeek.length;
    const prevWeek = checkIns.slice(-14, -7).map((c) => moodToNumber(c.mood));
    if (prevWeek.length >= 5) {
      const prevAvg = prevWeek.reduce((a, b) => a + b, 0) / prevWeek.length;
      if (lastWeekAvg < prevAvg - 1.5) {
        alerts.push({
          type: 'mood_drop',
          message: `Your mood this week is lower than last week. Consider opening the Coping Center.`,
          urgency: 'medium',
        });
      }
    }
  }

  return alerts;
}

export function getMoodTrend(checkIns: MoodCheckIn[], days = 7): { date: string; value: number }[] {
  const last = checkIns.slice(-days);
  return last.map((c) => ({
    date: new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: moodToNumber(c.mood),
  }));
}

export function getHabitHeatmap(
  completions: HabitCompletion[],
  habitId: string,
  days = 30
): { date: string; count: number }[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const key = d.toISOString().split('T')[0];
    const count = completions.filter((c) => c.habitId === habitId && c.date.startsWith(key)).length;
    return { date: key, count };
  });
}
