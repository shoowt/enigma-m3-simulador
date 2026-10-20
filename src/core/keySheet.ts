import type { DailyKey, Station } from '../types/crypto';

export const STATIONS: Station[] = [
  {
    id: 'ALPHA',
    name: 'Comando Alpha',
    callsign: 'HQ-BERLIN',
    role: 'Quartel General / Transmissão Central',
    color: '#eab308'
  },
  {
    id: 'U47',
    name: 'Submarino U-47',
    callsign: 'U-BOAT-47',
    role: 'Patrulha Atlântico Norte / Kriegmarine',
    color: '#06b6d4'
  },
  {
    id: 'BLETCHLEY',
    name: 'Bletchley Park',
    callsign: 'HUT-8-DECODE',
    role: 'Estação de Interceptação Britânica',
    color: '#10b981'
  },
  {
    id: 'OUTPOST',
    name: 'Posto Avançado',
    callsign: 'OUTPOST-7',
    role: 'Comunicações Táticas de Campo',
    color: '#f97316'
  }
];

export const MONTHLY_KEY_SHEET: DailyKey[] = [
  {
    day: 1,
    rotors: ['I', 'II', 'III'],
    rings: [1, 1, 1],
    reflector: 'UKW-B',
    plugs: ['AB', 'CD', 'EF', 'GH', 'IJ', 'KL', 'MN', 'OP', 'QR', 'ST'],
    indicatorGroup: 'WXC'
  },
  {
    day: 6, // Dia D - Operação Overlord
    rotors: ['III', 'II', 'I'],
    rings: [1, 1, 1],
    reflector: 'UKW-B',
    plugs: ['BQ', 'CR', 'DI', 'EJ', 'KW', 'MT', 'OS', 'PX', 'UZ', 'GH'],
    indicatorGroup: 'KAR'
  },
  {
    day: 14,
    rotors: ['IV', 'V', 'II'],
    rings: [12, 4, 19],
    reflector: 'UKW-B',
    plugs: ['AL', 'BM', 'CQ', 'DJ', 'ET', 'FX', 'GN', 'HR', 'IV', 'OS'],
    indicatorGroup: 'LSD'
  },
  {
    day: 22,
    rotors: ['II', 'IV', 'I'],
    rings: [5, 18, 9],
    reflector: 'UKW-C',
    plugs: ['AN', 'BO', 'CP', 'DQ', 'ER', 'FS', 'GT', 'HU', 'IV', 'JW'],
    indicatorGroup: 'ZRT'
  },
  {
    day: 30,
    rotors: ['V', 'I', 'III'],
    rings: [14, 26, 7],
    reflector: 'UKW-B',
    plugs: ['AZ', 'BY', 'CX', 'DW', 'EV', 'FU', 'GT', 'HS', 'IR', 'JQ'],
    indicatorGroup: 'QAZ'
  }
];

export function getDailyKey(day: number): DailyKey {
  const found = MONTHLY_KEY_SHEET.find(k => k.day === day);
  return found || MONTHLY_KEY_SHEET[1]; // Padrão dia 6
}
