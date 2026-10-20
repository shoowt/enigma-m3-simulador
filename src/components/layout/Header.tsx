import type { Station } from '../../types/crypto';
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
    <header className="w-full border-b border-[#252830] bg-[#0e0f12]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Identidade do Projeto */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] border border-amber-400/40">
            <span className="font-mono font-black text-lg text-black">M3</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold font-mono text-zinc-100 tracking-wider">
                ENIGMA M3 SIMULATOR
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                VS AES-256-GCM
              </span>
            </div>
            <p className="text-[11px] font-mono text-zinc-400">
              Estação Ativa:{' '}
              <strong className="text-amber-400">{currentStation.name}</strong>{' '}
              <span className="text-zinc-500">[{currentStation.callsign}]</span>
            </p>
          </div>
        </div>

        {/* Seletor de Estações Virtuais */}
        <div className="hidden lg:block">
          <StationSelector
            currentStationId={currentStation.id}
            onSelectStation={onSelectStation}
          />
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center w-full md:w-auto">
          <button
            onClick={onOpenKeySheet}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-bold text-zinc-300 bg-[#1c1e23] hover:bg-[#252930] border border-[#373b45] transition-colors shadow-sm"
            title="Abrir Folha de Chaves Mensal Militar"
          >
            <KeyRound size={13} className="text-amber-400 shrink-0" />
            <span><span className="hidden sm:inline">Folha de </span>Chaves</span>
          </button>

          <button
            onClick={onOpenTransmitQR}
            disabled={!hasCipherData}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 shadow transition-all active:scale-95"
            title="Gerar QR Code para transmissão Air-Gapped"
          >
            <QrCode size={13} className="shrink-0" />
            <span>Transmitir</span>
          </button>

          <button
            onClick={onOpenScanQR}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-bold text-zinc-200 bg-[#252830] hover:bg-[#2f333e] border border-[#444955] transition-colors shadow-sm"
            title="Escanear transmissão Air-Gapped via câmera ou imagem"
          >
            <Scan size={13} className="text-emerald-400 shrink-0" />
            <span>Receber</span>
          </button>

          <button
            onClick={onOpenCircuitModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-bold text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-700/50 transition-colors shadow-sm"
            title="Visualizar animação do caminho elétrico de 12V pelos rotores e plugboard"
          >
            <Zap size={13} className="text-amber-400 shrink-0 animate-pulse" />
            <span>Circuito 12V</span>
          </button>

          <button
            onClick={onOpenBletchleyModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-bold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-700/50 transition-colors shadow-sm"
            title="Ataque de crib de Alan Turing explorando a falha E(x) != x"
          >
            <Search size={13} className="text-emerald-400 shrink-0" />
            <span>Bletchley</span>
          </button>

          <button
            onClick={onToggleModernLab}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-bold transition-all shadow-sm ${
              showModernLab
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'text-zinc-400 hover:text-zinc-200 bg-[#17181c] border border-[#2d3038]'
            }`}
            title="Alternar modo Raio-X comparativo com criptografia moderna"
          >
            <SplitSquareVertical size={13} className="shrink-0" />
            <span>Raio-X</span>
          </button>
        </div>
      </div>
    </header>
  );
};
