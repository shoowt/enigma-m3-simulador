import React, { useState, useRef, useEffect } from 'react';
import { Unplug, RotateCcw } from 'lucide-react';
import { soundEffects } from '../../audio/soundEffects';

interface PlugboardProps {
  pairs: string[];
  onChangePairs: (newPairs: string[]) => void;
  onResetToDaily: () => void;
}

const PLUGBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'],
  ['P', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'L']
];

const CABLE_COLORS = [
  '#dc2626', // Vermelho militar
  '#2563eb', // Azul marinho
  '#16a34a', // Verde oliva
  '#d97706', // Âmbar
  '#9333ea', // Roxo
  '#0891b2', // Ciano
  '#ea580c', // Laranja
  '#475569', // Grafite
  '#ca8a04', // Bronze
  '#be123c'  // Carmim
];

export const Plugboard: React.FC<PlugboardProps> = ({
  pairs,
  onChangePairs,
  onResetToDaily
}) => {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [socketPositions, setSocketPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Recalcula posições dos soquetes para renderização precisa do SVG de cabos
  const updateSocketPositions = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newPositions: Record<string, { x: number; y: number }> = {};

    PLUGBOARD_ROWS.flat().forEach(char => {
      const el = document.getElementById(`plug-socket-${char}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        newPositions[char] = {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2
        };
      }
    });

    setSocketPositions(newPositions);
  };

  useEffect(() => {
    updateSocketPositions();
    window.addEventListener('resize', updateSocketPositions);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => {
        updateSocketPositions();
      });
      ro.observe(containerRef.current);
    }
    return () => {
      window.removeEventListener('resize', updateSocketPositions);
      if (ro) ro.disconnect();
    };
  }, [pairs]);

  // Encontra se a letra já possui conexão
  const getConnectedPair = (char: string): string | null => {
    return pairs.find(p => p.includes(char)) || null;
  };

  const handleSocketClick = (char: string) => {
    const existing = getConnectedPair(char);

    // Se já estiver conectada, desconecta o cabo
    if (existing) {
      soundEffects.playPlugRemove();
      onChangePairs(pairs.filter(p => p !== existing));
      setSelectedLetter(null);
      return;
    }

    // Se não há seleção prévia, seleciona o primeiro pino
    if (!selectedLetter) {
      soundEffects.playPlugInsert();
      setSelectedLetter(char);
      return;
    }

    // Se clicou na mesma letra selecionada, cancela
    if (selectedLetter === char) {
      setSelectedLetter(null);
      return;
    }

    // Conecta as duas letras se não atingiu o limite de 10 pares
    if (pairs.length >= 10) {
      alert('Limite militar de 10 pares de cabos atingido!');
      setSelectedLetter(null);
      return;
    }

    soundEffects.playPlugInsert();
    const newPair = `${selectedLetter}${char}`;
    onChangePairs([...pairs, newPair]);
    setSelectedLetter(null);
  };

  const handleClearAll = () => {
    soundEffects.playPlugRemove();
    onChangePairs([]);
    setSelectedLetter(null);
  };

  return (
    <div className="flex flex-col p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-[#121316] border border-[#2b2e35] shadow-[inset_0_4px_16px_rgba(0,0,0,0.95)] relative w-full overflow-hidden">
      {/* Cabeçalho do Plugboard */}
      <div className="flex items-center justify-between gap-1 mb-1 sm:mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-amber-500 uppercase font-bold">
            STECKERBRETT (CABOS)
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#1e2025] text-zinc-400 font-mono">
            {pairs.length}/10
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onResetToDaily}
            className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono text-zinc-400 hover:text-amber-400 px-1.5 py-0.5 bg-[#1a1c20] hover:bg-[#252830] border border-[#373a42] rounded transition-colors"
            title="Restaurar conexões da Folha de Chaves do Dia"
          >
            <RotateCcw size={10} />
            <span className="hidden sm:inline">Chave do Dia</span>
          </button>
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono text-zinc-400 hover:text-red-400 px-1.5 py-0.5 bg-[#1a1c20] hover:bg-[#252830] border border-[#373a42] rounded transition-colors"
            title="Remover todos os cabos"
          >
            <Unplug size={10} />
            <span className="hidden sm:inline">Desconectar</span>
          </button>
        </div>
      </div>

      {selectedLetter && (
        <div className="text-[10px] sm:text-xs font-mono text-amber-400 bg-amber-950/40 border border-amber-800/60 rounded px-2 py-0.5 mb-1 text-center animate-pulse">
          Pino 1 conectado em <strong>[{selectedLetter}]</strong>. Clique na segunda letra para fechar o circuito.
        </div>
      )}

      {/* Grid de Soquetes com SVG dos Cabos sobreposto */}
      <div ref={containerRef} className="relative py-1">
        {/* Camada SVG para renderizar as curvas dos cabos */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
          {pairs.map((pair, pIdx) => {
            const charA = pair[0];
            const charB = pair[1];
            const posA = socketPositions[charA];
            const posB = socketPositions[charB];
            if (!posA || !posB) return null;

            const dx = posB.x - posA.x;
            const dy = posB.y - posA.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            // Curvatura gravitacional natural
            const sag = Math.max(dist * 0.35, 24);

            const path = `M ${posA.x} ${posA.y} C ${posA.x} ${posA.y + sag}, ${posB.x} ${posB.y + sag}, ${posB.x} ${posB.y}`;
            const color = CABLE_COLORS[pIdx % CABLE_COLORS.length];

            return (
              <g key={pair}>
                {/* Sombra de oclusão do cabo */}
                <path d={path} fill="none" stroke="black" strokeWidth="8" opacity="0.45" />
                {/* Jaqueta emborrachada do cabo */}
                <path d={path} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
                {/* Linha reflexiva */}
                <path d={path} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeDasharray="3,2" />
                {/* Buchas metálicas */}
                <circle cx={posA.x} cy={posA.y} r="4.5" fill="#52525b" stroke="#18181b" strokeWidth="1.5" />
                <circle cx={posB.x} cy={posB.y} r="4.5" fill="#52525b" stroke="#18181b" strokeWidth="1.5" />
              </g>
            );
          })}
        </svg>

        {/* Soquetes das 26 letras */}
        <div className="flex flex-col gap-1 sm:gap-1.5 relative z-0">
          {PLUGBOARD_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-1 sm:gap-2 w-full">
              {row.map(char => {
                const connectedPair = getConnectedPair(char);
                const isSelected = selectedLetter === char;
                const isConnected = !!connectedPair;


                return (
                  <button
                    key={char}
                    id={`plug-socket-${char}`}
                    type="button"
                    onClick={() => handleSocketClick(char)}
                    className={`plug-socket transition-transform active:scale-95 group ${
                      isSelected
                        ? 'ring-2 ring-amber-400 bg-amber-950/60'
                        : isConnected
                        ? 'border-amber-600/70'
                        : 'hover:border-zinc-500'
                    }`}
                    title={
                      isConnected
                        ? `Conectado com ${connectedPair?.replace(char, '')} (Clique para desconectar)`
                        : `Soquete ${char} (Clique para conectar)`
                    }
                  >
                    {/* Letra identificadora gravada */}
                    <span className="text-[10px] font-mono font-bold text-zinc-400 group-hover:text-zinc-200">
                      {char}
                    </span>

                    {/* Orifícios dos dois pinos do plug militar */}
                    <div className="absolute inset-0 flex flex-col justify-between items-center py-1 pointer-events-none opacity-40">
                      <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
