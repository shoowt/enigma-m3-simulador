import React from 'react';
import { AlertOctagon, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';
import { soundEffects } from '../../audio/soundEffects';

interface TamperLabProps {
  isTampered: boolean;
  disabled?: boolean;
  onToggleTamper: () => void;
  enigmaDecrypted: string;
  modernDecrypted: { success: boolean; decryptedText?: string; error?: string } | null;
}

export const TamperLab: React.FC<TamperLabProps> = ({
  isTampered,
  disabled,
  onToggleTamper,
  enigmaDecrypted,
  modernDecrypted
}) => {
  const handleToggle = () => {
    onToggleTamper();
    if (!isTampered) {
      soundEffects.playAlarm();
    }
  };

  return (
    <div className="p-4 rounded-xl bg-[#14161a] border border-[#2d3038] shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#282a32] pb-2">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className={isTampered ? 'text-red-400' : 'text-amber-400'} />
          <h4 className="font-mono text-xs font-bold text-zinc-200 tracking-wider uppercase">
            Laboratório de Adulteração MITM (Integridade)
          </h4>
        </div>
        <button
          onClick={handleToggle}
          disabled={disabled}
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-40 shrink-0 ${
            isTampered
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]'
              : 'bg-[#22252c] hover:bg-[#2c3039] text-zinc-300 border border-[#3e434f]'
          }`}
        >
          <RefreshCw size={13} className={isTampered ? 'animate-spin' : ''} />
          <span>{isTampered ? 'Desfazer Adulteração' : 'Adulterar cifra (1 letra / 1 bit)'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Resultado na Enigma */}
        <div className="p-3.5 rounded-lg bg-[#1a1c22] border border-[#333640] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-xs text-amber-400">ENIGMA M3 (SEM INTEGRIDADE)</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                isTampered ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {isTampered ? 'FALHA SILENCIOSA' : 'Sem Adulteração'}
              </span>
            </div>

            <p className="text-xs font-mono text-zinc-300 bg-[#101114] p-2.5 rounded border border-[#242730] min-h-[50px] break-all select-text">
              {enigmaDecrypted || '(Aguardando mensagem transmitida)'}
            </p>
          </div>

          <div className="mt-3 text-[11px] font-mono leading-tight">
            {isTampered ? (
              <span className="text-amber-400 flex items-center gap-1">
                ⚠️ A Enigma decifra sem avisar nada! Apenas 1 caractere sai adulterado, sem detecção.
              </span>
            ) : (
              <span className="text-zinc-500">Cifra simétrica sem verificação de autenticidade (MAC).</span>
            )}
          </div>
        </div>

        {/* Resultado no AES-256-GCM */}
        <div className={`p-3.5 rounded-lg border flex flex-col justify-between transition-colors ${
          isTampered
            ? 'bg-red-950/20 border-red-700/60 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
            : 'bg-[#1a1c22] border-[#333640]'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-xs text-emerald-400">AES-256-GCM (AUTHENTICATED)</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                isTampered
                  ? 'bg-red-900/60 text-red-200 border border-red-700'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {modernDecrypted ? modernDecrypted.success ? 'TAG VÁLIDA' : 'AUTENTICAÇÃO FALHOU' : 'AGUARDANDO'}
              </span>
            </div>

            <div className="p-2.5 rounded bg-[#101114] border border-[#242730] min-h-[50px] font-mono text-xs flex items-center">
              {modernDecrypted?.success === false ? (
                <div className="text-red-400 flex items-center gap-2">
                  <AlertOctagon size={16} className="shrink-0 text-red-500 animate-pulse" />
                  <span className="font-bold">
                    {modernDecrypted?.error || 'Falha de autenticação. Decifração bloqueada.'}
                  </span>
                </div>
              ) : (
                <div className="text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
                  <span className="select-text">{modernDecrypted?.decryptedText || '(Aguardando mensagem)'}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 text-[11px] font-mono leading-tight">
            {isTampered ? (
              <span className="text-red-400 font-semibold">
                🛡️ O algoritmo moderno descarta os dados e impede execução de comandos alterados.
              </span>
            ) : (
              <span className="text-zinc-500">Tag de 128 bits autentica o pacote com a senha compartilhada.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
