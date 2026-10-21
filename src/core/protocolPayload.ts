import type { EnigmaPayload, ModernEncryptedBundle } from '../types/crypto';
import { STATIONS } from './keySheet';

// Ordem explícita: a autenticação independe da ordem das propriedades do JSON recebido.
export function payloadAAD(data: Pick<EnigmaPayload, 'v' | 'net' | 'enigma'>): string {
  return JSON.stringify([data.v, data.net.src, data.net.dst, data.net.keyId, data.net.ts, data.enigma.ground, data.enigma.ct]);
}

export function bundleFromPayload(data: EnigmaPayload): ModernEncryptedBundle {
  return { ciphertextBase64: data.modern.ct, ivBase64: data.modern.iv,
    tagBase64: data.modern.tag, saltBase64: data.modern.salt, aad: payloadAAD(data), tampered: false };
}

export function serializePayload(data: EnigmaPayload): string {
  return JSON.stringify(deserializePayload(JSON.stringify(data)));
}

export function deserializePayload(raw: string): EnigmaPayload {
  try {
    if (raw.length > 12000) throw new Error('Pacote excede o limite de tamanho.');
    const p = JSON.parse(raw);
    const exact = (obj: unknown, fields: string[]) => !!obj && typeof obj === 'object' && !Array.isArray(obj)
      && Object.keys(obj).length === fields.length && fields.every(k => Object.hasOwn(obj, k));
    if (!exact(p, ['v', 'net', 'enigma', 'modern']) || p.v !== 2) throw new Error('Formato inválido. Use uma transmissão nova do protocolo v2.');
    if (!exact(p.net, ['src', 'dst', 'keyId', 'ts']) || !exact(p.enigma, ['ground', 'ct'])
      || !exact(p.modern, ['algo', 'iv', 'salt', 'tag', 'ct', 'keyDerivation'])) throw new Error('Campos ausentes ou não permitidos.');
    const station = (id: unknown) => STATIONS.some(s => s.id === id);
    if (!station(p.net.src) || !station(p.net.dst) || p.net.src === p.net.dst) throw new Error('Remetente ou destinatário inválido.');
    if (typeof p.net.keyId !== 'string' || !/^1944-06-(0[1-9]|[12][0-9]|30)$/.test(p.net.keyId)
      || !Number.isSafeInteger(p.net.ts) || p.net.ts <= 0) throw new Error('Cabeçalho inválido.');
    if (!Array.isArray(p.enigma.ground) || p.enigma.ground.length !== 3 || !p.enigma.ground.every((c: unknown) => typeof c === 'string' && /^[A-Z]$/.test(c))
      || typeof p.enigma.ct !== 'string' || !/^[A-Z]{1,2000}$/.test(p.enigma.ct)) throw new Error('Cifra ou posição inicial inválida.');
    const bytes = (v: unknown, length?: number) => {
      if (typeof v !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(v)) return false;
      const decoded = atob(v);
      return btoa(decoded) === v && (length === undefined ? decoded.length > 0 && decoded.length <= 8000 : decoded.length === length);
    };
    if (p.modern.algo !== 'AES-256-GCM' || p.modern.keyDerivation !== 'PBKDF2-SHA256-100000'
      || !bytes(p.modern.iv, 12) || !bytes(p.modern.salt, 16) || !bytes(p.modern.tag, 16) || !bytes(p.modern.ct)) throw new Error('Parâmetros AES inválidos ou incompletos.');
    return p as EnigmaPayload;
  } catch (err) {
    throw new Error(`Falha ao ler transmissão: ${err instanceof Error ? err.message : String(err)}`);
  }
}
