import type { AIContext, MoodType } from '../types';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

function getApiKey(): string {
  return (
    (import.meta as unknown as { env: Record<string, string> }).env.VITE_ANTHROPIC_API_KEY ?? ''
  );
}

async function callClaude(systemPrompt: string, userMessage: string): Promise<string> {
  const key = getApiKey();
  if (!key) {
    throw new Error('No API key configured. Please set VITE_ANTHROPIC_API_KEY in your .env file.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text ?? '';
}

function buildContext(ctx: AIContext): string {
  const moodSummary =
    ctx.recentMoods.length > 0
      ? `Recent moods (last ${ctx.recentMoods.length} check-ins): ${ctx.recentMoods.slice(-7).map((m) => m.mood).join(', ')}`
      : 'No mood history yet';

  const habitSummary =
    ctx.habitCompletions.length > 0
      ? `${ctx.habitCompletions.length} habit completions logged`
      : 'No habits tracked yet';

  const goalSummary =
    ctx.activeGoals.length > 0
      ? `Active goals: ${ctx.activeGoals.map((g) => g.title).join(', ')}`
      : 'No active goals';

  const currentMoodStr = ctx.currentMood
    ? `Today's mood: ${ctx.currentMood.mood}, energy: ${ctx.currentMood.energy}/10, focus: ${ctx.currentMood.focus}/10`
    : 'No check-in today yet';

  return `
USER CONTEXT:
- Name: ${ctx.userName}
- North Star Score: ${ctx.northStarScore}/100
- ${currentMoodStr}
- ${moodSummary}
- ${habitSummary}
- ${goalSummary}
- AI Tone preference: ${ctx.aiTone}
- Vision board items: ${ctx.visionBoardItems.length} items
`.trim();
}

function toneInstruction(tone: string): string {
  if (tone === 'direct') return 'Be concise, clear, and action-oriented.';
  if (tone === 'motivational') return 'Be energizing, bold, and inspiring.';
  return 'Be warm, empathetic, deeply personal, and gently encouraging.';
}

export async function generateMorningBrief(ctx: AIContext): Promise<string> {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const system = `You are a wise life coach and personal AI companion named North Star.
${toneInstruction(ctx.aiTone)}
Keep responses to 3-4 sentences maximum. Be specific to this person's data.`;

  const user = `Generate a personalized ${greeting} brief for this user.
${buildContext(ctx)}

Write a warm, insightful morning brief that acknowledges their current state, references a recent pattern you notice, and offers one specific, actionable suggestion for today. Address them by name (${ctx.userName}).`;

  return callClaude(system, user);
}

export async function generateWeekAheadPrediction(ctx: AIContext): Promise<string> {
  const system = `You are a pattern analyst and life strategist named North Star.
${toneInstruction(ctx.aiTone)}
Analyze behavioral patterns to predict and guide the coming week.`;

  const user = `Based on this user's data, generate a "Your Week Ahead" prediction.
${buildContext(ctx)}

Include: predicted energy and mood trajectory, key habits to prioritize, a potential challenge to watch for, and one opportunity to seize this week. Be specific and data-informed. Keep it to 150-200 words.`;

  return callClaude(system, user);
}

export async function generateFutureSelfLetter(ctx: AIContext): Promise<string> {
  const system = `You are channeling the user's future self — the best version of who they are becoming.
${toneInstruction(ctx.aiTone)}
Write in first person as their future self, 1-2 years from now.`;

  const user = `Write a letter from ${ctx.userName}'s future self, based on their goals and current trajectory.
${buildContext(ctx)}
Goals: ${ctx.activeGoals.map((g) => `"${g.title}" (${g.category})`).join(', ') || 'None set yet'}

Write a personal, emotionally resonant letter (200-250 words) that acknowledges where they are now, celebrates who they are becoming, and offers encouragement for the journey. Make it specific to their goals and patterns.`;

  return callClaude(system, user);
}

export async function generateGoalPlan(
  ctx: AIContext,
  goalTitle: string,
  goalDescription: string,
  targetDate: string
): Promise<string> {
  const system = `You are a strategic life coach and action planner named North Star.
${toneInstruction(ctx.aiTone)}
Create concrete, adaptive action plans.`;

  const user = `Create a step-by-step action plan for this goal.
${buildContext(ctx)}

GOAL: "${goalTitle}"
DESCRIPTION: "${goalDescription}"
TARGET DATE: ${targetDate}

Given the user's current energy (${ctx.currentMood?.energy ?? 'unknown'}/10) and mood (${ctx.currentMood?.mood ?? 'unknown'}), create an adaptive plan with:
1. Weekly milestones
2. Daily micro-actions (15-30 minutes each)
3. A "minimum effective dose" version for low-energy days
4. How this goal connects to their other active goals

Format as clear sections with bullet points. Keep it actionable and specific.`;

  return callClaude(system, user);
}

export async function generateHabitInsight(
  ctx: AIContext,
  habitName: string,
  correlationScore: number,
  streakDays: number
): Promise<string> {
  const system = `You are a behavioral pattern analyst named North Star.
${toneInstruction(ctx.aiTone)}
Be data-driven but warm. Keep insights to 2-3 sentences.`;

  const user = `Generate a personalized insight for this habit.
${buildContext(ctx)}

HABIT: "${habitName}"
Current streak: ${streakDays} days
Mood correlation score: ${correlationScore} (how much better their mood is when they complete this habit)

Provide a specific, encouraging insight about what this habit data reveals about ${ctx.userName}'s wellbeing.`;

  return callClaude(system, user);
}

export async function generateCopingGuidance(
  ctx: AIContext,
  situation: string
): Promise<string> {
  const system = `You are a calm, grounding crisis companion named North Star.
Be gentle, non-judgmental, and immediately helpful. This person needs support right now.
Never minimize their experience. Lead with acknowledgment, then offer specific steps.`;

  const topStrategies = ctx.previousCopingRatings
    .filter((r) => r.rating === 'yes')
    .slice(-5)
    .map((r) => r.strategyId);

  const user = `${ctx.userName} is feeling ${situation} and needs support.
${buildContext(ctx)}
Strategies that have worked for them before: ${topStrategies.join(', ') || 'none rated yet'}

Offer a compassionate 3-4 sentence response that: acknowledges their feeling, suggests the most relevant coping approach based on their history, and reminds them of their resilience. Keep it grounding and immediate.`;

  return callClaude(system, user);
}

export async function generateWeeklySummary(ctx: AIContext): Promise<string> {
  const system = `You are a life intelligence analyst named North Star.
${toneInstruction(ctx.aiTone)}
Generate narrative weekly summaries that help users understand their patterns.`;

  const user = `Generate a weekly summary narrative for ${ctx.userName}.
${buildContext(ctx)}

Write a 150-200 word narrative that covers:
- Overall mood and energy trend this week
- Habit performance highlights and gaps
- One key pattern or insight from the data
- A meaningful encouragement for next week

Write it as a personal, intelligent summary — not a list. Make it feel like your wise advisor reflecting on your week.`;

  return callClaude(system, user);
}

export async function generateVisionInterpretation(
  ctx: AIContext,
  visionDescription: string
): Promise<string> {
  const system = `You are a visionary life strategist named North Star.
${toneInstruction(ctx.aiTone)}
Help people bridge the gap between their dreams and concrete action.`;

  const user = `${ctx.userName} has described their dream life or vision:
"${visionDescription}"
${buildContext(ctx)}

Extract from this vision:
1. 3-5 specific, concrete goals implied by this vision
2. For each goal, one immediate first action step
3. How these goals align with or complement their existing active goals
4. A one-sentence affirmation that captures the essence of this vision

Format clearly with headers.`;

  return callClaude(system, user);
}

export async function generateWhatIfSimulation(
  ctx: AIContext,
  habitName: string
): Promise<string> {
  const system = `You are a behavioral scientist and life oracle named North Star.
${toneInstruction(ctx.aiTone)}
Use pattern analysis to create realistic, inspiring simulations of positive change.`;

  const user = `${ctx.userName} asks: "What if I started ${habitName} daily?"
${buildContext(ctx)}

Simulate the realistic impact of this habit over:
- Week 1: Initial adjustment
- Month 1: Early momentum
- Month 3: Transformed patterns

Reference their current mood patterns, energy levels, and goals to make this specific and credible. Keep it inspiring but realistic. 150-200 words.`;

  return callClaude(system, user);
}

export async function generatePersonalizedAffirmations(
  ctx: AIContext,
  visionItems: string[]
): Promise<string[]> {
  const system = `You are a soulful affirmation writer named North Star.
Write affirmations that feel personal, true, and powerful — not generic.
Return exactly 5 affirmations, one per line.`;

  const user = `Generate 5 deeply personal affirmations for ${ctx.userName}.
${buildContext(ctx)}

Vision board themes: ${visionItems.join(', ')}

Write affirmations that:
- Feel specific to this person's goals and journey
- Use "I am", "I have", or "I create" language
- Reference their actual aspirations
- Feel true and achievable, not hollow
- Resonate emotionally

Return exactly 5 affirmations, one per line, no numbering.`;

  const result = await callClaude(system, user);
  return result
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 5);
}

export async function generateMoodBasedActivities(
  mood: MoodType,
  energy: number
): Promise<string[]> {
  const system = `You are a wellness activity recommender. Return exactly 4 short activity suggestions.`;

  const user = `Suggest 4 activities for someone feeling ${mood} with energy level ${energy}/10.
Each suggestion should be 1 sentence, specific, and achievable within 30 minutes.
Return one per line, no bullets or numbers.`;

  const result = await callClaude(system, user);
  return result
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 4);
}
