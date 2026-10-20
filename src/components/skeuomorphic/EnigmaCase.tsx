import React from 'react';
import { Volume2, VolumeX, FileText } from 'lucide-react';
import { RotorsUnit } from './RotorsUnit';
import { Lampboard } from './Lampboard';
import { Keyboard } from './Keyboard';
import { Plugboard } from './Plugboard';
import type { ReflectorId, RotorId } from '../../types/crypto';
import { soundEffects } from '../../audio/soundEffects';

interface EnigmaCaseProps {
  rotorTypes: [RotorId, RotorId, RotorId];
  positions: [string, string, string];
  ringSettings: [number, number, number];
  reflector: ReflectorId;
  plugboardPairs: string[];
  litChar: string | null;
  pressedKey: string | null;
  outputTape: string;
  onRotateManually: (rotorIndex: 0 | 1 | 2, delta: number) => void;
  onOpenLid: () => void;
  onKeyDown: (char: string) => void;
  onKeyUp: () => void;
  onSpace: () => void;
  onChangePlugPairs: (newPairs: string[]) => void;
  onResetPlugToDaily: () => void;
  onClearTape: () => void;
}

export const EnigmaCase: React.FC<EnigmaCaseProps> = ({
  rotorTypes,
  positions,
  plugboardPairs,
  litChar,
  pressedKey,
  outputTape,
  onRotateManually,
  onOpenLid,
  onKeyDown,
  onKeyUp,
  onSpace,
  onChangePlugPairs,
  onResetPlugToDaily,
  onClearTape
}) => {
  const [isMuted, setIsMuted] = React.useState<boolean>(soundEffects.isMuted);

  const toggleMute = () => {
    soundEffects.isMuted = !soundEffects.isMuted;
    setIsMuted(soundEffects.isMuted);
  };

  return (
    <div className="wood-cabinet p-4 sm:p-7 max-w-2xl mx-auto shadow-2xl relative select-none">
      {/* 4 Parafusos de latão nos cantos da madeira */}
      <div className="absolute top-3 left-3 brass-screw"></div>
      <div className="absolute top-3 right-3 brass-screw"></div>
      <div className="absolute bottom-3 left-3 brass-screw"></div>
      <div className="absolute bottom-3 right-3 brass-screw"></div>

      {/* Chassi de Metal Preto Fosco */}
      <div className="metal-chassis p-4 sm:p-6 flex flex-col gap-4">
        {/* Plaqueta Metálica do Fabricante Militar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#32363e]">
          <div className="flex items-center gap-2">
            <div className="metal-plate px-3 py-1 text-[11px] font-mono tracking-widest text-amber-300 font-bold uppercase shadow">
              CHFR.MASCH. ENIGMA M3 • W.1944
            </div>
            <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
              NO. A-14983/Heer
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-1.5 rounded bg-[#1e2024] hover:bg-[#282b31] border border-[#393d46] text-zinc-400 hover:text-zinc-200 transition-colors"
              title={isMuted ? 'Ativar Efeitos Sonoros Mecânicos' : 'Silenciar'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>
        </div>

        {/* Fita de Papel Militar Datilografada (Output Stream) */}
        <div className="flex flex-col bg-[#111215] border border-[#2b2e35] rounded-lg p-2.5 shadow-inner">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-amber-500/90 uppercase">
              <FileText size={12} />
              <span>Fita Telegráfica (Texto Cifrado em Grupos de 5)</span>
            </div>
            {outputTape.length > 0 && (
              <button
                onClick={onClearTape}
                className="text-[10px] font-mono text-zinc-400 hover:text-red-400 underline transition-colors"
              >
                Limpar Fita
              </button>
            )}
          </div>

          <div className="bg-[#181a1f] border border-[#22252a] rounded px-3 py-2 min-h-[42px] flex items-center overflow-x-auto font-mono text-sm tracking-widest text-amber-300 font-bold select-text">
            {outputTape.length === 0 ? (
              <span className="text-zinc-600 font-normal text-xs tracking-normal">
                Pressione as teclas abaixo ou digite no teclado para cifrar...
              </span>
            ) : (
              outputTape
            )}
          </div>
        </div>

        {/* Unidade Mecânica de Rotores */}
        <RotorsUnit
          rotorTypes={rotorTypes}
          positions={positions}
          onRotateManually={onRotateManually}
          onOpenLid={onOpenLid}
        />

        {/* Painel de Lâmpadas (Lampboard) */}
        <Lampboard litChar={litChar} />

        {/* Teclado (Keyboard) */}
        <Keyboard
          pressedKey={pressedKey}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onSpace={onSpace}
        />

        {/* Painel Frontal de Cabos (Plugboard / Steckerbrett) */}
        <Plugboard
          pairs={plugboardPairs}
          onChangePairs={onChangePlugPairs}
          onResetToDaily={onResetPlugToDaily}
        />
      </div>
    </div>
  );
};
