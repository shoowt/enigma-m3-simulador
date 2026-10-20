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
    <div className="flex flex-col items-center gap-2.5 p-3 sm:p-4 rounded-xl bg-[#17191d] border border-[#2e323a] shadow-md">
      <div className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-semibold mb-1">
        TASTATUR (TECLADO MECÂNICO MILITAR)
      </div>

      {KEYBOARD_ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex justify-center gap-1.5 sm:gap-2.5">
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
      <div className="flex items-center gap-3 mt-2 w-full max-w-sm justify-center">
        <button
          type="button"
          onClick={handleSpace}
          className="flex-1 py-1.5 px-4 text-xs font-mono font-bold text-zinc-300 bg-[#202227] hover:bg-[#282b31] border-2 border-[#545963] rounded-full shadow-[0_4px_0_#0e0f11] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider"
        >
          [ Barra de Espaço ]
        </button>
      </div>
    </div>
  );
};
