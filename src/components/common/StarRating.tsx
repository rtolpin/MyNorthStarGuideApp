import { motion } from 'framer-motion';

interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
}

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };

export default function StarRating({ value, onChange, max = 5, size = 'md', readOnly = false }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Star rating">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <motion.button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          whileTap={readOnly ? {} : { scale: 1.3 }}
          className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          <svg className={sizes[size]} viewBox="0 0 24 24">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={star <= value ? '#c9a84c' : 'none'}
              stroke={star <= value ? '#c9a84c' : 'rgba(201,168,76,0.3)'}
              strokeWidth="1.5"
            />
          </svg>
        </motion.button>
      ))}
    </div>
  );
}
