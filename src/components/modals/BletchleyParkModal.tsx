import React, { useState } from 'react';
import { X, Search, ShieldAlert, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { soundEffects } from '../../audio/soundEffects';

interface BletchleyParkModalProps {
  isOpen: boolean;
  onClose: () => void;
  cipherText: string;
}

export const BletchleyParkModal: React.FC<BletchleyParkModalProps> = ({
  isOpen,
  onClose,
  cipherText
}) => {
  const [cribWord, setCribWord] = useState<string>('ATAQUE');
  const [selectedOffset, setSelectedOffset] = useState<number>(0);

  if (!isOpen) return null;

  // Limpa espaços da cifra
  const cleanCt = (cipherText || 'QJKLZMPXZABWTOPLKJHG').toUpperCase().replace(/[^A-Z]/g, '');
  const cleanCrib = cribWord.toUpperCase().replace(/[^A-Z]/g, '');

  const maxOffset = Math.max(0, cleanCt.length - cleanCrib.length);

  // Calcula todas as posições e se tiveram colisão (Crib Crash)
  const analysis = Array.from({ length: maxOffset + 1 }, (_, offset) => {
    const collisions: { cribIndex: number; char: string; ctIndex: number }[] = [];

    for (let j = 0; j < cleanCrib.length; j++) {
      if (cleanCrib[j] === cleanCt[offset + j]) {
        collisions.push({
          cribIndex: j,
          char: cleanCrib[j],
          ctIndex: offset + j
        });
      }
    }

    return {
      offset,
      hasCrash: collisions.length > 0,
      collisions
    };
  });

  const totalPositions = analysis.length;
  const discardedCount = analysis.filter(a => a.hasCrash).length;
  const viableCount = totalPositions - discardedCount;
  const eliminationRate = totalPositions > 0 ? ((discardedCount / totalPositions) * 100).toFixed(1) : '0';

  const currentAnalysis = analysis[selectedOffset] || analysis[0];

  const handleCribChange = (word: string) => {
    soundEffects.playKeyPress();
    setCribWord(word);
    setSelectedOffset(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#14161a] border-2 border-emerald-900/60 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Cabeçalho Bletchley Park */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#171e1a] border-b border-[#243329] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Search size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-xs sm:text-sm text-emerald-100 uppercase tracking-widest">
                  Modo Bletchley Park • Alan Turing Crib Attack
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Hut 8
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-mono text-zinc-400">
                Criptoanálise explorando a falha fatal da Enigma: <strong>E(x) ≠ x</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-[#253029] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Caixa de Entrada do Crib (Palavra Provável) */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#0f1211] border border-[#233129] space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-mono font-bold text-emerald-400 uppercase">
                1. Palavra Provável (Crib Militar):
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-zinc-500">Sugestões históricas:</span>
                {['ATAQUE', 'WETTER', 'COMANDO'].map(word => (
                  <button
                    key={word}
                    onClick={() => handleCribChange(word)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c2420] text-emerald-300 border border-[#2f3d35] hover:border-emerald-500 transition-colors"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              value={cribWord}
              onChange={(e) => handleCribChange(e.target.value)}
              placeholder="Digite a palavra provável (ex: ATAQUE)"
              className="w-full bg-[#161a18] border border-[#2e3e34] rounded-lg px-3 py-2 text-sm font-mono text-emerald-300 font-bold focus:outline-none focus:border-emerald-500 uppercase tracking-widest"
            />
          </div>

          {/* Métricas de Eliminação de Turing */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center font-mono">
            <div className="p-3 rounded-xl bg-[#111413] border border-[#243329]">
              <span className="text-[10px] text-zinc-400 uppercase block">Posições Testadas</span>
              <span className="text-lg sm:text-xl font-bold text-zinc-200">{totalPositions}</span>
            </div>
            <div className="p-3 rounded-xl bg-red-950/20 border border-red-800/40">
              <span className="text-[10px] text-red-400 uppercase flex items-center justify-center gap-1">
                <ShieldAlert size={11} /> Descartadas (Crash)
              </span>
              <span className="text-lg sm:text-xl font-bold text-red-400">{discardedCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-red-950/30 border border-red-700/50">
              <span className="text-[10px] text-amber-400 uppercase block">Taxa de Eliminação</span>
              <span className="text-lg sm:text-xl font-bold text-amber-300">{eliminationRate}%</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
              <span className="text-[10px] text-emerald-400 uppercase block">Candidatas Válidas</span>
              <span className="text-lg sm:text-xl font-bold text-emerald-400">{viableCount}</span>
            </div>
          </div>

          {/* Demonstração Visual do Deslizamento do Crib */}
          <div className="p-4 rounded-xl bg-[#0f1110] border border-[#223027] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-200 uppercase">
                2. Teste de Alinhamento (Offset Atual: {selectedOffset})
              </span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                currentAnalysis?.hasCrash
                  ? 'bg-red-950 text-red-300 border border-red-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {currentAnalysis?.hasCrash ? '❌ COLISÃO DETECTADA (IMPOSSÍVEL)' : '✅ HIPÓTESE VÁLIDA'}
              </span>
            </div>

            {/* Slider de Posição */}
            {maxOffset > 0 && (
              <div>
                <input
                  type="range"
                  min="0"
                  max={maxOffset}
                  value={selectedOffset}
                  onChange={(e) => setSelectedOffset(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                  <span>Início (Offset 0)</span>
                  <span>Fim (Offset {maxOffset})</span>
                </div>
              </div>
            )}

            {/* Grid de Letras: Ciphertext vs Crib Deslizado */}
            <div className="overflow-x-auto py-2">
              <div className="flex flex-col gap-1.5 font-mono text-xs select-none min-w-[320px]">
                {/* Linha do Ciphertext Interceptado */}
                <div className="flex items-center gap-1">
                  <span className="w-16 text-[10px] text-zinc-500 font-bold uppercase shrink-0">Cifra:</span>
                  <div className="flex gap-1">
                    {cleanCt.split('').map((c, idx) => {
                      const isUnderCrib = idx >= selectedOffset && idx < selectedOffset + cleanCrib.length;
                      const cribChar = isUnderCrib ? cleanCrib[idx - selectedOffset] : null;
                      const isCrash = cribChar === c;

                      return (
                        <div
                          key={idx}
                          className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs border ${
                            isCrash
                              ? 'bg-red-600 text-white border-red-500 shadow-[0_0_8px_#ef4444]'
                              : isUnderCrib
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700'
                              : 'bg-[#181a18] text-zinc-500 border-[#2b332c]'
                          }`}
                        >
                          {c}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Linha do Crib Deslizado */}
                <div className="flex items-center gap-1">
                  <span className="w-16 text-[10px] text-emerald-400 font-bold uppercase shrink-0">Crib:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: cleanCt.length }).map((_, idx) => {
                      const isUnderCrib = idx >= selectedOffset && idx < selectedOffset + cleanCrib.length;
                      const char = isUnderCrib ? cleanCrib[idx - selectedOffset] : '';
                      const isCrash = isUnderCrib && cleanCt[idx] === char;

                      return (
                        <div
                          key={idx}
                          className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs ${
                            isCrash
                              ? 'bg-red-700 text-white border border-red-500'
                              : isUnderCrib
                              ? 'bg-amber-500 text-black shadow font-black'
                              : 'opacity-0'
                          }`}
                        >
                          {char}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {currentAnalysis?.hasCrash ? (
              <div className="p-3 bg-red-950/30 border border-red-800/60 rounded-lg text-xs font-mono text-red-300 flex items-center gap-2">
                <XCircle size={16} className="text-red-400 shrink-0" />
                <span>
                  <strong>CRASH!</strong> A letra <strong>'{currentAnalysis.collisions[0].char}'</strong> do crib coincide com o mesmo caractere na cifra na posição {currentAnalysis.collisions[0].ctIndex}. Como a Enigma física <strong>nunca cifra uma letra nela mesma</strong>, este offset é matematicamente impossível e a máquina <em>Bombe</em> de Turing descartava este ponto instantaneamente!
                </span>
              </div>
            ) : (
              <div className="p-3 bg-emerald-950/30 border border-emerald-800/60 rounded-lg text-xs font-mono text-emerald-300 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>
                  <strong>HIPÓTESE VÁLIDA:</strong> Nenhuma letra do crib colidiu com a cifra. A máquina <em>Bombe</em> de Bletchley Park configurava seus rotores eletromecânicos para buscar as conexões do plugboard nesta posição!
                </span>
              </div>
            )}
          </div>

          {/* Contexto Histórico */}
          <div className="text-[11px] font-mono text-zinc-400 leading-relaxed bg-[#0d0f0e] p-3 rounded-lg border border-[#202924]">
            <span className="text-emerald-400 font-bold flex items-center gap-1 mb-1">
              <Sparkles size={13} />
              A Falha que Decidiu a Guerra
            </span>
            A força bruta em todas as $1.58 \times 10^{20}$ combinações era impossível para a época. Ao deslizar palavras prováveis (<em>cribs</em>) e descartar posições onde qualquer letra colidia, Turing e Welchman reduziram o espaço de busca a um nível que as máquinas eletromecânicas <em>Bombe</em> conseguiam testar em cerca de 20 minutos.
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex justify-end p-4 bg-[#161c18] border-t border-[#233129] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 font-mono text-xs font-bold text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-lg shadow active:scale-95 transition-all"
          >
            Fechar Modo Bletchley
          </button>
        </div>
      </div>
    </div>
  );
};
