export interface TesterRosterItem {
  code: string;
  name: string;
  nickname: string;
}

export const TESTER_ROSTER: TesterRosterItem[] = [
  { code: 'X5-MEMBER-96747', name: 'Ramsky', nickname: '-RamsX5' },
  { code: 'X5-MEMBER-44824', name: 'Fadel', nickname: '-FaskyX5' },
  { code: 'X5-MEMBER-12421', name: 'Iqbal', nickname: 'imbaddie13-X5' },
  { code: 'X5-MEMBER-53161', name: 'Dewi', nickname: 'DeskyX5cF-v1' },
  { code: 'X5-MEMBER-31768', name: 'Pina', nickname: 'SakuraX5-REN' },
  { code: 'X5-MEMBER-58291', name: 'Claudia', nickname: 'GgCloud-X5' },
  { code: 'X5-MEMBER-72631', name: 'Dena', nickname: 'DENAX5-REN' },
  { code: 'X5-MEMBER-73912', name: 'Wicaksono', nickname: '-WiskyX5' },
  { code: 'X5-MEMBER-46241', name: 'Wale', nickname: 'N1KAX5-' },
  { code: 'X5-MEMBER-13486', name: 'Zarah', nickname: 'gdCANNA-X5' },
  { code: 'X5-MEMBER-76631', name: 'Misel', nickname: '-lesimX5' },
  { code: 'X5-MEMBER-72978', name: 'Grace', nickname: 'REN-grecX5-nLv' },
];

const CODE_TO_TESTER = new Map<string, TesterRosterItem>();
const NAME_TO_CODE = new Map<string, string>();

for (const t of TESTER_ROSTER) {
  CODE_TO_TESTER.set(t.code.toUpperCase(), t);
  NAME_TO_CODE.set(t.name.toLowerCase(), t.code);
  NAME_TO_CODE.set(t.nickname.toLowerCase(), t.code);
}

// Aliases for common variations
NAME_TO_CODE.set('fadhel', 'X5-MEMBER-44824');
NAME_TO_CODE.set('grecia', 'X5-MEMBER-72978');
NAME_TO_CODE.set('pina pinya', 'X5-MEMBER-31768');
NAME_TO_CODE.set('rizky wicaksono', 'X5-MEMBER-73912');
NAME_TO_CODE.set('ramskyyyyyy', 'X5-MEMBER-96747');

export function getTesterByCode(code?: string | null): TesterRosterItem | undefined {
  if (!code) return undefined;
  return CODE_TO_TESTER.get(String(code).trim().toUpperCase());
}

export function getTesterCodeByName(name?: string | null): string | undefined {
  if (!name) return undefined;
  const clean = String(name).trim().toLowerCase();
  if (clean.startsWith('x5-')) {
    const direct = CODE_TO_TESTER.get(clean.toUpperCase());
    if (direct) return direct.code;
  }
  return NAME_TO_CODE.get(clean);
}

export function normalizeTesterToCode(val?: string | null): string | null {
  if (!val) return null;
  const clean = String(val).trim();
  if (clean.toUpperCase().startsWith('X5-')) {
    return clean.toUpperCase();
  }
  return getTesterCodeByName(clean) || clean;
}

export function getTesterDisplayName(val?: string | null): string {
  if (!val) return '-';
  const item = getTesterByCode(val);
  if (item) return `${item.name} (${item.nickname})`;
  const code = getTesterCodeByName(val);
  if (code) {
    const resolved = getTesterByCode(code);
    if (resolved) return `${resolved.name} (${resolved.nickname})`;
  }
  return val;
}

export function getTesterShortName(val?: string | null): string {
  if (!val) return '-';
  const item = getTesterByCode(val);
  if (item) return item.name;
  const code = getTesterCodeByName(val);
  if (code) {
    const resolved = getTesterByCode(code);
    if (resolved) return resolved.name;
  }
  return val;
}
