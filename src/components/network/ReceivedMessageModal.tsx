import React from 'react';
import { X, ShieldCheck, ShieldAlert, Radio, Terminal, Copy, Check, ArrowRight } from 'lucide-react';
import type { EnigmaPayload } from '../../types/crypto';

interface ReceivedMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: EnigmaPayload | null;
  decryptedEnigma: string;
  modernResult: { success: boolean; decryptedText?: string; error?: string } | null;
  onGoToInspector: () => void;
}

export const ReceivedMessageModal: React.FC<ReceivedMessageModalProps> = ({
  isOpen,
  onClose,
  payload,
  decryptedEnigma,
  modernResult,
  onGoToInspector
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !payload) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(decryptedEnigma);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isTampered = !!payload.tampered || modernResult?.success === false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl bg-[#14161b] border-2 border-[#3c4250] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#1b1e25] border-b border-[#2c303c] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg border ${
              isTampered
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}>
              <Radio size={17} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-xs sm:text-sm text-zinc-100 uppercase tracking-widest">
                Transmissão Air-Gap Recebida & Decifrada
              </h3>
              <p className="text-[10px] sm:text-[11px] font-mono text-zinc-400">
                Estação de Origem: <strong className="text-amber-400">{payload.net.src}</strong> → Destino: <strong className="text-zinc-200">{payload.net.dst}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-[#282c37] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Card de Status de Autenticidade */}
          <div className={`p-3 rounded-xl border flex items-center gap-3 ${
            isTampered
              ? 'bg-red-950/30 border-red-800/60 text-red-300'
              : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
          }`}>
            {isTampered ? (
              <ShieldAlert size={20} className="shrink-0 text-red-400" />
            ) : (
              <ShieldCheck size={20} className="shrink-0 text-emerald-400" />
            )}
            <div className="text-xs font-mono">
              <span className="font-bold block uppercase">
                {isTampered ? 'Alerta: Pacote Adulterado no Canal (MITM)!' : 'Integridade e Origem Verificadas!'}
              </span>
              <span className="text-[11px] text-zinc-400">
                {isTampered
                  ? 'O AES-256-GCM detectou violação na tag MAC. A Enigma aceitou o texto sem validação!'
                  : 'Chave sincronizada: Rotores ' + payload.enigma.rotors.join('-') + ' | Posição ' + payload.enigma.ground.join('') + ' | Anéis ' + payload.enigma.rings.join('-')}
              </span>
            </div>
          </div>

          {/* Cifra Recebida */}
          <div className="p-3.5 rounded-xl bg-[#0e0f13] border border-[#272a34] space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
              1. Cifra Militar Recebida (Ciphertext)
            </span>
            <div className="p-2.5 rounded bg-[#16181e] border border-[#2f333f] font-mono text-xs text-amber-300 break-all select-all font-bold">
              {payload.enigma.ct}
            </div>
          </div>

          {/* Decifração Enigma M3 */}
          <div className="p-3.5 rounded-xl bg-[#0e0f13] border border-[#272a34] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal size={12} />
                2. Mensagem Original Decifrada pela Enigma M3
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 hover:text-amber-300 transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <div className="p-3 rounded bg-amber-950/20 border border-amber-800/40 font-mono text-sm sm:text-base text-amber-200 font-black tracking-widest break-all select-text">
              {decryptedEnigma || '(Vazio)'}
            </div>
          </div>

          {/* Decifração Moderna AES-256-GCM */}
          <div className="p-3.5 rounded-xl bg-[#0e0f13] border border-[#272a34] space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
              3. Decifração AES-256-GCM (Autenticada por Tag GHASH de 128 bits)
            </span>
            <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-800/40 font-mono text-xs text-emerald-200 break-all select-text">
              {modernResult?.success ? (
                <span>{modernResult.decryptedText}</span>
              ) : (
                <span className="text-red-400 font-bold">
                  ❌ {modernResult?.error || 'Violação de autenticidade detectada! Decifração bloqueada.'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-4 bg-[#181a20] border-t border-[#2a2e3a] shrink-0">
          <button
            type="button"
            onClick={onGoToInspector}
            className="w-full sm:w-auto px-4 py-2 font-mono text-xs font-bold text-amber-300 hover:text-amber-200 bg-[#232731] hover:bg-[#2b303c] rounded-lg border border-[#3c4250] transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Ver no Raio-X Criptográfico</span>
            <ArrowRight size={13} />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 font-mono text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow active:scale-95 transition-all"
          >
            Confirmar e Carregar na Máquina
          </button>
        </div>
      </div>
    </div>
  );
};
