import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { EnigmaM3 } from './core/enigmaEngine';
import { ModernCryptoEngine } from './core/modernCrypto';
import { getDailyKey, STATIONS } from './core/keySheet';
import type { EnigmaPayload, ModernEncryptedBundle, ReflectorId, RotorId, Station, DailyKey } from './types/crypto';
import { Header } from './components/layout/Header';
import { EnigmaCase } from './components/skeuomorphic/EnigmaCase';
import { TopLidModal } from './components/skeuomorphic/TopLidModal';
import { KeySheetModal } from './components/network/KeySheetModal';
import { QRModal } from './components/network/QRModal';
import { QRScannerModal } from './components/network/QRScannerModal';
import { CircuitTracerModal } from './components/modals/CircuitTracerModal';
import { BletchleyParkModal } from './components/modals/BletchleyParkModal';
import { ReceivedMessageModal } from './components/network/ReceivedMessageModal';
import { CryptoInspector } from './components/modern/CryptoInspector';
import { payloadAAD, bundleFromPayload } from './core/protocolPayload';
import { soundEffects } from './audio/soundEffects';
import { Play, RotateCcw, Send, FileSpreadsheet, Sparkles, KeyRound } from 'lucide-react';

export default function App() {
  // Configuração inicial do Dia D (Dia 6)
  const defaultDay = 6;
  const initialKey = getDailyKey(defaultDay);

  const [activeStation, setActiveStation] = useState<Station>(STATIONS[0]);
  const [destination, setDestination] = useState(STATIONS[1].id);
  const [sharedSecret, setSharedSecret] = useState('');
  const [messageTimestamp, setMessageTimestamp] = useState(() => Date.now());
  const [networkError, setNetworkError] = useState('');
  const [receivedMode, setReceivedMode] = useState(false);
  const [encryptedFor, setEncryptedFor] = useState('');
  const [encryptedSecret, setEncryptedSecret] = useState('');
  const [cryptoBusy, setCryptoBusy] = useState(false);
  const [currentDay, setCurrentDay] = useState<number>(defaultDay);

  // Estados dos Componentes Mecânicos
  const [rotorTypes, setRotorTypes] = useState<[RotorId, RotorId, RotorId]>(initialKey.rotors);
  const [positions, setPositions] = useState<[string, string, string]>(['K', 'A', 'R']);
  const [ringSettings, setRingSettings] = useState<[number, number, number]>(initialKey.rings);
  const [reflector, setReflector] = useState<ReflectorId>(initialKey.reflector);
  const [plugboardPairs, setPlugboardPairs] = useState<string[]>(initialKey.plugs);

  // Posição inicial de início da transmissão atual (crucial para decifração recíproca)
  const [sessionStartPositions, setSessionStartPositions] = useState<[string, string, string]>(['K', 'A', 'R']);
  const sessionStartPositionsRef = useRef<[string, string, string]>(['K', 'A', 'R']);
  const currentPositionsRef = useRef<[string, string, string]>(['K', 'A', 'R']);

  const hasStartedTapeRef = useRef<boolean>(false);


  // Instância do Motor Enigma
  const enigmaRef = useRef<EnigmaM3 | null>(null);

  // Inicializa a máquina Enigma
  const getOrInitEnigma = useCallback(() => {
    if (!enigmaRef.current) {
      enigmaRef.current = new EnigmaM3({
        rotorTypes,
        ringSettings,
        groundSettings: positions,
        reflector,
        plugboardPairs
      });
    }
    return enigmaRef.current;
  }, [rotorTypes, ringSettings, positions, reflector, plugboardPairs]);

  // Atualiza configurações na instância
  useEffect(() => {
    if (enigmaRef.current) {
      enigmaRef.current.updateSettings({
        rotorTypes,
        ringSettings,
        groundSettings: positions,
        reflector,
        plugboardPairs
      });
    }
  }, [rotorTypes, ringSettings, positions, reflector, plugboardPairs]);

  // Estados Interativos de Teclas e Lâmpadas
  const [litChar, setLitChar] = useState<string | null>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [plainText, setPlainText] = useState<string>('');
  const [cipherTape, setCipherTape] = useState<string>('');
  const [batchInput, setBatchInput] = useState<string>('');

  // Estados do AES-256-GCM e Adulteração MITM
  const [modernBundle, setModernBundle] = useState<ModernEncryptedBundle | null>(null);
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [modernDecrypted, setModernDecrypted] = useState<{ success: boolean; decryptedText?: string; error?: string } | null>(null);
  const [enigmaDecrypted, setEnigmaDecrypted] = useState<string>('');

  // Estados dos Modais
  const [isTopLidOpen, setIsTopLidOpen] = useState<boolean>(false);
  const [isKeySheetOpen, setIsKeySheetOpen] = useState<boolean>(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isCircuitModalOpen, setIsCircuitModalOpen] = useState<boolean>(false);
  const [isBletchleyModalOpen, setIsBletchleyModalOpen] = useState<boolean>(false);
  const [receivedPayload, setReceivedPayload] = useState<EnigmaPayload | null>(null);
  const [isReceivedModalOpen, setIsReceivedModalOpen] = useState<boolean>(false);
  const [showModernLab, setShowModernLab] = useState<boolean>(true);
  const [mobileTab, setMobileTab] = useState<'machine' | 'crypto'>('machine');

  // Formata texto em blocos militares de 5 letras
  const formatInBlocksOfFive = (str: string): string => {
    const clean = str.replace(/\s+/g, '');
    const chunks: string[] = [];
    for (let i = 0; i < clean.length; i += 5) {
      chunks.push(clean.slice(i, i + 5));
    }
    return chunks.join(' ');
  };

  // Processa caractere único pressionado
  const handleKeyDown = useCallback((char: string) => {
    if (receivedMode || plainText.length >= 2000) return;
    const upper = char.toUpperCase();
    if (upper < 'A' || upper > 'Z') return;

    setPressedKey(upper);
    const enigma = getOrInitEnigma();

    // Se estiver iniciando uma nova mensagem, grava a posição inicial SYNCHRONOUSLY antes do giro mecânico
    if (!hasStartedTapeRef.current) {
      hasStartedTapeRef.current = true;
      const initialPos = [...currentPositionsRef.current] as [string, string, string];
      sessionStartPositionsRef.current = initialPos;
      setSessionStartPositions(initialPos);
    }

    const { cipherChar, newPositions } = enigma.encryptChar(upper);

    setLitChar(cipherChar);
    setPositions(newPositions);
    currentPositionsRef.current = newPositions;

    setPlainText(prev => prev + upper);
    setCipherTape(prev => {
      const clean = (prev.replace(/\s+/g, '') + cipherChar);
      return formatInBlocksOfFive(clean);
    });
  }, [getOrInitEnigma, receivedMode, plainText.length]);

  const handleKeyUp = useCallback(() => {
    setLitChar(null);
    setPressedKey(null);
  }, []);

  const handleSpace = useCallback(() => {
    if (receivedMode) return;
    setPlainText(prev => prev + ' ');
  }, [receivedMode]);

  // Atalhos de teclado físico do usuário
  useEffect(() => {
    const onPhysicalKeyDown = (e: KeyboardEvent) => {
      // Ignora se estiver digitando em um input ou textarea
      if (isTopLidOpen || isKeySheetOpen || isQRModalOpen || isScannerOpen || isCircuitModalOpen || isBletchleyModalOpen || isReceivedModalOpen || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.repeat) return; // Evita disparo contínuo sem soltar tecla

      const key = e.key.toUpperCase();
      if (key >= 'A' && key <= 'Z') {
        e.preventDefault();
        soundEffects.playKeyPress();
        handleKeyDown(key);
      } else if (e.key === ' ') {
        e.preventDefault();
        soundEffects.playKeyPress();
        handleSpace();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        // Não remove na Enigma real (fita de papel apenas avança), mas limpa feedback
      }
    };

    const onPhysicalKeyUp = (e: KeyboardEvent) => {
      if (isTopLidOpen || isKeySheetOpen || isQRModalOpen || isScannerOpen || isCircuitModalOpen || isBletchleyModalOpen || isReceivedModalOpen || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      const key = e.key.toUpperCase();
      if (key >= 'A' && key <= 'Z') {
        soundEffects.playKeyRelease();
        handleKeyUp();
      }
    };

    window.addEventListener('keydown', onPhysicalKeyDown);
    window.addEventListener('keyup', onPhysicalKeyUp);
    return () => {
      window.removeEventListener('keydown', onPhysicalKeyDown);
      window.removeEventListener('keyup', onPhysicalKeyUp);
    };
  }, [handleKeyDown, handleKeyUp, handleSpace, isTopLidOpen, isKeySheetOpen, isQRModalOpen, isScannerOpen, isCircuitModalOpen, isBletchleyModalOpen, isReceivedModalOpen]);

  // Recalcula geometria de cabos do Plugboard ao alternar abas no mobile
  useEffect(() => {
    if (mobileTab === 'machine') {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [mobileTab]);

  const transmissionHeader = useMemo(() => ({
    v: 2 as const,
    net: { src: activeStation.id, dst: destination, keyId: `1944-06-${String(currentDay).padStart(2, '0')}`, ts: messageTimestamp },
    enigma: { ground: sessionStartPositions, ct: cipherTape.replace(/[^A-Z]/g, '') }
  }), [activeStation.id, destination, currentDay, messageTimestamp, sessionStartPositions, cipherTape]);
  const aad = payloadAAD(transmissionHeader);

  useEffect(() => {
    if (receivedMode || !plainText || sharedSecret.length === 0) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setCryptoBusy(true);
      try {
        const bundle = await ModernCryptoEngine.encrypt(plainText, sharedSecret, aad);
        const result = await ModernCryptoEngine.decrypt(bundle, sharedSecret);
        if (!cancelled) {
          setModernBundle(bundle); setModernDecrypted(result);
          setEncryptedFor(plainText); setEncryptedSecret(sharedSecret);
          setEnigmaDecrypted(plainText.replace(/[^A-Z]/g, ''));
          setIsTampered(false); setNetworkError('');
        }
      } catch {
        if (!cancelled) setNetworkError('Criptografia indisponível. Abra por HTTPS ou localhost.');
      } finally { if (!cancelled) setCryptoBusy(false); }
    }, 150);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [plainText, sharedSecret, aad, receivedMode]);

  // Aplicação de configurações da tampa mecânica (TopLid)
  const handleSaveInternalSettings = (
    newRotors: [RotorId, RotorId, RotorId],
    newRings: [number, number, number],
    newReflector: ReflectorId
  ) => {
    handleClearTape();
    setRotorTypes(newRotors);
    setRingSettings(newRings);
    setReflector(newReflector);
    if (enigmaRef.current) {
      enigmaRef.current.updateSettings({
        rotorTypes: newRotors,
        ringSettings: newRings,
        reflector: newReflector
      });
    }
  };

  // Carrega chave militar do dia
  const handleApplyDailyKey = (key: DailyKey) => {
    handleClearTape();
    setCurrentDay(key.day);
    setRotorTypes([...key.rotors]);
    setRingSettings([...key.rings]);
    setReflector(key.reflector);
    setPlugboardPairs([...key.plugs]);
    const groundChars = key.indicatorGroup.split('') as [string, string, string];
    setPositions(groundChars);
    currentPositionsRef.current = groundChars;
    hasStartedTapeRef.current = false;
    setSessionStartPositions(groundChars);
    sessionStartPositionsRef.current = groundChars;

    enigmaRef.current = new EnigmaM3({
      rotorTypes: key.rotors,
      ringSettings: key.rings,
      groundSettings: groundChars,
      reflector: key.reflector,
      plugboardPairs: key.plugs
    });
  };

  // Giro manual das roldanas
  const handleRotateRotorManually = (rotorIndex: 0 | 1 | 2, delta: number) => {
    if (hasStartedTapeRef.current) handleClearTape();
    const enigma = getOrInitEnigma();
    const newPos = enigma.rotateRotorManually(rotorIndex, delta);
    setPositions([...newPos]);
    currentPositionsRef.current = [...newPos];
    if (!hasStartedTapeRef.current) {
      setSessionStartPositions([...newPos]);
      sessionStartPositionsRef.current = [...newPos];
    }
  };

  // Cifrar texto em lote (batch processing)
  const handleProcessBatchText = () => {
    if (receivedMode) return;
    const normalized = batchInput.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z ]/g, '').trim();
    if (!/[A-Z]/.test(normalized)) return;
    if (plainText.length + normalized.length > 2000) { setNetworkError('Limite de 2000 caracteres por mensagem.'); return; }
    soundEffects.playRadioTransmit();

    if (!hasStartedTapeRef.current) {
      hasStartedTapeRef.current = true;
      const initialPos = [...currentPositionsRef.current] as [string, string, string];
      sessionStartPositionsRef.current = initialPos;
      setSessionStartPositions(initialPos);
    }

    const enigma = getOrInitEnigma();
    const { cipherText, finalPositions } = enigma.processString(normalized);

    setPlainText(prev => (prev ? prev + ' ' : '') + normalized);
    setPositions(finalPositions);
    currentPositionsRef.current = finalPositions;
    setCipherTape(prev => {
      const clean = (prev.replace(/\s+/g, '') + cipherText);
      return formatInBlocksOfFive(clean);
    });
    setBatchInput('');
  };

  // Resetar / Limpar fita
  const handleClearTape = () => {
    setReceivedMode(false); setMessageTimestamp(Date.now());
    setEncryptedFor(''); setCryptoBusy(false); setNetworkError('');
    hasStartedTapeRef.current = false;
    setPlainText('');
    setCipherTape('');
    setModernBundle(null);
    setModernDecrypted(null);
    setEnigmaDecrypted('');
    setIsTampered(false);
    // Retorna os rotores para a posição de início da fita
    const startPos = sessionStartPositionsRef.current;
    if (enigmaRef.current) {
      enigmaRef.current.setVisiblePositions(startPos);
    }
    setPositions(startPos);
    currentPositionsRef.current = startPos;
  };

  // Decifrar fita atual (Princípio Recíproco: reseta rotores para posição inicial e passa a cifra)
  const handleDecryptCurrentTape = () => {
    if (!cipherTape.trim()) return;
    soundEffects.playRadioTransmit();

    const startPos = sessionStartPositionsRef.current;

    // Reinicia a máquina na posição inicial da transmissão
    const enigma = new EnigmaM3({
      rotorTypes,
      ringSettings,
      groundSettings: startPos,
      reflector,
      plugboardPairs
    });
    enigmaRef.current = enigma;

    // Passa a fita cifrada limpa pela máquina
    const cleanCt = cipherTape.replace(/[^A-Z]/g, '');
    const { cipherText: decrypted, finalPositions } = enigma.processString(cleanCt);

    setPositions(finalPositions);
    currentPositionsRef.current = finalPositions;
    setPlainText(decrypted);
    setEnigmaDecrypted(decrypted);

  };

  const cryptoReady = !!modernBundle && encryptedFor === plainText && encryptedSecret === sharedSecret && modernBundle.aad === aad && !receivedMode;
  const currentPayload: EnigmaPayload | null = cryptoReady && sharedSecret.length > 0 && cipherTape ? {
    ...transmissionHeader,
    enigma: { ...transmissionHeader.enigma, ct: isTampered ? (transmissionHeader.enigma.ct[0] === 'X' ? 'Y' : 'X') + transmissionHeader.enigma.ct.slice(1) : transmissionHeader.enigma.ct },
    modern: { algo: 'AES-256-GCM', iv: modernBundle!.ivBase64, salt: modernBundle!.saltBase64,
      tag: modernBundle!.tagBase64, ct: modernBundle!.ciphertextBase64, keyDerivation: 'PBKDF2-SHA256-100000' }
  } : null;

  const handleToggleTamper = async () => {
    if (!modernBundle || !plainText || cryptoBusy || !cryptoReady) return;
    setCryptoBusy(true);
    try {
      const nextBundle = isTampered ? await ModernCryptoEngine.encrypt(plainText, sharedSecret, modernBundle.aad) : ModernCryptoEngine.tamperBundle(modernBundle);
      const result = await ModernCryptoEngine.decrypt(nextBundle, sharedSecret);
      const clean = cipherTape.replace(/[^A-Z]/g, '');
      const changed = clean ? (clean[0] === 'X' ? 'Y' : 'X') + clean.slice(1) : clean;
      const machine = new EnigmaM3({ rotorTypes, ringSettings, reflector, plugboardPairs, groundSettings: sessionStartPositions });
      setEnigmaDecrypted(machine.processString(isTampered ? clean : changed).cipherText);
      setModernBundle(nextBundle); setModernDecrypted(result); setIsTampered(!isTampered);
    } finally { setCryptoBusy(false); }
  };

  const handleScanSuccess = async (payload: EnigmaPayload) => {
    if (payload.net.dst !== activeStation.id) throw new Error(`Esta mensagem é para ${payload.net.dst}. Selecione essa estação antes de receber.`);
    if (payload.net.keyId !== `1944-06-${String(currentDay).padStart(2, '0')}`) throw new Error('Carregue na folha de chaves o dia indicado no pacote antes de receber.');
    if (sharedSecret.length === 0) throw new Error('Informe a senha compartilhada antes de receber.');
    const bundle = bundleFromPayload(payload);
    const result = await ModernCryptoEngine.decrypt(bundle, sharedSecret);
    const receiver = new EnigmaM3({ rotorTypes, ringSettings, reflector, plugboardPairs, groundSettings: payload.enigma.ground });
    const decrypted = receiver.processString(payload.enigma.ct);
    setReceivedMode(true); hasStartedTapeRef.current = true;
    sessionStartPositionsRef.current = payload.enigma.ground;
    setSessionStartPositions(payload.enigma.ground); enigmaRef.current = receiver;
    setPositions(decrypted.finalPositions); currentPositionsRef.current = decrypted.finalPositions;
    setCipherTape(formatInBlocksOfFive(payload.enigma.ct));
    setPlainText(result.success ? result.decryptedText! : '');
    setEnigmaDecrypted(decrypted.cipherText); setModernBundle(bundle); setModernDecrypted(result);
    setIsTampered(!result.success); setReceivedPayload(payload); setIsReceivedModalOpen(true); setCryptoBusy(false);
  };

  const tracerMachine = useMemo(() => new EnigmaM3({ rotorTypes, ringSettings, groundSettings: positions, reflector, plugboardPairs }), [rotorTypes, ringSettings, positions, reflector, plugboardPairs]);

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Barra de Navegação Superior */}
      <Header
        currentStation={activeStation}
        onSelectStation={station => { handleClearTape(); setActiveStation(station); setDestination(STATIONS.find(st => st.id !== station.id)!.id); }}
        onOpenKeySheet={() => setIsKeySheetOpen(true)}
        onOpenTransmitQR={() => setIsQRModalOpen(true)}
        onOpenScanQR={() => setIsScannerOpen(true)}
        onOpenCircuitModal={() => setIsCircuitModalOpen(true)}
        onOpenBletchleyModal={() => setIsBletchleyModalOpen(true)}
        showModernLab={showModernLab}
        onToggleModernLab={() => {
          setShowModernLab(prev => {
            const next = !prev;
            if (next) setMobileTab('crypto');
            return next;
          });
        }}
        hasCipherData={!!currentPayload}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 py-2 sm:p-4 md:p-6 space-y-2.5 sm:space-y-4">
        {/* Painel Tático de Rede & AES (Colapsável para economizar espaço no celular) */}
        <details className="group bg-[#131519] border border-[#2b2e36] rounded-lg text-xs font-mono overflow-hidden">
          <summary className="p-2 sm:p-2.5 cursor-pointer flex items-center justify-between font-bold text-zinc-300 hover:text-amber-400 select-none list-none">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
              <span className="text-[11px] uppercase tracking-wider text-zinc-200">
                Rede Air-Gap & Senha AES-256
              </span>
              <span className="text-[10px] text-zinc-500 font-normal hidden sm:inline">
                ({activeStation.name} ➔ {STATIONS.find(st => st.id === destination)?.name || destination})
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className={sharedSecret ? 'text-emerald-400 font-normal' : 'text-amber-400 font-normal'}>
                {sharedSecret ? '🔒 AES Ativo' : '⚠️ Definir Senha AES'}
              </span>
              <span className="text-zinc-500 group-open:rotate-180 transition-transform text-xs">▼</span>
            </div>
          </summary>
          <div className="p-3 pt-0 border-t border-[#22252c] grid sm:grid-cols-3 gap-3 mt-2">
            <label className="text-zinc-300 font-semibold">Esta máquina
              <select aria-label="Esta máquina" value={activeStation.id} onChange={e => { handleClearTape(); setActiveStation(STATIONS.find(st => st.id === e.target.value)!); setDestination(STATIONS.find(st => st.id !== e.target.value)!.id); }} className="block w-full mt-1 bg-[#0e1013] border border-[#353945] rounded-md p-1.5 text-xs text-amber-300">
                {STATIONS.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
              </select>
            </label>
            <label className="text-zinc-300 font-semibold">Enviar para
              <select aria-label="Enviar para" value={destination} onChange={e => setDestination(e.target.value)} className="block w-full mt-1 bg-[#0e1013] border border-[#353945] rounded-md p-1.5 text-xs text-amber-300">
                {STATIONS.filter(st => st.id !== activeStation.id).map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
              </select>
            </label>
            <label className="text-zinc-300 font-semibold">Senha compartilhada do AES
              <input type="password" autoComplete="off" aria-label="Senha compartilhada do AES" value={sharedSecret} onChange={e => { if (receivedMode) handleClearTape(); setSharedSecret(e.target.value); }} placeholder="Mesma senha nos dois aparelhos" className="block w-full mt-1 bg-[#0e1013] border border-[#353945] rounded-md p-1.5 text-xs text-amber-300 placeholder-zinc-600 focus:outline-none focus:border-amber-500" />
            </label>
            <p className="sm:col-span-3 text-[11px] text-zinc-400">Combine a mesma senha nos dois aparelhos fora do QR. Carregue a mesma chave do dia nas duas máquinas.</p>
            {sharedSecret.length === 0 && <p className="sm:col-span-3 text-[11px] text-amber-400">⚠️ Informe a senha para habilitar o AES e a transmissão autenticada.</p>}
            {plainText && !cryptoReady && !receivedMode && sharedSecret.length > 0 && <p role="status" className="sm:col-span-3 text-[11px] text-amber-300">Preparando pacote autenticado…</p>}
            {receivedMode && <p className="sm:col-span-3 text-[11px] text-emerald-400">Mensagem recebida. Limpe a fita para iniciar outra transmissão.</p>}
            {networkError && <p role="alert" className="sm:col-span-3 text-[11px] text-red-400">{networkError}</p>}
          </div>
        </details>
        {/* Painel Tático de Entrada Rápida de Mensagem (Ultra Compacto) */}
        <div className="bg-[#131519] border border-[#2b2e36] rounded-lg px-2.5 py-1 shadow-sm flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 justify-between">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
            <h2 className="text-[11px] font-mono font-bold tracking-wider text-zinc-200 uppercase">
              Terminal Tático
            </h2>
            <span className="text-[10px] font-mono text-zinc-500 hidden md:inline">
              (ou digite nas teclas da Enigma)
            </span>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            <input
              type="text"
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleProcessBatchText();
              }}
              placeholder="Digitar texto (ex: ATAQUE)..."
              className="flex-1 min-w-0 sm:w-56 bg-[#0d0e11] border border-[#373a44] rounded-lg px-2 sm:px-2.5 py-1 text-xs font-mono text-amber-300 placeholder-zinc-600 focus:outline-none focus:border-amber-500 uppercase"
            />
            <button
              onClick={handleProcessBatchText}
              disabled={!batchInput.trim()}
              className="px-2.5 sm:px-3 py-1 font-mono text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 rounded-lg shadow transition-all active:scale-95 flex items-center gap-1 shrink-0"
            >
              <Play size={12} fill="currentColor" />
              <span>Cifrar</span>
            </button>
            {cipherTape.length > 0 && (
              <>
                <button
                  onClick={handleDecryptCurrentTape}
                  className="px-2 sm:px-2.5 py-1 font-mono text-xs font-bold text-amber-300 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-700/60 rounded-lg shadow transition-all active:scale-95 flex items-center gap-1 shrink-0"
                  title="Decifrar fita: reseta os rotores para a posição inicial e passa a cifra pela Enigma"
                >
                  <KeyRound size={12} className="text-amber-400" />
                  <span>Decifrar</span>
                </button>
                <button
                  onClick={handleClearTape}
                  className="p-1 text-zinc-400 hover:text-red-400 bg-[#1a1c22] border border-[#333742] rounded-lg transition-colors shrink-0"
                  title="Limpar texto cifrado e reiniciar estado"
                >
                  <RotateCcw size={13} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Seletor Mobile de Abas (Máquina Enigma vs Raio-X) */}
        <div className="flex lg:hidden bg-[#15171b] p-1 rounded-xl border border-[#2d3038] shadow w-full">
          <button
            type="button"
            onClick={() => setMobileTab('machine')}
            className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'machine'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>🕹️ Máquina Enigma</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileTab('crypto');
              setShowModernLab(true);
            }}
            className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'crypto'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>🔬 Raio-X (AES-256)</span>
          </button>
        </div>

        {/* Layout Principal: Máquina Enigma à Esquerda / Raio-X Criptográfico à Direita */}
        <div className={`grid gap-4 sm:gap-8 items-start ${showModernLab ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
          {/* Coluna da Máquina Enigma 2.5D */}
          <div className={`${mobileTab === 'machine' ? 'block' : 'hidden lg:block'} ${showModernLab ? 'lg:col-span-7' : 'max-w-3xl mx-auto w-full'} w-full`}>
            <EnigmaCase
              rotorTypes={rotorTypes}
              positions={positions}
              ringSettings={ringSettings}
              reflector={reflector}
              plugboardPairs={plugboardPairs}
              litChar={litChar}
              pressedKey={pressedKey}
              outputTape={cipherTape}
              onRotateManually={handleRotateRotorManually}
              onOpenLid={() => setIsTopLidOpen(true)}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              onSpace={handleSpace}
              onChangePlugPairs={pairs => { handleClearTape(); setPlugboardPairs(pairs); }}
              onResetPlugToDaily={() => {
                const daily = getDailyKey(currentDay);
                handleClearTape();
                setPlugboardPairs([...daily.plugs]);
                soundEffects.playPlugInsert();
              }}
              onClearTape={handleClearTape}
            />

            {/* Ações de Transmissão sob a máquina */}
            <div className="flex items-center justify-between gap-2 mt-3 max-w-2xl mx-auto px-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsKeySheetOpen(true)}
                  className="flex items-center gap-1 text-[11px] sm:text-xs font-mono text-zinc-400 hover:text-amber-400 transition-colors"
                >
                  <FileSpreadsheet size={13} />
                  <span>Folha: <strong>Dia {currentDay}</strong></span>
                </button>
                <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
                  Partida: <strong className="text-amber-400 font-mono tracking-wider">{sessionStartPositions.join('')}</strong>
                </span>
              </div>

              {currentPayload && (
                <button
                  onClick={() => setIsQRModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-bold text-amber-300 bg-amber-950/40 border border-amber-800/60 hover:bg-amber-900/50 shadow transition-all active:scale-95 animate-pulse"
                >
                  <Send size={12} />
                  <span>Transmitir (QR)</span>
                </button>
              )}
            </div>
          </div>

          {/* Coluna do Raio-X Criptográfico (Split-View Moderno) */}
          {(showModernLab || mobileTab === 'crypto') && (
            <div className={`${mobileTab === 'crypto' ? 'block' : 'hidden lg:block'} lg:col-span-5 space-y-4 sm:space-y-6 w-full`}>
              <CryptoInspector
                plainText={plainText}
                enigmaCipherText={cipherTape}
                modernBundle={receivedMode || cryptoReady ? modernBundle : null}
                isTampered={isTampered}
                onToggleTamper={handleToggleTamper}
                tamperDisabled={cryptoBusy || !cryptoReady || !plainText}
                enigmaDecrypted={enigmaDecrypted}
                modernDecrypted={receivedMode || cryptoReady ? modernDecrypted : null}
                rotorTypes={rotorTypes}
                positions={sessionStartPositions}
                ringSettings={ringSettings}
                reflector={reflector}
                plugboardPairs={plugboardPairs}
              />
            </div>
          )}
        </div>
      </main>

      {/* Rodapé Tático */}
      <footer className="border-t border-[#1c1e24] bg-[#0c0d10] py-4 px-6 text-center text-xs font-mono text-zinc-500">
        <div className="flex items-center justify-center gap-2">
          <Sparkles size={13} className="text-amber-500" />
          <span>Hackathon Edition • Simulador Enigma M3 Eletromecânico & Criptografia Moderna AES-256-GCM</span>
        </div>
      </footer>

      {/* Modais do Sistema */}
      {isTopLidOpen && <TopLidModal
        isOpen={isTopLidOpen}
        onClose={() => setIsTopLidOpen(false)}
        rotorTypes={rotorTypes}
        ringSettings={ringSettings}
        reflector={reflector}
        onSave={handleSaveInternalSettings}
      />}

      <KeySheetModal
        isOpen={isKeySheetOpen}
        onClose={() => setIsKeySheetOpen(false)}
        currentDay={currentDay}
        onApplyDay={handleApplyDailyKey}
      />

      <QRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        payload={currentPayload}
      />

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      <CircuitTracerModal
        isOpen={isCircuitModalOpen}
        onClose={() => setIsCircuitModalOpen(false)}
        enigma={tracerMachine}
      />

      <BletchleyParkModal
        isOpen={isBletchleyModalOpen}
        onClose={() => setIsBletchleyModalOpen(false)}
        cipherText={cipherTape}
      />

      <ReceivedMessageModal
        isOpen={isReceivedModalOpen}
        onClose={() => setIsReceivedModalOpen(false)}
        payload={receivedPayload}
        decryptedEnigma={enigmaDecrypted}
        modernResult={modernDecrypted}
        onGoToInspector={() => {
          setIsReceivedModalOpen(false);
          setShowModernLab(true);
          setMobileTab('crypto');
        }}
      />
    </div>
  );
}
