import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StarRating from '../../components/common/StarRating';
import { useAppDispatch, useAppSelector } from '../../store';
import { addHabit, completeHabit, uncompleteHabit, deleteHabit, updateCompletionRating } from '../../store/slices/habitsSlice';
import { computeHabitStreaks, getHabitHeatmap } from '../../utils/patternAnalysis';
import type { HabitCategory } from '../../types';

const categoryIcons: Record<HabitCategory, string> = {
  Health: '💪', Mind: '🧠', Relationships: '💛', Career: '🚀',
  Creativity: '🎨', Finance: '💰', Spirituality: '🌿',
};

const habitColors = ['#c9a84c', '#7a9e7e', '#6fa8c8', '#b58adb', '#d47b7b', '#7ec8a4', '#e07040'];

interface NewHabitForm { name: string; category: HabitCategory; icon: string; color: string }

export default function Habits() {
  const dispatch = useAppDispatch();
  const habits = useAppSelector((s) => s.habits.habits);
  const completions = useAppSelector((s) => s.habits.completions);

  const [showAdd, setShowAdd] = useState(false);
  const [ratingModal, setRatingModal] = useState<{ habitId: string; name: string } | null>(null);
  const [tempRating, setTempRating] = useState(0);
  const [tempNote, setTempNote] = useState('');
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null);
  const [form, setForm] = useState<NewHabitForm>({
    name: '', category: 'Health', icon: '✨', color: '#c9a84c',
  });

  const todayKey = new Date().toISOString().split('T')[0];
  const completedTodayIds = new Set(
    completions.filter((c) => c.date.startsWith(todayKey)).map((c) => c.habitId)
  );

  function handleComplete(habitId: string, name: string) {
    if (completedTodayIds.has(habitId)) {
      dispatch(uncompleteHabit(habitId));
    } else {
      dispatch(completeHabit({ habitId }));
      setRatingModal({ habitId, name });
    }
  }

  function handleRatingSubmit() {
    if (ratingModal) {
      dispatch(updateCompletionRating({ habitId: ratingModal.habitId, rating: tempRating, note: tempNote }));
    }
    setRatingModal(null);
    setTempRating(0);
    setTempNote('');
  }

  function handleAddHabit() {
    if (!form.name.trim()) return;
    dispatch(addHabit({ ...form, isActive: true }));
    setForm({ name: '', category: 'Health', icon: '✨', color: '#c9a84c' });
    setShowAdd(false);
  }

  const activeHabits = habits.filter((h) => h.isActive);
  const completedToday = activeHabits.filter((h) => completedTodayIds.has(h.id)).length;

  return (
    <Layout title="Habits">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-heading text-2xl text-cream">Daily Habits</h2>
          <span className="text-sm text-starlight/50">
            {completedToday}/{activeHabits.length} today
          </span>
        </div>
        <div className="h-2 bg-navy-dark rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
            animate={{ width: activeHabits.length > 0 ? `${(completedToday / activeHabits.length) * 100}%` : '0%' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        {completedToday === activeHabits.length && activeHabits.length > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-gold text-sm mt-2 text-center font-heading">
            ✦ All habits complete — magnificent! ✦
          </motion.p>
        )}
      </div>

      {/* Habits List */}
      {activeHabits.length === 0 ? (
        <Card className="text-center py-12 mb-4">
          <p className="text-4xl mb-3">🌱</p>
          <h3 className="font-heading text-xl text-cream mb-2">Plant your first habit</h3>
          <p className="text-starlight/40 text-sm mb-4">Daily practices compound into extraordinary lives.</p>
          <Button onClick={() => setShowAdd(true)}>Add your first habit</Button>
        </Card>
      ) : (
        <div className="space-y-3 mb-6">
          {activeHabits.map((habit) => {
            const done = completedTodayIds.has(habit.id);
            const { current: streak, longest } = computeHabitStreaks(completions, habit.id);
            const isExpanded = expandedHabit === habit.id;
            const heatmap = isExpanded ? getHabitHeatmap(completions, habit.id, 28) : [];

            return (
              <Card key={habit.id} className={`transition-all ${done ? 'border-gold/25' : ''}`}>
                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={() => handleComplete(habit.id, habit.name)}
                    whileTap={{ scale: 0.85 }}
                    className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center text-lg flex-shrink-0 transition-all ${
                      done
                        ? 'border-gold bg-gold/20 shadow-gold'
                        : 'border-gold/20 bg-transparent hover:border-gold/50'
                    }`}
                    aria-label={done ? 'Mark incomplete' : 'Complete habit'}
                  >
                    {done ? (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                        ✓
                      </motion.span>
                    ) : (
                      habit.icon
                    )}
                  </motion.button>

                  <div className="flex-1 min-w-0" onClick={() => setExpandedHabit(isExpanded ? null : habit.id)}>
                    <p className={`font-medium ${done ? 'text-gold/70 line-through' : 'text-cream'}`}>{habit.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-starlight/30">{categoryIcons[habit.category]} {habit.category}</span>
                      {streak > 0 && (
                        <span className="text-xs text-orange-400/70">🔥 {streak} day{streak !== 1 ? 's' : ''}</span>
                      )}
                      {streak >= 7 && (
                        <span className="text-xs text-gold/60">
                          {streak >= 90 ? '🏆 90+' : streak >= 30 ? '⭐ 30+' : '✨ 7+'}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => dispatch(deleteHabit(habit.id))}
                    className="text-starlight/20 hover:text-red-400/60 transition-colors p-1"
                    aria-label="Delete habit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Expanded View */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-gold/10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-starlight/40">Last 28 days</span>
                          <span className="text-xs text-starlight/40">Best: {longest} days</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {['M','T','W','T','F','S','S'].map((d, i) => (
                            <div key={i} className="text-center text-[9px] text-starlight/20">{d}</div>
                          ))}
                          {heatmap.map((day, i) => (
                            <div
                              key={i}
                              className="aspect-square rounded-sm"
                              style={{
                                background: day.count > 0
                                  ? `rgba(201,168,76,${0.3 + day.count * 0.5})`
                                  : 'rgba(21,35,54,0.8)',
                              }}
                              title={day.date}
                            />
                          ))}
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

      <Button onClick={() => setShowAdd(true)} variant="secondary" fullWidth className="mb-4">
        + Add New Habit
      </Button>

      {/* Add Habit Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New Habit">
        <div className="space-y-4">
          <input
            className="input-field"
            placeholder="Habit name..."
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            autoFocus
          />
          <div>
            <label className="text-xs text-starlight/50 mb-1.5 block">Category</label>
            <select
              className="input-field"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as HabitCategory, icon: categoryIcons[e.target.value as HabitCategory] })}
            >
              {Object.entries(categoryIcons).map(([cat, icon]) => (
                <option key={cat} value={cat}>{icon} {cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-starlight/50 mb-1.5 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {habitColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <Button onClick={handleAddHabit} disabled={!form.name.trim()} fullWidth>
            Add Habit
          </Button>
        </div>
      </Modal>

      {/* Post-completion Rating Modal */}
      <Modal isOpen={!!ratingModal} onClose={() => setRatingModal(null)} title="How did that feel?">
        <div className="text-center space-y-4">
          <p className="text-starlight/60 text-sm">You completed "{ratingModal?.name}" ✦</p>
          <div className="flex justify-center">
            <StarRating value={tempRating} onChange={setTempRating} size="lg" />
          </div>
          <textarea
            className="input-field resize-none"
            rows={2}
            placeholder="Optional note..."
            value={tempNote}
            onChange={(e) => setTempNote(e.target.value)}
          />
          <div className="flex gap-3">
            <Button onClick={() => setRatingModal(null)} variant="ghost" fullWidth>Skip</Button>
            <Button onClick={handleRatingSubmit} fullWidth>Save</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
