/**
 * Pure helpers that turn raw registration rows into something the admin panel
 * can render. Kept free of Vue so they can be unit tested directly
 * (see tests/registration_utils.test.ts).
 */
import type {
  DeviceInfo,
  EmailStatus,
  LocationParts,
  MemberRow,
  Registration,
  Tone,
  VpnStatus,
} from '../types/registration';

const EMPTY_LOCATION: LocationParts = {
  city: null,
  province: null,
  country: null,
  short: '',
  full: '',
  known: false,
};

/** Trims and collapses empty-ish values to null so `v-if` checks stay simple. */
function clean(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Parses the `is_vpn` sentence.
 *
 * Note the ordering: `"Tidak Terdeteksi"` also contains the word "Terdeteksi",
 * so the negative form has to be ruled out first. The old UI used
 * `.startsWith('Terdeteksi')` in five separate places, which worked but only by
 * accident of capitalisation.
 */
export function parseVpn(raw: string | null | undefined): VpnStatus {
  const value = clean(raw);
  if (!value) return { detected: false, known: false, indicators: [], raw: null };

  const lower = value.toLowerCase();
  const detected = lower.startsWith('terdeteksi');

  const inParens = value.match(/\(([^)]*)\)/)?.[1] ?? '';
  const indicators = inParens
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  return { detected, known: true, indicators, raw: value };
}

/**
 * Splits the joined `user_location` string back into parts.
 *
 * The backend builds it as `[city, subdivision, country].filter(Boolean)`, so a
 * shorter string means something was missing — and which piece is missing is
 * not recoverable with certainty. Heuristic used here: geo data almost always
 * carries a country while the subdivision is the piece that commonly drops out,
 * so two parts are read as city + country and a lone part as country.
 */
export function parseLocation(raw: string | null | undefined): LocationParts {
  const value = clean(raw);
  if (!value || value.toLowerCase() === 'unknown') return { ...EMPTY_LOCATION };

  const parts = value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  let city: string | null = null;
  let province: string | null = null;
  let country: string | null = null;

  if (parts.length >= 3) {
    city = parts[0] ?? null;
    province = parts[1] ?? null;
    country = parts[2] ?? null;
  } else if (parts.length === 2) {
    city = parts[0] ?? null;
    country = parts[1] ?? null;
  } else if (parts.length === 1) {
    country = parts[0] ?? null;
  }

  // The table column wants the two most specific pieces available.
  const short = [city, province ?? country].filter(Boolean).join(', ') || value;

  return { city, province, country, short, full: value, known: parts.length > 0 };
}

/** Browser matchers, most specific first — Chrome-based UAs name themselves last. */
const BROWSER_PATTERNS: Array<[RegExp, string]> = [
  [/\bInstagram\b/i, 'Instagram'],
  [/\bFBAV\/|\bFB_IAB\b/i, 'Facebook'],
  [/\bEdgA?\/(\d+)/i, 'Edge'],
  [/\b(?:OPR|Opera)\/(\d+)/i, 'Opera'],
  [/\bSamsungBrowser\/(\d+)/i, 'Samsung Internet'],
  [/\bFirefox\/(\d+)/i, 'Firefox'],
  [/\bChrome\/(\d+)/i, 'Chrome'],
  [/\bVersion\/(\d+).*\bSafari\b/i, 'Safari'],
];

const OS_PATTERNS: Array<[RegExp, string]> = [
  [/\bAndroid\b/i, 'Android'],
  [/\b(?:iPhone|iPad|iPod|CPU iPhone OS)\b/i, 'iOS'],
  [/\bWindows NT\b/i, 'Windows'],
  [/\b(?:Macintosh|Mac OS X)\b/i, 'macOS'],
  [/\bLinux\b/i, 'Linux'],
];

/**
 * Reduces a user-agent to "browser / OS". The full string stays available for
 * the copy button — truncating it at 60 characters, as the old panel did, cut
 * off exactly the part that identifies the device.
 */
export function parseDevice(raw: string | null | undefined): DeviceInfo {
  const value = clean(raw);
  if (!value || value.toLowerCase() === 'unknown') {
    return { browser: null, version: null, os: null, label: '', full: value ?? '', known: false };
  }

  let browser: string | null = null;
  let version: string | null = null;
  for (const [pattern, name] of BROWSER_PATTERNS) {
    const match = value.match(pattern);
    if (match) {
      browser = name;
      version = match[1] ?? null;
      break;
    }
  }

  let os: string | null = null;
  for (const [pattern, name] of OS_PATTERNS) {
    if (pattern.test(value)) {
      os = name;
      break;
    }
  }

  const label = [browser, os].filter(Boolean).join(' / ');

  return {
    browser,
    version,
    os,
    // An unrecognised UA is better shown raw than shown as nothing.
    label: label || value,
    full: value,
    known: true,
  };
}

const EMAIL_STATUS_LABELS: Record<EmailStatus, string> = {
  sent: 'Terkirim',
  failed: 'Gagal',
  pending: 'Menunggu',
  disabled: 'Dinonaktifkan',
  not_configured: 'Belum dikonfigurasi',
  unknown: 'Tidak diketahui',
};

const EMAIL_STATUS_TONES: Record<EmailStatus, Tone> = {
  sent: 'ok',
  failed: 'danger',
  pending: 'warn',
  disabled: 'muted',
  not_configured: 'muted',
  unknown: 'muted',
};

/** Narrows the free-text `email_status` column to a known union member. */
export function parseEmailStatus(raw: string | null | undefined): EmailStatus {
  const value = clean(raw);
  if (!value) return 'unknown';
  return value in EMAIL_STATUS_LABELS ? (value as EmailStatus) : 'unknown';
}

export function emailStatusLabel(status: EmailStatus): string {
  return EMAIL_STATUS_LABELS[status];
}

export function emailStatusTone(status: EmailStatus): Tone {
  return EMAIL_STATUS_TONES[status];
}

/**
 * `social_confirmed` is stored as text, so it arrives as `"true"` rather than a
 * boolean. Anything else — including `"false"`, null, and legacy rows — is not
 * a confirmation.
 */
export function parseBooleanText(raw: string | null | undefined): boolean {
  const value = clean(raw);
  return value?.toLowerCase() === 'true';
}

/** Strips formatting so a WhatsApp number can be appended to `wa.me/`. */
export function toWhatsappLink(raw: string | null | undefined): string | null {
  const value = clean(raw);
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8 ? digits : null;
}

function parseTimestamp(raw: string | null | undefined): Date | null {
  const value = clean(raw);
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(date: Date | null): string {
  if (!date) return '';
  return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatTime(date: Date | null): string {
  if (!date) return '';
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDateTime(date: Date | null): string {
  if (!date) return '';
  return `${formatDate(date)}, ${formatTime(date)}`;
}

/** True when `date` falls on today's local calendar day. */
export function isToday(date: Date | null): boolean {
  if (!date) return false;
  return date.toDateString() === new Date().toDateString();
}

/**
 * Collapses a raw API row into the view model.
 *
 * The two `??` fallbacks below are the only place in the panel that needs to
 * know about the legacy columns: `upload_code` predates `member_code`, and
 * `face_image_id` predates the re-keyed `face_image_key`.
 */
export function normalizeRegistration(row: Registration): MemberRow {
  const faceKey = clean(row.face_image_key) ?? clean(row.face_image_id);
  const whatsapp = clean(row.nomor_wa);

  return {
    id: row.id,

    name: clean(row.nama_panggilan) ?? '',
    nickname: clean(row.nickname_ayodance) ?? '',
    memberCode: clean(row.member_code) ?? clean(row.upload_code),
    birthDate: clean(row.tanggal_lahir),
    domicile: clean(row.domisili),
    division: clean(row.divisi_community),

    whatsapp,
    whatsappLink: toWhatsappLink(whatsapp),
    email: clean(row.email),
    emailStatus: parseEmailStatus(row.email_status),
    socialUsername: clean(row.username_sosmed)?.replace(/^@/, '') ?? null,
    socialPlatform: clean(row.sosial_media_name),
    socialConfirmed: parseBooleanText(row.social_confirmed),

    ip: clean(row.user_ip),
    location: parseLocation(row.user_location),
    vpn: parseVpn(row.is_vpn),
    device: parseDevice(row.user_agent),
    createdAt: parseTimestamp(row.created_at),

    tester: clean(row.tester),
    quote: clean(row.quote),

    faceKey,
    hasFace: Boolean(faceKey),
  };
}
