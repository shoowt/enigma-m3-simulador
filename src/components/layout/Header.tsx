import type { Station } from '../../types/crypto';
import { STATIONS } from '../../core/keySheet';
import { StationSelector } from './StationSelector';
import { KeyRound, QrCode, Scan, SplitSquareVertical, Zap, Search } from 'lucide-react';

interface HeaderProps {
  currentStation: Station;
  onSelectStation: (st: Station) => void;
  onOpenKeySheet: () => void;
  onOpenTransmitQR: () => void;
  onOpenScanQR: () => void;
  onOpenCircuitModal: () => void;
  onOpenBletchleyModal: () => void;
  showModernLab: boolean;
  onToggleModernLab: () => void;
  hasCipherData: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentStation,
  onSelectStation,
  onOpenKeySheet,
  onOpenTransmitQR,
  onOpenScanQR,
  onOpenCircuitModal,
  onOpenBletchleyModal,
  showModernLab,
  onToggleModernLab,
  hasCipherData
}) => {
  return (
    <header className="w-full border-b border-[#202228] bg-[#0c0d10]/95 backdrop-blur-md sticky top-0 z-40 px-2 sm:px-4 py-1">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1 sm:gap-2">
        {/* Identidade do Projeto & Seletor Mobile */}
        <div className="flex items-center justify-between gap-2 shrink-0">
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-semibold font-mono text-zinc-100 tracking-wider whitespace-nowrap">
                ENIGMA M3 SIMULATOR
              </h1>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium whitespace-nowrap">
                VS AES-256
              </span>
            </div>
            <p className="text-[10px] font-mono text-zinc-400 whitespace-nowrap">
              Estação:{' '}
              <strong className="text-amber-400 font-medium">{currentStation.name}</strong>{' '}
              <span className="text-zinc-500">[{currentStation.callsign}]</span>
            </p>
          </div>

          {/* Seletor Mobile de Estação */}
          <div className="block lg:hidden shrink-0">
            <select
              value={currentStation.id}
              onChange={(e) => {
                const found = STATIONS.find(s => s.id === e.target.value);
                if (found) onSelectStation(found);
              }}
              className="bg-[#181a1f] border border-[#2e323b] text-amber-300 text-[10px] font-mono rounded px-1.5 py-0.5 focus:outline-none focus:border-amber-500"
              aria-label="Selecionar Estação Virtual"
            >
              {STATIONS.map(st => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Seletor de Estações Virtuais */}
        <div className="hidden lg:block shrink-0">
          <StationSelector
            currentStationId={currentStation.id}
            onSelectStation={onSelectStation}
          />
        </div>

        {/* Botões de Ação Rápida (Linha Única Fina, Sem Quebras) */}
        <div className="flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto overflow-x-auto sm:overflow-visible no-scrollbar pb-0.5 sm:pb-0 flex-nowrap shrink-0 pr-3 sm:pr-0">
          <button
            onClick={onOpenKeySheet}
            className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10.5px] sm:text-[11px] font-mono font-medium text-zinc-300 bg-[#16181d] hover:bg-[#20232a] border border-[#2b2e37] transition-colors shadow-xs whitespace-nowrap shrink-0"
            title="Abrir Folha de Chaves Mensal Militar"
          >
            <KeyRound size={12} className="text-amber-400 shrink-0" />
            <span><span className="hidden xl:inline">Folha de </span>Chaves</span>
          </button>

          <button
            onClick={onOpenTransmitQR}
            disabled={!hasCipherData}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[10.5px] sm:text-[11px] font-mono font-semibold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 shadow-xs transition-all active:scale-95 whitespace-nowrap shrink-0"
            title="Gerar QR Code para transmissão Air-Gapped"
          >
            <QrCode size={12} className="shrink-0" />
            <span>Transmitir</span>
          </button>

          <button
            onClick={onOpenScanQR}
            className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10.5px] sm:text-[11px] font-mono font-medium text-zinc-200 bg-[#20232a] hover:bg-[#282d36] border border-[#343844] transition-colors shadow-xs whitespace-nowrap shrink-0"
            title="Escanear transmissão Air-Gapped via câmera ou imagem"
          >
            <Scan size={12} className="text-emerald-400 shrink-0" />
            <span>Receber</span>
          </button>

          <button
            onClick={onOpenCircuitModal}
            className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10.5px] sm:text-[11px] font-mono font-medium text-amber-300 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-700/40 transition-colors shadow-xs whitespace-nowrap shrink-0"
            title="Visualizar animação do caminho elétrico de 12V pelos rotores e plugboard"
          >
            <Zap size={12} className="text-amber-400 shrink-0 animate-pulse" />
            <span><span className="hidden xl:inline">Circuito </span>12V</span>
          </button>

          <button
            onClick={onOpenBletchleyModal}
            className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10.5px] sm:text-[11px] font-mono font-medium text-emerald-300 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-700/40 transition-colors shadow-xs whitespace-nowrap shrink-0"
            title="Ataque de crib de Alan Turing explorando a falha E(x) != x"
          >
            <Search size={12} className="text-emerald-400 shrink-0" />
            <span>Bletchley</span>
          </button>

          <button
            onClick={onToggleModernLab}
            className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10.5px] sm:text-[11px] font-mono font-medium transition-all shadow-xs whitespace-nowrap shrink-0 ${
              showModernLab
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200 bg-[#141519] border border-[#262831]'
            }`}
            title="Alternar modo Raio-X comparativo com criptografia moderna"
          >
            <SplitSquareVertical size={12} className="shrink-0" />
            <span>Raio-X</span>
          </button>
        </div>
      </div>
    </header>
  );
};
