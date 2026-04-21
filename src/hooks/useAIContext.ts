import { useMemo } from 'react';
import { useAppSelector } from '../store';
import type { AIContext } from '../types';

export function useAIContext(): AIContext {
  const profile = useAppSelector((s) => s.userProfile.profile);
  const checkIns = useAppSelector((s) => s.dailyCheckIn.history);
  const todayCheckIn = useAppSelector((s) => s.dailyCheckIn.today);
  const completions = useAppSelector((s) => s.habits.completions);
  const goals = useAppSelector((s) => s.goals.goals);
  const visionBoards = useAppSelector((s) => s.visionBoard.boards);
  const northStarScore = useAppSelector((s) => s.insights.northStarScore);
  const copingRatings = useAppSelector((s) => s.coping.ratings);

  return useMemo<AIContext>(
    () => ({
      recentMoods: checkIns.slice(-30),
      habitCompletions: completions,
      activeGoals: goals.filter((g) => g.status === 'active'),
      visionBoardItems: visionBoards.flatMap((b) => b.items),
      currentMood: todayCheckIn ?? undefined,
      userPersonality: profile?.personalityTraits ?? [],
      previousCopingRatings: copingRatings,
      northStarScore,
      userName: profile?.name || 'Friend',
      aiTone: profile?.preferences.aiTone ?? 'warm',
    }),
    [checkIns, todayCheckIn, completions, goals, visionBoards, northStarScore, copingRatings, profile]
  );
}
