import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import AICard from '../../components/common/AICard';
import MoodWheel, { moods } from '../../components/features/MoodWheel';
import Slider from '../../components/common/Slider';
import Button from '../../components/common/Button';
import { useAppDispatch, useAppSelector } from '../../store';
import { startCheckIn, setTags, setFreeText, setAIMorningBrief, saveCheckIn } from '../../store/slices/dailyCheckInSlice';
import { setNorthStarScore } from '../../store/slices/insightsSlice';
import { useAIContext } from '../../hooks/useAIContext';
import { generateMorningBrief, generateMoodBasedActivities } from '../../api/claudeApi';
import { computeNorthStarScore, computeHabitStreaks } from '../../utils/patternAnalysis';
import type { MoodType, CheckInTag } from '../../types';

const checkInTags: CheckInTag[] = ['work stress', 'relationships', 'health', 'finances', 'loneliness', 'uncertainty'];

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 5) return `The night is still, ${name}. What's on your mind?`;
  if (hour < 12) return `Good morning, ${name}. Your stars are aligned today.`;
  if (hour < 17) return `Good afternoon, ${name}. How is your day unfolding?`;
  if (hour < 21) return `Good evening, ${name}. Time to reflect.`;
  return `A peaceful night to you, ${name}. How are you really?`;
}

export default function Home() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const ctx = useAIContext();
  const profile = useAppSelector((s) => s.userProfile.profile);
  const today = useAppSelector((s) => s.dailyCheckIn.today);
  const habits = useAppSelector((s) => s.habits.habits.filter((h) => h.isActive));
  const completions = useAppSelector((s) => s.habits.completions);
  const goals = useAppSelector((s) => s.goals.goals.filter((g) => g.status === 'active'));
  const checkIns = useAppSelector((s) => s.dailyCheckIn.history);
  const allHabits = useAppSelector((s) => s.habits.habits);

  const [mood, setMood] = useState<MoodType | null>(today?.mood ?? null);
  const [energy, setEnergy] = useState(today?.energy ?? 5);
  const [focus, setFocus] = useState(today?.focus ?? 5);
  const [selectedTags, setSelectedTags] = useState<CheckInTag[]>(today?.tags ?? []);
  const [freeText, setFreeTextLocal] = useState(today?.freeText ?? '');
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefError, setBriefError] = useState('');
  const [activities, setActivities] = useState<string[]>([]);
  const [_activitiesLoading, setActivitiesLoading] = useState(false);
  const [checkInSaved, setCheckInSaved] = useState(!!today);
  const [showCheckIn, setShowCheckIn] = useState(!today);

  const name = profile?.name || 'Friend';

  useEffect(() => {
    const score = computeNorthStarScore({
      checkIns,
      completions,
      habits: allHabits,
      goalCount: goals.length,
      completedGoalCount: goals.filter((g) => g.status === 'completed').length,
    });
    dispatch(setNorthStarScore(score));
  }, [checkIns, completions, allHabits, goals, dispatch]);

  const fetchMorningBrief = useCallback(async () => {
    if (!today) return;
    setBriefLoading(true);
    setBriefError('');
    try {
      const brief = await generateMorningBrief(ctx);
      dispatch(setAIMorningBrief(brief));
    } catch (e) {
      setBriefError('Unable to generate brief — check your API key in .env');
    } finally {
      setBriefLoading(false);
    }
  }, [ctx, today, dispatch]);

  function handleSaveCheckIn() {
    if (!mood) return;
    dispatch(startCheckIn({ mood, energy, focus }));
    dispatch(setTags(selectedTags));
    dispatch(setFreeText(freeText));
    dispatch(saveCheckIn());
    setCheckInSaved(true);
    setShowCheckIn(false);
    fetchMorningBrief();
    fetchActivities(mood, energy);
  }

  async function fetchActivities(m: MoodType, e: number) {
    setActivitiesLoading(true);
    try {
      const acts = await generateMoodBasedActivities(m, e);
      setActivities(acts);
    } catch {
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  }

  function toggleTag(tag: CheckInTag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  const todayKey = new Date().toISOString().split('T')[0];
  const completedTodayIds = new Set(
    completions.filter((c) => c.date.startsWith(todayKey)).map((c) => c.habitId)
  );
  const streaks = habits.map((h) => ({
    ...h,
    streak: computeHabitStreaks(completions, h.id).current,
  }));

  const currentMoodData = mood ? moods.find((m) => m.type === mood) : null;

  return (
    <Layout>
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-heading text-3xl text-cream mb-1">{getGreeting(name)}</h1>
        <p className="text-starlight/40 text-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Check-In Card */}
      <AnimatePresence mode="wait">
        {showCheckIn ? (
          <motion.div key="checkin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card gold className="mb-4">
              <h2 className="font-heading text-xl text-cream mb-4">How are you today?</h2>
              <MoodWheel selected={mood} onSelect={setMood} />
              {mood && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="mt-5 space-y-4">
                  <Slider value={energy} onChange={setEnergy} label="Energy" leftLabel="Drained" rightLabel="Electric" />
                  <Slider value={focus} onChange={setFocus} label="Focus" leftLabel="Scattered" rightLabel="Laser" />
                  <div>
                    <p className="text-sm text-starlight/60 mb-2">What's weighing on you? (optional)</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {checkInTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                            selectedTags.includes(tag)
                              ? 'border-gold/50 bg-gold/15 text-gold'
                              : 'border-gold/15 text-starlight/40 hover:border-gold/30'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="input-field resize-none"
                      rows={2}
                      placeholder="Anything else on your mind..."
                      value={freeText}
                      onChange={(e) => setFreeTextLocal(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSaveCheckIn} fullWidth>
                    Complete Check-In ✦
                  </Button>
                </motion.div>
              )}
            </Card>
          </motion.div>
        ) : (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card gold className="mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currentMoodData?.emoji ?? '✨'}</span>
                  <div>
                    <p className="text-sm text-starlight/50">Today's mood</p>
                    <p className="font-heading text-lg text-cream capitalize">{today?.mood ?? mood}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="text-gold font-semibold">{today?.energy ?? energy}</p>
                    <p className="text-xs text-starlight/30">Energy</p>
                  </div>
                  <div>
                    <p className="text-gold font-semibold">{today?.focus ?? focus}</p>
                    <p className="text-xs text-starlight/30">Focus</p>
                  </div>
                </div>
                <button onClick={() => setShowCheckIn(true)} className="text-xs text-gold/50 hover:text-gold">Edit</button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Morning Brief */}
      {checkInSaved && (
        <AICard
          title="Your Morning Brief"
          content={today?.aiMorningBrief}
          loading={briefLoading}
          error={briefError}
          onRefresh={fetchMorningBrief}
          className="mb-4"
          icon={
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
            </svg>
          }
        >
          {!today?.aiMorningBrief && !briefLoading && !briefError && (
            <div className="text-center py-2">
              <p className="text-starlight/40 text-sm mb-3">Complete your check-in to unlock your personalized brief.</p>
            </div>
          )}
        </AICard>
      )}

      {/* Suggested Activities */}
      {activities.length > 0 && (
        <Card className="mb-4">
          <h3 className="font-heading text-lg text-cream mb-3">Suggested for your state</h3>
          <div className="space-y-2">
            {activities.map((act, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-2 text-sm text-starlight/70">
                <span className="text-gold mt-0.5 shrink-0">✦</span>
                <span>{act}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Today's Habits Quick View */}
      {habits.length > 0 && (
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-lg text-cream">Today's Habits</h3>
            <button onClick={() => navigate('/habits')} className="text-xs text-gold/50 hover:text-gold">View all →</button>
          </div>
          <div className="space-y-2">
            {streaks.slice(0, 4).map((habit) => {
              const done = completedTodayIds.has(habit.id);
              return (
                <div key={habit.id} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                  done ? 'border-gold/30 bg-gold/10' : 'border-gold/10'
                }`}>
                  <span className="text-lg">{habit.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${done ? 'text-gold line-through' : 'text-cream'}`}>{habit.name}</p>
                    {habit.streak > 0 && (
                      <p className="text-xs text-starlight/30">{habit.streak} day streak 🔥</p>
                    )}
                  </div>
                  {done && (
                    <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                      className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </motion.svg>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Active Goals Quick View */}
      {goals.length > 0 && (
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-lg text-cream">Active Goals</h3>
            <button onClick={() => navigate('/goals')} className="text-xs text-gold/50 hover:text-gold">View all →</button>
          </div>
          <div className="space-y-2">
            {goals.slice(0, 3).map((goal) => {
              const completed = goal.milestones.filter((m) => m.completedAt).length;
              const total = goal.milestones.length;
              const pct = total > 0 ? (completed / total) * 100 : 0;
              return (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-cream">{goal.title}</p>
                    <span className="text-xs text-starlight/30">{goal.category}</span>
                  </div>
                  {total > 0 && (
                    <div className="h-1.5 bg-navy-dark rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* AI Predictions CTA */}
      <Card hover onClick={() => navigate('/predictions')} className="mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
            🔮
          </div>
          <div>
            <h3 className="font-heading text-base text-cream">Your Week Ahead</h3>
            <p className="text-xs text-starlight/40">See AI predictions for your week</p>
          </div>
          <svg className="w-4 h-4 text-gold/40 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Card>

      {/* Empty state */}
      {!checkInSaved && habits.length === 0 && goals.length === 0 && (
        <div className="text-center py-8 text-starlight/30">
          <p className="font-heading text-lg mb-2">Your journey starts with a single step.</p>
          <p className="text-sm">Complete your check-in above, then explore Habits and Goals to begin.</p>
        </div>
      )}
    </Layout>
  );
}
