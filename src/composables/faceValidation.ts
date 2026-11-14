/**
 * Pure, framework-agnostic face-readiness logic for the biometric face scan.
 *
 * Everything in this file is side-effect free and browser-API free so it can be
 * reasoned about (and unit tested) without a camera. The runtime part — camera
 * lifecycle, MediaPipe inference loop, timers — lives in `useFaceScanner.ts`.
 *
 * Coordinate conventions
 * ----------------------
 * MediaPipe Face Landmarker returns landmarks normalized against the *source
 * video frame*: x in [0,1] over videoWidth, y in [0,1] over videoHeight, z in
 * roughly the same scale as x (relative depth).
 *
 * The preview element uses `object-cover`, so the user only sees a cropped
 * window of that frame. All validation is therefore done in "visible" space
 * (see `computeVisibleRegion`) so that "centered" and "close enough" mean what
 * the user actually sees on screen, on any device aspect ratio.
 *
 * Detection coordinates are always raw video coordinates. A CSS mirror on the
 * preview (if ever enabled) does not touch them, so left/right/center maths
 * stay correct.
 */

/** Single source of truth for every tunable threshold. */
export const FACE_READY_CONFIG = {
  /** Inference throttle: ~10 detections/second (video itself stays 30–60 FPS). */
  detectionIntervalMs: 100,
  /** How long every condition must hold continuously before READY. */
  stableDurationMs: 1500,
  /** Countdown length, in seconds, before the shutter fires. */
  countdownSeconds: 3,
  /** Minimum on-screen lifetime for a non-critical instruction (anti-flicker). */
  minMessageMs: 450,
  /** Give up if the camera never produces a usable frame. */
  videoReadyTimeoutMs: 12000,

  /** Where the face should sit inside the visible preview (0.5 = dead center). */
  centerTargetX: 0.5,
  centerTargetY: 0.5,
  centerToleranceX: 0.15,
  centerToleranceY: 0.15,
  /** Extra slack required to *leave* OFF_CENTER once entered. */
  centerHysteresis: 0.04,

  /** Face bounding-box height as a fraction of the visible preview height. */
  minFaceHeightRatio: 0.3,
  maxFaceHeightRatio: 0.68,
  /** Extra slack required to leave TOO_FAR / TOO_CLOSE once entered. */
  sizeHysteresis: 0.04,

  /** Head pose tolerance (approximate degrees, deliberately generous). */
  maxYawDeg: 20,
  maxPitchDeg: 20,
  maxRollDeg: 20,
  /** Extra slack required to leave NOT_FACING_CAMERA once entered. */
  poseHysteresisDeg: 4,

  /** Movement is measured as the spread of samples inside this time window. */
  movementWindowMs: 350,
  /** Spread that counts as "1.0" of movement for each metric. */
  movementToleranceCenter: 0.022,
  movementToleranceSize: 0.035,
  movementTolerancePoseDeg: 6,
  /** Score above 1 starts MOVING; it has to drop below this factor to stop. */
  movementReleaseFactor: 0.8,

  /** MediaPipe model options. */
  maxFaces: 2, // 2 so a second face can be *detected* and rejected, not ignored.
  minFaceDetectionConfidence: 0.5,
  minFacePresenceConfidence: 0.5,
  minTrackingConfidence: 0.5,
} as const

export type FaceReadyConfig = typeof FACE_READY_CONFIG

/** The single state variable that drives both logic and UI. */
export type FaceScanState =
  | 'IDLE'
  | 'LOADING'
  | 'CAMERA_STARTING'
  | 'CAMERA_READY'
  | 'NO_FACE'
  | 'MULTIPLE_FACES'
  | 'TOO_FAR'
  | 'TOO_CLOSE'
  | 'OFF_CENTER'
  | 'NOT_FACING_CAMERA'
  | 'MOVING'
  | 'STABILIZING'
  | 'READY'
  | 'COUNTDOWN'
  | 'CAPTURED'
  | 'PREVIEW'
  | 'ERROR'

export type InstructionTone = 'info' | 'danger' | 'warn' | 'ok'

export interface Instruction {
  text: string
  tone: InstructionTone
}

/** Exactly one message per state — the UI never shows two at once. */
const INSTRUCTIONS: Record<FaceScanState, Instruction> = {
  IDLE: { text: '', tone: 'info' },
  LOADING: { text: '⏳ Menyiapkan sistem deteksi wajah...', tone: 'info' },
  CAMERA_STARTING: { text: '⏳ Mengaktifkan kamera...', tone: 'info' },
  CAMERA_READY: { text: '⏳ Mencari wajah...', tone: 'info' },
  NO_FACE: { text: '🔴 Wajah tidak ditemukan', tone: 'danger' },
  MULTIPLE_FACES: { text: '🟡 Pastikan hanya satu wajah di kamera', tone: 'warn' },
  TOO_FAR: { text: '🟡 Dekatkan wajah', tone: 'warn' },
  TOO_CLOSE: { text: '🟡 Mundurkan sedikit', tone: 'warn' },
  OFF_CENTER: { text: '🟡 Posisikan wajah ke tengah', tone: 'warn' },
  NOT_FACING_CAMERA: { text: '🟡 Lihat lurus ke kamera', tone: 'warn' },
  MOVING: { text: '🟡 Jangan bergerak', tone: 'warn' },
  STABILIZING: { text: '🟡 Jangan bergerak', tone: 'warn' },
  READY: { text: '🟢 Posisi sudah sesuai', tone: 'ok' },
  COUNTDOWN: { text: '🟢 Posisi sudah sesuai', tone: 'ok' },
  CAPTURED: { text: '📸 Foto diambil', tone: 'ok' },
  PREVIEW: { text: '📸 Periksa hasil foto', tone: 'ok' },
  ERROR: { text: '🔴 Terjadi kesalahan', tone: 'danger' },
}

export const instructionFor = (state: FaceScanState): Instruction => INSTRUCTIONS[state]

/**
 * States that must appear instantly, bypassing the anti-flicker hold: safety
 * critical ("no face", "two faces") plus everything that gates the shutter.
 */
const IMMEDIATE_STATES: ReadonlySet<FaceScanState> = new Set<FaceScanState>([
  'IDLE',
  'LOADING',
  'CAMERA_STARTING',
  'CAMERA_READY',
  'NO_FACE',
  'MULTIPLE_FACES',
  'READY',
  'COUNTDOWN',
  'CAPTURED',
  'PREVIEW',
  'ERROR',
])

/**
 * Anti-flicker gate: a soft guidance message keeps the screen for at least
 * `minMessageMs` so borderline values cannot strobe the UI. Critical states are
 * never held back.
 */
export const shouldHoldMessage = (
  current: FaceScanState,
  next: FaceScanState,
  msSinceChange: number,
  cfg: FaceReadyConfig = FACE_READY_CONFIG,
): boolean => {
  if (current === next) return false
  if (IMMEDIATE_STATES.has(next)) return false
  return msSinceChange < cfg.minMessageMs
}

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

export interface Landmark {
  x: number
  y: number
  z: number
}

/** Fraction of the source frame that survives the `object-cover` crop. */
export interface VisibleRegion {
  fracX: number
  fracY: number
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/**
 * Works out how much of the camera frame is actually on screen once the video
 * is laid out with `object-fit: cover` inside a box of `boxW × boxH`.
 */
export const computeVisibleRegion = (
  videoW: number,
  videoH: number,
  boxW: number,
  boxH: number,
): VisibleRegion => {
  if (!videoW || !videoH || !boxW || !boxH) return { fracX: 1, fracY: 1 }
  const scale = Math.max(boxW / videoW, boxH / videoH)
  return {
    fracX: clamp(boxW / (videoW * scale), 0.05, 1),
    fracY: clamp(boxH / (videoH * scale), 0.05, 1),
  }
}

/** Landmark indices (MediaPipe canonical face mesh) used for pose estimation. */
const IDX_CHEEK_LEFT = 234 // face oval, image-left side
const IDX_CHEEK_RIGHT = 454 // face oval, image-right side
const IDX_FOREHEAD = 10
const IDX_CHIN = 152

export interface FaceMetrics {
  /** Face bbox center, in visible-preview space (0..1, 0.5 = middle). */
  centerX: number
  centerY: number
  /** Face bbox size as a fraction of the visible preview. */
  heightRatio: number
  widthRatio: number
  /** Approximate head pose in degrees; magnitudes only are used downstream. */
  yawDeg: number
  pitchDeg: number
  rollDeg: number
}

const RAD_TO_DEG = 180 / Math.PI

/**
 * Derives position, size and an approximate head pose from one face's landmarks.
 *
 * Pose is estimated from the 3D landmark cloud: the face normal is the cross
 * product of the cheek-to-cheek vector and the chin-to-forehead vector. Because
 * only the magnitude of yaw/pitch is used, the result is independent of
 * MediaPipe's depth sign convention. It is an approximation — good enough for
 * "roughly looking at the camera", which is all that is required.
 */
export const computeFaceMetrics = (
  landmarks: readonly Landmark[],
  videoW: number,
  videoH: number,
  region: VisibleRegion,
): FaceMetrics => {
  let minX = 1
  let minY = 1
  let maxX = 0
  let maxY = 0
  for (const p of landmarks) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }

  const frameCenterX = (minX + maxX) / 2
  const frameCenterY = (minY + maxY) / 2

  // Frame-normalized -> visible-normalized (the crop is symmetric about 0.5).
  const centerX = (frameCenterX - 0.5) / region.fracX + 0.5
  const centerY = (frameCenterY - 0.5) / region.fracY + 0.5
  const widthRatio = (maxX - minX) / region.fracX
  const heightRatio = (maxY - minY) / region.fracY

  // Put x, y and z on a common scale (units of frame width) before doing 3D
  // maths: y is normalized against height, x and z against width.
  const aspect = videoW > 0 ? videoH / videoW : 1
  const at = (i: number) => {
    const p = landmarks[i]
    return p ? { x: p.x, y: p.y * aspect, z: p.z } : { x: 0, y: 0, z: 0 }
  }

  const cheekL = at(IDX_CHEEK_LEFT)
  const cheekR = at(IDX_CHEEK_RIGHT)
  const forehead = at(IDX_FOREHEAD)
  const chin = at(IDX_CHIN)

  const right = { x: cheekR.x - cheekL.x, y: cheekR.y - cheekL.y, z: cheekR.z - cheekL.z }
  const up = { x: forehead.x - chin.x, y: forehead.y - chin.y, z: forehead.z - chin.z }

  // forward = right x up  (points towards the camera for a frontal face)
  const forward = {
    x: right.y * up.z - right.z * up.y,
    y: right.z * up.x - right.x * up.z,
    z: right.x * up.y - right.y * up.x,
  }

  const yawDeg = Math.atan2(forward.x, -forward.z) * RAD_TO_DEG
  const pitchDeg = Math.atan2(-forward.y, -forward.z) * RAD_TO_DEG
  const rollDeg = Math.atan2(right.y, right.x) * RAD_TO_DEG

  return { centerX, centerY, heightRatio, widthRatio, yawDeg, pitchDeg, rollDeg }
}

// ---------------------------------------------------------------------------
// Validation (with hysteresis so borderline values cannot oscillate)
// ---------------------------------------------------------------------------

export interface ValidationFlags {
  tooFar: boolean
  tooClose: boolean
  offCenter: boolean
  notFacing: boolean
}

export const NEUTRAL_FLAGS: ValidationFlags = {
  tooFar: false,
  tooClose: false,
  offCenter: false,
  notFacing: false,
}

export const evaluateFace = (
  m: FaceMetrics,
  prev: ValidationFlags | null,
  cfg: FaceReadyConfig = FACE_READY_CONFIG,
): ValidationFlags => {
  const was = prev ?? NEUTRAL_FLAGS

  // Once a condition is active, the value has to move past the threshold *plus*
  // a hysteresis margin before it clears.
  const minH = was.tooFar ? cfg.minFaceHeightRatio + cfg.sizeHysteresis : cfg.minFaceHeightRatio
  const maxH = was.tooClose ? cfg.maxFaceHeightRatio - cfg.sizeHysteresis : cfg.maxFaceHeightRatio
  const tolX = was.offCenter ? cfg.centerToleranceX - cfg.centerHysteresis : cfg.centerToleranceX
  const tolY = was.offCenter ? cfg.centerToleranceY - cfg.centerHysteresis : cfg.centerToleranceY
  const hyst = was.notFacing ? cfg.poseHysteresisDeg : 0

  return {
    tooFar: m.heightRatio < minH,
    tooClose: m.heightRatio > maxH,
    offCenter:
      Math.abs(m.centerX - cfg.centerTargetX) > tolX ||
      Math.abs(m.centerY - cfg.centerTargetY) > tolY,
    notFacing:
      Math.abs(m.yawDeg) > cfg.maxYawDeg - hyst ||
      Math.abs(m.pitchDeg) > cfg.maxPitchDeg - hyst ||
      Math.abs(m.rollDeg) > cfg.maxRollDeg - hyst,
  }
}

// ---------------------------------------------------------------------------
// Movement / stability
// ---------------------------------------------------------------------------

export interface FaceSample {
  t: number
  centerX: number
  centerY: number
  heightRatio: number
  yawDeg: number
  pitchDeg: number
  rollDeg: number
}

export const toSample = (t: number, m: FaceMetrics): FaceSample => ({
  t,
  centerX: m.centerX,
  centerY: m.centerY,
  heightRatio: m.heightRatio,
  yawDeg: m.yawDeg,
  pitchDeg: m.pitchDeg,
  rollDeg: m.rollDeg,
})

const spread = (samples: readonly FaceSample[], pick: (s: FaceSample) => number): number => {
  let min = Infinity
  let max = -Infinity
  for (const s of samples) {
    const v = pick(s)
    if (v < min) min = v
    if (v > max) max = v
  }
  return max - min
}

/**
 * Movement score normalized so that 1.0 == "exactly at the tolerance". Uses the
 * spread across a short window rather than a frame-to-frame delta, which makes
 * it far less jittery.
 */
export const computeMovementScore = (
  samples: readonly FaceSample[],
  cfg: FaceReadyConfig = FACE_READY_CONFIG,
): number => {
  if (samples.length < 2) return 0
  return Math.max(
    spread(samples, (s) => s.centerX) / cfg.movementToleranceCenter,
    spread(samples, (s) => s.centerY) / cfg.movementToleranceCenter,
    spread(samples, (s) => s.heightRatio) / cfg.movementToleranceSize,
    spread(samples, (s) => s.yawDeg) / cfg.movementTolerancePoseDeg,
    spread(samples, (s) => s.pitchDeg) / cfg.movementTolerancePoseDeg,
    spread(samples, (s) => s.rollDeg) / cfg.movementTolerancePoseDeg,
  )
}

/** Hysteresis on the movement flag itself, so the score can sit near 1.0. */
export const isMoving = (
  score: number,
  wasMoving: boolean,
  cfg: FaceReadyConfig = FACE_READY_CONFIG,
): boolean => (wasMoving ? score > cfg.movementReleaseFactor : score > 1)

/** Drops samples older than the movement window. */
export const pruneSamples = (
  samples: readonly FaceSample[],
  now: number,
  cfg: FaceReadyConfig = FACE_READY_CONFIG,
): FaceSample[] => samples.filter((s) => now - s.t <= cfg.movementWindowMs)

// ---------------------------------------------------------------------------
// State resolution
// ---------------------------------------------------------------------------

export interface ResolveInput {
  faceCount: number
  flags: ValidationFlags | null
  moving: boolean
  /** How long every condition has been continuously satisfied. */
  stableMs: number
}

/**
 * Maps the current observation to exactly one state, following the fixed
 * priority order. READY is the *only* outcome that may lead to a capture, and
 * it requires the full stability window.
 */
export const resolveState = (
  input: ResolveInput,
  cfg: FaceReadyConfig = FACE_READY_CONFIG,
): FaceScanState => {
  if (input.faceCount === 0) return 'NO_FACE'
  if (input.faceCount > 1) return 'MULTIPLE_FACES'

  const flags = input.flags
  if (!flags) return 'NO_FACE'
  if (flags.tooFar) return 'TOO_FAR'
  if (flags.tooClose) return 'TOO_CLOSE'
  if (flags.offCenter) return 'OFF_CENTER'
  if (flags.notFacing) return 'NOT_FACING_CAMERA'
  if (input.moving) return 'MOVING'
  if (input.stableMs < cfg.stableDurationMs) return 'STABILIZING'
  return 'READY'
}

/** True only for the one state that is allowed to arm the countdown. */
export const isReadyState = (state: FaceScanState): boolean => state === 'READY'

/** Human-readable message for a `getUserMedia` failure. */
export const describeCameraError = (err: unknown): string => {
  const name = (err as { name?: string } | null)?.name ?? ''
  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'Akses kamera ditolak. Izinkan kamera di pengaturan browser, lalu coba lagi.'
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'Kamera tidak ditemukan. Gunakan perangkat dengan kamera aktif (HP/Laptop).'
    case 'NotReadableError':
    case 'TrackStartError':
      return 'Kamera sedang dipakai aplikasi lain. Tutup aplikasi tersebut, lalu coba lagi.'
    case 'OverconstrainedError':
      return 'Kamera perangkat ini tidak mendukung konfigurasi yang diminta. Coba lagi.'
    case 'AbortError':
      return 'Kamera gagal dijalankan. Silakan coba lagi.'
    case 'SecurityError':
      return 'Kamera diblokir karena alasan keamanan. Pastikan situs dibuka melalui HTTPS.'
    default: {
      const msg = (err as { message?: string } | null)?.message
      return `Kamera tidak dapat diaktifkan${msg ? ` (${msg})` : ''}. Silakan coba lagi.`
    }
  }
}

// ---------------------------------------------------------------------------
// Session stepper — the whole capture decision, as a pure function
// ---------------------------------------------------------------------------

/**
 * Everything the face-ready decision needs to remember between detections.
 * Kept outside Vue so the exact same logic can be exercised in tests.
 */
export interface FaceSession {
  flags: ValidationFlags | null
  moving: boolean
  movementScore: number
  samples: FaceSample[]
  stableSince: number | null
  stableMs: number
  countdownEndsAt: number
  countdownValue: number
  /** Capture lock: one photo per session, no matter how the loop behaves. */
  captured: boolean
}

export const createFaceSession = (): FaceSession => ({
  flags: null,
  moving: false,
  movementScore: 0,
  samples: [],
  stableSince: null,
  stableMs: 0,
  countdownEndsAt: 0,
  countdownValue: 0,
  captured: false,
})

/** Clears stability timer, countdown and capture lock (used by "Foto Ulang"). */
export const resetFaceSession = (s: FaceSession): void => {
  s.flags = null
  s.moving = false
  s.movementScore = 0
  s.samples = []
  s.stableSince = null
  s.stableMs = 0
  s.countdownEndsAt = 0
  s.countdownValue = 0
  s.captured = false
}

export interface FaceObservation {
  now: number
  faceCount: number
  /** Metrics of the single detected face, or null when there isn't exactly one. */
  metrics: FaceMetrics | null
}

export interface FaceStepResult {
  state: FaceScanState
  /** True on exactly one step per session, once the countdown has elapsed. */
  shouldCapture: boolean
}

/**
 * Advances the face-ready state machine by one detection.
 *
 * A detected face by itself never produces `shouldCapture`. The chain is:
 * exactly one face -> distance ok -> centered -> facing camera -> not moving ->
 * held for `stableDurationMs` -> countdown -> capture. Any condition breaking at
 * any point (including mid-countdown) drops straight back to guidance and clears
 * the countdown.
 */
export const stepFaceSession = (
  s: FaceSession,
  obs: FaceObservation,
  cfg: FaceReadyConfig = FACE_READY_CONFIG,
): FaceStepResult => {
  // Capture lock — nothing after the shutter can fire it again.
  if (s.captured) return { state: 'PREVIEW', shouldCapture: false }

  const { now, faceCount } = obs
  const single = faceCount === 1 ? obs.metrics : null

  if (single) {
    s.flags = evaluateFace(single, s.flags, cfg)
    s.samples = pruneSamples(s.samples, now, cfg)
    s.samples.push(toSample(now, single))
    s.movementScore = computeMovementScore(s.samples, cfg)
    s.moving = isMoving(s.movementScore, s.moving, cfg)
  } else {
    s.flags = null
    s.samples = []
    s.moving = false
    s.movementScore = 0
  }

  const basicsOk =
    !!single &&
    !!s.flags &&
    !s.flags.tooFar &&
    !s.flags.tooClose &&
    !s.flags.offCenter &&
    !s.flags.notFacing &&
    !s.moving

  if (basicsOk) {
    if (s.stableSince === null) s.stableSince = now
    s.stableMs = now - s.stableSince
  } else {
    s.stableSince = null
    s.stableMs = 0
  }

  const resolved = resolveState(
    { faceCount, flags: s.flags, moving: s.moving, stableMs: s.stableMs },
    cfg,
  )

  if (!isReadyState(resolved)) {
    // Cancels an in-flight countdown as a side effect of being invalid.
    s.countdownEndsAt = 0
    s.countdownValue = 0
    return { state: resolved, shouldCapture: false }
  }

  if (s.countdownEndsAt === 0) {
    s.countdownEndsAt = now + cfg.countdownSeconds * 1000
    s.countdownValue = cfg.countdownSeconds
    return { state: 'READY', shouldCapture: false }
  }

  const remaining = s.countdownEndsAt - now
  if (remaining <= 0) {
    s.captured = true
    s.countdownValue = 0
    return { state: 'CAPTURED', shouldCapture: true }
  }

  s.countdownValue = Math.max(1, Math.ceil(remaining / 1000))
  return { state: 'COUNTDOWN', shouldCapture: false }
}
