import React from 'react';
import { X, ShieldAlert } from 'lucide-react';
import type { DailyKey } from '../../types/crypto';
import { MONTHLY_KEY_SHEET } from '../../core/keySheet';
import { soundEffects } from '../../audio/soundEffects';

interface KeySheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDay: number;
  onApplyDay: (key: DailyKey) => void;
}

export const KeySheetModal: React.FC<KeySheetModalProps> = ({
  isOpen,
  onClose,
  currentDay,
  onApplyDay
}) => {
  if (!isOpen) return null;

  const handleSelectDay = (key: DailyKey) => {
    soundEffects.playRotorStep();
    onApplyDay(key);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl vintage-paper p-6 sm:p-8 rounded-lg shadow-2xl relative border-4 border-[#7a5c37] overflow-y-auto max-h-[90vh]">
        {/* Carimbo de TOP SECRET Militar */}
        <div className="absolute top-4 right-14 border-4 border-red-800/80 text-red-800/90 font-black text-xs sm:text-sm px-3 py-1 uppercase tracking-widest rotate-6 pointer-events-none select-none">
          GEHEIM! • STRENG VERTRAULICH
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/10 text-stone-700 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Título do Documento */}
        <div className="text-center pb-4 border-b-2 border-stone-800/40 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-widest uppercase text-stone-900 font-military">
            SCHLÜSSELTAFEL • WEHRMACHT M3
          </h2>
          <p className="text-xs sm:text-sm text-stone-700 mt-1 font-mono">
            Tabela Mensal de Códigos de Máquina para Comunicações de Rádio (Junho de 1944)
          </p>
        </div>

        {/* Tabela de Chaves Militares */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm font-mono">
            <thead>
              <tr className="border-b-2 border-stone-800 text-stone-900 font-bold uppercase text-[11px] sm:text-xs">
                <th className="py-2 px-2">Dia</th>
                <th className="py-2 px-2">Walzenlage (Rotores)</th>
                <th className="py-2 px-2">Ringstellung (Anéis)</th>
                <th className="py-2 px-2">Refletor</th>
                <th className="py-2 px-2">Stecker (Plugboard)</th>
                <th className="py-2 px-2 text-center">Ação</th>
              </tr>
            </thead>
            <tbody>
              {MONTHLY_KEY_SHEET.map((k) => {
                const isSelected = currentDay === k.day;
                return (
                  <tr
                    key={k.day}
                    className={`border-b border-stone-400/50 hover:bg-black/5 transition-colors ${
                      isSelected ? 'bg-amber-800/15 font-bold' : ''
                    }`}
                  >
                    <td className="py-3 px-2 text-stone-900 font-bold">
                      Dia {String(k.day).padStart(2, '0')}
                    </td>
                    <td className="py-3 px-2 text-stone-800">
                      {k.rotors.join(' - ')}
                    </td>
                    <td className="py-3 px-2 text-stone-800">
                      {k.rings.map(r => String(r).padStart(2, '0')).join(' ')}
                    </td>
                    <td className="py-3 px-2 text-stone-800 font-semibold">
                      {k.reflector}
                    </td>
                    <td className="py-3 px-2 text-stone-800 text-xs tracking-tight">
                      {k.plugs.slice(0, 5).join(' ')}...
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => handleSelectDay(k)}
                        className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-stone-800 text-amber-200 shadow'
                            : 'bg-stone-300 hover:bg-stone-400 text-stone-900'
                        }`}
                      >
                        {isSelected ? 'Em Uso' : 'Carregar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Instruções Confidenciais */}
        <div className="mt-6 pt-4 border-t-2 border-stone-800/40 text-[11px] sm:text-xs text-stone-800 leading-relaxed font-mono">
          <div className="flex items-center gap-1.5 font-bold mb-1 text-stone-900">
            <ShieldAlert size={14} />
            <span>ORDENS DE SEGURANÇA OPERACIONAL:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1">
            <li>Em caso de captura iminente da estação, destrua este documento por incineração.</li>
            <li>Nunca reutilize a mesma posição inicial (Grundstellung) em duas transmissões consecutivas.</li>
            <li>As estações em rede devem sincronizar o dia civil para que a decodificação seja instantânea.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
