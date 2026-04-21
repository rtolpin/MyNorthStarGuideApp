import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  createBoard, setActiveBoard, addItem, removeItem, setItemStatus,
} from '../../store/slices/visionBoardSlice';
import { generateVisionInterpretation, generatePersonalizedAffirmations } from '../../api/claudeApi';
import { useAIContext } from '../../hooks/useAIContext';
import type { VisionItemStatus, VisionItemType } from '../../types';

const statusColors: Record<VisionItemStatus, string> = {
  dreaming: 'border-gold/20 bg-gold/5',
  'in-progress': 'border-sage/30 bg-sage/10',
  achieved: 'border-gold/60 bg-gold/20',
};

const statusLabels: Record<VisionItemStatus, string> = {
  dreaming: '💭 Dreaming',
  'in-progress': '🌱 In Progress',
  achieved: '✦ Achieved',
};

export default function VisionBoard() {
  const dispatch = useAppDispatch();
  const ctx = useAIContext();
  const boards = useAppSelector((s) => s.visionBoard.boards);
  const activeBoardId = useAppSelector((s) => s.visionBoard.activeBoardId);
  const activeBoard = boards.find((b) => b.id === activeBoardId);

  const [showNewBoard, setShowNewBoard] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [visionText, setVisionText] = useState('');
  const [visionInterp, setVisionInterp] = useState('');
  const [visionLoading, setVisionLoading] = useState(false);
  const [affirmations, setAffirmations] = useState<string[]>([]);
  const [affLoading, setAffLoading] = useState(false);
  const [itemForm, setItemForm] = useState({ type: 'text' as VisionItemType, content: '', color: '#c9a84c' });
  const [celebratingItem, setCelebratingItem] = useState<string | null>(null);

  function handleCreateBoard() {
    if (!boardName.trim()) return;
    dispatch(createBoard({ name: boardName.trim() }));
    setBoardName('');
    setShowNewBoard(false);
  }

  function handleAddItem() {
    if (!activeBoardId || !itemForm.content.trim()) return;
    dispatch(addItem({
      boardId: activeBoardId,
      item: {
        type: itemForm.type,
        content: itemForm.content,
        position: { x: Math.random() * 60 + 10, y: Math.random() * 60 + 10 },
        size: { w: 160, h: 100 },
        status: 'dreaming',
        color: itemForm.color,
      },
    }));
    setItemForm({ type: 'text', content: '', color: '#c9a84c' });
    setShowAddItem(false);
  }

  function handleSetStatus(itemId: string, status: VisionItemStatus) {
    if (!activeBoardId) return;
    dispatch(setItemStatus({ boardId: activeBoardId, itemId, status }));
    if (status === 'achieved') {
      setCelebratingItem(itemId);
      setTimeout(() => setCelebratingItem(null), 3000);
    }
  }

  async function handleVisionInterpret() {
    if (!visionText.trim()) return;
    setVisionLoading(true);
    try {
      const result = await generateVisionInterpretation(ctx, visionText);
      setVisionInterp(result);
    } catch {
      setVisionInterp('Unable to interpret vision — check your API key.');
    } finally {
      setVisionLoading(false);
    }
  }

  async function handleGenerateAffirmations() {
    if (!activeBoard) return;
    setAffLoading(true);
    try {
      const items = activeBoard.items.map((i) => i.content).slice(0, 10);
      const results = await generatePersonalizedAffirmations(ctx, items);
      setAffirmations(results);
    } catch {
      setAffirmations(['Unable to generate — check your API key.']);
    } finally {
      setAffLoading(false);
    }
  }

  return (
    <Layout title="Vision Board">
      {/* Board Selector */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-2xl text-cream">Vision Board Studio</h2>
          <Button size="sm" onClick={() => setShowNewBoard(true)}>+ Board</Button>
        </div>
        {boards.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {boards.map((b) => (
              <button
                key={b.id}
                onClick={() => dispatch(setActiveBoard(b.id))}
                className={`px-4 py-2 rounded-xl border text-sm whitespace-nowrap transition-all ${
                  b.id === activeBoardId
                    ? 'border-gold/50 bg-gold/15 text-gold'
                    : 'border-gold/10 text-starlight/50 hover:border-gold/30'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {!activeBoard ? (
        <Card className="text-center py-16 mb-4">
          <p className="text-5xl mb-4">🌟</p>
          <h3 className="font-heading text-2xl text-cream mb-2">Create Your First Vision Board</h3>
          <p className="text-starlight/40 text-sm mb-6 max-w-xs mx-auto">
            A vision board is a visual map of your ideal life. Let your dreams take shape here.
          </p>
          <Button onClick={() => setShowNewBoard(true)} size="lg">
            Create Vision Board ✦
          </Button>
        </Card>
      ) : (
        <>
          {/* Canvas */}
          <div className="relative mb-4">
            <div
              className="rounded-2xl border border-gold/15 overflow-hidden relative min-h-[360px]"
              style={{
                background: 'radial-gradient(ellipse at 30% 50%, rgba(26,46,26,0.4) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(201,168,76,0.08) 0%, transparent 50%), #0a1520',
              }}
            >
              {/* Starfield background */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: "radial-gradient(circle, #c9a84c 1px, transparent 1px)",
                backgroundSize: '40px 40px',
              }} />

              {activeBoard.items.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <p className="text-starlight/20 font-heading text-xl mb-2">Your canvas awaits.</p>
                  <p className="text-starlight/10 text-sm">Add items to bring your vision to life.</p>
                </div>
              ) : (
                <div className="relative p-4 grid grid-cols-2 gap-3">
                  {activeBoard.items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: 1,
                        scale: celebratingItem === item.id ? [1, 1.1, 1] : 1,
                      }}
                      transition={celebratingItem === item.id ? { repeat: 3, duration: 0.3 } : {}}
                      className={`relative p-3 rounded-xl border cursor-pointer ${statusColors[item.status]}`}
                    >
                      {celebratingItem === item.id && (
                        <div className="absolute inset-0 flex items-center justify-center text-2xl pointer-events-none">
                          ✦✨✦
                        </div>
                      )}
                      {item.type === 'text' || item.type === 'affirmation' ? (
                        <p
                          className={`text-sm leading-snug ${item.type === 'affirmation' ? 'italic font-heading text-base' : ''}`}
                          style={{ color: item.color ?? '#e8e4d9' }}
                        >
                          {item.content}
                        </p>
                      ) : item.type === 'emoji' ? (
                        <div className="text-4xl text-center py-2">{item.content}</div>
                      ) : (
                        <p className="text-xs text-starlight/50">{item.content}</p>
                      )}
                      <div className="mt-2 flex items-center gap-1 flex-wrap">
                        {(['dreaming', 'in-progress', 'achieved'] as VisionItemStatus[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => handleSetStatus(item.id, s)}
                            className={`text-[9px] px-1.5 py-0.5 rounded-full border transition-all ${
                              item.status === s
                                ? 'border-gold/40 bg-gold/15 text-gold'
                                : 'border-white/10 text-white/20 hover:border-white/20'
                            }`}
                          >
                            {statusLabels[s]}
                          </button>
                        ))}
                        <button
                          onClick={() => dispatch(removeItem({ boardId: activeBoard.id, itemId: item.id }))}
                          className="ml-auto text-white/20 hover:text-red-400/50 text-[10px]"
                        >
                          ×
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button onClick={() => setShowAddItem(true)} variant="secondary" fullWidth className="mb-4">
            + Add to Board
          </Button>

          {/* AI Affirmations */}
          {activeBoard.items.length > 0 && (
            <Card className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading text-lg text-cream">Personalized Affirmations</h3>
                <span className="text-xs text-gold/60 bg-gold/10 px-2 py-0.5 rounded-full">AI</span>
              </div>
              {affirmations.length > 0 ? (
                <div className="space-y-2">
                  {affirmations.map((aff, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-2">
                      <span className="text-gold mt-0.5">✦</span>
                      <p className="text-starlight/80 text-sm italic font-heading">{aff}</p>
                    </motion.div>
                  ))}
                  <button onClick={handleGenerateAffirmations} className="text-xs text-gold/40 hover:text-gold mt-2">
                    Regenerate →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-starlight/40">Generate affirmations tailored to your vision board.</p>
                  <Button size="sm" onClick={handleGenerateAffirmations} loading={affLoading} variant="secondary">
                    Generate Affirmations ✦
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* AI Vision Interpreter */}
          <Card className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-gold">🔮</span>
              <h3 className="font-heading text-lg text-cream">AI Vision Interpreter</h3>
            </div>
            <p className="text-sm text-starlight/40 mb-3">
              Describe your dream life in words and AI will extract concrete goals and action steps.
            </p>
            <textarea
              className="input-field resize-none mb-3"
              rows={3}
              placeholder="In my ideal life, I wake up feeling... I spend my time... I've achieved..."
              value={visionText}
              onChange={(e) => setVisionText(e.target.value)}
            />
            <Button onClick={handleVisionInterpret} loading={visionLoading} disabled={!visionText.trim()} fullWidth variant="secondary">
              Interpret My Vision ✦
            </Button>
            {visionInterp && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-4 p-4 rounded-xl bg-gold/5 border border-gold/15">
                <p className="text-sm text-starlight/80 whitespace-pre-line leading-relaxed">{visionInterp}</p>
              </motion.div>
            )}
          </Card>
        </>
      )}

      {/* New Board Modal */}
      <Modal isOpen={showNewBoard} onClose={() => setShowNewBoard(false)} title="New Vision Board">
        <div className="space-y-4">
          <input
            className="input-field"
            placeholder="Board name (e.g. Career, Health, Dream Life)"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
            autoFocus
          />
          <Button onClick={handleCreateBoard} disabled={!boardName.trim()} fullWidth>
            Create Board ✦
          </Button>
        </div>
      </Modal>

      {/* Add Item Modal */}
      <Modal isOpen={showAddItem} onClose={() => setShowAddItem(false)} title="Add to Vision Board">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-starlight/50 mb-1.5 block">Type</label>
            <div className="flex gap-2 flex-wrap">
              {(['text', 'affirmation', 'emoji', 'goal'] as VisionItemType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setItemForm({ ...itemForm, type: t })}
                  className={`px-3 py-1.5 rounded-lg border text-xs capitalize transition-all ${
                    itemForm.type === t
                      ? 'border-gold/50 bg-gold/15 text-gold'
                      : 'border-gold/15 text-starlight/50 hover:border-gold/30'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder={
              itemForm.type === 'text' ? 'Write something meaningful...'
              : itemForm.type === 'affirmation' ? 'I am... I have... I create...'
              : itemForm.type === 'emoji' ? 'Paste an emoji or symbol ✨'
              : 'Describe this goal or dream...'
            }
            value={itemForm.content}
            onChange={(e) => setItemForm({ ...itemForm, content: e.target.value })}
            autoFocus
          />
          <div>
            <label className="text-xs text-starlight/50 mb-1.5 block">Text Color</label>
            <div className="flex gap-2">
              {['#c9a84c', '#e8e4d9', '#7ec8a4', '#6fa8c8', '#b58adb', '#d47b7b'].map((c) => (
                <button
                  key={c}
                  onClick={() => setItemForm({ ...itemForm, color: c })}
                  className={`w-7 h-7 rounded-full border-2 ${itemForm.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <Button onClick={handleAddItem} disabled={!itemForm.content.trim()} fullWidth>
            Add to Board
          </Button>
        </div>
      </Modal>
    </Layout>
  );
}
