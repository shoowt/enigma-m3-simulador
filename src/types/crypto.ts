export type RotorId = 'I' | 'II' | 'III' | 'IV' | 'V';
export type ReflectorId = 'UKW-B' | 'UKW-C';

export interface RotorConfig {
  wiring: string;
  turnover: string[];
}

export interface MachineSettings {
  rotorTypes: [RotorId, RotorId, RotorId]; // [Esquerda, Meio, Direita]
  ringSettings: [number, number, number];  // 1-26
  groundSettings: [string, string, string]; // Posições visíveis A-Z
  reflector: ReflectorId;
  plugboardPairs: string[]; // Ex: ["BQ", "CR", "DI", ...] Max 10 pares
}

export interface ModernEncryptedBundle {
  ciphertextBase64: string;
  ivBase64: string;
  tagBase64: string;
  tampered: boolean;
  saltBase64: string;
  aad?: string;
}

export interface EnigmaPayload {
  v: 2;
  net: { src: string; dst: string; keyId: string; ts: number };
  enigma: { ground: [string, string, string]; ct: string };
  modern: {
    algo: 'AES-256-GCM'; iv: string; salt: string; tag: string; ct: string;
    keyDerivation: 'PBKDF2-SHA256-100000';
  };
}

export interface DailyKey {
  day: number;
  rotors: [RotorId, RotorId, RotorId];
  rings: [number, number, number];
  reflector: ReflectorId;
  plugs: string[];
  indicatorGroup: string;
}

export interface Station {
  id: string;
  name: string;
  callsign: string;
  role: string;
  color: string;
}

export interface CircuitTraceStep {
  stage: string;
  subLabel: string;
  charIn: string;
  charOut: string;
  description: string;
}

export interface CircuitTrace {
  inputChar: string;
  outputChar: string;
  rotorPositions: [string, string, string];
  steps: CircuitTraceStep[];
}

