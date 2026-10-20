import { useState, useEffect, useRef, useCallback } from 'react';
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
import { soundEffects } from './audio/soundEffects';
import { Play, RotateCcw, Send, FileSpreadsheet, Sparkles, KeyRound } from 'lucide-react';

export default function App() {
  // Configuração inicial do Dia D (Dia 6)
  const defaultDay = 6;
  const initialKey = getDailyKey(defaultDay);

  const [activeStation, setActiveStation] = useState<Station>(STATIONS[0]);
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
  currentPositionsRef.current = positions;
  const isReceivingRef = useRef<boolean>(false);

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
    const upper = char.toUpperCase();
    if (upper < 'A' || upper > 'Z') return;

    setPressedKey(upper);
    const enigma = getOrInitEnigma();

    // Se estiver iniciando uma nova mensagem, grava a posição inicial antes do primeiro giro
    setPlainText(prev => {
      if (prev.length === 0) {
        setSessionStartPositions([...currentPositionsRef.current]);
        sessionStartPositionsRef.current = [...currentPositionsRef.current];
      }
      return prev + upper;
    });

    const { cipherChar, newPositions } = enigma.encryptChar(upper);

    setLitChar(cipherChar);
    setPositions(newPositions);
    currentPositionsRef.current = newPositions;

    setCipherTape(prev => {
      const clean = (prev.replace(/\s+/g, '') + cipherChar);
      return formatInBlocksOfFive(clean);
    });
  }, [getOrInitEnigma]);

  const handleKeyUp = useCallback(() => {
    setLitChar(null);
    setPressedKey(null);
  }, []);

  const handleSpace = useCallback(() => {
    setPlainText(prev => prev + ' ');
  }, []);

  // Atalhos de teclado físico do usuário
  useEffect(() => {
    const onPhysicalKeyDown = (e: KeyboardEvent) => {
      // Ignora se estiver digitando em um input ou textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
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
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
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
  }, [handleKeyDown, handleKeyUp, handleSpace]);

  // Criptografa mensagem moderna em paralelo sempre que o plainText mudar
  useEffect(() => {
    if (isReceivingRef.current) {
      isReceivingRef.current = false;
      return;
    }
    if (!plainText.trim()) {
      setModernBundle(null);
      setModernDecrypted(null);
      setEnigmaDecrypted('');
      return;
    }

    const secretKey = `ENIGMA_KEY_DAY_${currentDay}_${rotorTypes.join('')}`;
    ModernCryptoEngine.encrypt(plainText, secretKey).then(bundle => {
      setModernBundle(bundle);
      setIsTampered(false);
      // Decifra para estado inicial de demonstração
      ModernCryptoEngine.decrypt(bundle, secretKey).then(setModernDecrypted);
      setEnigmaDecrypted(plainText);
    });
  }, [plainText, currentDay, rotorTypes]);

  // Aplicação de configurações da tampa mecânica (TopLid)
  const handleSaveInternalSettings = (
    newRotors: [RotorId, RotorId, RotorId],
    newRings: [number, number, number],
    newReflector: ReflectorId
  ) => {
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
    setCurrentDay(key.day);
    setRotorTypes([...key.rotors]);
    setRingSettings([...key.rings]);
    setReflector(key.reflector);
    setPlugboardPairs([...key.plugs]);
    const groundChars = key.indicatorGroup.split('') as [string, string, string];
    setPositions(groundChars);
    currentPositionsRef.current = groundChars;
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
    const enigma = getOrInitEnigma();
    const newPos = enigma.rotateRotorManually(rotorIndex, delta);
    setPositions([...newPos]);
    currentPositionsRef.current = [...newPos];
    if (!plainText && !cipherTape) {
      setSessionStartPositions([...newPos]);
      sessionStartPositionsRef.current = [...newPos];
    }
  };

  // Cifrar texto em lote (batch processing)
  const handleProcessBatchText = () => {
    if (!batchInput.trim()) return;
    soundEffects.playRadioTransmit();

    if (!plainText) {
      sessionStartPositionsRef.current = [...positions];
      setSessionStartPositions([...positions]);
    }

    const enigma = getOrInitEnigma();
    const { cipherText, finalPositions } = enigma.processString(batchInput);

    setPlainText(prev => (prev ? prev + ' ' : '') + batchInput.toUpperCase());
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

    // Abre o modal de transmissão recebida/decifrada para confirmação visual
    const virtualPayload: EnigmaPayload = {
      v: 1,
      net: {
        src: activeStation.id,
        dst: activeStation.id,
        keyId: `1944-06-${String(currentDay).padStart(2, '0')}`,
        ts: Date.now()
      },
      enigma: {
        rotors: rotorTypes,
        rings: ringSettings,
        ground: startPos,
        plugs: plugboardPairs.join('-'),
        ct: cipherTape,
        plainPreview: decrypted
      },
      modern: {
        algo: 'AES-256-GCM',
        iv: modernBundle?.ivBase64 || '',
        tag: modernBundle?.tagBase64 || '',
        ct: modernBundle?.ciphertextBase64 || '',
        keyDerivation: `PBKDF2_SHA256_DAY_${currentDay}`
      },
      tampered: isTampered
    };
    setReceivedPayload(virtualPayload);
    setIsReceivedModalOpen(true);
  };

  // Alterna adulteração MITM
  const handleToggleTamper = async () => {
    if (!modernBundle) return;
    const secretKey = `ENIGMA_KEY_DAY_${currentDay}_${rotorTypes.join('')}`;

    if (!isTampered) {
      // Aplica adulteração no pacote moderno
      const tampered = ModernCryptoEngine.tamperBundle(modernBundle);
      setModernBundle(tampered);
      setIsTampered(true);

      // Decifra no AES: tag de autenticação falhará!
      const decModern = await ModernCryptoEngine.decrypt(tampered, secretKey);
      setModernDecrypted(decModern);

      // Na Enigma: altera 1 caractere no texto decifrado sem detecção
      if (plainText.length > 0) {
        const chars = plainText.split('');
        const corruptChar = chars[0] === 'X' ? 'Z' : 'X';
        chars[0] = corruptChar;
        setEnigmaDecrypted(chars.join(''));
      }
    } else {
      // Reverte adulteração
      const cleanBundle = await ModernCryptoEngine.encrypt(plainText, secretKey);
      setModernBundle(cleanBundle);
      setIsTampered(false);
      const decModern = await ModernCryptoEngine.decrypt(cleanBundle, secretKey);
      setModernDecrypted(decModern);
      setEnigmaDecrypted(plainText);
    }
  };

  // Recebe payload escaneado via QR Code Airgap
  const handleScanSuccess = (payload: EnigmaPayload) => {
    isReceivingRef.current = true;

    // Altera estação destinatária para a atual se for correspondente
    const targetStation = STATIONS.find(s => s.id === payload.net.dst) || activeStation;
    setActiveStation(targetStation);

    let dayNumber = currentDay;
    if (payload.net.keyId) {
      const match = payload.net.keyId.match(/(\d+)$/);
      if (match) dayNumber = parseInt(match[1], 10);
    }
    setCurrentDay(dayNumber);

    // Configura a máquina receptora com os parâmetros da transmissão
    setRotorTypes(payload.enigma.rotors);
    setRingSettings(payload.enigma.rings);
    const startGround = payload.enigma.ground;
    setSessionStartPositions(startGround);
    sessionStartPositionsRef.current = startGround;

    const plugsArr = payload.enigma.plugs ? payload.enigma.plugs.split('-') : [];
    setPlugboardPairs(plugsArr);

    // Cria a máquina receptora na posição inicial (ground)
    const receiverEnigma = new EnigmaM3({
      rotorTypes: payload.enigma.rotors,
      ringSettings: payload.enigma.rings,
      groundSettings: startGround,
      reflector: 'UKW-B',
      plugboardPairs: plugsArr
    });
    enigmaRef.current = receiverEnigma;

    // Decifra na Enigma receptora
    const cleanCt = payload.enigma.ct.replace(/[^A-Z]/g, '');
    const { cipherText: decryptedPlain, finalPositions } = receiverEnigma.processString(cleanCt);

    // Rotores avançam para a posição final correspondente
    setPositions(finalPositions);
    currentPositionsRef.current = finalPositions;

    setPlainText(decryptedPlain);
    setCipherTape(formatInBlocksOfFive(cleanCt));
    setEnigmaDecrypted(decryptedPlain);

    // Ajusta bundle moderno
    const bundle: ModernEncryptedBundle = {
      ciphertextBase64: payload.modern.ct,
      ivBase64: payload.modern.iv,
      tagBase64: payload.modern.tag,
      tampered: !!payload.tampered
    };
    setModernBundle(bundle);

    const secretKey = `ENIGMA_KEY_DAY_${dayNumber}_${payload.enigma.rotors.join('')}`;
    ModernCryptoEngine.decrypt(bundle, secretKey).then(decResult => {
      setModernDecrypted(decResult);
      setReceivedPayload(payload);
      setIsReceivedModalOpen(true);
    });
  };

  // Monta objeto do payload para QR Code
  const currentPayload: EnigmaPayload | null = cipherTape.length > 0 && modernBundle ? {
    v: 1,
    net: {
      src: activeStation.id,
      dst: activeStation.id === 'U47' ? 'ALPHA' : 'U47',
      keyId: `1944-06-${String(currentDay).padStart(2, '0')}`,
      ts: Date.now()
    },
    enigma: {
      rotors: rotorTypes,
      rings: ringSettings,
      ground: sessionStartPositionsRef.current,
      plugs: plugboardPairs.join('-'),
      ct: cipherTape,
      plainPreview: plainText
    },
    modern: {
      algo: 'AES-256-GCM',
      iv: modernBundle.ivBase64,
      tag: modernBundle.tagBase64,
      ct: modernBundle.ciphertextBase64,
      keyDerivation: `PBKDF2_SHA256_DAY_${currentDay}`
    },
    tampered: isTampered
  } : null;

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Barra de Navegação Superior */}
      <Header
        currentStation={activeStation}
        onSelectStation={setActiveStation}
        onOpenKeySheet={() => setIsKeySheetOpen(true)}
        onOpenTransmitQR={() => setIsQRModalOpen(true)}
        onOpenScanQR={() => setIsScannerOpen(true)}
        onOpenCircuitModal={() => setIsCircuitModalOpen(true)}
        onOpenBletchleyModal={() => setIsBletchleyModalOpen(true)}
        showModernLab={showModernLab}
        onToggleModernLab={() => setShowModernLab(prev => !prev)}
        hasCipherData={cipherTape.length > 0}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-5 lg:p-8 space-y-3 sm:space-y-6 overflow-x-hidden">
        {/* Painel Tático de Entrada Rápida de Mensagem */}
        <div className="bg-[#131519] border border-[#2b2e36] rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg flex flex-col md:flex-row items-stretch md:items-center gap-3 sm:gap-4 justify-between">
          <div className="flex-1 w-full space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
              <h2 className="text-[11px] sm:text-xs font-mono font-bold tracking-widest text-zinc-200 uppercase">
                Terminal de Transmissão Tática
              </h2>
            </div>
            <p className="text-[10px] sm:text-[11px] font-mono text-zinc-400 hidden sm:block">
              Digite letras diretamente no seu teclado físico, clique nas teclas da máquina 2.5D ou cole um texto militar abaixo para cifrar instantaneamente.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleProcessBatchText();
              }}
              placeholder="Ex: ATAQUE AO AMANHECER..."
              className="flex-1 md:w-64 bg-[#0d0e11] border border-[#373a44] rounded-lg px-3 py-2 text-xs font-mono text-amber-300 placeholder-zinc-600 focus:outline-none focus:border-amber-500 uppercase"
            />
            <button
              onClick={handleProcessBatchText}
              disabled={!batchInput.trim()}
              className="px-3 sm:px-4 py-2 font-mono text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 rounded-lg shadow transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
            >
              <Play size={13} fill="currentColor" />
              <span>Cifrar</span>
            </button>
            {cipherTape.length > 0 && (
              <>
                <button
                  onClick={handleDecryptCurrentTape}
                  className="px-3 py-2 font-mono text-xs font-bold text-amber-300 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-700/60 rounded-lg shadow transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
                  title="Decifrar fita: reseta os rotores para a posição inicial e passa a cifra pela Enigma"
                >
                  <KeyRound size={13} className="text-amber-400" />
                  <span>Decifrar Fita</span>
                </button>
                <button
                  onClick={handleClearTape}
                  className="p-2 text-zinc-400 hover:text-red-400 bg-[#1a1c22] border border-[#333742] rounded-lg transition-colors shrink-0"
                  title="Limpar texto cifrado e reiniciar estado"
                >
                  <RotateCcw size={15} />
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
            onClick={() => setMobileTab('crypto')}
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
              onChangePlugPairs={setPlugboardPairs}
              onResetPlugToDaily={() => {
                const daily = getDailyKey(currentDay);
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

              {cipherTape.length > 0 && (
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
          {showModernLab && (
            <div className={`${mobileTab === 'crypto' ? 'block' : 'hidden lg:block'} lg:col-span-5 space-y-4 sm:space-y-6 w-full`}>
              <CryptoInspector
                plainText={plainText}
                enigmaCipherText={cipherTape}
                modernBundle={modernBundle}
                isTampered={isTampered}
                onToggleTamper={handleToggleTamper}
                enigmaDecrypted={enigmaDecrypted}
                modernDecrypted={modernDecrypted}
                rotorTypes={rotorTypes}
                positions={positions}
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
      <TopLidModal
        isOpen={isTopLidOpen}
        onClose={() => setIsTopLidOpen(false)}
        rotorTypes={rotorTypes}
        ringSettings={ringSettings}
        reflector={reflector}
        onSave={handleSaveInternalSettings}
      />

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
        enigma={getOrInitEnigma()}
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
