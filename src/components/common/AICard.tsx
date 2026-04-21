import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import Card from './Card';

interface AICardProps {
  title: string;
  content?: string;
  loading?: boolean;
  error?: string;
  icon?: ReactNode;
  onRefresh?: () => void;
  className?: string;
  children?: ReactNode;
}

export default function AICard({ title, content, loading, error, icon, onRefresh, className = '', children }: AICardProps) {
  return (
    <Card gold className={className}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && <span className="text-gold">{icon}</span>}
          <h3 className="font-heading text-lg text-cream">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gold/60 bg-gold/10 px-2 py-0.5 rounded-full">AI</span>
          {onRefresh && !loading && (
            <button
              onClick={onRefresh}
              className="text-starlight/30 hover:text-gold transition-colors"
              aria-label="Refresh"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="h-4 bg-gold/10 rounded-full"
              style={{ width: i === 2 ? '60%' : '100%' }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
          <p className="text-xs text-starlight/30 mt-2 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 bg-gold/50 rounded-full animate-pulse" />
            North Star is thinking...
          </p>
        </div>
      )}

      {error && !loading && (
        <p className="text-red-400/70 text-sm">{error}</p>
      )}

      {content && !loading && !error && (
        <p className="text-starlight/80 text-sm leading-relaxed whitespace-pre-line">{content}</p>
      )}

      {children && !loading && !error && children}
    </Card>
  );
}
