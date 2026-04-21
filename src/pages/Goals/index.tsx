import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import AICard from '../../components/common/AICard';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useAppDispatch, useAppSelector } from '../../store';
import { addGoal, deleteGoal, setGoalStatus, addMilestone, completeMilestone, setGoalAIPlan } from '../../store/slices/goalsSlice';
import { generateGoalPlan } from '../../api/claudeApi';
import { useAIContext } from '../../hooks/useAIContext';
import type { GoalCategory, GoalStatus } from '../../types';

const categoryEmoji: Record<GoalCategory, string> = {
  Health: '💪', Career: '🚀', Relationships: '💛', Finance: '💰',
  'Personal Growth': '🌱', Creativity: '🎨', Travel: '✈️', Spirituality: '🌿',
};

const statusColors: Record<GoalStatus, string> = {
  active: 'text-gold border-gold/30', completed: 'text-sage border-sage/30',
  paused: 'text-starlight/40 border-starlight/20', archived: 'text-starlight/20 border-starlight/10',
};

export default function Goals() {
  const dispatch = useAppDispatch();
  const ctx = useAIContext();
  const goals = useAppSelector((s) => s.goals.goals);

  const [showAdd, setShowAdd] = useState(false);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', category: 'Personal Growth' as GoalCategory, description: '', targetDate: '' });
  const [milestoneInput, setMilestoneInput] = useState('');

  async function handleGeneratePlan(goalId: string) {
    const g = goals.find((g) => g.id === goalId);
    if (!g) return;
    setPlanLoading(goalId);
    try {
      const plan = await generateGoalPlan(ctx, g.title, g.description, g.targetDate);
      dispatch(setGoalAIPlan({ goalId, plan }));
    } catch (e) {
      dispatch(setGoalAIPlan({ goalId, plan: 'Unable to generate plan — please check your API key.' }));
    } finally {
      setPlanLoading(null);
    }
  }

  function handleAddGoal() {
    if (!form.title.trim()) return;
    dispatch(addGoal({
      title: form.title,
      category: form.category,
      description: form.description,
      targetDate: form.targetDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    }));
    setForm({ title: '', category: 'Personal Growth', description: '', targetDate: '' });
    setShowAdd(false);
  }

  function handleAddMilestone(goalId: string) {
    if (!milestoneInput.trim()) return;
    dispatch(addMilestone({
      goalId,
      milestone: {
        title: milestoneInput.trim(),
        targetDate: '',
        order: (goals.find((g) => g.id === goalId)?.milestones.length ?? 0) + 1,
      },
    }));
    setMilestoneInput('');
  }

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  return (
    <Layout title="Goals">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl text-cream">Your Stars to Chase</h2>
        <Button onClick={() => setShowAdd(true)} size="sm">+ Goal</Button>
      </div>

      {activeGoals.length === 0 ? (
        <Card className="text-center py-12 mb-4">
          <p className="text-4xl mb-3">🌟</p>
          <h3 className="font-heading text-xl text-cream mb-2">What are you reaching for?</h3>
          <p className="text-starlight/40 text-sm mb-4">Goals give your daily habits direction and meaning.</p>
          <Button onClick={() => setShowAdd(true)}>Set your first goal</Button>
        </Card>
      ) : (
        <div className="space-y-4 mb-6">
          {activeGoals.map((goal) => {
            const completed = goal.milestones.filter((m) => m.completedAt).length;
            const total = goal.milestones.length;
            const pct = total > 0 ? (completed / total) * 100 : 0;
            const isOpen = activeGoalId === goal.id;

            return (
              <Card key={goal.id}>
                <div
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => setActiveGoalId(isOpen ? null : goal.id)}
                >
                  <span className="text-2xl mt-0.5">{categoryEmoji[goal.category]}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-lg text-cream">{goal.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[goal.status]}`}>
                        {goal.status}
                      </span>
                      <span className="text-xs text-starlight/30">{goal.category}</span>
                      {goal.targetDate && (
                        <span className="text-xs text-starlight/30">
                          {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    {total > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-starlight/30 mb-1">
                          <span>{completed}/{total} milestones</span>
                          <span>{Math.round(pct)}%</span>
                        </div>
                        <div className="h-1.5 bg-navy-dark rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <svg className={`w-4 h-4 text-starlight/30 transition-transform mt-1 ${isOpen ? 'rotate-90' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="mt-4 pt-4 border-t border-gold/10 space-y-4">
                        {goal.description && (
                          <p className="text-sm text-starlight/50">{goal.description}</p>
                        )}

                        {/* Milestones */}
                        <div>
                          <h4 className="text-sm font-semibold text-starlight/60 mb-2">Milestones</h4>
                          <div className="space-y-2">
                            {goal.milestones.map((m) => (
                              <div key={m.id} className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!m.completedAt) dispatch(completeMilestone({ goalId: goal.id, milestoneId: m.id }));
                                  }}
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    m.completedAt ? 'bg-gold border-gold' : 'border-gold/30 hover:border-gold/60'
                                  }`}
                                >
                                  {m.completedAt && (
                                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-navy text-xs">✓</motion.span>
                                  )}
                                </button>
                                <span className={`text-sm ${m.completedAt ? 'line-through text-starlight/30' : 'text-starlight/80'}`}>
                                  {m.title}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <input
                              className="input-field text-sm py-2"
                              placeholder="Add milestone..."
                              value={milestoneInput}
                              onChange={(e) => setMilestoneInput(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone(goal.id)}
                            />
                            <Button size="sm" onClick={() => handleAddMilestone(goal.id)} variant="secondary">Add</Button>
                          </div>
                        </div>

                        {/* AI Plan */}
                        <AICard
                          title="AI Action Plan"
                          content={goal.aiPlan}
                          loading={planLoading === goal.id}
                          onRefresh={() => handleGeneratePlan(goal.id)}
                        >
                          {!goal.aiPlan && planLoading !== goal.id && (
                            <Button size="sm" onClick={() => handleGeneratePlan(goal.id)} variant="secondary">
                              Generate AI Plan ✦
                            </Button>
                          )}
                        </AICard>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              dispatch(setGoalStatus({ id: goal.id, status: 'completed' }));
                              setActiveGoalId(null);
                            }}
                          >
                            ✓ Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => dispatch(setGoalStatus({ id: goal.id, status: 'paused' }))}
                          >
                            Pause
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => dispatch(deleteGoal(goal.id))}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h3 className="font-heading text-lg text-cream/50 mb-3">Achieved ✦</h3>
          <div className="space-y-2">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gold/10 bg-gold/5">
                <span className="text-lg">{categoryEmoji[goal.category]}</span>
                <span className="text-starlight/50 text-sm line-through">{goal.title}</span>
                <span className="ml-auto text-gold text-xs">✦ Done</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New Goal" size="lg">
        <div className="space-y-4">
          <input
            className="input-field"
            placeholder="What do you want to achieve?"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            autoFocus
          />
          <select
            className="input-field"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as GoalCategory })}
          >
            {Object.entries(categoryEmoji).map(([cat, emoji]) => (
              <option key={cat} value={cat}>{emoji} {cat}</option>
            ))}
          </select>
          <textarea
            className="input-field resize-none"
            rows={2}
            placeholder="Why does this matter to you? (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div>
            <label className="text-xs text-starlight/50 mb-1 block">Target Date (optional)</label>
            <input
              type="date"
              className="input-field"
              value={form.targetDate}
              onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
            />
          </div>
          <Button onClick={handleAddGoal} disabled={!form.title.trim()} fullWidth>
            Add Goal ✦
          </Button>
        </div>
      </Modal>
    </Layout>
  );
}
