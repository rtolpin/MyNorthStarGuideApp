import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import AICard from '../../components/common/AICard';
import Button from '../../components/common/Button';
import { useAppDispatch, useAppSelector } from '../../store';
import { setActiveSituation, rateStrategy } from '../../store/slices/copingSlice';
import { generateCopingGuidance } from '../../api/claudeApi';
import { useAIContext } from '../../hooks/useAIContext';
import type { CopingSituation, CopingStrategy } from '../../types';
import { saveCopingRating } from '../../utils/db';

const situations: { type: CopingSituation; emoji: string; label: string }[] = [
  { type: 'overwhelmed', emoji: '🌊', label: 'Overwhelmed' },
  { type: 'anxious', emoji: '🌀', label: 'Anxious' },
  { type: 'sad', emoji: '💧', label: 'Sad' },
  { type: 'angry', emoji: '🔥', label: 'Angry' },
  { type: 'lonely', emoji: '🌙', label: 'Lonely' },
  { type: 'unfocused', emoji: '🌫️', label: 'Unfocused' },
  { type: 'grieving', emoji: '🍂', label: 'Grieving' },
  { type: 'burnt out', emoji: '⬛', label: 'Burnt Out' },
];

function TimerWidget({ seconds, onComplete }: { seconds: number; onComplete: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            onComplete();
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = ((seconds - remaining) / seconds) * 100;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="34" fill="none" stroke="#c9a84c" strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gold font-semibold text-sm font-body">
            {mins}:{secs.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => setRunning((r) => !r)}>
          {running ? 'Pause' : remaining === seconds ? 'Start' : 'Resume'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setRemaining(seconds); setRunning(false); }}>
          Reset
        </Button>
      </div>
    </div>
  );
}

function StrategyCard({ strategy, onRate }: {
  strategy: CopingStrategy;
  situation: CopingSituation;
  onRate: (r: 'yes' | 'somewhat' | 'no') => void;
}) {
  const [timerDone, setTimerDone] = useState(false);
  const [rated, setRated] = useState(false);

  function handleRate(r: 'yes' | 'somewhat' | 'no') {
    onRate(r);
    setRated(true);
  }

  return (
    <Card>
      <h3 className="font-heading text-lg text-cream mb-1">{strategy.name}</h3>
      <p className="text-sm text-starlight/50 mb-4">{strategy.description}</p>

      {strategy.steps && (
        <div className="space-y-2 mb-4">
          {strategy.steps.map((step, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="w-5 h-5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-starlight/70">{step}</p>
            </div>
          ))}
        </div>
      )}

      {strategy.hasTimer && strategy.duration && (
        <div className="flex justify-center mb-4">
          <TimerWidget seconds={strategy.duration} onComplete={() => setTimerDone(true)} />
        </div>
      )}

      {timerDone && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gold text-sm mb-3">
          ✦ Well done. How do you feel?
        </motion.p>
      )}

      {!rated ? (
        <div>
          <p className="text-xs text-starlight/40 text-center mb-2">Did this help?</p>
          <div className="flex gap-2 justify-center">
            {(['yes', 'somewhat', 'no'] as const).map((r) => (
              <button
                key={r}
                onClick={() => handleRate(r)}
                className="px-3 py-1.5 rounded-lg border border-gold/20 text-xs text-starlight/60 hover:border-gold/40 hover:text-gold transition-all"
              >
                {r === 'yes' ? '✓ Yes' : r === 'somewhat' ? '~ Somewhat' : '✗ No'}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sage text-xs">
          Noted. I'll remember what works for you.
        </motion.p>
      )}
    </Card>
  );
}

export default function Coping() {
  const dispatch = useAppDispatch();
  const ctx = useAIContext();
  const situation = useAppSelector((s) => s.coping.activeSituation);
  const strategies = useAppSelector((s) => s.coping.strategies);
  const top5Ids = useAppSelector((s) => s.coping.personalTop5);
  const allStrategies = useAppSelector((s) => s.coping.strategies);

  const [aiGuidance, setAiGuidance] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  async function fetchGuidance(sit: CopingSituation) {
    setAiLoading(true);
    try {
      const result = await generateCopingGuidance(ctx, sit);
      setAiGuidance(result);
    } catch {
      setAiGuidance("Take a slow, deep breath. You are safe. Whatever you're feeling will pass.");
    } finally {
      setAiLoading(false);
    }
  }

  function handleSituationSelect(sit: CopingSituation) {
    dispatch(setActiveSituation(sit));
    setAiGuidance('');
    fetchGuidance(sit);
  }

  function handleRate(strategyId: string, rating: 'yes' | 'somewhat' | 'no') {
    if (!situation) return;
    dispatch(rateStrategy({ strategyId, situationTag: situation, rating }));
    const ratingObj = {
      id: `${strategyId}-${Date.now()}`,
      strategyId,
      situationTag: situation,
      rating,
      date: new Date().toISOString(),
    };
    saveCopingRating(ratingObj).catch(console.warn);
  }

  const relevantStrategies = situation
    ? strategies.filter((s) => s.category === situation)
    : [];

  const top5 = top5Ids.map((id) => allStrategies.find((s) => s.id === id)).filter(Boolean) as typeof strategies;

  return (
    <Layout title="Coping Center">
      {/* 5-4-3-2-1 Grounding — always visible */}
      <Card gold className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-gold text-sm font-bold">⊕</span>
          <h3 className="font-heading text-base text-cream">Emergency Grounding: 5-4-3-2-1</h3>
        </div>
        <div className="grid grid-cols-5 gap-2 text-center">
          {[
            { n: 5, sense: 'SEE', color: '#c9a84c' },
            { n: 4, sense: 'TOUCH', color: '#7a9e7e' },
            { n: 3, sense: 'HEAR', color: '#6fa8c8' },
            { n: 2, sense: 'SMELL', color: '#b58adb' },
            { n: 1, sense: 'TASTE', color: '#e07040' },
          ].map(({ n, sense, color }) => (
            <div key={n} className="p-2 rounded-lg bg-navy-dark/40 border border-gold/10">
              <div className="text-xl font-heading" style={{ color }}>{n}</div>
              <div className="text-[9px] text-starlight/40 mt-0.5">{sense}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Situation Selector */}
      <h2 className="font-heading text-xl text-cream mb-3">How are you feeling?</h2>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {situations.map((s) => (
          <motion.button
            key={s.type}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSituationSelect(s.type)}
            className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all text-center ${
              situation === s.type
                ? 'border-gold/50 bg-gold/15'
                : 'border-gold/10 hover:border-gold/30'
            }`}
          >
            <span className="text-xl">{s.emoji}</span>
            <span className="text-[10px] text-starlight/50">{s.label}</span>
          </motion.button>
        ))}
      </div>

      {/* AI Guidance */}
      {situation && (
        <AICard
          title="North Star Companion"
          content={aiGuidance}
          loading={aiLoading}
          onRefresh={() => fetchGuidance(situation)}
          className="mb-4"
          icon={<span>🌟</span>}
        >
          {!aiGuidance && !aiLoading && (
            <p className="text-starlight/40 text-sm">Personalized guidance loading...</p>
          )}
        </AICard>
      )}

      {/* Strategies */}
      {situation && relevantStrategies.length > 0 && (
        <div>
          <h3 className="font-heading text-lg text-cream mb-3">Suggested Strategies</h3>
          <div className="space-y-4 mb-6">
            {relevantStrategies.map((strategy) => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                situation={situation}
                onRate={(r) => handleRate(strategy.id, r)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Personal Top 5 */}
      {top5.length > 0 && (
        <div>
          <h3 className="font-heading text-lg text-cream mb-3">Your Top Strategies</h3>
          <div className="space-y-2">
            {top5.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gold/10 bg-gold/5">
                <span className="text-gold text-sm font-heading">{i + 1}.</span>
                <span className="text-starlight/70 text-sm">{s.name}</span>
                <span className="ml-auto text-xs text-starlight/30">{s.technique}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!situation && top5.length === 0 && (
        <div className="text-center py-8">
          <p className="text-4xl mb-3">🧘</p>
          <h3 className="font-heading text-xl text-cream mb-2">You are not alone.</h3>
          <p className="text-starlight/40 text-sm">Select how you're feeling above and I'll guide you through it.</p>
        </div>
      )}
    </Layout>
  );
}
