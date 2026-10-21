import React from 'react';

interface LampboardProps {
  litChar: string | null;
}

const LAMPBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'],
  ['P', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'L']
];

export const Lampboard: React.FC<LampboardProps> = ({ litChar }) => {
  return (
    <div className="flex flex-col items-center gap-1 sm:gap-1.5 p-1 sm:p-2 rounded-lg sm:rounded-xl bg-[#141619] border border-[#2a2d34] shadow-[inset_0_4px_16px_rgba(0,0,0,0.9)] mb-1 sm:mb-1.5 w-full overflow-hidden">
      <div className="text-[8px] sm:text-[9px] font-mono tracking-widest text-zinc-500 uppercase font-semibold mb-0.5">
        GLÜHLAMPENFELD (LÂMPADAS)
      </div>

      {LAMPBOARD_ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex justify-center gap-1 sm:gap-1.5 w-full">
          {row.map(char => {
            const isActive = litChar === char;
            return (
              <div
                key={char}
                className={`lamp-cell select-none ${isActive ? 'active' : ''}`}
                title={`Lâmpada ${char}`}
              >
                {char}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
