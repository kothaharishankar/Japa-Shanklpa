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

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Sacred Devotional Logo Medallion Image */}
      <div className={`relative ${currentSize.icon} flex-shrink-0 flex items-center justify-center rounded-full overflow-hidden bg-white shadow-subtle border border-border/80`}>
        <img
          src="/icons/logo.jpg"
          alt="Japa Sankalpa Sacred Logo"
          className="w-full h-full object-contain transform scale-105 select-none pointer-events-none"
          loading="eager"
        />
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
