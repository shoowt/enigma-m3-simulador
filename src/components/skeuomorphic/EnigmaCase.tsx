import React, { useState } from 'react';
import { Volume2, VolumeX, FileText, Maximize2, Minimize2 } from 'lucide-react';
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
  const [isMuted, setIsMuted] = useState<boolean>(soundEffects.isMuted);
  const [isFitScreen, setIsFitScreen] = useState<boolean>(true);

  const toggleMute = () => {
    soundEffects.isMuted = !soundEffects.isMuted;
    setIsMuted(soundEffects.isMuted);
  };

  return (
    <div className={`wood-cabinet p-1.5 sm:p-2.5 md:p-3 max-w-2xl mx-auto shadow-2xl relative select-none transition-all ${isFitScreen ? 'enigma-fit-screen' : ''}`}>
      {/* 4 Parafusos de latão nos cantos da madeira */}
      <div className="absolute top-1 left-1 sm:top-2 sm:left-2 brass-screw"></div>
      <div className="absolute top-1 right-1 sm:top-2 sm:right-2 brass-screw"></div>
      <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 brass-screw"></div>
      <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 brass-screw"></div>

      {/* Chassi de Metal Preto Fosco */}
      <div className="metal-chassis p-1.5 sm:p-2.5 md:p-3 flex flex-col gap-1.5 sm:gap-2">
        {/* Plaqueta Metálica do Fabricante Militar */}
        <div className="flex items-center justify-between pb-1.5 border-b border-[#32363e]">
          <div className="flex items-center gap-2">
            <div className="metal-plate px-2.5 py-0.5 text-[10px] sm:text-[11px] font-mono tracking-widest text-amber-300 font-bold uppercase shadow">
              CHFR.MASCH. ENIGMA M3 • W.1944
            </div>
            <span className="text-[9px] font-mono text-zinc-500 hidden sm:inline">
              NO. A-14983/Heer
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Botão Toda a Máquina na Tela / Ajustar */}
            <button
              type="button"
              onClick={() => setIsFitScreen(!isFitScreen)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all border ${
                isFitScreen
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-[#1e2024] text-zinc-400 hover:text-zinc-200 border-[#393d46]'
              }`}
              title={isFitScreen ? 'Alternar para tamanho expandido' : 'Ajustar para toda a máquina caber na tela sem rolagem'}
            >
              {isFitScreen ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
              <span className="hidden sm:inline">{isFitScreen ? 'Visão Completa' : 'Ajustar à Tela'}</span>
            </button>

            {/* Mudo / Som */}
            <button
              onClick={toggleMute}
              className="p-1 rounded bg-[#1e2024] hover:bg-[#282b31] border border-[#393d46] text-zinc-400 hover:text-zinc-200 transition-colors"
              title={isMuted ? 'Ativar Efeitos Sonoros Mecânicos' : 'Silenciar'}
            >
              {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
          </div>
        </div>

        {/* Fita de Papel Militar Datilografada (Output Stream) */}
        <div className="flex flex-col bg-[#111215] border border-[#2b2e35] rounded-lg p-1.5 sm:p-2 shadow-inner">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono font-bold tracking-wider text-amber-500/90 uppercase">
              <FileText size={11} />
              <span>Fita Telegráfica (Grupos de 5)</span>
            </div>
            {outputTape.length > 0 && (
              <button
                onClick={onClearTape}
                className="text-[9px] sm:text-[10px] font-mono text-zinc-400 hover:text-red-400 underline transition-colors"
              >
                Limpar Fita
              </button>
            )}
          </div>

          <div className="bg-[#181a1f] border border-[#22252a] rounded px-2.5 py-1 min-h-[32px] sm:min-h-[36px] flex items-center overflow-x-auto font-mono text-xs sm:text-sm tracking-widest text-amber-300 font-bold select-text">
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
