import type { ModernEncryptedBundle } from '../../types/crypto';
import { EntropyChart } from './EntropyChart';
import { TamperLab } from './TamperLab';
import { BarChart3, Binary, Lock, ShieldCheck } from 'lucide-react';

interface CryptoInspectorProps {
  plainText: string;
  enigmaCipherText: string;
  modernBundle: ModernEncryptedBundle | null;
  isTampered: boolean;
  onToggleTamper: () => void;
  enigmaDecrypted: string;
  modernDecrypted: { success: boolean; decryptedText?: string; error?: string } | null;
}

export const CryptoInspector: React.FC<CryptoInspectorProps> = ({
  plainText,
  enigmaCipherText,
  modernBundle,
  isTampered,
  onToggleTamper,
  enigmaDecrypted,
  modernDecrypted
}) => {
  // Alan Turing Crib Flaw Check: In Enigma, E(x) != x strictly
  const cleanPlain = plainText.toUpperCase().replace(/[^A-Z]/g, '');
  const cleanEnigma = enigmaCipherText.replace(/[^A-Z]/g, '');
  const minLen = Math.min(cleanPlain.length, cleanEnigma.length);

  let selfCipherCount = 0;
  for (let i = 0; i < minLen; i++) {
    if (cleanPlain[i] === cleanEnigma[i]) {
      selfCipherCount++;
    }
  }

  // Frequência de caracteres na Enigma
  const freqMap: Record<string, number> = {};
  for (const c of cleanEnigma) {
    freqMap[c] = (freqMap[c] || 0) + 1;
  }
  const topChars = Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 rounded-2xl bg-[#121316] border border-[#2b2e35] shadow-xl text-zinc-200">
      {/* Cabeçalho do Raio-X */}
      <div className="flex items-center justify-between border-b border-[#242730] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Lock size={18} />
          </div>
          <div>
            <h3 className="font-mono font-bold text-sm text-zinc-100 tracking-wide uppercase">
              Raio-X Criptográfico: 1944 vs. Era Moderna
            </h3>
            <p className="text-[11px] font-mono text-zinc-500">
              Confronto em tempo real: Eletromecânica vs. AES-256 Galois/Counter Mode
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#1c1e24] text-zinc-400 border border-[#343844]">
          Split-View Ativo
        </span>
      </div>

      {/* Cartões dos Ciphertexts em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bloco Enigma */}
        <div className="p-4 rounded-xl bg-[#17191e] border border-amber-900/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                <Binary size={14} />
                Enigma M3 Ciphertext
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Grupos Militares de 5</span>
            </div>

            <div className="bg-[#0f1013] border border-[#262830] rounded p-2.5 min-h-[56px] font-mono text-xs text-amber-200 break-all select-text font-bold">
              {enigmaCipherText || '(Digite algo para cifrar)'}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-2 border-t border-[#252830]">
            <span>Caracteres: {cleanEnigma.length}</span>
            <span className="text-amber-500/80">Cifra Polialfabética</span>
          </div>
        </div>

        {/* Bloco AES-256-GCM */}
        <div className="p-4 rounded-xl bg-[#17191e] border border-emerald-900/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                <ShieldCheck size={14} />
                AES-256-GCM Ciphertext (Base64)
              </span>
              <span className="text-[10px] font-mono text-zinc-500">96-bit IV + 128-bit MAC</span>
            </div>

            <div className="bg-[#0f1013] border border-[#262830] rounded p-2.5 min-h-[56px] font-mono text-xs text-emerald-300 break-all select-text">
              {modernBundle?.ciphertextBase64 || '(Aguardando dados)'}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-2 border-t border-[#252830]">
            <span>IV: {modernBundle?.ivBase64.slice(0, 8)}...</span>
            <span className="text-emerald-500/80">Tag: {modernBundle?.tagBase64.slice(0, 8)}...</span>
          </div>
        </div>
      </div>

      {/* Cartão da Falha Clássica de Alan Turing: E(x) != x */}
      <div className="p-4 rounded-xl bg-[#16181e] border border-[#2d313a] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-amber-400" />
            <h4 className="font-mono text-xs font-bold text-zinc-200 uppercase tracking-wide">
              Detector da Falha de Bletchley Park: E(x) ≠ x
            </h4>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800">
            {selfCipherCount === 0 && minLen > 0 ? 'FALHA CONFIRMADA (0% AUTO-CIFRA)' : 'AGUARDANDO'}
          </span>
        </div>

        <p className="text-xs font-mono text-zinc-400 leading-relaxed">
          Na Enigma, por projeto físico do refletor (<em>Umkehrwalze</em>), uma letra <strong>NUNCA</strong> pode se transformar nela mesma. Em {minLen} letras digitadas, o total de letras que cifraram em si mesmas foi: <strong className="text-amber-300">{selfCipherCount} de {minLen} (0.00%)</strong>.
        </p>

        {topChars.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#252830]">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1.5">
              Frequência de Caracteres no Ciphertext Enigma:
            </span>
            <div className="flex flex-wrap gap-2">
              {topChars.map(([ch, count]) => (
                <div key={ch} className="px-2 py-1 rounded bg-[#0f1013] border border-[#2b2e35] text-xs font-mono">
                  <span className="text-amber-400 font-bold">{ch}</span>: <span className="text-zinc-300">{count}x</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Laboratório de Adulteração MITM */}
      <TamperLab
        isTampered={isTampered}
        onToggleTamper={onToggleTamper}
        enigmaDecrypted={enigmaDecrypted}
        modernDecrypted={modernDecrypted}
      />

      {/* Comparador de Espaço de Chaves */}
      <EntropyChart />
    </div>
  );
};
