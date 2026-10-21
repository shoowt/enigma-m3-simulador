import React, { useState, useEffect } from 'react';
import { ShieldX, ShieldCheck, AlertOctagon } from 'lucide-react';
import { EnigmaM3 } from '../../core/enigmaEngine';
import { ModernCryptoEngine } from '../../core/modernCrypto';
import { soundEffects } from '../../audio/soundEffects';
import type { ModernEncryptedBundle, RotorId, ReflectorId } from '../../types/crypto';

interface WrongKeyProofProps {
  currentTape: string;
  rotorTypes: [RotorId, RotorId, RotorId];
  positions: [string, string, string];
  ringSettings: [number, number, number];
  reflector: ReflectorId;
  plugboardPairs: string[];
}

export const WrongKeyProof: React.FC<WrongKeyProofProps> = ({
  currentTape,
  rotorTypes,
  positions,
  ringSettings,
  reflector,
  plugboardPairs
}) => {
  // Mensagem de teste padrão se a fita estiver vazia
  const sampleMessage = 'ATAQUE AO AMANHECER';
  const cleanTape = currentTape.replace(/\s+/g, '');

  const [testMode, setTestMode] = useState<'rotor_offset' | 'rotor_swap' | 'plug_error'>('rotor_offset');
  const [targetCipher, setTargetCipher] = useState<string>('');
  const [correctEnigmaPlain, setCorrectEnigmaPlain] = useState<string>('');
  const [wrongEnigmaPlain, setWrongEnigmaPlain] = useState<string>('');

  const [sampleBundle, setSampleBundle] = useState<ModernEncryptedBundle | null>(null);
  const [correctAesResult, setCorrectAesResult] = useState<string>('');
  const [wrongAesResult, setWrongAesResult] = useState<{ success: boolean; error?: string }>({ success: false });

  // Executa os testes de chave correta vs errada
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
    // 1. Prepara a cifra base (se o usuário já digitou, usa o que ele digitou; senão usa sample)
    let basePlain = sampleMessage;
    let baseCipher = '';

    if (cleanTape.length >= 3) {
      // Se tiver fita, usamos a fita como cifra a ser decifrada
      baseCipher = cleanTape;
      basePlain = ''; // vamos decifrar com máquina correta
    } else {
      // Cria cifra de teste com a máquina correta atual
      const encMachine = new EnigmaM3({
        rotorTypes,
        groundSettings: positions,
        ringSettings,
        reflector,
        plugboardPairs
      });
      const res = encMachine.processString(sampleMessage);
      baseCipher = res.cipherText;
    }

    setTargetCipher(baseCipher);

    // 2. Decifração com Chave CORRETA (reiniciando na posição inicial)
    const correctMachine = new EnigmaM3({
      rotorTypes,
      groundSettings: positions,
      ringSettings,
      reflector,
      plugboardPairs
    });
    const correctRes = correctMachine.processString(baseCipher);
    setCorrectEnigmaPlain(correctRes.cipherText);

    // 3. Decifração com Chave ERRADA de acordo com o modo
    let wrongRotors = [...rotorTypes] as [RotorId, RotorId, RotorId];
    let wrongPositions = [...positions] as [string, string, string];
    let wrongPlugs = [...plugboardPairs];

    if (testMode === 'rotor_offset') {
      // Desloca a roldana da direita em 1 caractere (ex: de A para B)
      const nextChar = String.fromCharCode(((wrongPositions[2].charCodeAt(0) - 65 + 1) % 26) + 65);
      wrongPositions[2] = nextChar;
    } else if (testMode === 'rotor_swap') {
      // Troca o rotor rápido pelo rotor IV ou I
      [wrongRotors[0], wrongRotors[2]] = [wrongRotors[2], wrongRotors[0]];
    } else if (testMode === 'plug_error') {
      // Erro de 1 cabo no plugboard
      wrongPlugs = wrongPlugs.length ? wrongPlugs.slice(1) : ['AZ'];
    }

    const wrongMachine = new EnigmaM3({
      rotorTypes: wrongRotors,
      groundSettings: wrongPositions,
      ringSettings,
      reflector,
      plugboardPairs: wrongPlugs
    });
    const wrongRes = wrongMachine.processString(baseCipher);
    setWrongEnigmaPlain(wrongRes.cipherText);

    // 4. Teste no AES-256-GCM
    const masterSecret = 'CHAVE_MESTRE_MILITAR_1944';
    const wrongSecret = 'CHAVE_MESTRE_MILITAR_1945'; // 1 dígito de diferença

    const plainForModern = cleanTape.length >= 3 ? correctRes.cipherText : basePlain;
    ModernCryptoEngine.encrypt(plainForModern || 'TESTE', masterSecret).then(bundle => {
      if (cancelled) return;
      setSampleBundle(bundle);

      // Decifra com chave correta
      ModernCryptoEngine.decrypt(bundle, masterSecret).then(res => {
        if (!cancelled) setCorrectAesResult(res.decryptedText || '');
      });

      // Decifra com chave incorreta
      ModernCryptoEngine.decrypt(bundle, wrongSecret).then(res => {
        if (!cancelled) setWrongAesResult(res);
      });
    }).catch(() => { if (!cancelled) setWrongAesResult({ success: false, error: 'Criptografia indisponível neste contexto. Use HTTPS ou localhost.' }); });
    }, 150);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [cleanTape, rotorTypes, positions, ringSettings, reflector, plugboardPairs, testMode]);

  const handleModeChange = (mode: 'rotor_offset' | 'rotor_swap' | 'plug_error') => {
    soundEffects.playRotorStep();
    setTestMode(mode);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#14161b] border border-[#2e3340] space-y-4">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#232733] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <AlertOctagon size={16} />
          </div>
          <div>
            <h4 className="font-mono text-xs sm:text-sm font-bold text-zinc-100 uppercase tracking-wide">
              Prova ao Vivo: Chave Correta vs. Chave Incorreta
            </h4>
            <p className="text-[10px] sm:text-[11px] font-mono text-zinc-400">
              Veja a diferença de segurança operacional: Enigma gera lixo ilegível sem aviso; AES-GCM rejeita por integridade.
            </p>
          </div>
        </div>

        {/* Seletor de simulação de erro */}
        <div className="flex items-center gap-1 bg-[#0f1013] p-1 rounded-lg border border-[#2b2e38]">
          <button
            onClick={() => handleModeChange('rotor_offset')}
            className={`px-2 py-1 text-[10px] font-mono rounded font-bold transition-all ${
              testMode === 'rotor_offset'
                ? 'bg-amber-500 text-black shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Desloca a posição inicial da roldana em apenas 1 letra"
          >
            Posição +1
          </button>
          <button
            onClick={() => handleModeChange('rotor_swap')}
            className={`px-2 py-1 text-[10px] font-mono rounded font-bold transition-all ${
              testMode === 'rotor_swap'
                ? 'bg-amber-500 text-black shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Troca a ordem dos rotores selecionados"
          >
            Rotor Trocado
          </button>
          <button
            onClick={() => handleModeChange('plug_error')}
            className={`px-2 py-1 text-[10px] font-mono rounded font-bold transition-all ${
              testMode === 'plug_error'
                ? 'bg-amber-500 text-black shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Conexão errada de cabos no plugboard"
          >
            Plugboard Errado
          </button>
        </div>
      </div>

      {/* Cifras sendo decifradas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2.5 rounded-lg bg-[#0e0f12] border border-[#262933] flex items-center justify-between">
          <span className="text-zinc-500 text-[11px]">Enigma Cifra:</span>
          <span className="text-amber-300 font-bold tracking-wider truncate max-w-[180px]">
            {targetCipher || 'ATAQUE'}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-[#0e0f12] border border-[#262933] flex items-center justify-between">
          <span className="text-zinc-500 text-[11px]">AES Ciphertext:</span>
          <span className="text-emerald-300 font-bold tracking-wider truncate max-w-[180px]">
            {sampleBundle?.ciphertextBase64.slice(0, 16) || '...'}...
          </span>
        </div>
      </div>

      {/* Grid Comparativo Lado a Lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Caso 1: Chave Correta */}
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
              <ShieldCheck size={14} />
              1. Com Chave Correta
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-700/60 font-bold">
              SINCRONIZADO
            </span>
          </div>

          {/* Resultado Enigma */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block">Enigma M3 (Decifrado):</span>
            <div className="p-2 rounded bg-[#0b100d] border border-emerald-900/50 text-xs font-mono text-emerald-200 font-bold break-all">
              {correctEnigmaPlain || '---'}
            </div>
          </div>

          {/* Resultado AES */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block">AES-256-GCM (Decifrado):</span>
            <div className="p-2 rounded bg-[#0b100d] border border-emerald-900/50 text-xs font-mono text-emerald-200 font-bold break-all">
              {correctAesResult || '---'}
            </div>
          </div>

          <p className="text-[10px] font-mono text-zinc-400 leading-tight">
            Ambos os sistemas revelam a mensagem original perfeita quando as chaves batem rigorosamente.
          </p>
        </div>

        {/* Caso 2: Chave Incorreta */}
        <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-800/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-red-400 uppercase flex items-center gap-1.5">
              <ShieldX size={14} />
              2. Com Chave Incorreta ({testMode === 'rotor_offset' ? 'Posição +1' : testMode === 'rotor_swap' ? 'Rotor Diferente' : 'Plug Errado'})
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-900/40 text-red-300 border border-red-700/60 font-bold">
              FALHA DE CHAVE
            </span>
          </div>

          {/* Resultado Enigma com Erro */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block">Enigma M3 (Texto Ilegível):</span>
            <div className="p-2 rounded bg-[#150a0a] border border-red-900/50 text-xs font-mono text-red-300 font-bold break-all">
              {wrongEnigmaPlain || '---'}
            </div>
          </div>

          {/* Resultado AES com Erro */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block">AES-256-GCM (Detecção de Violação):</span>
            <div className="p-2 rounded bg-[#150a0a] border border-red-900/50 text-xs font-mono text-red-400 font-semibold break-all flex items-center gap-1.5">
              <ShieldX size={13} className="shrink-0 text-red-400" />
              <span>{wrongAesResult.error || 'OperationError: MAC verification failed'}</span>
            </div>
          </div>

          <p className="text-[10px] font-mono text-zinc-400 leading-tight">
            <strong className="text-amber-300">Lição de Segurança:</strong> A Enigma cospe letras caóticas sem saber que errou a chave. O AES-GCM possui tag MAC autenticada e <strong>recusa o processamento</strong> imediatamente!
          </p>
        </div>
      </div>
    </div>
  );
};
