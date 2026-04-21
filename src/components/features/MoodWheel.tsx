import { motion } from 'framer-motion';
import type { MoodType } from '../../types';

const moods: { type: MoodType; emoji: string; label: string; color: string }[] = [
  { type: 'joy', emoji: '✨', label: 'Joy', color: '#f6d860' },
  { type: 'energized', emoji: '⚡', label: 'Energized', color: '#7ec8a4' },
  { type: 'hopeful', emoji: '🌱', label: 'Hopeful', color: '#7a9e7e' },
  { type: 'grateful', emoji: '🙏', label: 'Grateful', color: '#c9a84c' },
  { type: 'calm', emoji: '🌊', label: 'Calm', color: '#6fa8c8' },
  { type: 'foggy', emoji: '🌫️', label: 'Foggy', color: '#8a8a9a' },
  { type: 'anxious', emoji: '🌀', label: 'Anxious', color: '#b58adb' },
  { type: 'overwhelmed', emoji: '🌊', label: 'Overwhelmed', color: '#d47b7b' },
  { type: 'sad', emoji: '🌧️', label: 'Sad', color: '#7a8ca8' },
  { type: 'frustrated', emoji: '🔥', label: 'Frustrated', color: '#e07040' },
];

interface MoodWheelProps {
  selected: MoodType | null;
  onSelect: (mood: MoodType) => void;
}

export default function MoodWheel({ selected, onSelect }: MoodWheelProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {moods.map((mood) => {
        const isSelected = selected === mood.type;
        return (
          <motion.button
            key={mood.type}
            onClick={() => onSelect(mood.type)}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className={`
              flex flex-col items-center gap-1 py-3 px-1 rounded-xl border transition-all duration-200
              ${isSelected
                ? 'border-gold/60 bg-gold/15 shadow-gold'
                : 'border-gold/10 bg-navy-dark/40 hover:border-gold/30'
              }
            `}
            aria-label={mood.label}
            aria-pressed={isSelected}
          >
            <motion.span
              className="text-xl"
              animate={isSelected ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.4 }}
            >
              {mood.emoji}
            </motion.span>
            <span
              className="text-[10px] font-medium leading-none"
              style={{ color: isSelected ? mood.color : 'rgba(232,228,217,0.5)' }}
            >
              {mood.label}
            </span>
            {isSelected && (
              <motion.div
                layoutId="mood-indicator"
                className="w-1 h-1 rounded-full"
                style={{ background: mood.color }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export { moods };
