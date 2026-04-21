import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import AICard from '../../components/common/AICard';
import Button from '../../components/common/Button';
import { useAppDispatch, useAppSelector } from '../../store';
import { setWeeklySummary, setCorrelations, setInflectionPoints, setNorthStarScore } from '../../store/slices/insightsSlice';
import { generateWeeklySummary } from '../../api/claudeApi';
import { useAIContext } from '../../hooks/useAIContext';
import { computeNorthStarScore, getMoodTrend, computeCorrelations, detectInflectionPoints } from '../../utils/patternAnalysis';

type Range = '7' | '30' | '90';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-light border border-gold/20 rounded-xl px-3 py-2 text-xs">
      <p className="text-starlight/50 mb-1">{label}</p>
      <p className="text-gold font-semibold">{payload[0].value}/10</p>
    </div>
  );
};

export default function Insights() {
  const dispatch = useAppDispatch();
  const ctx = useAIContext();
  const checkIns = useAppSelector((s) => s.dailyCheckIn.history);
  const habits = useAppSelector((s) => s.habits.habits);
  const completions = useAppSelector((s) => s.habits.completions);
  const goals = useAppSelector((s) => s.goals.goals);
  const insights = useAppSelector((s) => s.insights);
  const northStarScore = useAppSelector((s) => s.insights.northStarScore);

  const [range, setRange] = useState<Range>('30');
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    const score = computeNorthStarScore({
      checkIns,
      completions,
      habits,
      goalCount: goals.length,
      completedGoalCount: goals.filter((g) => g.status === 'completed').length,
    });
    dispatch(setNorthStarScore(score));

    const correlations = computeCorrelations(checkIns, completions, habits);
    dispatch(setCorrelations(correlations));

    const alerts = detectInflectionPoints(checkIns, completions, habits);
    dispatch(setInflectionPoints(alerts));
  }, [checkIns, completions, habits, goals, dispatch]);

  async function fetchWeeklySummary() {
    setSummaryLoading(true);
    try {
      const summary = await generateWeeklySummary(ctx);
      dispatch(setWeeklySummary({ date: new Date().toISOString(), content: summary }));
    } catch {
      dispatch(setWeeklySummary({ date: new Date().toISOString(), content: 'Unable to generate summary — check your API key.' }));
    } finally {
      setSummaryLoading(false);
    }
  }

  const days = parseInt(range);
  const moodTrend = getMoodTrend(checkIns, days);
  const energyTrend = checkIns.slice(-days).map((c, i) => ({
    date: moodTrend[i]?.date ?? '',
    value: c.energy,
  }));
  const correlations = insights.patterns.correlations.slice(0, 5);
  const inflections = insights.patterns.inflectionPoints;

  // Heatmap
  const heatmapDays = 56;
  const heatmap = Array.from({ length: heatmapDays }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (heatmapDays - 1 - i));
    const key = d.toISOString().split('T')[0];
    const dayCompletions = completions.filter((c) => c.date.startsWith(key));
    return { date: key, count: dayCompletions.length };
  });

  const maxHeatmap = Math.max(...heatmap.map((d) => d.count), 1);

  const scoreColor = northStarScore >= 70 ? '#c9a84c' : northStarScore >= 40 ? '#7a9e7e' : '#7a8ca8';
  const scoreLabel = northStarScore >= 80 ? 'Exceptional' : northStarScore >= 60 ? 'Thriving' : northStarScore >= 40 ? 'Growing' : northStarScore > 0 ? 'Starting' : 'Begin Your Journey';

  return (
    <Layout title="Insights">
      {/* North Star Score */}
      <Card gold className="mb-4 text-center">
        <p className="text-xs text-starlight/40 mb-2">Your North Star Score</p>
        <div className="relative inline-flex items-center justify-center mb-2">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(201,168,76,0.1)" strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r="42" fill="none"
              stroke={scoreColor} strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeLinecap="round"
              initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - northStarScore / 100) }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-heading text-3xl text-cream">{northStarScore}</span>
            <span className="text-[10px] text-starlight/40">/ 100</span>
          </div>
        </div>
        <p className="font-heading text-lg" style={{ color: scoreColor }}>{scoreLabel}</p>
        <p className="text-xs text-starlight/30 mt-1">Based on mood, habits, and goal progress</p>
      </Card>

      {/* Inflection Alerts */}
      {inflections.length > 0 && (
        <div className="space-y-2 mb-4">
          {inflections.map((alert, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
              alert.urgency === 'high' ? 'border-red-500/30 bg-red-900/10' : 'border-gold/20 bg-gold/5'
            }`}>
              <span>{alert.urgency === 'high' ? '⚠️' : '💡'}</span>
              <p className="text-xs text-starlight/70">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Range Selector */}
      <div className="flex gap-2 mb-4">
        {(['7', '30', '90'] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
              range === r ? 'bg-gold text-navy font-semibold' : 'bg-navy-light border border-gold/10 text-starlight/50 hover:border-gold/30'
            }`}
          >
            {r}d
          </button>
        ))}
      </div>

      {/* Mood Trend */}
      {moodTrend.length > 1 ? (
        <Card className="mb-4">
          <h3 className="font-heading text-lg text-cream mb-3">Mood Trend</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={moodTrend} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.08)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(232,228,217,0.3)', fontSize: 10 }} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fill: 'rgba(232,228,217,0.3)', fontSize: 10 }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#c9a84c" strokeWidth={2} dot={false}
                activeDot={{ r: 4, fill: '#c9a84c', stroke: '#0d1b2a', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      ) : (
        <Card className="mb-4 text-center py-8">
          <p className="text-starlight/20 text-sm">Check in daily to see your mood trend.</p>
        </Card>
      )}

      {/* Energy & Focus */}
      {energyTrend.length > 1 && (
        <Card className="mb-4">
          <h3 className="font-heading text-lg text-cream mb-3">Energy & Focus</h3>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={energyTrend} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.08)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(232,228,217,0.3)', fontSize: 10 }} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fill: 'rgba(232,228,217,0.3)', fontSize: 10 }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#7a9e7e" strokeWidth={2} dot={false} name="Energy" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Habit Heatmap */}
      {completions.length > 0 && (
        <Card className="mb-4">
          <h3 className="font-heading text-lg text-cream mb-3">Habit Activity (8 Weeks)</h3>
          <div className="grid grid-cols-7 gap-1">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
              <div key={d} className="text-center text-[9px] text-starlight/20">{d}</div>
            ))}
            {heatmap.map((day, i) => (
              <div
                key={i}
                className="aspect-square rounded-sm cursor-default"
                style={{
                  background: day.count > 0
                    ? `rgba(201,168,76,${0.15 + (day.count / maxHeatmap) * 0.75})`
                    : 'rgba(21,35,54,0.6)',
                }}
                title={`${day.date}: ${day.count} completions`}
              />
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 mt-2">
            <span className="text-[10px] text-starlight/20">Less</span>
            {[0.15, 0.35, 0.55, 0.75, 0.9].map((o) => (
              <div key={o} className="w-3 h-3 rounded-sm" style={{ background: `rgba(201,168,76,${o})` }} />
            ))}
            <span className="text-[10px] text-starlight/20">More</span>
          </div>
        </Card>
      )}

      {/* Habit Correlations */}
      {correlations.length > 0 && (
        <Card className="mb-4">
          <h3 className="font-heading text-lg text-cream mb-3">Habits & Mood Correlation</h3>
          <div className="space-y-3">
            {correlations.map((c) => (
              <div key={c.habitId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-starlight/70">{c.habitName}</span>
                  <span className={`text-xs font-semibold ${c.correlation > 0 ? 'text-sage' : 'text-red-400/60'}`}>
                    {c.correlation > 0 ? '+' : ''}{Math.round(c.correlation * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-navy-dark rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: c.correlation > 0 ? '#7a9e7e' : '#d47b7b' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.abs(c.correlation) * 100 + 30)}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <p className="text-[11px] text-starlight/30 mt-1">{c.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Weekly Summary */}
      <AICard
        title="Weekly Narrative Summary"
        content={insights.aiSummaries.weekly?.content}
        loading={summaryLoading}
        onRefresh={fetchWeeklySummary}
        className="mb-4"
        icon={<span>📖</span>}
      >
        {!insights.aiSummaries.weekly && !summaryLoading && (
          <div className="space-y-3">
            <p className="text-sm text-starlight/40">Get a narrative summary of your week — patterns, wins, and guidance.</p>
            <Button size="sm" onClick={fetchWeeklySummary} variant="secondary">
              Generate Summary ✦
            </Button>
          </div>
        )}
      </AICard>

      {checkIns.length === 0 && (
        <div className="text-center py-8">
          <p className="text-4xl mb-3">📊</p>
          <h3 className="font-heading text-xl text-cream mb-2">Your insights await.</h3>
          <p className="text-starlight/40 text-sm">Check in daily and your patterns will emerge here.</p>
        </div>
      )}
    </Layout>
  );
}
