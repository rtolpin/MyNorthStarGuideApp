import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  gold?: boolean;
  padding?: string;
}

export default function Card({ children, className = '', hover = false, onClick, gold = false, padding = 'p-5' }: CardProps) {
  const base = `bg-navy-light/80 backdrop-blur-sm border rounded-2xl shadow-card ${padding}`;
  const borderClass = gold ? 'border-gold/30' : 'border-gold/10';
  const hoverClass = hover ? 'transition-all duration-300 hover:border-gold/30 hover:shadow-gold hover:-translate-y-0.5 cursor-pointer' : '';

  if (hover || onClick) {
    return (
      <motion.div
        className={`${base} ${borderClass} ${hoverClass} ${className}`}
        onClick={onClick}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${base} ${borderClass} ${className}`}>
      {children}
    </div>
  );
}
