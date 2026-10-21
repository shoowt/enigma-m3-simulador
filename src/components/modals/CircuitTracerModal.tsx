import React, { useState } from 'react';
import { X, Zap, ArrowRight, Activity } from 'lucide-react';
import type { CircuitTrace } from '../../types/crypto';
import type { EnigmaM3 } from '../../core/enigmaEngine';
import { soundEffects } from '../../audio/soundEffects';

interface CircuitTracerModalProps {
  isOpen: boolean;
  onClose: () => void;
  enigma: EnigmaM3 | null;
}

export const CircuitTracerModal: React.FC<CircuitTracerModalProps> = ({
  isOpen,
  onClose,
  enigma
}) => {
  const [selectedChar, setSelectedChar] = useState<string>('A');

  if (!isOpen || !enigma) return null;

  const trace: CircuitTrace = enigma.traceChar(selectedChar);

  const handleSelectChar = (c: string) => {
    soundEffects.playKeyPress();
    setSelectedChar(c);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#14161a] border-2 border-[#3d424e] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#1d2026] border-b border-[#2e323c] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap size={17} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-xs sm:text-sm text-zinc-100 uppercase tracking-widest">
                Raio-X do Circuito Elétrico (12V)
              </h3>
              <p className="text-[10px] sm:text-[11px] font-mono text-zinc-400">
                Acompanhe o caminho físico da corrente elétrica pelos 11 estágios da Enigma
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-[#2a2d36] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 overscroll-contain space-y-5">
          {/* Seletor da Tecla para Rastreamento */}
          <div className="p-3 sm:p-4 rounded-xl bg-[#0f1013] border border-[#2b2e36] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono font-bold text-amber-400 uppercase block mb-0.5">
                Pressione uma tecla para rastrear o circuito:
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                Rotores na posição inicial: [{trace.rotorPositions.join(' - ')}]
              </span>
            </div>

            <div className="flex flex-wrap gap-1 max-w-md">
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map(c => (
                <button
                  key={c}
                  onClick={() => handleSelectChar(c)}
                  className={`w-7 h-7 rounded font-mono text-xs font-bold transition-all ${
                    selectedChar === c
                      ? 'bg-amber-500 text-black shadow-[0_0_8px_#f59e0b]'
                      : 'bg-[#1e2025] text-zinc-300 hover:bg-[#2a2d34]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Resumo da Transformação */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/30 via-[#181a20] to-amber-950/30 border border-amber-800/40 flex items-center justify-around text-center">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Tecla Pressionada</span>
              <span className="text-2xl sm:text-3xl font-mono font-black text-amber-300">{trace.inputChar}</span>
            </div>

            <div className="flex flex-col items-center gap-1 text-zinc-500 font-mono text-xs">
              <span className="text-[10px] text-amber-500 uppercase font-semibold">11 Estágios Mecânicos</span>
              <ArrowRight size={20} className="text-amber-400 animate-pulse" />
            </div>

            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Lâmpada Acesa</span>
              <span className="text-2xl sm:text-3xl font-mono font-black text-amber-400 drop-shadow-[0_0_12px_#f59e0b]">
                {trace.outputChar}
              </span>
            </div>
          </div>

          {/* Timeline Vertical dos 11 Estágios */}
          <div className="space-y-2 relative before:absolute before:top-3 before:bottom-3 before:left-[19px] before:w-0.5 before:bg-[#2b2e36]">
            {trace.steps.map((step, idx) => {
              const isReflector = step.stage.includes('Refletor');
              const isFinal = idx === trace.steps.length - 1;

              return (
                <div
                  key={idx}
                  className={`relative flex items-start gap-3 p-2.5 sm:p-3 rounded-lg border transition-all ${
                    isReflector
                      ? 'bg-red-950/20 border-red-700/50 shadow-sm'
                      : isFinal
                      ? 'bg-amber-950/30 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'bg-[#111215] border-[#242730]'
                  }`}
                >
                  {/* Número do Passo / Marcador */}
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-mono text-xs font-bold z-10 ${
                    isReflector
                      ? 'bg-red-600 text-white'
                      : isFinal
                      ? 'bg-amber-500 text-black'
                      : 'bg-[#22252c] text-zinc-300 border border-[#3b3f4a]'
                  }`}>
                    {idx + 1}
                  </div>

                  {/* Detalhes do Estágio */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-200">{step.stage}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1c1e24] text-zinc-400 border border-[#2b2e35]">
                          {step.subLabel}
                        </span>
                      </div>

                      {/* Transição de Letra */}
                      <div className="flex items-center gap-1 font-mono text-xs font-bold shrink-0">
                        <span className="text-zinc-400">{step.charIn}</span>
                        <ArrowRight size={12} className="text-amber-500" />
                        <span className="text-amber-400 font-black">{step.charOut}</span>
                      </div>
                    </div>

                    <p className="text-[11px] font-mono text-zinc-400 mt-0.5 leading-snug">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] font-mono text-zinc-400 bg-[#0d0e11] p-3 rounded-lg border border-[#22252b] leading-relaxed">
            <span className="text-amber-400 font-bold flex items-center gap-1 mb-1">
              <Activity size={13} />
              Diferencial da Banca: Princípio da Involução
            </span>
            A corrente de 12V sai da tecla, percorre os 3 rotores na ida, é redirecionada pelo refletor e volta pelos mesmos rotores em sentido inverso. Se você pressionar agora a letra <strong>'{trace.outputChar}'</strong> na mesma posição, o circuito fará o caminho oposto e acenderá <strong>'{trace.inputChar}'</strong>!
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex justify-end p-4 bg-[#1a1c22] border-t border-[#2e323c] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 font-mono text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow active:scale-95 transition-all"
          >
            Fechar Rastreamento
          </button>
        </div>
      </div>
    </div>
  );
};
