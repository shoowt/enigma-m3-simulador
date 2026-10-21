import React, { useState, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { X, Download, ShieldCheck, Radio, Copy, Check, Image as ImageIcon } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

  const handleDownloadPNG = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr_${payload.net.src}_to_${payload.net.dst}_${Date.now()}.png`;
    a.click();
  };

  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(rawJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback para navegadores sem permissão de clipboard
      const ta = document.createElement('textarea');
      ta.value = rawJson;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
        <div className="p-4 sm:p-6 flex flex-col items-center gap-3.5 sm:gap-4 overflow-y-auto flex-1 min-h-0 overscroll-contain">
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

          {/* O QR Code com borda e contraste para leitura rápida via smartphone */}
          <div className="relative p-3.5 sm:p-4 bg-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.7)] flex items-center justify-center border-4 border-amber-500/90 w-full max-w-[270px] sm:max-w-[320px] aspect-square">
            {fitsQR ? (
              <>
                <QRCodeSVG
                  value={rawJson}
                  size={300}
                  level="L"
                  boostLevel={false}
                  marginSize={4}
                  className="w-full h-full aspect-square"
                  style={{ shapeRendering: 'crispEdges' }}
                />
                {/* Canvas oculto para download em alta resolução (600x600 HD) */}
                <div className="hidden">
                  <QRCodeCanvas
                    ref={canvasRef}
                    value={rawJson}
                    size={600}
                    level="L"
                    boostLevel={false}
                    marginSize={4}
                  />
                </div>
              </>
            ) : (
              <p className="max-w-xs text-sm text-black p-4 text-center">
                Mensagem grande demais para um QR legível. Divida o texto em mensagens menores ou baixe o arquivo .enigma.
              </p>
            )}
          </div>

          <p className="text-xs text-center font-mono text-zinc-400 max-w-sm">
            Aponte a câmera do dispositivo receptor (celular ou tablet). O código foi calibrado com módulos ampliados e alto contraste para captura imediata.
          </p>

          {/* Ações Rápidas: Copiar JSON & Baixar PNG */}
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              type="button"
              onClick={handleCopyJSON}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                copied
                  ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                  : 'bg-[#181a20] hover:bg-[#22252e] border-[#2f333e] text-zinc-300'
              }`}
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} className="text-zinc-400" />}
              <span>{copied ? 'Payload Copiado!' : 'Copiar JSON'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPNG}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-[#181a20] hover:bg-[#22252e] border border-[#2f333e] text-zinc-300 transition-colors"
            >
              <ImageIcon size={13} className="text-amber-400" />
              <span>Baixar Foto (PNG)</span>
            </button>
          </div>

          {/* Ciphertext Resumido */}
          <div className="w-full p-2.5 rounded bg-[#0e0f12] border border-[#24262d] font-mono text-[11px] space-y-1">
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
