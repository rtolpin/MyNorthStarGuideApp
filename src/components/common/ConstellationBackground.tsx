import { useMemo } from 'react';

interface Star {
  x: number;
  y: number;
  r: number;
  opacity: number;
  delay: number;
}

export default function ConstellationBackground() {
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      x: (((i * 137.508) % 100)),
      y: (((i * 97.3) % 100)),
      r: 0.5 + (i % 3) * 0.5,
      opacity: 0.1 + (i % 5) * 0.08,
      delay: (i % 8) * 0.5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {stars.map((star, i) => (
          <circle
            key={i}
            cx={`${star.x}%`}
            cy={`${star.y}%`}
            r={star.r}
            fill="#c9a84c"
            opacity={star.opacity}
          >
            <animate
              attributeName="opacity"
              values={`${star.opacity};${star.opacity * 3};${star.opacity}`}
              dur={`${3 + star.delay}s`}
              repeatCount="indefinite"
              begin={`${star.delay}s`}
            />
          </circle>
        ))}
        {/* Constellation lines */}
        <line x1="20%" y1="15%" x2="35%" y2="25%" stroke="#c9a84c" strokeOpacity="0.05" strokeWidth="0.5" />
        <line x1="35%" y1="25%" x2="50%" y2="18%" stroke="#c9a84c" strokeOpacity="0.05" strokeWidth="0.5" />
        <line x1="50%" y1="18%" x2="65%" y2="30%" stroke="#c9a84c" strokeOpacity="0.05" strokeWidth="0.5" />
        <line x1="65%" y1="30%" x2="80%" y2="20%" stroke="#c9a84c" strokeOpacity="0.05" strokeWidth="0.5" />
        <line x1="15%" y1="60%" x2="30%" y2="70%" stroke="#c9a84c" strokeOpacity="0.04" strokeWidth="0.5" />
        <line x1="30%" y1="70%" x2="45%" y2="65%" stroke="#c9a84c" strokeOpacity="0.04" strokeWidth="0.5" />
        <line x1="70%" y1="65%" x2="85%" y2="75%" stroke="#c9a84c" strokeOpacity="0.04" strokeWidth="0.5" />
      </svg>
    </div>
  );
}
