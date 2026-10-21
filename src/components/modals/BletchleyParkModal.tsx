import React, { useState } from 'react';
import {
  X,
  Search,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Sparkles,
  History,
  ChevronLeft,
  ChevronRight,
  Zap,
  RotateCcw
} from 'lucide-react';
import { soundEffects } from '../../audio/soundEffects';

interface BletchleyParkModalProps {
  isOpen: boolean;
  onClose: () => void;
  cipherText?: string;
}

interface CipherPreset {
  id: string;
  title: string;
  origin: string;
  date: string;
  ciphertext: string;
  recommendedCrib: string;
  description: string;
}

const DIDACTIC_PRESETS: CipherPreset[] = [
  {
    id: 'u-boat-weather',
    title: 'Boletim Meteorológico U-Boat (Atlântico)',
    origin: 'Submarino U-559 / Kriegsmarine',
    date: 'Hut 8 — Bletchley Park, 1942',
    ciphertext: 'EKNZXWETTRPKLQZMNBVCXZSAWQETUO',
    recommendedCrib: 'WETTER',
    description: 'Relatórios matinais de clima começavam frequentemente com WETTER (tempo). Este padrão foi o ponto de partida de Alan Turing!'
  },
  {
    id: 'kriegsmarine-tactical',
    title: 'Ordem Tática Naval (Königsberg)',
    origin: 'Comando Naval do Báltico',
    date: 'Bletchley Park, 1941',
    ciphertext: 'NLRIJIDPIQTPZTPMZQKLZMPXZABWTO',
    recommendedCrib: 'ATAQUE',
    description: 'Ordens táticas e rotas operacionais continham palavras frequentes como ATAQUE e COMANDO nos blocos iniciais.'
  },
  {
    id: 'high-command-dispatch',
    title: 'Despacho do Alto Comando (Berlim)',
    origin: 'Oberkommando der Wehrmacht (Berlim)',
    date: 'Hut 6 / Bletchley Park, 1943',
    ciphertext: 'QJKLZMPXZABWTOPLKJHGVFRDCXSWZA',
    recommendedCrib: 'COMANDO',
    description: 'Comunicações rotineiras do estado-maior alemão continham saudações padronizadas e termos de liderança.'
  },
  {
    id: 'luftwaffe-traffic',
    title: 'Tráfego Aéreo Luftwaffe (Mediterrâneo)',
    origin: 'Fliegerkorps II (Sicília)',
    date: 'Bletchley Park, 1941',
    ciphertext: 'BZXYTQMVPRKFWQZJLPOMNBVCXZSWERT',
    recommendedCrib: 'BERLIN',
    description: 'Mensagens de navegação e rotas de esquadrilhas frequentemente reportavam à capital Berlim.'
  }
];

const HISTORICAL_CRIBS = ['WETTER', 'ATAQUE', 'COMANDO', 'BERLIN', 'PANZER', 'KURIER'];

export const BletchleyParkModal: React.FC<BletchleyParkModalProps> = ({
  isOpen,
  onClose,
  cipherText
}) => {
  const [useOwnMessage, setUseOwnMessage] = useState(!!cipherText?.replace(/[^A-Z]/g, ''));
  const [selectedPresetId, setSelectedPresetId] = useState<string>('u-boat-weather');
  const [cribWord, setCribWord] = useState<string>('WETTER');
  const [selectedOffset, setSelectedOffset] = useState<number>(0);

  if (!isOpen) return null;

  const currentPreset = DIDACTIC_PRESETS.find(p => p.id === selectedPresetId) || DIDACTIC_PRESETS[0];

  const cleanCt = (useOwnMessage && cipherText?.replace(/[^A-Z]/g, '') ? cipherText : currentPreset.ciphertext).toUpperCase().replace(/[^A-Z]/g, '');
  const cleanCrib = cribWord.toUpperCase().replace(/[^A-Z]/g, '') || 'WETTER';

  const maxOffset = Math.max(0, cleanCt.length - cleanCrib.length);

  // Calcula todas as posições e colisões (Crib Crash)
  const analysis = Array.from({ length: cleanCrib.length <= cleanCt.length ? maxOffset + 1 : 0 }, (_, offset) => {
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

  const safeOffset = Math.min(selectedOffset, maxOffset);
  const totalPositions = analysis.length;
  const discardedCount = analysis.filter(a => a.hasCrash).length;
  const viableCount = totalPositions - discardedCount;
  const eliminationRate = totalPositions > 0 ? ((discardedCount / totalPositions) * 100).toFixed(1) : '0';

  const currentAnalysis = analysis[safeOffset] || analysis[0];

  const handleCribChange = (word: string) => {
    soundEffects.playKeyPress();
    setCribWord(word);
    setSelectedOffset(0);
  };

  const handleSelectPreset = (preset: CipherPreset) => {
    setUseOwnMessage(false);
    soundEffects.playPlugInsert();
    setSelectedPresetId(preset.id);
    setCribWord(preset.recommendedCrib);
    setSelectedOffset(0);
  };

  const handleOffsetChange = (offset: number) => {
    const clamped = Math.max(0, Math.min(maxOffset, offset));
    setSelectedOffset(clamped);
    if (analysis[clamped]?.hasCrash) {
      soundEffects.playAlarm();
    } else {
      soundEffects.playRotorStep();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#14161a] border-2 border-emerald-900/60 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Cabeçalho Bletchley Park */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#171e1a] border-b border-[#243329] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Search size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-xs sm:text-sm text-emerald-100 uppercase tracking-widest">
                  Modo Bletchley Park • Alan Turing Crib Attack
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                  Hut 8
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-mono text-zinc-400">
                Criptoanálise explorando a falha de engenharia da Enigma: <strong className="text-emerald-300">E(x) ≠ x</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-[#253029] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Conteúdo com rolagem suave */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
          <p className="text-xs text-zinc-400">Exemplos fictícios inspirados no contexto histórico. Este modo elimina alinhamentos impossíveis; não recupera sozinho a chave nem implementa a Bombe completa.</p>
          {cipherText && <button onClick={() => { setUseOwnMessage(true); setSelectedOffset(0); }} className="text-xs text-amber-300 border border-amber-700 rounded p-2">Analisar minha mensagem {useOwnMessage ? '(ativa)' : ''}</button>}
          {/* SELEÇÃO DA TRANSMISSÃO INTERCEPTADA DA WWII */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                <History size={14} /> 1. Cifra para análise:
              </label>
              <span className="text-[10px] font-mono text-zinc-400">
                Tamanho da Cifra: <strong className="text-emerald-300">{cleanCt.length} caracteres</strong>
              </span>
            </div>

            {/* Grid dos 4 Presets Históricos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {DIDACTIC_PRESETS.map((preset) => {
                const isSelected = preset.id === selectedPresetId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-950/50 border-emerald-500 text-emerald-100 shadow-[0_0_14px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/40'
                        : 'bg-[#0f1211] border-[#223027] text-zinc-400 hover:border-emerald-800 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                      <span className={isSelected ? 'text-emerald-300 font-bold' : 'text-zinc-300'}>
                        {isSelected ? '▶ ' : ''}{preset.title}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#19221d] text-emerald-300 border border-[#27362d]">
                        Crib: {preset.recommendedCrib}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-zinc-500 mt-1">
                      {preset.origin} • {preset.date}
                    </p>
                    <div className="mt-1.5 pt-1 border-t border-[#1a251e] flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-500">Cifra:</span>
                      <span className="text-emerald-400 font-bold tracking-wider">{preset.ciphertext.slice(0, 16)}...</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PALAVRA PROVÁVEL (CRIB) */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#0f1211] border border-[#233129] space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                <Zap size={14} /> 2. Palavra Provável (Crib Militar):
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono text-zinc-500">Cribs históricos:</span>
                {HISTORICAL_CRIBS.map(word => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => handleCribChange(word)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                      cribWord.toUpperCase() === word
                        ? 'bg-emerald-500 text-black border-emerald-400 font-bold'
                        : 'bg-[#1c2420] text-emerald-300 border-[#2f3d35] hover:border-emerald-500'
                    }`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={cribWord}
                onChange={(e) => handleCribChange(e.target.value)}
                placeholder="Digite a palavra provável (ex: WETTER, ATAQUE)"
                className="w-full bg-[#161a18] border border-[#2e3e34] rounded-lg px-3 py-2 text-sm font-mono text-emerald-300 font-bold focus:outline-none focus:border-emerald-500 uppercase tracking-widest"
              />
              <button
                type="button"
                onClick={() => {
                  setCribWord(currentPreset.recommendedCrib);
                  setSelectedOffset(0);
                }}
                title="Restaurar crib recomendado deste preset"
                className="p-2 rounded-lg bg-[#1a211d] text-zinc-400 hover:text-emerald-300 border border-[#2e3e34] transition-colors"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* MÉTRICAS DE ELIMINAÇÃO DE TURING */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center font-mono">
            <div className="p-3 rounded-xl bg-[#111413] border border-[#243329]">
              <span className="text-[10px] text-zinc-400 uppercase block">Posições Testadas</span>
              <span className="text-lg sm:text-xl font-bold text-zinc-200">{totalPositions}</span>
            </div>
            <div className="p-3 rounded-xl bg-red-950/20 border border-red-800/40">
              <span className="text-[10px] text-red-400 uppercase flex items-center justify-center gap-1">
                <ShieldAlert size={12} /> Descartadas (Crash)
              </span>
              <span className="text-lg sm:text-xl font-bold text-red-400">{discardedCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-700/50">
              <span className="text-[10px] text-amber-400 uppercase block">Taxa de Eliminação</span>
              <span className="text-lg sm:text-xl font-bold text-amber-300">{eliminationRate}%</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
              <span className="text-[10px] text-emerald-400 uppercase block">Candidatas Válidas</span>
              <span className="text-lg sm:text-xl font-bold text-emerald-400">{viableCount}</span>
            </div>
          </div>

          {/* DEMONSTRAÇÃO VISUAL DO DESLIZAMENTO DO CRIB */}
          <div className="p-4 rounded-xl bg-[#0f1110] border border-[#223027] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-zinc-200 uppercase">
                  3. Teste de Alinhamento (Offset Atual: {safeOffset} de {maxOffset})
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  [{safeOffset + 1}ª posição]
                </span>
              </div>
              <span
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded font-bold self-start sm:self-auto flex items-center gap-1.5 ${
                  currentAnalysis?.hasCrash
                    ? 'bg-red-950 text-red-300 border border-red-800 shadow-[0_0_8px_rgba(239,68,68,0.2)]'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                }`}
              >
                {!currentAnalysis ? <span>Crib maior que a cifra: escolha uma palavra menor.</span> : currentAnalysis.hasCrash ? (
                  <>
                    <XCircle size={13} /> COLISÃO DETECTADA (IMPOSSÍVEL)
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={13} /> HIPÓTESE VÁLIDA PARA A BOMBE
                  </>
                )}
              </span>
            </div>

            {/* Controles de Navegação do Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safeOffset <= 0}
                  onClick={() => handleOffsetChange(safeOffset - 1)}
                  className="p-1.5 rounded-lg bg-[#1c2420] text-emerald-300 border border-[#2e3e34] disabled:opacity-30 disabled:cursor-not-allowed hover:border-emerald-500 transition-colors"
                  title="Offset anterior"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex-1 relative flex items-center">
                  <input
                    type="range"
                    min="0"
                    max={Math.max(1, maxOffset)}
                    disabled={maxOffset === 0}
                    value={safeOffset}
                    onChange={(e) => handleOffsetChange(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                  />
                </div>
                <button
                  type="button"
                  disabled={safeOffset >= maxOffset}
                  onClick={() => handleOffsetChange(safeOffset + 1)}
                  className="p-1.5 rounded-lg bg-[#1c2420] text-emerald-300 border border-[#2e3e34] disabled:opacity-30 disabled:cursor-not-allowed hover:border-emerald-500 transition-colors"
                  title="Próximo offset"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>Início (Offset 0)</span>
                {maxOffset === 0 ? (
                  <span className="text-amber-400 font-bold">
                    Tamanho idêntico à palavra provável (1 posição possível)
                  </span>
                ) : (
                  <span>Fim (Offset {maxOffset})</span>
                )}
              </div>
            </div>

            {/* Linha do Tempo / Minimap de Todos os Offsets */}
            {maxOffset > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>Mapa de Varredura da Bombe (Clique para saltar):</span>
                  <span className="text-zinc-500">
                    <span className="text-emerald-400 font-bold">{viableCount} válidos</span> •{' '}
                    <span className="text-red-400 font-bold">{discardedCount} descartados</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-[#0b0d0c] rounded-lg border border-[#1e2621]">
                  {analysis.map((a) => {
                    const isSelected = a.offset === safeOffset;
                    return (
                      <button
                        key={a.offset}
                        type="button"
                        onClick={() => handleOffsetChange(a.offset)}
                        title={
                          a.hasCrash
                            ? `Offset ${a.offset}: Colisão '${a.collisions[0].char}' na posição ${a.collisions[0].ctIndex + 1}`
                            : `Offset ${a.offset}: Hipótese Válida`
                        }
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                          isSelected
                            ? a.hasCrash
                              ? 'bg-red-500 text-white ring-2 ring-red-400 shadow-[0_0_8px_#ef4444]'
                              : 'bg-emerald-500 text-black ring-2 ring-emerald-300 shadow-[0_0_8px_#10b981]'
                            : a.hasCrash
                            ? 'bg-red-950/60 text-red-400 border border-red-900/50 hover:bg-red-900/50'
                            : 'bg-emerald-950/60 text-emerald-300 border border-emerald-900/50 hover:bg-emerald-900/50'
                        }`}
                      >
                        {a.offset}: {a.hasCrash ? '❌' : '✅'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* GRID DE LETRAS: CIFRA VS CRIB DESLIZADO */}
            <div className="overflow-x-auto py-2">
              <div className="flex flex-col gap-2 font-mono text-xs select-none min-w-[340px]">
                {/* Linha do Ciphertext Interceptado */}
                <div className="flex items-center gap-1.5">
                  <span className="w-16 text-[10px] text-zinc-500 font-bold uppercase shrink-0">Cifra:</span>
                  <div className="flex gap-1">
                    {cleanCt.split('').map((c, idx) => {
                      const isUnderCrib = idx >= safeOffset && idx < safeOffset + cleanCrib.length;
                      const cribChar = isUnderCrib ? cleanCrib[idx - safeOffset] : null;
                      const isCrash = cribChar === c;

                      return (
                        <div
                          key={idx}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center font-bold text-xs sm:text-sm border transition-all ${
                            isCrash
                              ? 'bg-red-600 text-white border-red-400 shadow-[0_0_12px_#ef4444] animate-pulse scale-105 z-10'
                              : isUnderCrib
                              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600 shadow-sm'
                              : 'bg-[#181a18] text-zinc-500 border-[#2b332c]'
                          }`}
                          title={`Posição ${idx + 1}: ${c}`}
                        >
                          {c}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Linha do Crib Deslizado */}
                <div className="flex items-center gap-1.5">
                  <span className="w-16 text-[10px] text-emerald-400 font-bold uppercase shrink-0">Crib:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: cleanCt.length }).map((_, idx) => {
                      const isUnderCrib = idx >= safeOffset && idx < safeOffset + cleanCrib.length;
                      const char = isUnderCrib ? cleanCrib[idx - safeOffset] : '';
                      const isCrash = isUnderCrib && cleanCt[idx] === char;

                      return (
                        <div
                          key={idx}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                            isCrash
                              ? 'bg-red-700 text-white border border-red-400 shadow-[0_0_12px_#ef4444] font-black scale-105 z-10'
                              : isUnderCrib
                              ? 'bg-amber-400 text-black shadow font-black'
                              : 'opacity-0'
                          }`}
                          title={isUnderCrib ? `Crib: ${char}` : ''}
                        >
                          {char}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Painel de Explicação da Posição Atual */}
            {!currentAnalysis ? <span>Crib maior que a cifra: escolha uma palavra menor.</span> : currentAnalysis.hasCrash ? (
              <div className="p-3.5 bg-red-950/30 border border-red-800/60 rounded-xl text-xs font-mono text-red-200 flex items-start gap-2.5">
                <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-300 text-sm">
                      💥 CRASH! CONTRADIÇÃO ELÉTRICA DETECTADA
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/60 text-red-200 border border-red-700 font-bold">
                      {currentAnalysis.collisions.length} {currentAnalysis.collisions.length === 1 ? 'colisão' : 'colisões'}
                    </span>
                  </div>
                  <p className="leading-relaxed">
                    A letra <strong>'{currentAnalysis.collisions[0].char}'</strong> do crib coincide exatamente com o caractere na cifra na posição {currentAnalysis.collisions[0].ctIndex + 1}.
                    {currentAnalysis.collisions.length > 1 && (
                      <span>
                        {' '}(Colisões adicionais:{' '}
                        {currentAnalysis.collisions
                          .slice(1)
                          .map((c) => `'${c.char}' na pos ${c.ctIndex + 1}`)
                          .join(', ')}
                        )
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-red-300/80 leading-relaxed">
                    Pela engenharia do refletor (<em>Umkehrwalze</em>), a corrente que entra por um contato retorna obrigatoriamente por outro contato. Logo, <strong>a Enigma física JAMAIS cifra uma letra nela mesma (E(x) ≠ x)</strong>. Alan Turing usava essa contradição para eliminar este offset instantaneamente!
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/60 rounded-xl text-xs font-mono text-emerald-200 flex items-start gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-300 text-sm">
                      ✅ HIPÓTESE VÁLIDA (OFFSET {safeOffset})
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-bold">
                      Zero Colisões
                    </span>
                  </div>
                  <p className="leading-relaxed">
                    Nenhuma letra do crib colidiu com a cifra neste alinhamento.
                  </p>
                  <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                    A máquina <em>Bombe</em> de Alan Turing em Bletchley Park configurava seus 36 bancos de rotores eletromecânicos sincronizados nesta posição para buscar as conexões do plugboard (<em>Steckerbrett</em>) via fechamento de circuitos lógicos!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* CONTEXTO HISTÓRICO COM FORMATAÇÃO MATEMÁTICA LIMPA */}
          <div className="text-[11px] font-mono text-zinc-300 leading-relaxed bg-[#0d0f0e] p-3.5 rounded-xl border border-[#202924] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                <Sparkles size={14} />
                A Falha de Engenharia que Decidiu a Segunda Guerra
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                Princípio: E(x) ≠ x
              </span>
            </div>
            <p>
              A força bruta em todas as <strong className="text-emerald-300 font-bold">1,58 × 10²⁰ combinações</strong> (158 quintilhões de chaves possíveis) era fisicamente impossível para os recursos da época.
            </p>
            <p className="text-zinc-400">
              Ao deslizar palavras prováveis (<em>cribs</em>) e descartar imediatamente qualquer posição com colisão de letras, <strong>Alan Turing e Gordon Welchman</strong> usaram restrições lógicas para reduzir o trabalho das máquinas <em>Bombe</em>. Um alinhamento sem colisões é apenas um candidato, não uma mensagem decifrada.
            </p>
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex justify-end p-4 bg-[#161c18] border-t border-[#233129] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 font-mono text-xs font-bold text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-lg shadow-md active:scale-95 transition-all"
          >
            Fechar Modo Bletchley
          </button>
        </div>
      </div>
    </div>
  );
};

