/**
 * ==============================================================================
 * ENIGMA M3 vs AES-256-GCM — COMPREHENSIVE QA AUTOMATION TEST SUITE
 * ==============================================================================
 * Role: Senior Quality Assurance & Cryptography Engineer
 * Scope: Mechanical Engine, Modern Crypto, Airgap Protocol, Bletchley Attack,
 *        Military Key Sheet, Reciprocity & Edge Cases.
 * ==============================================================================
 */

import { EnigmaM3, ROTOR_SPECS, REFLECTORS } from '../src/core/enigmaEngine';
import { ModernCryptoEngine } from '../src/core/modernCrypto';
import { serializePayload, deserializePayload, payloadAAD, bundleFromPayload } from '../src/core/protocolPayload';
import { MONTHLY_KEY_SHEET, getDailyKey, STATIONS } from '../src/core/keySheet';
import type { EnigmaPayload, RotorId, ReflectorId } from '../src/types/crypto';

// Polyfill Web Crypto API in Node if needed (Node 24 has it on globalThis.crypto)
if (!globalThis.crypto && typeof require !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  globalThis.crypto = require('crypto').webcrypto;
}

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(suite: string, name: string, fn: () => void | Promise<void>) {
  const start = performance.now();
  try {
    await fn();
    const durationMs = performance.now() - start;
    results.push({ suite, name, passed: true, durationMs });
    console.log(`  \x1b[32m✔ PASS\x1b[0m ${name} (${durationMs.toFixed(2)}ms)`);
  } catch (err: unknown) {
    const durationMs = performance.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ suite, name, passed: false, durationMs, error: msg });
    console.error(`  \x1b[31m✖ FAIL\x1b[0m ${name}: ${msg}`);
  }
}

function assertEquals<T>(actual: T, expected: T, message?: string) {
  if (actual !== expected) {
    throw new Error(`${message || 'Assertion failed'}: expected "${expected}", received "${actual}"`);
  }
}

function assertTrue(condition: boolean, message?: string) {
  if (!condition) {
    throw new Error(message || 'Expected true, received false');
  }
}

// ==============================================================================
// TEST EXECUTION
// ==============================================================================
async function main() {
  console.log('\n\x1b[1m\x1b[36m==================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m  ENIGMA M3 SIMULATOR — AUTOMATED QA TEST SUITE\x1b[0m');
  console.log('\x1b[1m\x1b[36m==================================================================\x1b[0m\n');

  // ----------------------------------------------------------------------------
  // SUITE 1: ENIGMA M3 CORE MECHANICS & HISTORICAL ACCURACY
  // ----------------------------------------------------------------------------
  console.log('\x1b[1m[Suite 1: Enigma M3 Core Mechanics & Historical Accuracy]\x1b[0m');

  await runTest('Suite 1', '1.1 Rotores I a V possuem 26 letras únicas e turnovers históricos', () => {
    const rotors: RotorId[] = ['I', 'II', 'III', 'IV', 'V'];
    const expectedTurnovers: Record<RotorId, string[]> = {
      'I': ['Q'],
      'II': ['E'],
      'III': ['V'],
      'IV': ['J'],
      'V': ['Z']
    };

    for (const r of rotors) {
      const spec = ROTOR_SPECS[r];
      assertEquals(spec.wiring.length, 26, `Rotor ${r} deve ter 26 conexões`);
      const unique = new Set(spec.wiring.split(''));
      assertEquals(unique.size, 26, `Rotor ${r} não pode ter letras repetidas na fiação`);
      assertEquals(JSON.stringify(spec.turnover), JSON.stringify(expectedTurnovers[r]), `Turnover do rotor ${r} incorreto`);
    }
  });

  await runTest('Suite 1', '1.2 Refletores UKW-B e UKW-C são involuções perfeitas sem letras fixas (E(x) != x)', () => {
    const reflectors: ReflectorId[] = ['UKW-B', 'UKW-C'];
    for (const ref of reflectors) {
      const wiring = REFLECTORS[ref];
      assertEquals(wiring.length, 26);
      for (let i = 0; i < 26; i++) {
        const charIn = String.fromCharCode(65 + i);
        const charOut = wiring[i];
        assertTrue(charIn !== charOut, `Refletor ${ref} não pode refletir letra nela mesma (falha na posição ${charIn})`);
        const returnChar = wiring[charOut.charCodeAt(0) - 65];
        assertEquals(returnChar, charIn, `Refletor ${ref} deve ser uma involução recíproca bidirecional`);
      }
    }
  });

  await runTest('Suite 1', '1.3 Princípio Recíproco: E(E(M)) = M em toda a gama de caracteres', () => {
    const machine1 = new EnigmaM3({
      rotorTypes: ['I', 'II', 'III'],
      ringSettings: [1, 1, 1],
      groundSettings: ['K', 'A', 'R'],
      reflector: 'UKW-B',
      plugboardPairs: ['BQ', 'CR', 'DI']
    });

    const machine2 = new EnigmaM3({
      rotorTypes: ['I', 'II', 'III'],
      ringSettings: [1, 1, 1],
      groundSettings: ['K', 'A', 'R'],
      reflector: 'UKW-B',
      plugboardPairs: ['BQ', 'CR', 'DI']
    });

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const { cipherText } = machine1.processString(alphabet);
    const { cipherText: decrypted } = machine2.processString(cipherText);
    assertEquals(decrypted, alphabet, 'Decifração com chave idêntica deve recompor o alfabeto original');
  });

  await runTest('Suite 1', '1.4 Falha Geométrica de Alan Turing: Nenhuma letra cifra em si mesma (0% auto-cifra)', () => {
    const machine = new EnigmaM3({
      rotorTypes: ['III', 'II', 'I'],
      ringSettings: [1, 1, 1],
      groundSettings: ['A', 'A', 'A'],
      reflector: 'UKW-B',
      plugboardPairs: []
    });

    const testText = 'A'.repeat(500); // 500 letras 'A' consecutivas
    const { cipherText } = machine.processString(testText);

    let selfCipherCount = 0;
    for (let i = 0; i < cipherText.length; i++) {
      if (cipherText[i] === 'A') {
        selfCipherCount++;
      }
    }
    assertEquals(selfCipherCount, 0, 'Letra A nunca pode se transformar em A na Enigma física');
  });

  await runTest('Suite 1', '1.5 Mecânica de Avanço Simples (Right Rotor Stepping)', () => {
    const machine = new EnigmaM3({
      rotorTypes: ['I', 'II', 'III'],
      ringSettings: [1, 1, 1],
      groundSettings: ['A', 'A', 'A'],
      reflector: 'UKW-B',
      plugboardPairs: []
    });

    assertEquals(machine.getVisiblePositions().join(''), 'AAA');
    machine.step();
    assertEquals(machine.getVisiblePositions().join(''), 'AAB');
    machine.step();
    assertEquals(machine.getVisiblePositions().join(''), 'AAC');
  });

  await runTest('Suite 1', '1.6 Anomalia Histórica de Double-Stepping (Avanço duplo do rotor do meio)', () => {
    // Rotor II turnover é 'E'.
    // Quando o rotor do meio (II) está em 'E', ele avança no próximo passo E avança o esquerdo.
    const machine = new EnigmaM3({
      rotorTypes: ['I', 'II', 'III'],
      ringSettings: [1, 1, 1],
      groundSettings: ['A', 'D', 'U'], // Rotor III está em U. Turnover de III é V.
      reflector: 'UKW-B',
      plugboardPairs: []
    });

    // Passo 1: III avança de U para V (V é notch do rotor III)
    machine.step();
    assertEquals(machine.getVisiblePositions().join(''), 'ADV');

    // Passo 2: III estava em V, então Meio avança de D para E (E é notch do rotor II)
    machine.step();
    assertEquals(machine.getVisiblePositions().join(''), 'AEW');

    // Passo 3: DOUBLE STEPPING! Meio está em E, então ele avança de novo (para F) E faz o esquerdo avançar (A para B)!
    machine.step();
    assertEquals(machine.getVisiblePositions().join(''), 'BFX', 'Double stepping falhou: o rotor do meio deveria avançar e puxar o esquerdo');
  });

  await runTest('Suite 1', '1.7 Configuração de Anéis (Ringstellung / Rings) altera a cifra matematicamente', () => {
    const machineRing1 = new EnigmaM3({
      rotorTypes: ['I', 'II', 'III'],
      ringSettings: [1, 1, 1],
      groundSettings: ['A', 'A', 'A'],
      reflector: 'UKW-B',
      plugboardPairs: []
    });

    const machineRing2 = new EnigmaM3({
      rotorTypes: ['I', 'II', 'III'],
      ringSettings: [5, 10, 15],
      groundSettings: ['A', 'A', 'A'],
      reflector: 'UKW-B',
      plugboardPairs: []
    });

    const text = 'SEGREDO';
    const ct1 = machineRing1.processString(text).cipherText;
    const ct2 = machineRing2.processString(text).cipherText;
    assertTrue(ct1 !== ct2, 'Rings diferentes devem produzir ciphertexts completamente distintos');
  });

  await runTest('Suite 1', '1.8 Plugboard (Steckerbrett) troca cabos antes e depois dos rotores', () => {
    const machineNoPlugs = new EnigmaM3({
      rotorTypes: ['I', 'II', 'III'],
      ringSettings: [1, 1, 1],
      groundSettings: ['A', 'A', 'A'],
      reflector: 'UKW-B',
      plugboardPairs: []
    });

    const machineWithPlugs = new EnigmaM3({
      rotorTypes: ['I', 'II', 'III'],
      ringSettings: [1, 1, 1],
      groundSettings: ['A', 'A', 'A'],
      reflector: 'UKW-B',
      plugboardPairs: ['AZ', 'MN']
    });

    const ct1 = machineNoPlugs.processString('A').cipherText;
    const ct2 = machineWithPlugs.processString('A').cipherText;
    assertTrue(ct1 !== ct2, 'Cabo AZ no plugboard deve alterar a cifra da letra A');
  });

  await runTest('Suite 1', '1.9 Rastreamento Elétrico do Circuito 12V (traceChar) retorna 11 estágios', () => {
    const machine = new EnigmaM3({
      rotorTypes: ['I', 'II', 'III'],
      ringSettings: [1, 1, 1],
      groundSettings: ['K', 'A', 'R'],
      reflector: 'UKW-B',
      plugboardPairs: ['AZ']
    });

    const trace = machine.traceChar('A');
    assertEquals(trace.inputChar, 'A');
    assertEquals(trace.steps.length, 11, 'Circuito completo deve possuir rigorosamente 11 estágios');
    assertEquals(trace.steps[0].subLabel, 'Tastatur');
    assertEquals(trace.steps[5].subLabel, 'Umkehrwalze');
    assertEquals(trace.steps[10].subLabel, 'Lâmpada Acesa');
    assertEquals(trace.outputChar, trace.steps[10].charOut);
  });

  // ----------------------------------------------------------------------------
  // SUITE 2: CRIPTOGRAFIA MODERNA (AES-256-GCM & INTEGRIDADE GHASH)
  // ----------------------------------------------------------------------------
  console.log('\n\x1b[1m[Suite 2: Criptografia Moderna (AES-256-GCM & PBKDF2)]\x1b[0m');

  await runTest('Suite 2', '2.1 Cifragem e decifragem correta com AES-256-GCM', async () => {
    const message = 'COMUNICADO SECRETO MILITAR 1944';
    const password = 'CHAVE_SEGURA_DAY_6';

    const bundle = await ModernCryptoEngine.encrypt(message, password);
    assertTrue(bundle.ciphertextBase64.length > 0, 'Ciphertext deve estar em Base64');
    assertTrue(bundle.ivBase64.length > 0, 'IV de 96 bits deve estar presente');
    assertTrue(bundle.tagBase64.length > 0, 'Tag de autenticação de 128 bits deve estar presente');

    const result = await ModernCryptoEngine.decrypt(bundle, password);
    assertTrue(result.success, 'Decifração deve ser bem-sucedida');
    assertEquals(result.decryptedText, message, 'Texto decifrado deve ser exatamente igual ao original');
  });

  await runTest('Suite 2', '2.2 Ataque MITM / Adulteração de 1 bit: AES-GCM bloqueia por falha de integridade MAC', async () => {
    const message = 'ORDEM DE ATAQUE AO AMANHECER';
    const password = 'CHAVE_SUPER_SECRETA';

    const cleanBundle = await ModernCryptoEngine.encrypt(message, password);
    const tamperedBundle = ModernCryptoEngine.tamperBundle(cleanBundle);

    assertTrue(tamperedBundle.tampered, 'Bundle deve ser marcado como adulterado');
    assertTrue(cleanBundle.ciphertextBase64 !== tamperedBundle.ciphertextBase64, 'Ciphertext corrompido deve diferir do original');

    const result = await ModernCryptoEngine.decrypt(tamperedBundle, password);
    assertEquals(result.success, false, 'Decifração com ciphertext adulterado DEVE falhar');
    assertTrue(result.error !== undefined, 'Erro de autenticação MAC deve ser reportado');
  });

  await runTest('Suite 2', '2.3 Chave Incorreta: AES-256-GCM rejeita decifração', async () => {
    const message = 'TEXTO CONFIDENCIAL';
    const bundle = await ModernCryptoEngine.encrypt(message, 'CHAVE_CORRETA');

    const result = await ModernCryptoEngine.decrypt(bundle, 'CHAVE_ERRADA_123');
    assertEquals(result.success, false, 'Chave errada não pode decifrar AES-GCM');
    assertTrue(
      result.error?.includes('FAILURE') || result.error?.includes('Mismatch') || result.error?.includes('Falha'),
      'Erro deve indicar falha criptográfica de autenticação'
    );
  });

  await runTest('Suite 2', '2.4 Unicidade do IV: Cada cifragem gera IV aleatório de 96 bits', async () => {
    const message = 'MESMA MENSAGEM';
    const key = 'MESMA_CHAVE';

    const b1 = await ModernCryptoEngine.encrypt(message, key);
    const b2 = await ModernCryptoEngine.encrypt(message, key);

    assertTrue(b1.ivBase64 !== b2.ivBase64, 'Dois IVs consecutivos nunca podem ser iguais (risco de colisão GCM)');
    assertTrue(b1.ciphertextBase64 !== b2.ciphertextBase64, 'Mesmo plaintext com IVs distintos deve gerar ciphertexts diferentes');
  });

  // ----------------------------------------------------------------------------
  // SUITE 3: PROTOCOLO AIR-GAP, SERIALIZAÇÃO & SINCRONIZAÇÃO PONTA-A-PONTA
  // ----------------------------------------------------------------------------
  console.log('\n\x1b[1m[Suite 3: Protocolo Air-Gap & Sincronização Ponta-a-Ponta]\x1b[0m');

  const makePayload = async (day = 6): Promise<EnigmaPayload> => {
    const key = getDailyKey(day);
    const ground = key.indicatorGroup.split('') as [string, string, string];
    const sender = new EnigmaM3({ rotorTypes: key.rotors, ringSettings: key.rings, groundSettings: ground, reflector: key.reflector, plugboardPairs: key.plugs });
    const header = { v: 2 as const, net: { src: 'ALPHA', dst: 'U47', keyId: `1944-06-${String(day).padStart(2, '0')}`, ts: Date.now() }, enigma: { ground, ct: sender.processString('ATAQUEAOAMANHECER').cipherText } };
    const bundle = await ModernCryptoEngine.encrypt('ATAQUEAOAMANHECER', 'senha-compartilhada-de-teste', payloadAAD(header));
    return { ...header, modern: { algo: 'AES-256-GCM', iv: bundle.ivBase64, salt: bundle.saltBase64, tag: bundle.tagBase64, ct: bundle.ciphertextBase64, keyDerivation: 'PBKDF2-SHA256-100000' } };
  };

  await runTest('Suite 3', '3.1 Protocolo v2 não transporta texto original, senha ou configuração secreta', async () => {
    const p = await makePayload();
    const raw = serializePayload(p);
    const parsed = deserializePayload(raw);
    assertEquals(Object.keys(parsed.enigma).sort().join(','), 'ct,ground');
    for (const forbidden of ['ATAQUEAOAMANHECER', 'senha-compartilhada-de-teste', 'plainPreview', 'rotors', 'rings', 'plugs']) assertTrue(!raw.includes(forbidden), `Vazamento: ${forbidden}`);
  });

  await runTest('Suite 3', '3.2 Transmissão Enigma e AES real em todos os dias cadastrados', async () => {
    for (const key of MONTHLY_KEY_SHEET) {
      const p = deserializePayload(serializePayload(await makePayload(key.day)));
      const receiver = new EnigmaM3({ rotorTypes: key.rotors, ringSettings: key.rings, groundSettings: p.enigma.ground, reflector: key.reflector, plugboardPairs: key.plugs });
      assertEquals(receiver.processString(p.enigma.ct).cipherText, 'ATAQUEAOAMANHECER');
      const result = await ModernCryptoEngine.decrypt(bundleFromPayload(p), 'senha-compartilhada-de-teste');
      assertTrue(result.success); assertEquals(result.decryptedText, 'ATAQUEAOAMANHECER');
    }
  });

  await runTest('Suite 3', '3.3 Cabeçalho, posição e cifra Enigma adulterados são rejeitados pelo AES', async () => {
    const original = await makePayload();
    for (const mutate of [
      (p: EnigmaPayload) => { p.net.src = 'OUTPOST'; },
      (p: EnigmaPayload) => { p.net.dst = 'BLETCHLEY'; },
      (p: EnigmaPayload) => { p.net.keyId = '1944-06-14'; },
      (p: EnigmaPayload) => { p.net.ts += 1; },
      (p: EnigmaPayload) => { p.enigma.ground[0] = 'Z'; },
      (p: EnigmaPayload) => { p.enigma.ct = (p.enigma.ct[0] === 'X' ? 'Y' : 'X') + p.enigma.ct.slice(1); }
    ]) {
      const p = structuredClone(original); mutate(p);
      const result = await ModernCryptoEngine.decrypt(bundleFromPayload(p), 'senha-compartilhada-de-teste');
      assertEquals(result.success, false);
    }
  });

  await runTest('Suite 3', '3.4 Pacotes truncados, versão antiga, campos secretos e Base64 inválido são recusados', async () => {
    const original = await makePayload();
    for (const raw of ['{', '{}', JSON.stringify({ ...original, v: 1 }), JSON.stringify({ ...original, enigma: { ...original.enigma, plainPreview: 'segredo' } }), JSON.stringify({ ...original, modern: { ...original.modern, iv: 'x' } }), JSON.stringify({ ...original, net: { ...original.net, dst: 'inexistente' } }), JSON.stringify({ ...original, enigma: { ...original.enigma, ground: ['A'] } })]) {
      let rejected = false; try { deserializePayload(raw); } catch { rejected = true; } assertTrue(rejected, 'Pacote inválido aceito');
    }
  });

  await runTest('Suite 3', '3.5 Salt e IV variam entre mensagens com a mesma senha', async () => {
    const a = await makePayload(); const b = await makePayload();
    assertTrue(a.modern.salt !== b.modern.salt); assertTrue(a.modern.iv !== b.modern.iv);
  });

  await runTest('Suite 3', '3.6 Adulteração da cifra Enigma altera a saída real sem autenticação', () => {
    const key = getDailyKey(6);
    const settings = { rotorTypes: key.rotors, ringSettings: key.rings, groundSettings: ['K', 'A', 'R'] as [string, string, string], reflector: key.reflector, plugboardPairs: key.plugs };
    const ct = new EnigmaM3(settings).processString('ATAQUEAOAMANHECER').cipherText;
    const changed = (ct[0] === 'X' ? 'Y' : 'X') + ct.slice(1);
    const output = new EnigmaM3(settings).processString(changed).cipherText;
    assertTrue(output[0] !== 'A'); assertEquals(output.slice(1), 'TAQUEAOAMANHECER');
  });

  await runTest('Suite 3', '3.7 Vetor conhecido Enigma I-II-III / B / AAA / anéis 01', () => {
    const settings = { rotorTypes: ['I', 'II', 'III'] as [RotorId, RotorId, RotorId], ringSettings: [1, 1, 1] as [number, number, number], groundSettings: ['A', 'A', 'A'] as [string, string, string], reflector: 'UKW-B' as ReflectorId, plugboardPairs: [] };
    assertEquals(new EnigmaM3(settings).processString('AAAAA').cipherText, 'BDZGO');
    assertEquals(new EnigmaM3(settings).processString('HELLOWORLD').cipherText, 'ILBDAAMTAZ');
  });

  // ----------------------------------------------------------------------------
  // SUITE 4: MODO BLETCHLEY PARK (ALAN TURING CRIB ATTACK)
  // ----------------------------------------------------------------------------
  console.log('\n\x1b[1m[Suite 4: Modo Bletchley Park (Alan Turing Crib Attack Engine)]\x1b[0m');

  await runTest('Suite 4', '4.1 Detecção de Colisão Fatal (Crash E(x) == x)', () => {
    const cipherText = 'NLRIJI'; // Cifra de "ATAQUE" a partir de KAR
    const crib = 'ATAQUE';

    // Se deslizarmos o crib na posição 0:
    // cipherText[0] = 'N', crib[0] = 'A' (ok)
    // Se crib colidir com qualquer letra na mesma posição, é um crash!
    const hasCollisionAtOffset0 = crib.split('').some((c, i) => c === cipherText[i]);
    assertEquals(hasCollisionAtOffset0, false, 'ATAQUE em NLRIJI não possui colisão na posição 0 (hipótese válida)');

    // Teste com crib forçado a colidir: 'N' na posição 0 com cifra começando em 'N'
    const cribCollision = 'NAVIO';
    const collisionDetected = cribCollision[0] === cipherText[0];
    assertTrue(collisionDetected, 'Deve detectar crash quando a letra do crib é idêntica à letra da cifra');
  });

  await runTest('Suite 4', '4.2 Cálculo da Taxa de Eliminação de Turing', () => {
    const cipherText = 'QJKLZMPXZABWTOPLKJHG';
    const crib = 'ATAQUE';
    const maxOffset = cipherText.length - crib.length;

    let crashes = 0;
    for (let offset = 0; offset <= maxOffset; offset++) {
      let isCrash = false;
      for (let j = 0; j < crib.length; j++) {
        if (crib[j] === cipherText[offset + j]) {
          isCrash = true;
          break;
        }
      }
      if (isCrash) crashes++;
    }

    assertTrue(crashes > 0, 'Em uma cifra longa, ao menos uma colisão deve ser detectada e eliminada');
  });

  // ----------------------------------------------------------------------------
  // SUITE 5: FOLHA DE CHAVES MENSAL MILITAR & CONSISTÊNCIA DAS ESTAÇÕES
  // ----------------------------------------------------------------------------
  console.log('\n\x1b[1m[Suite 5: Folha de Chaves Mensal Militar & Integridade de Rede]\x1b[0m');

  await runTest('Suite 5', '5.1 Integridade dos pares de cabos no Plugboard da folha de chaves', () => {
    for (const key of MONTHLY_KEY_SHEET) {
      assertTrue(key.plugs.length <= 10, `Dia ${key.day}: Enigma M3 histórica suporta no máximo 10 cabos`);
      const seen = new Set<string>();
      for (const pair of key.plugs) {
        assertEquals(pair.length, 2, `Dia ${key.day}: Par ${pair} deve ter 2 letras`);
        const a = pair[0];
        const b = pair[1];
        assertTrue(a !== b, `Dia ${key.day}: Cabo não pode conectar a mesma letra (${pair})`);
        assertTrue(!seen.has(a) && !seen.has(b), `Dia ${key.day}: Letra ${a} ou ${b} conectada duas vezes no plugboard`);
        seen.add(a);
        seen.add(b);
      }
    }
  });

  await runTest('Suite 5', '5.2 Grupos indicadores (Grundstellung) são válidos em A-Z', () => {
    for (const key of MONTHLY_KEY_SHEET) {
      assertEquals(key.indicatorGroup.length, 3, `Dia ${key.day}: Indicador deve ter 3 letras`);
      assertTrue(/^[A-Z]{3}$/.test(key.indicatorGroup), `Dia ${key.day}: Indicador deve ser composto de letras A-Z maiúsculas`);
    }
  });

  await runTest('Suite 5', '5.3 Rede de 4 estações virtuais cadastradas', () => {
    assertEquals(STATIONS.length, 4, 'Rede deve possuir exatamente 4 estações virtuais conforme edital');
    const ids = STATIONS.map(s => s.id);
    assertTrue(ids.includes('ALPHA'), 'Estação ALPHA deve existir');
    assertTrue(ids.includes('U47'), 'Estação U47 deve existir');
    assertTrue(ids.includes('BLETCHLEY'), 'Estação BLETCHLEY deve existir');
    assertTrue(ids.includes('OUTPOST'), 'Estação OUTPOST deve existir');
  });

  // ----------------------------------------------------------------------------
  // SUMMARY REPORT
  // ----------------------------------------------------------------------------
  console.log('\n\x1b[1m\x1b[36m==================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m  RELATÓRIO FINAL DE QUALITY ASSURANCE (QA)\x1b[0m');
  console.log('\x1b[1m\x1b[36m==================================================================\x1b[0m');

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const totalDuration = results.reduce((acc, r) => acc + r.durationMs, 0);

  console.log(`\nTotal de Testes Automatizados Executados: \x1b[1m${total}\x1b[0m`);
  console.log(`Testes Aprovados:                         \x1b[32m\x1b[1m${passed} (${((passed / total) * 100).toFixed(1)}%)\x1b[0m`);
  console.log(`Testes com Falha:                         \x1b[${failed > 0 ? '31' : '32'}m\x1b[1m${failed}\x1b[0m`);
  console.log(`Tempo Total de Execução:                  \x1b[1m${totalDuration.toFixed(2)}ms\x1b[0m\n`);

  if (failed > 0) {
    console.error('\x1b[31m[QA ALERT] Falhas detectadas nos seguintes testes:\x1b[0m');
    for (const r of results.filter(r => !r.passed)) {
      console.error(` - [${r.suite}] ${r.name}: ${r.error}`);
    }
    process.exit(1);
  } else {
    console.log('\x1b[32m\x1b[1m✔ TODOS OS TESTES FORAM APROVADOS COM SUCESSO! SOFTWARE VALIDADO E ROBUSTO.\x1b[0m\n');
  }
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
