import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizeMap = {
    sm: { icon: 'w-8 h-8', text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 'w-10 h-10', text: 'text-lg', sub: 'text-[11px]' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 'w-20 h-20', text: 'text-3xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  // 26 beads mathematically distributed on a circle (r=38, center=50,50)
  const beadAngles = [
    -76.7, -63.3, -50.0, -36.7, -23.3, -10.0,
    3.3, 16.7, 30.0, 43.3, 56.7, 70.0, 83.3, 96.7,
    110.0, 123.3, 136.7, 150.0, 163.3, 176.7, 190.0,
    203.3, 216.7, 230.0, 243.3, 256.7
  ];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Sacred Devotional Logo Medallion */}
      <div className={`relative ${currentSize.icon} flex-shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm select-none"
        >
          <defs>
            {/* Subtle Divine Radial Glow */}
            <radialGradient id="logoMedallionGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="65%" stopColor="#F3F8F3" />
              <stop offset="100%" stopColor="#EAF4EC" />
            </radialGradient>

            {/* Sacred Gold Gradient for Meru bead and Bindu */}
            <linearGradient id="divineGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DFBF74" />
              <stop offset="50%" stopColor="#C5A45A" />
              <stop offset="100%" stopColor="#9E7F36" />
            </linearGradient>

            {/* Primary Green Gradient */}
            <linearGradient id="sacredGreen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E7A50" />
              <stop offset="100%" stopColor="#145638" />
            </linearGradient>
          </defs>

          {/* Outer Soft Devotional Medallion Disc */}
          <circle cx="50" cy="50" r="48" fill="url(#logoMedallionGlow)" stroke="#E4EBE5" strokeWidth="1" />

          {/* Sacred Mala Thread Ring */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="#C5A45A"
            strokeWidth="0.8"
            strokeDasharray="1.5 2.5"
            opacity="0.6"
          />

          {/* 26 Sacred Mala Beads in Primary Green */}
          {beadAngles.map((deg, idx) => {
            const rad = (deg * Math.PI) / 180;
            const x = 50 + 38 * Math.cos(rad);
            const y = 50 + 38 * Math.sin(rad);
            return (
              <circle
                key={idx}
                cx={x.toFixed(1)}
                cy={y.toFixed(1)}
                r="2.5"
                fill="#176B45"
                stroke="#145638"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Sumeru / Guru Bead at Top in Radiant Gold */}
          <g>
            <path
              d="M 48.5 16.5 L 50 19 L 51.5 16.5 Z"
              fill="url(#divineGold)"
              opacity="0.9"
            />
            <circle
              cx="50"
              cy="12"
              r="4.2"
              fill="url(#divineGold)"
              stroke="#145638"
              strokeWidth="0.8"
            />
            <circle
              cx="48.8"
              cy="10.8"
              r="1"
              fill="#FFFFFF"
              opacity="0.7"
            />
          </g>

          {/* Central Sacred OM (ॐ) - Balanced, Classical Calligraphy */}
          <g>
            {/* Upper-left arc */}
            <path
              d="M 42 37 C 42 32 46.5 28.5 52 29.5 C 57 30.5 59 35 58 39.5 C 57 44 53 46 47 46.5"
              fill="none"
              stroke="url(#sacredGreen)"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Lower-left sweeping arc & inner spiral */}
            <path
              d="M 47 46.5 C 38 48 34.5 55 35 62 C 35.5 69 42 74 50 74 C 59 74 64 68 64 60 C 64 53 58.5 48.5 51 47"
              fill="none"
              stroke="url(#sacredGreen)"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Right tail curve (soaring curve) */}
            <path
              d="M 54 48 C 60 48.5 67 52 71 58 C 74 63 74 69 72 73"
              fill="none"
              stroke="url(#sacredGreen)"
              strokeWidth="3.4"
              strokeLinecap="round"
            />

            {/* Top Candra (Sacred Crescent) in Gold */}
            <path
              d="M 57 26.5 C 62 30 68 30 73 26.5"
              fill="none"
              stroke="url(#divineGold)"
              strokeWidth="2.8"
              strokeLinecap="round"
            />

            {/* Top Bindu (Sacred Dot / Supreme Consciousness) in Gold */}
            <circle
              cx="65"
              cy="20.5"
              r="2.8"
              fill="url(#divineGold)"
            />
            <circle
              cx="64.2"
              cy="19.7"
              r="0.8"
              fill="#FFFFFF"
              opacity="0.8"
            />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight text-primary-dark ${currentSize.text} leading-tight`}>
            Japa Sankalpa
          </span>
          <span className={`font-medium text-text-secondary ${currentSize.sub} tracking-wide flex items-center gap-1`}>
            <span>11 Lakh Devotion</span>
            <span className="w-1 h-1 rounded-full bg-accent-gold" />
            <span className="text-primary font-semibold">108 Mala</span>
          </span>
        </div>
      )}
    </div>
  );
};
