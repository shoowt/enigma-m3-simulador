import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, ShieldCheck, Radio } from 'lucide-react';
import type { EnigmaPayload } from '../../types/crypto';
import { serializePayload } from '../../core/protocolPayload';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: EnigmaPayload | null;
}

export const QRModal: React.FC<QRModalProps> = ({
  isOpen,
  onClose,
  payload
}) => {
  if (!isOpen || !payload) return null;

  const rawJson = serializePayload(payload);
  const fitsQR = new TextEncoder().encode(rawJson).length <= 2000;

  const handleDownloadFile = () => {
    const blob = new Blob([rawJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `msg_${payload.net.src}_to_${payload.net.dst}_${Date.now()}.enigma`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-[#15171b] border-2 border-[#3c404a] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden max-h-[92vh] flex flex-col my-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#1e2026] border-b border-[#30333d] shrink-0">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-amber-400 animate-pulse" />
            <h3 className="font-mono font-bold text-xs sm:text-sm text-zinc-100 uppercase tracking-widest">
              Transmissão Air-Gapped (QR Code)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-[#2a2c34] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-4 sm:p-6 flex flex-col items-center gap-4 sm:gap-5 overflow-y-auto flex-1 min-h-0 overscroll-contain">
          {/* Identificação de Rota */}
          <div className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#0e0f12] border border-[#262830] font-mono text-xs">
            <div>
              <span className="text-zinc-500">De:</span>{' '}
              <strong className="text-amber-400">{payload.net.src}</strong>
            </div>
            <div className="text-zinc-600">➔</div>
            <div>
              <span className="text-zinc-500">Para:</span>{' '}
              <strong className="text-emerald-400">{payload.net.dst}</strong>
            </div>
            <div>
              <span className="text-zinc-500">Chave:</span>{' '}
              <span className="text-zinc-300 font-semibold">{payload.net.keyId}</span>
            </div>
          </div>

          {/* O QR Code com borda e contraste para leitura via smartphone */}
          <div className="p-3 sm:p-4 bg-white rounded-xl shadow-2xl flex items-center justify-center border-4 border-amber-500 max-w-[240px] sm:max-w-none">
            {fitsQR ? <QRCodeSVG
              value={rawJson}
              size={210}
              level="M"
              marginSize={3}
              className="w-full h-auto max-w-[200px] aspect-square"
            /> : <p className="max-w-xs text-sm text-black p-4">Mensagem grande demais para um QR legível. Divida o texto em mensagens menores ou baixe o arquivo .enigma.</p>}
          </div>

          <p className="text-xs text-center font-mono text-zinc-400 max-w-sm">
            Aponte a câmera do dispositivo receptor (celular ou tablet) para escanear a transmissão 100% isolada da rede (air-gapped).
          </p>

          {/* Ciphertext Resumido */}
          <div className="w-full p-3 rounded bg-[#0e0f12] border border-[#24262d] font-mono text-[11px] space-y-1">
            <div className="text-zinc-500 flex justify-between">
              <span>Ciphertext Enigma:</span>
              <span className="text-amber-400 font-bold truncate max-w-[160px] sm:max-w-none">{payload.enigma.ct.slice(0, 24)}...</span>
            </div>
            <div className="text-zinc-500 flex justify-between">
              <span>Payload Moderno:</span>
              <span className="text-emerald-400">AES-256-GCM + IV + Tag</span>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 px-4 sm:px-6 py-3 bg-[#1b1d22] border-t border-[#30333d] shrink-0">
          <button
            type="button"
            onClick={handleDownloadFile}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#242730] hover:bg-[#2e323e] border border-[#3e434f] text-zinc-300 text-xs font-mono font-semibold transition-colors"
          >
            <Download size={14} />
            <span>Baixar Arquivo .enigma</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 px-5 py-2 font-mono text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded shadow transition-all active:scale-95"
          >
            <ShieldCheck size={14} />
            <span>Concluir Transmissão</span>
          </button>
        </div>
      </div>
    </div>
  );
};
