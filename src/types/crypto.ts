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
}

export interface EnigmaPayload {
  v: number;
  net: {
    src: string;
    dst: string;
    keyId: string;
    ts: number;
  };
  enigma: {
    rotors: [RotorId, RotorId, RotorId];
    rings: [number, number, number];
    ground: [string, string, string];
    reflector?: ReflectorId;
    plugs: string;
    ct: string;
    plainPreview?: string;
  };
  modern: {
    algo: 'AES-256-GCM';
    iv: string;
    tag: string;
    ct: string;
    keyDerivation: string;
  };
  tampered?: boolean;
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

