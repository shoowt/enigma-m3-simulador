import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, FileText, Maximize2, Minimize2 } from 'lucide-react';
import { RotorsUnit } from './RotorsUnit';
import { Lampboard } from './Lampboard';
import { Keyboard } from './Keyboard';
import { Plugboard } from './Plugboard';
import type { ReflectorId, RotorId } from '../../types/crypto';
import { soundEffects } from '../../audio/soundEffects';

interface EnigmaCaseProps {
  rotorTypes: [RotorId, RotorId, RotorId];
  positions: [string, string, string];
  ringSettings: [number, number, number];
  reflector: ReflectorId;
  plugboardPairs: string[];
  litChar: string | null;
  pressedKey: string | null;
  outputTape: string;
  onRotateManually: (rotorIndex: 0 | 1 | 2, delta: number) => void;
  onOpenLid: () => void;
  onKeyDown: (char: string) => void;
  onKeyUp: () => void;
  onSpace: () => void;
  onChangePlugPairs: (newPairs: string[]) => void;
  onResetPlugToDaily: () => void;
  onClearTape: () => void;
}

export const EnigmaCase: React.FC<EnigmaCaseProps> = ({
  rotorTypes,
  positions,
  plugboardPairs,
  litChar,
  pressedKey,
  outputTape,
  onRotateManually,
  onOpenLid,
  onKeyDown,
  onKeyUp,
  onSpace,
  onChangePlugPairs,
  onResetPlugToDaily,
  onClearTape
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(soundEffects.isMuted);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isFitScreen, setIsFitScreen] = useState<boolean>(true);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(isFs);
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Dispara redimensionamento para os cabos do Plugboard ao alternar modo
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
    return () => clearTimeout(timer);
  }, [isFitScreen]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        const root = document.documentElement;
        if (root.requestFullscreen) {
          await root.requestFullscreen();
        } else if ((root as any).webkitRequestFullscreen) {
          await (root as any).webkitRequestFullscreen();
        } else {
          setIsFullscreen(prev => !prev);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else {
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.warn('Erro ao alternar tela inteira:', err);
      setIsFullscreen(prev => !prev);
    }
  };

  const toggleMute = () => {
    soundEffects.isMuted = !soundEffects.isMuted;
    setIsMuted(soundEffects.isMuted);
  };

  return (
    <div className={`wood-cabinet p-1 sm:p-2.5 md:p-3 max-w-2xl mx-auto shadow-2xl relative select-none transition-all w-full overflow-hidden ${isFitScreen ? 'enigma-fit-screen' : ''} ${isFullscreen ? 'enigma-fullscreen-active' : ''}`}>
      {/* 4 Parafusos de latão nos cantos da madeira */}
      <div className="absolute top-1 left-1 sm:top-2 sm:left-2 brass-screw"></div>
      <div className="absolute top-1 right-1 sm:top-2 sm:right-2 brass-screw"></div>
      <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 brass-screw"></div>
      <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 brass-screw"></div>

      {/* Chassi de Metal Preto Fosco */}
      <div className="metal-chassis p-1 sm:p-2.5 md:p-3 flex flex-col gap-1 sm:gap-2 w-full overflow-hidden">
        {/* Plaqueta Metálica do Fabricante Militar */}
        <div className="flex items-center justify-between pb-1 sm:pb-1.5 border-b border-[#32363e] gap-1">
          <div className="flex items-center gap-1 min-w-0">
            <div className="metal-plate px-1.5 sm:px-2.5 py-0.5 text-[9px] sm:text-[11px] font-mono tracking-wider sm:tracking-widest text-amber-300 font-bold uppercase shadow truncate">
              ENIGMA M3 • W.1944
            </div>
            <span className="text-[9px] font-mono text-zinc-500 hidden md:inline">
              NO. A-14983/Heer
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Botão Ajustar à Tela (Fita até os Cabos visíveis sem rolagem) */}
            <button
              type="button"
              onClick={() => setIsFitScreen(prev => !prev)}
              className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all border ${
                isFitScreen
                  ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-sm'
                  : 'bg-[#1e2024] text-zinc-400 hover:text-zinc-200 border-[#393d46]'
              }`}
              title={isFitScreen ? 'Modo Ajustado Ativo (fita aos cabos 100% visíveis sem rolagem). Clique para alternar para modo expandido.' : 'Ajustar para toda a máquina (da fita até os cabos) caber na tela sem rolagem'}
            >
              <Minimize2 size={11} className={isFitScreen ? 'text-amber-300' : 'text-zinc-400'} />
              <span className="hidden sm:inline">{isFitScreen ? 'Ajustado à Tela' : 'Ajustar à Tela'}</span>
            </button>

            {/* Botão Tela Cheia do Navegador (F11) */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className={`p-1 rounded transition-colors border ${
                isFullscreen
                  ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-sm'
                  : 'bg-[#1e2024] hover:bg-[#282b31] text-zinc-400 hover:text-zinc-200 border-[#393d46]'
              }`}
              title={isFullscreen ? 'Sair do modo Tela Cheia (Esc)' : 'Expandir para Tela Cheia do Navegador (F11)'}
            >
              <Maximize2 size={11} />
            </button>

            {/* Mudo / Som */}
            <button
              onClick={toggleMute}
              className="p-1 rounded bg-[#1e2024] hover:bg-[#282b31] border border-[#393d46] text-zinc-400 hover:text-zinc-200 transition-colors"
              title={isMuted ? 'Ativar Efeitos Sonoros Mecânicos' : 'Silenciar'}
            >
              {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
            </button>
          </div>
        </div>

        {/* Fita de Papel Militar Datilografada (Output Stream) */}
        <div className="flex flex-col bg-[#111215] border border-[#2b2e35] rounded-lg p-1.5 sm:p-2 shadow-inner">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono font-bold tracking-wider text-amber-500/90 uppercase">
              <FileText size={11} />
              <span>Fita Telegráfica (Grupos de 5)</span>
            </div>
            {outputTape.length > 0 && (
              <button
                onClick={onClearTape}
                className="text-[9px] sm:text-[10px] font-mono text-zinc-400 hover:text-red-400 underline transition-colors"
              >
                Limpar Fita
              </button>
            )}
          </div>

          <div className="fita-output-box bg-[#181a1f] border border-[#22252a] rounded px-2.5 py-1 min-h-[28px] sm:min-h-[32px] flex items-center overflow-x-auto font-mono text-xs sm:text-sm tracking-widest text-amber-300 font-bold select-text">
            {outputTape.length === 0 ? (
              <span className="text-zinc-600 font-normal text-xs tracking-normal">
                Pressione as teclas abaixo ou digite no teclado para cifrar...
              </span>
            ) : (
              outputTape
            )}
          </div>
        </div>

        {/* Unidade Mecânica de Rotores */}
        <RotorsUnit
          rotorTypes={rotorTypes}
          positions={positions}
          onRotateManually={onRotateManually}
          onOpenLid={onOpenLid}
        />

        {/* Painel de Lâmpadas (Lampboard) */}
        <Lampboard litChar={litChar} />

        {/* Teclado (Keyboard) */}
        <Keyboard
          pressedKey={pressedKey}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onSpace={onSpace}
        />

        {/* Painel Frontal de Cabos (Plugboard / Steckerbrett) */}
        <Plugboard
          pairs={plugboardPairs}
          onChangePairs={onChangePlugPairs}
          onResetToDaily={onResetPlugToDaily}
        />
      </div>
    </div>
  );
};
