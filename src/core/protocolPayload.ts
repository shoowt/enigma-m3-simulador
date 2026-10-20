import type { EnigmaPayload } from '../types/crypto';

export function serializePayload(data: EnigmaPayload): string {
  return JSON.stringify(data);
}

export function deserializePayload(raw: string): EnigmaPayload {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.enigma || !parsed.modern || !parsed.net) {
      throw new Error('Payload Airgap incompleto ou sem cabeçalho.');
    }
    return parsed as EnigmaPayload;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Falha ao decodificar QR Code Airgap: ${msg}`);
  }
}
