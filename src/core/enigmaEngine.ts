import type { MachineSettings, ReflectorId, RotorConfig, RotorId } from '../types/crypto';

export const ROTOR_SPECS: Record<RotorId, RotorConfig> = {
  'I':   { wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', turnover: ['Q'] },
  'II':  { wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', turnover: ['E'] },
  'III': { wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', turnover: ['V'] },
  'IV':  { wiring: 'ESOVPZJAYQUIRHXLNFTGKDCMWB', turnover: ['J'] },
  'V':   { wiring: 'VZBRGITYUPSDNHLXAWMJQOFECK', turnover: ['Z'] }
};

export const REFLECTORS: Record<ReflectorId, string> = {
  'UKW-B': 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
  'UKW-C': 'FVPJIAOYEDRZXWGCTKUQSBNMHL'
};

export class EnigmaM3 {
  private rotorWiring: [string, string, string];
  private turnovers: [string[], string[], string[]];
  private positions: [number, number, number]; // 0 a 25
  private ringSettings: [number, number, number]; // 0 a 25
  private reflectorWiring: string;
  private plugboardMap: number[];
  public rotorTypes: [RotorId, RotorId, RotorId];
  public reflector: ReflectorId;

  constructor(settings: MachineSettings) {
    this.rotorTypes = [...settings.rotorTypes];
    this.reflector = settings.reflector;

    this.rotorWiring = [
      ROTOR_SPECS[settings.rotorTypes[0]].wiring,
      ROTOR_SPECS[settings.rotorTypes[1]].wiring,
      ROTOR_SPECS[settings.rotorTypes[2]].wiring
    ];

    this.turnovers = [
      ROTOR_SPECS[settings.rotorTypes[0]].turnover,
      ROTOR_SPECS[settings.rotorTypes[1]].turnover,
      ROTOR_SPECS[settings.rotorTypes[2]].turnover
    ];

    this.positions = [
      this.charToMod(settings.groundSettings[0]),
      this.charToMod(settings.groundSettings[1]),
      this.charToMod(settings.groundSettings[2])
    ];

    this.ringSettings = [
      (settings.ringSettings[0] - 1 + 26) % 26,
      (settings.ringSettings[1] - 1 + 26) % 26,
      (settings.ringSettings[2] - 1 + 26) % 26
    ];

    this.reflectorWiring = REFLECTORS[settings.reflector];
    this.plugboardMap = this.buildPlugboard(settings.plugboardPairs);
  }

  private charToMod(c: string): number {
    return (c.toUpperCase().charCodeAt(0) - 65 + 26) % 26;
  }

  private modToChar(n: number): string {
    return String.fromCharCode(((n % 26) + 26) % 26 + 65);
  }

  public buildPlugboard(pairs: string[]): number[] {
    const map = Array.from({ length: 26 }, (_, i) => i);
    const seen = new Set<number>();

    for (const rawPair of pairs) {
      const pair = rawPair.trim().toUpperCase();
      if (pair.length !== 2) continue;
      const a = this.charToMod(pair[0]);
      const b = this.charToMod(pair[1]);
      if (a === b) continue;
      if (seen.has(a) || seen.has(b)) {
        continue;
      }
      seen.add(a);
      seen.add(b);
      map[a] = b;
      map[b] = a;
    }
    return map;
  }

  /**
   * Mecânica de avanço mecânico com a anomalia histórica do Double-Stepping:
   * 1. O rotor direito (fast) sempre avança a cada tecla.
   * 2. O rotor do meio avança se o rotor direito estava na sua posição de corte (notch/turnover).
   * 3. Anomalia do Double-Stepping: se o rotor do MEIO está no seu próprio corte (notch),
   *    ele avança novamente E faz o rotor esquerdo avançar simultaneamente.
   */
  public step(): void {
    const rightTurnover = this.turnovers[2].map(c => this.charToMod(c));
    const middleTurnover = this.turnovers[1].map(c => this.charToMod(c));

    const rightAtNotch = rightTurnover.includes(this.positions[2]);
    const middleAtNotch = middleTurnover.includes(this.positions[1]);

    if (middleAtNotch) {
      this.positions[0] = (this.positions[0] + 1) % 26; // Esquerdo avança
      this.positions[1] = (this.positions[1] + 1) % 26; // Meio avança (double step!)
    } else if (rightAtNotch) {
      this.positions[1] = (this.positions[1] + 1) % 26; // Meio avança normalmente
    }

    // O rotor da direita avança a cada tecla
    this.positions[2] = (this.positions[2] + 1) % 26;
  }

  public getVisiblePositions(): [string, string, string] {
    return [
      this.modToChar(this.positions[0]),
      this.modToChar(this.positions[1]),
      this.modToChar(this.positions[2])
    ];
  }

  public setVisiblePositions(pos: [string, string, string]): void {
    this.positions = [
      this.charToMod(pos[0]),
      this.charToMod(pos[1]),
      this.charToMod(pos[2])
    ];
  }

  public rotateRotorManually(rotorIndex: 0 | 1 | 2, delta: number): [string, string, string] {
    this.positions[rotorIndex] = (this.positions[rotorIndex] + delta + 26) % 26;
    return this.getVisiblePositions();
  }

  public updateSettings(settings: Partial<MachineSettings>): void {
    if (settings.rotorTypes) {
      this.rotorTypes = [...settings.rotorTypes];
      this.rotorWiring = [
        ROTOR_SPECS[settings.rotorTypes[0]].wiring,
        ROTOR_SPECS[settings.rotorTypes[1]].wiring,
        ROTOR_SPECS[settings.rotorTypes[2]].wiring
      ];
      this.turnovers = [
        ROTOR_SPECS[settings.rotorTypes[0]].turnover,
        ROTOR_SPECS[settings.rotorTypes[1]].turnover,
        ROTOR_SPECS[settings.rotorTypes[2]].turnover
      ];
    }
    if (settings.reflector) {
      this.reflector = settings.reflector;
      this.reflectorWiring = REFLECTORS[settings.reflector];
    }
    if (settings.ringSettings) {
      this.ringSettings = [
        (settings.ringSettings[0] - 1 + 26) % 26,
        (settings.ringSettings[1] - 1 + 26) % 26,
        (settings.ringSettings[2] - 1 + 26) % 26
      ];
    }
    if (settings.groundSettings) {
      this.setVisiblePositions(settings.groundSettings);
    }
    if (settings.plugboardPairs) {
      this.plugboardMap = this.buildPlugboard(settings.plugboardPairs);
    }
  }

  private passForward(pin: number, rotorIdx: number): number {
    const pos = this.positions[rotorIdx];
    const ring = this.ringSettings[rotorIdx];
    const offset = pos - ring;

    const inputPin = ((pin + offset) % 26 + 26) % 26;
    const wiredLetter = this.rotorWiring[rotorIdx][inputPin];
    const outputPin = this.charToMod(wiredLetter);

    return ((outputPin - offset) % 26 + 26) % 26;
  }

  private passBackward(pin: number, rotorIdx: number): number {
    const pos = this.positions[rotorIdx];
    const ring = this.ringSettings[rotorIdx];
    const offset = pos - ring;

    const inputPin = ((pin + offset) % 26 + 26) % 26;
    const charToFind = this.modToChar(inputPin);
    const outputPin = this.rotorWiring[rotorIdx].indexOf(charToFind);

    return ((outputPin - offset) % 26 + 26) % 26;
  }

  /**
   * Cifra um único caractere e avança a máquina.
   * Retorna a letra cifrada e as novas posições visíveis dos rotores.
   */
  public encryptChar(char: string): { cipherChar: string; newPositions: [string, string, string] } {
    const upper = char.toUpperCase();
    if (upper < 'A' || upper > 'Z') {
      return { cipherChar: upper, newPositions: this.getVisiblePositions() };
    }

    // 1. Passo mecânico ocorre ANTES do sinal elétrico
    this.step();

    // 2. Entrada no Plugboard (Steckerbrett)
    let signal = this.plugboardMap[this.charToMod(upper)];

    // 3. Ida pelos Rotores (Direita -> Meio -> Esquerda)
    signal = this.passForward(signal, 2);
    signal = this.passForward(signal, 1);
    signal = this.passForward(signal, 0);

    // 4. Refletor (UKW)
    const reflectedChar = this.reflectorWiring[signal];
    signal = this.charToMod(reflectedChar);

    // 5. Retorno pelos Rotores (Esquerda -> Meio -> Direita)
    signal = this.passBackward(signal, 0);
    signal = this.passBackward(signal, 1);
    signal = this.passBackward(signal, 2);

    // 6. Saída pelo Plugboard para a Lâmpada
    signal = this.plugboardMap[signal];

    const cipherChar = this.modToChar(signal);

    return {
      cipherChar,
      newPositions: this.getVisiblePositions()
    };
  }

  /**
   * Processa uma sequência inteira de texto, retornando o texto cifrado
   */
  public processString(text: string): { cipherText: string; finalPositions: [string, string, string] } {
    let result = '';
    for (const ch of text) {
      if (ch === ' ' || ch === '\n') {
        result += ch;
        continue;
      }
      const upper = ch.toUpperCase();
      if (upper >= 'A' && upper <= 'Z') {
        const { cipherChar } = this.encryptChar(upper);
        result += cipherChar;
      }
    }
    return {
      cipherText: result,
      finalPositions: this.getVisiblePositions()
    };
  }

  /**
   * Clona o estado atual da máquina para simulações
   */
  public clone(): EnigmaM3 {
    const curPos = this.getVisiblePositions();
    const cloned = new EnigmaM3({
      rotorTypes: [...this.rotorTypes],
      ringSettings: [this.ringSettings[0] + 1, this.ringSettings[1] + 1, this.ringSettings[2] + 1],
      groundSettings: curPos,
      reflector: this.reflector,
      plugboardPairs: []
    });
    cloned.plugboardMap = [...this.plugboardMap];
    return cloned;
  }
}
