import { motion } from 'framer-motion';

interface Props {
  size?: number;
  animated?: boolean;
}

export default function NorthStarLogo({ size = 40, animated = true }: Props) {
  const svgEl = (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
      <defs>
        <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#starGlow)" />
      <line x1="50" y1="10" x2="50" y2="90" stroke="#c9a84c" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="10" y1="50" x2="90" y2="50" stroke="#c9a84c" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="22" y1="22" x2="78" y2="78" stroke="#c9a84c" strokeWidth="0.8" strokeOpacity="0.2" />
      <line x1="78" y1="22" x2="22" y2="78" stroke="#c9a84c" strokeWidth="0.8" strokeOpacity="0.2" />
      <path d="M50 5 L54 44 L88 50 L54 56 L50 95 L46 56 L12 50 L46 44 Z" fill="#c9a84c" opacity="0.9" />
      <path d="M50 30 L52 46 L66 50 L52 54 L50 70 L48 54 L34 50 L48 46 Z" fill="#d9bc7a" />
      <circle cx="50" cy="50" r="5" fill="#faf8f3" />
      <circle cx="50" cy="8" r="2" fill="#c9a84c" />
      <circle cx="50" cy="92" r="1.5" fill="#c9a84c" opacity="0.6" />
      <circle cx="8" cy="50" r="1.5" fill="#c9a84c" opacity="0.6" />
      <circle cx="92" cy="50" r="1.5" fill="#c9a84c" opacity="0.6" />
    </svg>
  );

  if (!animated) {
    return <div style={{ width: size, height: size, display: 'inline-flex' }}>{svgEl}</div>;
  }

  return (
    <motion.div
      style={{ width: size, height: size, display: 'inline-flex' }}
      animate={{ rotate: [0, 5, -5, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' as const }}
    >
      {svgEl}
    </motion.div>
  );
}
