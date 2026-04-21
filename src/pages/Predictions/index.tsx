import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import AICard from '../../components/common/AICard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAppDispatch, useAppSelector } from '../../store';
import { setWeekAheadPrediction, setFutureSelfLetter } from '../../store/slices/insightsSlice';
import { useAIContext } from '../../hooks/useAIContext';
import {
  generateWeekAheadPrediction,
  generateFutureSelfLetter,
  generateWhatIfSimulation,
} from '../../api/claudeApi';

export default function Predictions() {
  const dispatch = useAppDispatch();
  const ctx = useAIContext();
  const predictions = useAppSelector((s) => s.insights.predictions);
  const inflectionPoints = useAppSelector((s) => s.insights.patterns.inflectionPoints);

  const [weekLoading, setWeekLoading] = useState(false);
  const [weekError, setWeekError] = useState('');
  const [futureLoading, setFutureLoading] = useState(false);
  const [futureError, setFutureError] = useState('');
  const [whatIfHabit, setWhatIfHabit] = useState('');
  const [whatIfResult, setWhatIfResult] = useState('');
  const [whatIfLoading, setWhatIfLoading] = useState(false);

  async function fetchWeekAhead() {
    setWeekLoading(true);
    setWeekError('');
    try {
      const content = await generateWeekAheadPrediction(ctx);
      dispatch(setWeekAheadPrediction({ generatedAt: new Date().toISOString(), content, predictedMoods: [] }));
    } catch {
      setWeekError('Unable to generate prediction — check your API key.');
    } finally {
      setWeekLoading(false);
    }
  }

  async function fetchFutureLetter() {
    setFutureLoading(true);
    setFutureError('');
    try {
      const letter = await generateFutureSelfLetter(ctx);
      dispatch(setFutureSelfLetter(letter));
    } catch {
      setFutureError('Unable to generate letter — check your API key.');
    } finally {
      setFutureLoading(false);
    }
  }

  async function fetchWhatIf() {
    if (!whatIfHabit.trim()) return;
    setWhatIfLoading(true);
    try {
      const result = await generateWhatIfSimulation(ctx, whatIfHabit);
      setWhatIfResult(result);
    } catch {
      setWhatIfResult('Unable to simulate — check your API key.');
    } finally {
      setWhatIfLoading(false);
    }
  }

  return (
    <Layout title="Predictions" showBack>
      <div className="mb-6">
        <h2 className="font-heading text-2xl text-cream mb-1">AI Future Self Engine</h2>
        <p className="text-starlight/40 text-sm">Pattern analysis and predictions based on your data.</p>
      </div>

      {/* Inflection Point Alerts */}
      {inflectionPoints.length > 0 && (
        <div className="space-y-2 mb-6">
          {inflectionPoints.map((alert, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${
                alert.urgency === 'high'
                  ? 'border-red-500/30 bg-red-900/10'
                  : 'border-gold/20 bg-gold/5'
              }`}
            >
              <span>{alert.urgency === 'high' ? '⚠️' : '💡'}</span>
              <p className="text-sm text-starlight/70">{alert.message}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Week Ahead */}
      <AICard
        title="Your Week Ahead"
        content={predictions.weekAhead?.content}
        loading={weekLoading}
        error={weekError}
        onRefresh={fetchWeekAhead}
        className="mb-4"
        icon={<span>🔮</span>}
      >
        {!predictions.weekAhead && !weekLoading && (
          <div className="space-y-3">
            <p className="text-sm text-starlight/40">AI predicts your mood trajectory and best strategy for the coming week.</p>
            <Button size="sm" onClick={fetchWeekAhead} variant="secondary">
              Generate Week Ahead ✦
            </Button>
          </div>
        )}
      </AICard>

      {/* Future Self Letter */}
      <Card gold className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-gold">✉️</span>
            <h3 className="font-heading text-lg text-cream">Letter from Your Future Self</h3>
          </div>
          <span className="text-xs text-gold/60 bg-gold/10 px-2 py-0.5 rounded-full">AI</span>
        </div>
        {predictions.futureSelfLetter ? (
          <div>
            <p className="text-starlight/80 text-sm leading-relaxed italic whitespace-pre-line">
              {predictions.futureSelfLetter}
            </p>
            <button
              onClick={fetchFutureLetter}
              className="mt-3 text-xs text-gold/50 hover:text-gold transition-colors"
            >
              Regenerate →
            </button>
          </div>
        ) : futureLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="h-4 bg-gold/10 rounded-full"
                style={{ width: i === 3 ? '70%' : '100%' }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-starlight/40">
              Claude writes a deeply personal letter from your future self — based on your goals, patterns, and trajectory.
            </p>
            <Button size="sm" onClick={fetchFutureLetter} variant="secondary">
              Read Your Future ✦
            </Button>
          </div>
        )}
        {futureError && <p className="text-red-400/70 text-xs mt-2">{futureError}</p>}
      </Card>

      {/* What If Simulator */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-gold">⚡</span>
          <h3 className="font-heading text-lg text-cream">"What If" Simulator</h3>
        </div>
        <p className="text-sm text-starlight/40 mb-3">
          Describe a habit and AI predicts its impact on your life.
        </p>
        <div className="flex gap-2 mb-3">
          <input
            className="input-field"
            placeholder='e.g. "I meditated daily", "I exercised every morning"'
            value={whatIfHabit}
            onChange={(e) => setWhatIfHabit(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchWhatIf()}
          />
          <Button size="sm" onClick={fetchWhatIf} loading={whatIfLoading} disabled={!whatIfHabit.trim()}>
            Simulate
          </Button>
        </div>
        {whatIfResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-gold/5 border border-gold/15"
          >
            <p className="text-sm text-starlight/80 whitespace-pre-line leading-relaxed">{whatIfResult}</p>
          </motion.div>
        )}
      </Card>

      {/* Decision Forecast */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-gold">📊</span>
          <h3 className="font-heading text-lg text-cream">Decision Forecast</h3>
        </div>
        <p className="text-sm text-starlight/40 mb-3">
          Based on your current behavioral patterns, here's what your trajectory looks like if you continue as-is.
        </p>
        {predictions.decisionForecast ? (
          <p className="text-sm text-starlight/80 leading-relaxed">{predictions.decisionForecast}</p>
        ) : (
          <div className="text-center py-6">
            <p className="text-starlight/20 text-sm">Complete at least 7 days of check-ins to unlock your forecast.</p>
          </div>
        )}
      </Card>
    </Layout>
  );
}
