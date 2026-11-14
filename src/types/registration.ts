/**
 * Shapes for the admin panel's registration data.
 *
 * Two layers on purpose:
 *  - `Registration` is the raw row exactly as `/api/admin/registrations` sends
 *    it: snake_case keys, almost everything nullable, a few legacy duplicate
 *    columns.
 *  - `MemberRow` is the normalized view model every panel component reads. All
 *    the fallbacks and string parsing happen once, in `normalizeRegistration`,
 *    so no component has to know that `is_vpn` is a sentence or that the member
 *    code lives in one of two columns.
 */

/** Raw row from the admin API. Key names match the database columns. */
export interface Registration {
  id: number;
  nama_panggilan: string;
  nickname_ayodance: string;
  tanggal_lahir: string | null;
  domisili: string | null;
  has_social_media: string | null;
  sosial_media_name: string | null;
  divisi_community: string | null;
  tester: string | null;
  user_ip: string | null;
  credential_id: string | null;
  face_image_id: string | null;
  upload_code: string | null;
  user_location: string | null;
  is_vpn: string | null;
  user_agent: string | null;
  // --- Member profile fields (6-step registration flow) ---
  member_code: string | null;
  nomor_wa: string | null;
  email: string | null;
  quote: string | null;
  username_sosmed: string | null;
  face_image_key: string | null;
  social_confirmed: string | null;
  email_status: string | null;
  created_at: string | null;
}

/**
 * Semantic tone for badges. Components map these to tokens rather than picking
 * colors themselves, which keeps "red means a real problem" a single decision.
 */
export type Tone = 'ok' | 'warn' | 'danger' | 'muted';

export type EmailStatus =
  | 'sent'
  | 'failed'
  | 'pending'
  | 'disabled'
  | 'not_configured'
  | 'unknown';

/**
 * Parsed form of `is_vpn`, which the backend stores as prose:
 * `"Terdeteksi (Multiple proxy hops, Via proxy)"` or `"Tidak Terdeteksi"`.
 *
 * `known` distinguishes "the check ran and found nothing" from "no data at all"
 * (older rows) — they must not look the same in the UI.
 */
export interface VpnStatus {
  detected: boolean;
  known: boolean;
  /** Individual reasons pulled out of the parenthesised list, if any. */
  indicators: string[];
  /** Original string, preserved verbatim for the detail view. */
  raw: string | null;
}

/**
 * Parsed form of `user_location`, which the backend stores as a single joined
 * string built from Netlify's geo object.
 */
export interface LocationParts {
  city: string | null;
  province: string | null;
  country: string | null;
  /** Compact label for the table column, e.g. `"Bandung, Jawa Barat"`. */
  short: string;
  /** Full original string for the detail view. */
  full: string;
  /** False for missing values and for the literal `"Unknown"` sentinel. */
  known: boolean;
}

/** Human-readable summary of a `user_agent` string. */
export interface DeviceInfo {
  browser: string | null;
  /** Major version only; full versions are noise in a table. */
  version: string | null;
  os: string | null;
  /** Short label for display, e.g. `"Chrome / Android"`. */
  label: string;
  /** Untouched user-agent, for copy-to-clipboard and tooltips. */
  full: string;
  known: boolean;
}

/** Normalized row consumed by every admin panel component. */
export interface MemberRow {
  id: number;

  // Identitas
  name: string;
  nickname: string;
  /** `member_code`, falling back to the legacy `upload_code`. */
  memberCode: string | null;
  birthDate: string | null;
  domicile: string | null;
  division: string | null;

  // Kontak
  whatsapp: string | null;
  /** Digits only, safe to append to `https://wa.me/`. */
  whatsappLink: string | null;
  email: string | null;
  emailStatus: EmailStatus;
  socialUsername: string | null;
  socialPlatform: string | null;
  socialConfirmed: boolean;

  // Lokasi & device
  ip: string | null;
  location: LocationParts;
  vpn: VpnStatus;
  device: DeviceInfo;
  /** Parsed `created_at`; null when missing or unparseable. */
  createdAt: Date | null;

  // Catatan tester
  tester: string | null;
  quote: string | null;

  /** Blob key for the face photo: `face_image_key` or legacy `face_image_id`. */
  faceKey: string | null;
  hasFace: boolean;
}

/** Columns the desktop table can sort by. */
export type SortKey = 'name' | 'memberCode' | 'createdAt' | 'location' | 'vpn';
export type SortDirection = 'asc' | 'desc';
