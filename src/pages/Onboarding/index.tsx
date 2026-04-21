import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../../store';
import { completeOnboarding } from '../../store/slices/userProfileSlice';
import { addHabit } from '../../store/slices/habitsSlice';
import { addGoal } from '../../store/slices/goalsSlice';
import NorthStarLogo from '../../components/common/NorthStarLogo';
import Button from '../../components/common/Button';
import ConstellationBackground from '../../components/common/ConstellationBackground';

type Step = 'welcome' | 'name' | 'quiz' | 'goals' | 'habit' | 'complete';

const quizQuestions = [
  {
    key: 'lifestyle',
    question: 'How would you describe your current lifestyle?',
    options: ['Very active and social', 'Balanced and steady', 'Busy and stressed', 'Quiet and reflective'],
  },
  {
    key: 'challenge',
    question: 'What area of life needs the most attention right now?',
    options: ['Health & Energy', 'Career & Purpose', 'Relationships', 'Inner Peace & Mental Health'],
  },
  {
    key: 'motivation',
    question: 'What drives you most?',
    options: ['Achievement and growth', 'Connection and love', 'Security and stability', 'Freedom and creativity'],
  },
  {
    key: 'style',
    question: 'How do you best receive guidance?',
    options: ['Warm and empathetic', 'Direct and action-focused', 'Motivating and energizing', 'Data-driven and analytical'],
  },
  {
    key: 'vision',
    question: 'In your best life, you feel...',
    options: ['Vibrant and energized every day', 'Deeply connected to people I love', 'Purposeful and creatively fulfilled', 'At peace with myself and my choices'],
  },
];

const goalCategories = ['Health', 'Career', 'Relationships', 'Finance', 'Personal Growth', 'Creativity'];

export default function Onboarding() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizStep, setQuizStep] = useState(0);
  const [goalInputs, setGoalInputs] = useState([{ title: '', category: 'Personal Growth' }]);
  const [habitName, setHabitName] = useState('');
  const [habitCategory, setHabitCategory] = useState('Health');

  function handleAnswer(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (quizStep < quizQuestions.length - 1) {
      setTimeout(() => setQuizStep((s) => s + 1), 300);
    } else {
      setTimeout(() => setStep('goals'), 400);
    }
  }

  function handleComplete() {
    const toneMap: Record<string, 'warm' | 'direct' | 'motivational'> = {
      'Warm and empathetic': 'warm',
      'Direct and action-focused': 'direct',
      'Motivating and energizing': 'motivational',
    };
    const aiTone = toneMap[answers.style] ?? 'warm';
    const traits = Object.entries(answers).map(([key, value]) => ({ key, value }));
    dispatch(completeOnboarding({ name, traits: [...traits, { key: 'aiTone', value: aiTone }] }));

    goalInputs.filter((g) => g.title.trim()).forEach((g) => {
      dispatch(addGoal({
        title: g.title.trim(),
        category: g.category as never,
        description: '',
        targetDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      }));
    });

    if (habitName.trim()) {
      dispatch(addHabit({
        name: habitName.trim(),
        category: habitCategory as never,
        icon: '✨',
        color: '#c9a84c',
        isActive: true,
      }));
    }

    setStep('complete');
  }

  const stepVariants = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <ConstellationBackground />
      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div key="welcome" variants={stepVariants} initial="initial" animate="animate" exit="exit"
              className="text-center space-y-8">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                <NorthStarLogo size={80} />
              </motion.div>
              <div>
                <h1 className="font-heading text-5xl font-light text-cream mb-3">MyNorthStarGuide</h1>
                <p className="text-starlight/60 text-lg italic font-heading">Always pointing you toward your best life.</p>
              </div>
              <div className="space-y-3 text-starlight/50 text-sm">
                <p>Your AI-powered personal life intelligence platform.</p>
                <p>Track your moods, build powerful habits, pursue meaningful goals — and let AI illuminate your path forward.</p>
              </div>
              <Button onClick={() => setStep('name')} size="lg" className="w-full">
                Begin Your Journey ✦
              </Button>
            </motion.div>
          )}

          {step === 'name' && (
            <motion.div key="name" variants={stepVariants} initial="initial" animate="animate" exit="exit"
              className="space-y-6">
              <div className="text-center">
                <NorthStarLogo size={40} />
                <h2 className="font-heading text-3xl text-cream mt-4 mb-2">What shall I call you?</h2>
                <p className="text-starlight/40 text-sm">Your name helps me personalize your guidance.</p>
              </div>
              <input
                className="input-field text-center text-lg"
                placeholder="Your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep('quiz')}
              />
              <Button onClick={() => setStep('quiz')} disabled={!name.trim()} fullWidth>
                That's me →
              </Button>
            </motion.div>
          )}

          {step === 'quiz' && (
            <motion.div key={`quiz-${quizStep}`} variants={stepVariants} initial="initial" animate="animate" exit="exit"
              className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-starlight/30 text-xs">Question {quizStep + 1} of {quizQuestions.length}</span>
                  <span className="text-starlight/30 text-xs">Getting to know you</span>
                </div>
                <div className="h-1 bg-navy-dark rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gold rounded-full"
                    animate={{ width: `${((quizStep + 1) / quizQuestions.length) * 100}%` }}
                  />
                </div>
              </div>
              <h2 className="font-heading text-2xl text-cream">{quizQuestions[quizStep].question}</h2>
              <div className="space-y-3">
                {quizQuestions[quizStep].options.map((opt) => (
                  <motion.button
                    key={opt}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(quizQuestions[quizStep].key, opt)}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
                      answers[quizQuestions[quizStep].key] === opt
                        ? 'border-gold/50 bg-gold/15 text-cream'
                        : 'border-gold/10 bg-navy-light/50 text-starlight/70 hover:border-gold/30 hover:bg-navy-light'
                    }`}
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'goals' && (
            <motion.div key="goals" variants={stepVariants} initial="initial" animate="animate" exit="exit"
              className="space-y-6">
              <div className="text-center">
                <h2 className="font-heading text-3xl text-cream mb-2">Your first stars to chase</h2>
                <p className="text-starlight/40 text-sm">Set up to 3 goals — you can always add more later.</p>
              </div>
              {goalInputs.map((g, i) => (
                <div key={i} className="space-y-2">
                  <input
                    className="input-field"
                    placeholder={`Goal ${i + 1} — e.g. "Run a 5K", "Learn Spanish"`}
                    value={g.title}
                    onChange={(e) => {
                      const updated = [...goalInputs];
                      updated[i] = { ...updated[i], title: e.target.value };
                      setGoalInputs(updated);
                    }}
                  />
                  <select
                    className="input-field"
                    value={g.category}
                    onChange={(e) => {
                      const updated = [...goalInputs];
                      updated[i] = { ...updated[i], category: e.target.value };
                      setGoalInputs(updated);
                    }}
                  >
                    {goalCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              ))}
              {goalInputs.length < 3 && (
                <button
                  onClick={() => setGoalInputs([...goalInputs, { title: '', category: 'Personal Growth' }])}
                  className="text-gold/60 text-sm hover:text-gold transition-colors"
                >
                  + Add another goal
                </button>
              )}
              <Button onClick={() => setStep('habit')} fullWidth>
                Set Goals →
              </Button>
              <button onClick={() => setStep('habit')} className="w-full text-center text-starlight/30 text-sm hover:text-starlight/50">
                Skip for now
              </button>
            </motion.div>
          )}

          {step === 'habit' && (
            <motion.div key="habit" variants={stepVariants} initial="initial" animate="animate" exit="exit"
              className="space-y-6">
              <div className="text-center">
                <h2 className="font-heading text-3xl text-cream mb-2">Plant your first habit</h2>
                <p className="text-starlight/40 text-sm">A single daily practice can change everything. What's yours?</p>
              </div>
              <input
                className="input-field"
                placeholder='e.g. "Morning meditation", "Journal for 5 min"'
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
              />
              <select
                className="input-field"
                value={habitCategory}
                onChange={(e) => setHabitCategory(e.target.value)}
              >
                {['Health', 'Mind', 'Relationships', 'Career', 'Creativity', 'Finance', 'Spirituality'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <Button onClick={handleComplete} fullWidth>
                Complete Setup ✦
              </Button>
              <button onClick={handleComplete} className="w-full text-center text-starlight/30 text-sm hover:text-starlight/50">
                Skip for now
              </button>
            </motion.div>
          )}

          {step === 'complete' && (
            <motion.div key="complete" variants={stepVariants} initial="initial" animate="animate" exit="exit"
              className="text-center space-y-8">
              <motion.div
                animate={{ scale: [0, 1.2, 1], rotate: [0, 360, 360] }}
                transition={{ duration: 1, ease: 'backOut' }}
              >
                <NorthStarLogo size={80} />
              </motion.div>
              <div>
                <h2 className="font-heading text-4xl text-cream mb-3">
                  Welcome, {name} ✦
                </h2>
                <p className="text-starlight/60">Your north star is set. Your journey begins now.</p>
              </div>
              <div className="space-y-2 text-sm text-starlight/40">
                <p>Check in daily to build your intelligence profile.</p>
                <p>The more you share, the more I can guide you.</p>
              </div>
              <Button onClick={() => navigate('/')} size="lg" className="w-full">
                Enter MyNorthStarGuide →
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
