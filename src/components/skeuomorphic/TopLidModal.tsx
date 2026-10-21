import React from 'react';
import { X, Check } from 'lucide-react';
import type { ReflectorId, RotorId } from '../../types/crypto';
import { soundEffects } from '../../audio/soundEffects';

interface TopLidModalProps {
  isOpen: boolean;
  onClose: () => void;
  rotorTypes: [RotorId, RotorId, RotorId];
  ringSettings: [number, number, number];
  reflector: ReflectorId;
  onSave: (
    newRotors: [RotorId, RotorId, RotorId],
    newRings: [number, number, number],
    newReflector: ReflectorId
  ) => void;
}

const AVAILABLE_ROTORS: RotorId[] = ['I', 'II', 'III', 'IV', 'V'];

export const TopLidModal: React.FC<TopLidModalProps> = ({
  isOpen,
  onClose,
  rotorTypes,
  ringSettings,
  reflector,
  onSave
}) => {
  const [selectedRotors, setSelectedRotors] = React.useState<[RotorId, RotorId, RotorId]>([...rotorTypes]);
  const [selectedRings, setSelectedRings] = React.useState<[number, number, number]>([...ringSettings]);
  const [selectedReflector, setSelectedReflector] = React.useState<ReflectorId>(reflector);

  if (!isOpen) return null;

  const handleApply = () => {
    if (new Set(selectedRotors).size !== 3) return;
    soundEffects.playRotorStep();
    onSave(selectedRotors, selectedRings, selectedReflector);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#17191d] border-2 border-[#474b54] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden max-h-[92vh] flex flex-col my-auto">
        {/* Cabeçalho da Tampa Mecânica */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#202227] border-b border-[#343842] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
            <h3 className="font-mono font-bold text-xs sm:text-sm tracking-widest text-zinc-200 uppercase">
              Mecanismo Interno & Rotores (Walzenlage)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-[#2c3038] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1 min-h-0 overscroll-contain">
          <p className="text-xs text-zinc-400 font-mono leading-relaxed">
            Configure a ordem dos 3 rotores no eixo central, a calibração do anel interno (<em>Ringstellung</em>) e o refletor (<em>Umkehrwalze</em>) de acordo com a Folha de Chaves militar do dia.
          </p>

          {/* Seleção do Refletor */}
          <div className="p-4 bg-[#111215] rounded-lg border border-[#2b2e36]">
            <label className="block text-xs font-mono font-bold text-amber-500 uppercase mb-2">
              1. Refletor (Umkehrwalze - UKW)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['UKW-B', 'UKW-C'] as ReflectorId[]).map(ref => (
                <button
                  key={ref}
                  type="button"
                  onClick={() => setSelectedReflector(ref)}
                  className={`p-3 rounded border text-left font-mono transition-all ${
                    selectedReflector === ref
                      ? 'border-amber-500 bg-amber-950/30 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'border-[#33363e] bg-[#1a1c20] text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  <div className="font-bold text-sm">{ref}</div>
                  <div className="text-[11px] text-zinc-500 mt-1">
                    {ref === 'UKW-B' ? 'Padrão Wehrmacht/Luftwaffe (1940-45)' : 'Alternativa Kriegsmarine/Naval'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Seleção e Ordem dos 3 Rotores */}
          <div className="p-4 bg-[#111215] rounded-lg border border-[#2b2e36]">
            <label className="block text-xs font-mono font-bold text-amber-500 uppercase mb-3">
              2. Ordem dos Rotores (Esq, Meio, Dir) & Anéis (Ringstellung 01-26)
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map(slotIdx => {
                const slotLabels = ['Rotor Esquerdo (Lento)', 'Rotor Meio (Double-Step)', 'Rotor Direito (Rápido)'];
                return (
                  <div key={slotIdx} className="p-3 bg-[#181a1e] rounded border border-[#2c3038] flex flex-col gap-2">
                    <span className="text-[11px] font-mono font-semibold text-zinc-300">
                      {slotLabels[slotIdx]}
                    </span>

                    {/* Escolha do Rotor I a V */}
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 block mb-1">Tipo de Rotor:</span>
                      <select
                        value={selectedRotors[slotIdx]}
                        onChange={(e) => {
                          const val = e.target.value as RotorId;
                          const next = [...selectedRotors] as [RotorId, RotorId, RotorId];
                          next[slotIdx] = val;
                          setSelectedRotors(next);
                        }}
                        className="w-full bg-[#101114] text-amber-400 font-mono font-bold text-sm border border-[#3f434c] rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                      >
                        {AVAILABLE_ROTORS.map(r => (
                          <option key={r} value={r}>Rotor {r}</option>
                        ))}
                      </select>
                    </div>

                    {/* Ringstellung (Ajuste do anel de 1 a 26) */}
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 block mb-1">
                        Anel (Ringstellung): {String(selectedRings[slotIdx]).padStart(2, '0')}
                      </span>
                      <input
                        type="range"
                        min="1"
                        max="26"
                        value={selectedRings[slotIdx]}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          const next = [...selectedRings] as [number, number, number];
                          next[slotIdx] = val;
                          setSelectedRings(next);
                        }}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 bg-[#1f2126] border-t border-[#343842] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-mono text-xs text-zinc-400 hover:text-zinc-200 transition-colors text-center"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={new Set(selectedRotors).size !== 3}
            className="flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 font-mono text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded shadow-md transition-all active:scale-95 disabled:opacity-40"
          >
            <Check size={14} />
            <span>{new Set(selectedRotors).size !== 3 ? 'Escolha três rotores diferentes' : 'Fechar Tampa & Aplicar Ajustes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
