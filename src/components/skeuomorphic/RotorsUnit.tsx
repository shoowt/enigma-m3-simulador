import React from 'react';
import { ChevronUp, ChevronDown, Settings2 } from 'lucide-react';
import type { RotorId } from '../../types/crypto';
import { soundEffects } from '../../audio/soundEffects';

interface RotorsUnitProps {
  rotorTypes: [RotorId, RotorId, RotorId];
  positions: [string, string, string];
  onRotateManually: (rotorIndex: 0 | 1 | 2, delta: number) => void;
  onOpenLid: () => void;
}

export const RotorsUnit: React.FC<RotorsUnitProps> = ({
  rotorTypes,
  positions,
  onRotateManually,
  onOpenLid
}) => {
  const rotorLabels = ['ROTOR I (ESQ)', 'ROTOR II (MEIO)', 'ROTOR III (DIR)'];

  const handleStep = (idx: 0 | 1 | 2, delta: number) => {
    soundEffects.playRotorStep();
    onRotateManually(idx, delta);
  };

  return (
    <div className="flex flex-col items-center p-2 sm:p-3 rounded-lg bg-[#141517] border border-[#2d3036] shadow-inner mb-2.5 sm:mb-4 w-full">
      {/* Barra de título do compartimento de rotores */}
      <div className="flex items-center justify-between w-full px-1 sm:px-2 mb-1.5 sm:mb-2">
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-amber-500/80 font-mono font-bold tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
          <span>Catracas (M3)</span>
        </div>
        <button
          onClick={onOpenLid}
          className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-mono font-semibold text-zinc-300 hover:text-amber-400 bg-[#222428] hover:bg-[#2b2e34] border border-[#3e424a] rounded shadow transition-colors active:scale-95"
          title="Abrir tampa para inspecionar rotores internos e anéis"
        >
          <Settings2 size={12} />
          <span>Abrir Tampa</span>
        </button>
      </div>

      {/* Rotores visíveis */}
      <div className="flex items-center justify-center gap-3 sm:gap-7 py-1.5 px-2 sm:px-4 bg-[#0d0e10] rounded-md border border-[#25282e] shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] w-full">
        {positions.map((pos, idx) => (
          <div key={idx} className="flex flex-col items-center">
            {/* Tag do Tipo de Rotor */}
            <div className="text-[10px] font-mono text-zinc-500 mb-1 font-semibold">
              {rotorTypes[idx]}
            </div>

            {/* Catraca Superior */}
            <button
              onClick={() => handleStep(idx as 0 | 1 | 2, 1)}
              className="p-1 text-zinc-400 hover:text-amber-400 active:scale-90 transition-transform"
              title={`Girar ${rotorLabels[idx]} para cima`}
            >
              <ChevronUp size={18} />
            </button>

            {/* Janela de Inspeção com Cilindro Serrilhado */}
            <div className="relative w-11 h-14 rounded rotor-drum flex items-center justify-center overflow-hidden my-0.5">
              {/* Vidro de proteção com reflexo */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/40 pointer-events-none"></div>
              
              {/* Letra atual visível */}
              <span className="text-2xl font-bold font-mono text-amber-100 tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {pos}
              </span>

              {/* Linha vermelha de leitura militar */}
              <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-red-600/40 pointer-events-none -translate-y-1/2"></div>
            </div>

            {/* Catraca Inferior */}
            <button
              onClick={() => handleStep(idx as 0 | 1 | 2, -1)}
              className="p-1 text-zinc-400 hover:text-amber-400 active:scale-90 transition-transform"
              title={`Girar ${rotorLabels[idx]} para baixo`}
            >
              <ChevronDown size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
