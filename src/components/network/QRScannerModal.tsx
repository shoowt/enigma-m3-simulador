import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Upload, ClipboardCheck, AlertCircle, Smartphone } from 'lucide-react';
import type { EnigmaPayload } from '../../types/crypto';
import { deserializePayload } from '../../core/protocolPayload';
import { soundEffects } from '../../audio/soundEffects';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (payload: EnigmaPayload) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'file' | 'paste'>('camera');
  const [manualJson, setManualJson] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const scannerContainerId = 'qr-reader-container';

  const isSecureContext = typeof window !== 'undefined' && (
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );

  useEffect(() => {
    if (!isOpen) {
      stopCameraScanner();
      return;
    }

    if (activeTab === 'camera') {
      startCameraScanner();
    } else {
      stopCameraScanner();
    }

    return () => {
      stopCameraScanner();
    };
  }, [isOpen, activeTab]);

  const startCameraScanner = async () => {
    setErrorMessage(null);

    // Se estiver em HTTP inseguro em rede externa, navegadores bloqueiam getUserMedia
    if (!isSecureContext && !navigator.mediaDevices?.getUserMedia) {
      setErrorMessage(
        'Navegadores de smartphone exigem conexão HTTPS para abrir a câmera em tempo real. Use o botão "Tirar Foto com a Câmera" abaixo ou acesse pelo link HTTPS!'
      );
      setIsScanning(false);
      return;
    }

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      // Tenta listar câmeras disponíveis para escolher a traseira
      let cameraConfig: string | { facingMode: string } = { facingMode: 'environment' };
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          const back = devices.find(d => 
            d.label.toLowerCase().includes('back') || 
            d.label.toLowerCase().includes('traseira') ||
            d.label.toLowerCase().includes('environment')
          );
          cameraConfig = back ? back.id : devices[devices.length - 1].id;
        }
      } catch {
        // Fallback para facingMode padrão
      }

      await html5QrCodeRef.current.start(
        cameraConfig,
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const min = Math.min(viewfinderWidth, viewfinderHeight);
            const edge = Math.floor(min * 0.75);
            return { width: edge, height: edge };
          }
        },
        (decodedText) => {
          handlePayloadReceived(decodedText);
        },
        () => {
          // Frame sem detecção
        }
      );
      setIsScanning(true);
    } catch (err: unknown) {
      console.warn('Erro ao inicializar câmera de vídeo:', err);
      setIsScanning(false);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(
        `Acesso à câmera bloqueado (${msg}). Clique no botão "Tirar Foto do QR" abaixo para usar a câmera nativa do celular!`
      );
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Erro ao encerrar câmera:', err);
      }
      setIsScanning(false);
    }
  };

  const handlePayloadReceived = (rawText: string) => {
    try {
      const payload = deserializePayload(rawText);
      soundEffects.playRadioTransmit();
      stopCameraScanner();
      onScanSuccess(payload);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Payload inválido: ${msg}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMessage(null);
      const scanner = new Html5Qrcode('qr-temp-file-reader');
      const decoded = await scanner.scanFile(file, true);
      handlePayloadReceived(decoded);
    } catch {
      setErrorMessage('Nenhum código QR detectado na foto. Tente apontar mais perto e com boa iluminação.');
    }
  };

  const handleManualPaste = () => {
    if (!manualJson.trim()) return;
    handlePayloadReceived(manualJson);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#15171b] border-2 border-[#3c404a] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* Container invisível para decodificação de imagem/foto */}
        <div id="qr-temp-file-reader" className="hidden"></div>

        {/* Input nativo que aciona a câmera do celular diretamente */}
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1e2026] border-b border-[#30333d]">
          <div className="flex items-center gap-2">
            <Camera size={16} className="text-amber-400" />
            <h3 className="font-mono font-bold text-sm text-zinc-100 uppercase tracking-widest">
              Receptor Air-Gapped (Leitor de Transmissão)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-[#2a2c34] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-[#2b2e36] bg-[#121316]">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2.5 text-xs font-mono font-bold border-b-2 transition-colors ${
              activeTab === 'camera'
                ? 'border-amber-500 text-amber-400 bg-[#1c1e24]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Câmera Ao Vivo
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-2.5 text-xs font-mono font-bold border-b-2 transition-colors ${
              activeTab === 'file'
                ? 'border-amber-500 text-amber-400 bg-[#1c1e24]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Carregar Foto / Imagem
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-2.5 text-xs font-mono font-bold border-b-2 transition-colors ${
              activeTab === 'paste'
                ? 'border-amber-500 text-amber-400 bg-[#1c1e24]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Colar JSON
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-lg text-xs font-mono text-amber-200 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 text-amber-400 mt-0.5" />
              <div className="space-y-1">
                <p>{errorMessage}</p>
                {!isSecureContext && (
                  <p className="text-[11px] text-zinc-400">
                    💡 Para usar o vídeo ao vivo sem restrições do celular, acesse pelo link HTTPS seguro gerado: <strong>https://f465622a184a16.lhr.life</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="flex flex-col items-center gap-3">
              {/* Botão de Câmera Nativa do Celular (100% Infalível em Qualquer Smartphone) */}
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Smartphone size={16} />
                <span>📸 Tirar Foto do QR Code (Câmera Nativa)</span>
              </button>

              <div className="flex items-center gap-2 w-full my-1">
                <div className="h-px bg-[#2b2e35] flex-1"></div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">ou leitor em tempo real</span>
                <div className="h-px bg-[#2b2e35] flex-1"></div>
              </div>

              {/* Viewport da Câmera em Tempo Real */}
              <div
                id={scannerContainerId}
                className="w-full max-w-xs h-60 bg-black rounded-xl border-2 border-amber-500/50 overflow-hidden flex items-center justify-center relative shadow-inner"
              >
                {!isScanning && (
                  <span className="text-zinc-500 text-xs font-mono text-center px-4">
                    Aguardando permissão de câmera...
                  </span>
                )}
              </div>

              <p className="text-[11px] text-zinc-400 font-mono text-center">
                Aponte para o QR Code na tela do computador para decifrar.
              </p>
            </div>
          )}

          {activeTab === 'file' && (
            <div className="flex flex-col items-center gap-4 py-2">
              <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-[#444955] hover:border-amber-500 rounded-xl cursor-pointer bg-[#101114] transition-colors p-4">
                <Upload size={32} className="text-amber-400 mb-2" />
                <span className="text-xs font-mono text-zinc-200 font-bold">
                  Selecionar Foto / Captura de Tela do QR
                </span>
                <span className="text-[11px] font-mono text-zinc-500 mt-1">PNG, JPG, WEBP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-3">
              <textarea
                value={manualJson}
                onChange={(e) => setManualJson(e.target.value)}
                placeholder='Cole aqui o payload JSON recebido...'
                rows={6}
                className="w-full bg-[#0d0e11] border border-[#343740] rounded-lg p-3 font-mono text-xs text-amber-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500 resize-none"
              />
              <button
                type="button"
                onClick={handleManualPaste}
                disabled={!manualJson.trim()}
                className="w-full py-2.5 px-4 font-mono text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 rounded-lg shadow transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <ClipboardCheck size={14} />
                <span>Carregar e Decifrar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
