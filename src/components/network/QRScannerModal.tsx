import React, { useState, useEffect, useRef, useEffectEvent } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Upload, ClipboardCheck, AlertCircle, Smartphone, RefreshCw, CheckCircle2 } from 'lucide-react';
import type { EnigmaPayload } from '../../types/crypto';
import { deserializePayload } from '../../core/protocolPayload';
import { soundEffects } from '../../audio/soundEffects';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (payload: EnigmaPayload) => void | Promise<void>;
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
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const isStartingRef = useRef(false);
  const receivingRef = useRef(false);
  const generationRef = useRef(0);
  const scannerContainerId = 'qr-reader-container';

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Aviso ao encerrar scanner:', err);
      }
      setIsScanning(false);
    }
  };

  const startCameraScanner = async () => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    const generation = generationRef.current;
    setErrorMessage(null);

    try {
      const container = document.getElementById(scannerContainerId);
      if (!container) {
        isStartingRef.current = false;
        return;
      }

      await stopCameraScanner();

      html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);

      // Tenta primeiro a câmera traseira (environment)
      try {
        await html5QrCodeRef.current.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            // Omitir qrbox no mobile escaneia o frame inteiro e evita erros de dimensão do container
          },
          (decodedText) => {
            handlePayloadReceived(decodedText);
          },
          () => {
            // Frame sem QR code
          }
        );
        if (generation !== generationRef.current) { await stopCameraScanner(); return; }
        setIsScanning(true);
        setErrorMessage(null);
      } catch (errEnv) {
        console.warn("Tentando fallback de câmera geral após erro no 'environment':", errEnv);
        if (generation !== generationRef.current) return;
        // Fallback: tenta qualquer câmera disponível (user ou padrão do dispositivo)
        await html5QrCodeRef.current.start(
          { facingMode: 'user' },
          { fps: 10 },
          (decodedText) => {
            handlePayloadReceived(decodedText);
          },
          () => {}
        );
        if (generation !== generationRef.current) { await stopCameraScanner(); return; }
        setIsScanning(true);
        setErrorMessage(null);
      }
    } catch (err: unknown) {
      console.warn('Câmera indisponível no navegador:', err);
      setIsScanning(false);
      const e = err as Error;
      if (e?.name === 'NotAllowedError' || e?.message?.toLowerCase().includes('permission')) {
        setErrorMessage(
          'Permissão da câmera bloqueada. Toque no ícone de cadeado na barra de endereços e ative a Câmera, ou use o botão verde "Tirar Foto do QR".'
        );
      } else if (e?.name === 'NotReadableError' || e?.message?.toLowerCase().includes('busy')) {
        setErrorMessage('A câmera está sendo usada por outro app. Feche outros aplicativos e tente novamente.');
      } else {
        setErrorMessage(
          `Não foi possível iniciar o vídeo ao vivo (${e?.message || 'Erro desconhecido'}). Use o botão verde "Tirar Foto do QR" para acionar a câmera nativa do seu celular!`
        );
      }
    } finally {
      isStartingRef.current = false;
    }
  };

  const handlePayloadReceived = async (rawText: string) => {
    if (receivingRef.current) return;
    receivingRef.current = true;
    try {
      const payload = deserializePayload(rawText);
      await onScanSuccess(payload);
      soundEffects.playRadioTransmit();
      await stopCameraScanner();
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally { receivingRef.current = false; }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setErrorMessage(null);

    try {
      const scanner = new Html5Qrcode('qr-temp-file-reader');
      try {
        // Tentativa 1: com pré-processamento de imagem
        const decoded = await scanner.scanFile(file, true);
        await handlePayloadReceived(decoded);
      } catch {
        // Tentativa 2: sem pré-processamento (imagem original em alta definição)
        const decoded = await scanner.scanFile(file, false);
        await handlePayloadReceived(decoded);
      }
    } catch {
      setErrorMessage('Nenhum código QR nítido detectado na foto. Aproxime a câmera e certifique-se de que a tela do computador esteja bem iluminada.');
    } finally {
      setIsProcessingFile(false);
      // Limpa input para permitir selecionar a mesma foto novamente se necessário
      e.target.value = '';
    }
  };

  const handleManualPaste = () => {
    if (!manualJson.trim()) return;
    handlePayloadReceived(manualJson);
  };

  const startFromEffect = useEffectEvent(() => { void startCameraScanner(); });
  const stopFromEffect = useEffectEvent(() => { void stopCameraScanner(); });
  useEffect(() => {
    if (!isOpen || activeTab !== 'camera') { stopFromEffect(); return; }
    const timer = setTimeout(() => startFromEffect(), 250);
    return () => { clearTimeout(timer); generationRef.current += 1; stopFromEffect(); };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#15171b] border-2 border-[#3c404a] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* Container invisível mas com layout no DOM para decodificação de imagem/foto */}
        <div
          id="qr-temp-file-reader"
          style={{ position: 'absolute', width: '10px', height: '10px', opacity: 0.01, pointerEvents: 'none' }}
        ></div>

        {/* Input nativo que aciona a câmera do celular diretamente pelo sistema operacional */}
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
            Câmera
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-2.5 text-xs font-mono font-bold border-b-2 transition-colors ${
              activeTab === 'file'
                ? 'border-amber-500 text-amber-400 bg-[#1c1e24]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Galeria / Imagem
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
              </div>
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="flex flex-col items-center gap-3">
              {/* Botão Câmera Nativa (100% Compatível com iOS e Android) */}
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                disabled={isProcessingFile}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {isProcessingFile ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Processando foto do QR Code...</span>
                  </>
                ) : (
                  <>
                    <Smartphone size={16} />
                    <span>📸 Tirar Foto do QR Code (Câmera do Celular)</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 w-full my-1">
                <div className="h-px bg-[#2b2e35] flex-1"></div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                  {isScanning ? 'Scanner ao vivo conectado' : 'ou tente vídeo ao vivo'}
                </span>
                <div className="h-px bg-[#2b2e35] flex-1"></div>
              </div>

              {/* Viewport de Vídeo em Tempo Real */}
              <div className="w-full max-w-xs h-60 bg-black rounded-xl border-2 border-amber-500/50 overflow-hidden flex flex-col items-center justify-center relative shadow-inner">
                <div id={scannerContainerId} className="w-full h-full"></div>
                {!isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/80 gap-2">
                    <span className="text-zinc-400 text-xs font-mono text-center">
                      Vídeo ao vivo pausado ou aguardando permissão.
                    </span>
                    <button
                      type="button"
                      onClick={startCameraScanner}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                    >
                      <RefreshCw size={13} />
                      <span>Ativar Câmera Ao Vivo</span>
                    </button>
                  </div>
                )}
              </div>

              {isScanning && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                  <CheckCircle2 size={13} />
                  <span>Câmera ativa! Aponte para o QR Code na tela.</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'file' && (
            <div className="flex flex-col items-center gap-4 py-2">
              <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-[#444955] hover:border-amber-500 rounded-xl cursor-pointer bg-[#101114] transition-colors p-4">
                <Upload size={32} className="text-amber-400 mb-2" />
                <span className="text-xs font-mono text-zinc-200 font-bold">
                  {isProcessingFile ? 'Decodificando...' : 'Selecionar Foto ou Print da Tela com QR'}
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
