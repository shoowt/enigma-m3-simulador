import React from 'react';
import { soundEffects } from '../../audio/soundEffects';

interface KeyboardProps {
  pressedKey: string | null;
  onKeyDown: (char: string) => void;
  onKeyUp: () => void;
  onSpace: () => void;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'],
  ['P', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'L']
];

export const Keyboard: React.FC<KeyboardProps> = ({
  pressedKey,
  onKeyDown,
  onKeyUp,
  onSpace
}) => {
  const handleKeyTouchStart = (char: string) => {
    soundEffects.playKeyPress();
    onKeyDown(char);
  };

  const handleKeyTouchEnd = () => {
    soundEffects.playKeyRelease();
    onKeyUp();
  };

  const handleSpace = () => {
    soundEffects.playKeyPress();
    onSpace();
    setTimeout(() => soundEffects.playKeyRelease(), 60);
  };

  return (
    <div className="flex flex-col items-center gap-1 sm:gap-1.5 p-1 sm:p-2 rounded-lg sm:rounded-xl bg-[#17191d] border border-[#2e323a] shadow-md w-full overflow-hidden">
      <div className="text-[8px] sm:text-[9px] font-mono tracking-widest text-zinc-500 uppercase font-semibold mb-0.5">
        TASTATUR (TECLADO MECÂNICO)
      </div>

      {KEYBOARD_ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex justify-center gap-1 sm:gap-1.5 w-full">
          {row.map(char => {
            const isPressed = pressedKey === char;
            return (
              <button
                key={char}
                type="button"
                onMouseDown={() => handleKeyTouchStart(char)}
                onMouseUp={handleKeyTouchEnd}
                onMouseLeave={handleKeyTouchEnd}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleKeyTouchStart(char);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleKeyTouchEnd();
                }}
                className={`typewriter-key ${isPressed ? 'pressed' : ''}`}
                title={`Tecla ${char}`}
              >
                {char}
              </button>
            );
          })}
        </div>
      ))}

      {/* Barra de Espaço e Atalhos de Apoio */}
      <div className="flex items-center gap-3 mt-1 w-full max-w-xs justify-center">
        <button
          type="button"
          onClick={handleSpace}
          className="spacebar-btn flex-1 py-0.5 sm:py-1 px-3 text-[10px] sm:text-[11px] font-mono font-bold text-zinc-300 bg-[#202227] hover:bg-[#282b31] border-2 border-[#545963] rounded-full shadow-[0_2px_0_#0e0f11] active:translate-y-0.5 active:shadow-none transition-all uppercase tracking-wider flex items-center justify-center"
        >
          [ Barra de Espaço ]
        </button>
      </div>
    </div>
  );
};
