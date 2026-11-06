import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 'w-9 h-9', text: 'text-lg', sub: 'text-[11px]' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Devotional Mala + Om Icon */}
      <div className={`relative ${currentSize.icon} flex-shrink-0 flex items-center justify-center`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          {/* Subtle Outer Glow */}
          <circle cx="50" cy="50" r="46" fill="#EAF4EC" />
          {/* Bead Ring */}
          <circle cx="50" cy="50" r="38" fill="none" stroke="#E4EBE5" stroke-width="2" stroke-dasharray="2 6" />
          {/* Guru / Meru Bead */}
          <circle cx="50" cy="12" r="4.5" fill="#C5A45A" stroke="#145638" strokeWidth="1.2" />
          {/* Key Mala Beads */}
          <circle cx="78" cy="22" r="3" fill="#176B45" />
          <circle cx="88" cy="50" r="3" fill="#176B45" />
          <circle cx="78" cy="78" r="3" fill="#176B45" />
          <circle cx="50" cy="88" r="3" fill="#176B45" />
          <circle cx="22" cy="78" r="3" fill="#176B45" />
          <circle cx="12" cy="50" r="3" fill="#176B45" />
          <circle cx="22" cy="22" r="3" fill="#176B45" />
          {/* Minimalist OM sacred geometry */}
          <path
            d="M 44 38 C 40 38 36 41 36 46 C 36 50 39 53 43 54 C 38 55 35 60 35 65 C 35 72 40 76 47 76 C 56 76 63 69 63 60 C 63 56 61 53 58 51 C 61 49 63 46 63 43 C 63 38 58 34 52 34 C 50 34 47 35 45 36"
            fill="none"
            stroke="#176B45"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Crescent and Bindu */}
          <path d="M 58 33 C 63 33 67 36 68 40" fill="none" stroke="#C5A45A" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="68" cy="30" r="2.2" fill="#C5A45A" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-semibold tracking-tight text-primary-dark ${currentSize.text} leading-tight`}>
            Japa Sankalpa
          </span>
          <span className={`font-normal text-text-secondary ${currentSize.sub} tracking-wide`}>
            Journey to 11 Lakh
          </span>
        </div>
      )}
    </div>
  );
};
