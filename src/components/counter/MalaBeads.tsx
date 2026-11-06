import React, { useMemo } from 'react';

interface MalaBeadsProps {
  count: number; // Current session or today count
  completedMalas: number;
}

export const MalaBeads: React.FC<MalaBeadsProps> = ({ count, completedMalas }) => {
  // Current position in current mala (0 to 107)
  const currentBeadIndex = count % 108;
  const isFullMalaCycle = count > 0 && currentBeadIndex === 0;

  // Generate 108 bead positions along an elliptical/circular mala loop
  const beads = useMemo(() => {
    const list = [];
    const totalBeads = 108;
    const cx = 160;
    const cy = 165;
    const rx = 135;
    const ry = 135;

    for (let i = 0; i < totalBeads; i++) {
      // Start from just past the Meru bead (top: -90 deg + small offset)
      const angle = ((i + 0.5) / totalBeads) * 2 * Math.PI - Math.PI / 2;
      const x = cx + rx * Math.cos(angle);
      const y = cy + ry * Math.sin(angle);
      list.push({ index: i, x, y });
    }
    return list;
  }, []);

  return (
    <div className="relative w-full max-w-[320px] mx-auto aspect-square flex items-center justify-center">
      <svg
        viewBox="0 0 320 330"
        className="w-full h-full drop-shadow-sm select-none"
      >
        {/* Subtle Rosary Guideline */}
        <circle
          cx="160"
          cy="165"
          r="135"
          fill="none"
          stroke="#E4EBE5"
          strokeWidth="1.5"
          strokeDasharray="2 3"
        />

        {/* Sacred Meru / Guru Bead at the very top */}
        <g transform="translate(160, 22)">
          {/* Tassel */}
          <path
            d="M -3 10 L -6 22 L 6 22 L 3 10 Z"
            fill="#C5A45A"
            opacity="0.85"
          />
          <circle
            cx="0"
            cy="2"
            r="7"
            fill="#C5A45A"
            stroke="#145638"
            strokeWidth="1.5"
          />
        </g>

        {/* 108 Beads */}
        {beads.map(({ index, x, y }) => {
          const isDone = isFullMalaCycle ? true : index < currentBeadIndex;
          const isCurrent = !isFullMalaCycle && index === currentBeadIndex;

          let fill = '#F3F8F3';
          let stroke = '#E4EBE5';
          let r = 3.5;

          if (isDone) {
            fill = '#176B45';
            stroke = '#145638';
          } else if (isCurrent) {
            fill = '#C5A45A';
            stroke = '#176B45';
            r = 5.5;
          }

          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={r}
              fill={fill}
              stroke={stroke}
              strokeWidth={isCurrent ? 2 : 1}
              className="transition-all duration-150"
            />
          );
        })}
      </svg>

      {/* Inside Mala Center Information */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
        <span className="text-xs uppercase tracking-wider font-semibold text-text-secondary">
          Mala Bead
        </span>
        <div className="flex items-baseline gap-1 my-0.5">
          <span className="text-3xl font-bold text-primary-dark">
            {isFullMalaCycle ? 108 : currentBeadIndex}
          </span>
          <span className="text-sm font-medium text-text-secondary">/ 108</span>
        </div>
        <div className="mt-1 px-2.5 py-0.5 rounded-full bg-primary-soft text-primary-dark text-[11px] font-semibold border border-primary/20">
          {completedMalas} {completedMalas === 1 ? 'Mala' : 'Malas'} Done
        </div>
      </div>
    </div>
  );
};
