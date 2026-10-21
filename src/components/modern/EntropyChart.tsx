import React from 'react';
import { Cpu, ShieldCheck, Zap } from 'lucide-react';

export const EntropyChart: React.FC = () => {
  return (
    <div className="p-4 rounded-xl bg-[#131519] border border-[#2b2e36] shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#262830] pb-2">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-amber-400" />
          <h4 className="font-mono text-xs font-bold text-zinc-200 tracking-wider uppercase">
            Espaço de Chaves & Resistência a Força Bruta
          </h4>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">Modelo teórico</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Enigma M3 */}
        <div className="p-3.5 rounded-lg bg-[#1a1c22] border border-amber-900/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-xs text-amber-400">ENIGMA M3 (1944)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50">
                ~67 bits
              </span>
            </div>
            <p className="text-2xl font-mono font-bold text-zinc-200 my-1">
              1.58 × 10<sup>20</sup>
            </p>
            <p className="text-[11px] text-zinc-400 font-mono mt-1">
              60 ordens × 26³ posições × 150.738.274.937.250 plugboards. Anéis fixos, refletor B e exatamente 10 cabos.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#2d3038] text-[11px] font-mono text-red-400 flex items-center gap-1.5">
            <Cpu size={14} />
            <span>Busca exaustiva média: <strong>≈ 2,52 anos</strong></span>
          </div>
        </div>

        {/* Card AES-256-GCM */}
        <div className="p-3.5 rounded-lg bg-[#1a1c22] border border-emerald-900/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-xs text-emerald-400">AES-256-GCM (MODERNO)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                256 bits
              </span>
            </div>
            <p className="text-2xl font-mono font-bold text-zinc-200 my-1">
              1.15 × 10<sup>77</sup>
            </p>
            <p className="text-[11px] text-zinc-400 font-mono mt-1">
              2<sup>256</sup> chaves possíveis; pressupõe chave uniforme e aleatória.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#2d3038] text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck size={14} />
            <span>Busca exaustiva média: <strong>≈ 1,83 × 10⁵⁷ anos</strong></span>
          </div>
        </div>
      </div>

      <div className="text-[11px] font-mono text-zinc-400 leading-relaxed bg-[#101114] p-2.5 rounded border border-[#22242b]">
        <p>Hipótese ilustrativa: 10¹² chaves testadas por segundo, tempo médio = N / (2 × taxa). Não é medição deste aplicativo. A senha compartilhada pode ter muito menos entropia que uma chave AES aleatória; PBKDF2 aumenta o custo de cada tentativa, sem criar entropia.</p>
        💡 <strong>Nota Histórica:</strong> Alan Turing e a equipe de Bletchley Park não usaram força bruta ingênua; eles exploraram a falha geométrica do refletor da Enigma que impede que uma letra cifre nela mesma (<em>crib-matching</em> via eletromecânica <em>Bombe</em>).
      </div>
    </div>
  );
};
