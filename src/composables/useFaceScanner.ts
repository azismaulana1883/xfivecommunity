/**
 * Camera + MediaPipe Face Landmarker runtime for the biometric face scan.
 *
 * Responsibilities: lazily load MediaPipe (WASM + model), own the camera
 * lifecycle, run a throttled non-overlapping inference loop, drive the single
 * state machine, hold the stability timer, run/cancel the countdown, take
 * exactly one photo per session, and clean everything up.
 *
 * Everything here is browser-only: the module never touches `window`,
 * `navigator` or `document` at import time, and MediaPipe itself is pulled in
 * with a dynamic `import()` from inside a user-triggered call.
 */
import { computed, onUnmounted, ref, shallowRef } from 'vue'
import type { FaceLandmarker } from '@mediapipe/tasks-vision'
import {
  FACE_READY_CONFIG,
  computeFaceMetrics,
  computeVisibleRegion,
  createFaceSession,
  describeCameraError,
  instructionFor,
  resetFaceSession,
  shouldHoldMessage,
  stepFaceSession,
} from './faceValidation'
import type { FaceMetrics, FaceScanState } from './faceValidation'

/** Same-origin asset locations. Both are emitted by the production build. */
const MODEL_ASSET_PATH = '/models/face_landmarker.task'
const WASM_BASE_PATH = '/mediapipe/wasm'

/** Capture geometry & WebP output. */
const CAPTURE_MAX_DIM = 720
const CAPTURE_MIME = 'image/webp'
const CAPTURE_QUALITY = 0.85

const DEV = import.meta.env.DEV
const debugLog = (...args: unknown[]) => {
  if (DEV) console.debug('[face-scan]', ...args)
}

const isMobileDevice = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)

export interface UseFaceScannerOptions {
  /** Called exactly once per session with the captured JPEG data URI. */
  onCapture: (dataUri: string) => void
}

export const useFaceScanner = (options: UseFaceScannerOptions) => {
  const cfg = FACE_READY_CONFIG

  // --- Reactive surface (single source of truth) --------------------------
  const videoRef = ref<HTMLVideoElement | null>(null)
  /** Authoritative state; drives all capture decisions. */
  const state = ref<FaceScanState>('IDLE')
  /** Same machine, de-flickered — this is what the instruction UI renders. */
  const displayState = ref<FaceScanState>('IDLE')
  const errorMessage = ref('')
  const countdownValue = ref(0)
  const stableMs = ref(0)
  const faceCount = ref(0)
  const movementScore = ref(0)
  const metrics = shallowRef<FaceMetrics | null>(null)

  // --- Non-reactive runtime ----------------------------------------------
  let landmarker: FaceLandmarker | null = null
  let loadPromise: Promise<FaceLandmarker> | null = null
  let stream: MediaStream | null = null
  let rafId = 0
  let isProcessing = false
  let lastInferenceAt = 0
  let lastTimestamp = 0
  let lastVideoTime = -1
  /** All face-ready bookkeeping, including the capture lock. */
  const session = createFaceSession()
  let displayChangedAt = 0
  /** Bumped on every start/stop so stale async work can detect it lost. */
  let sessionId = 0

  const setState = (next: FaceScanState, now: number) => {
    state.value = next
    if (shouldHoldMessage(displayState.value, next, now - displayChangedAt, cfg)) return
    if (displayState.value !== next) {
      displayState.value = next
      displayChangedAt = now
    }
  }

  const fail = (message: string) => {
    errorMessage.value = message
    stopCamera()
    setState('ERROR', performance.now())
  }

  // --- MediaPipe ---------------------------------------------------------

  /**
   * Loads WASM + model once. Safe to call repeatedly and safe to call while the
   * user is still reading the privacy notice (no camera permission involved).
   */
  const loadDetector = (): Promise<FaceLandmarker> => {
    if (landmarker) return Promise.resolve(landmarker)
    if (loadPromise) return loadPromise

    loadPromise = (async () => {
      const { FaceLandmarker: FL, FilesetResolver } = await import('@mediapipe/tasks-vision')
      const fileset = await FilesetResolver.forVisionTasks(WASM_BASE_PATH)

      const build = (delegate: 'GPU' | 'CPU') =>
        FL.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_ASSET_PATH, delegate },
          runningMode: 'VIDEO',
          numFaces: cfg.maxFaces,
          minFaceDetectionConfidence: cfg.minFaceDetectionConfidence,
          minFacePresenceConfidence: cfg.minFacePresenceConfidence,
          minTrackingConfidence: cfg.minTrackingConfidence,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        })

      let instance: FaceLandmarker
      // Di perangkat Mobile (Android/iOS), delegate WebGL GPU sering mengalami masalah texture binding
      // dengan stream kamera video. CPU delegate dengan WebAssembly SIMD (XNNPACK) sangat cepat (<15ms)
      // dan 100% stabil di semua ponsel.
      const initialDelegate: 'GPU' | 'CPU' = isMobileDevice ? 'CPU' : 'GPU'
      try {
        instance = await build(initialDelegate)
      } catch (firstErr) {
        debugLog(`${initialDelegate} delegate unavailable, falling back to alternative`, firstErr)
        instance = await build(initialDelegate === 'GPU' ? 'CPU' : 'GPU')
      }
      landmarker = instance
      debugLog('detector ready with delegate', initialDelegate)
      return instance
    })()

    loadPromise.catch(() => {
      // Allow a later retry to attempt the download again.
      loadPromise = null
    })
    return loadPromise
  }

  const switchToCpuDetector = async () => {
    try {
      const { FaceLandmarker: FL, FilesetResolver } = await import('@mediapipe/tasks-vision')
      const fileset = await FilesetResolver.forVisionTasks(WASM_BASE_PATH)
      if (landmarker) {
        try { landmarker.close() } catch {}
      }
      landmarker = await FL.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_ASSET_PATH, delegate: 'CPU' },
        runningMode: 'VIDEO',
        numFaces: cfg.maxFaces,
        minFaceDetectionConfidence: cfg.minFaceDetectionConfidence,
        minFacePresenceConfidence: cfg.minFacePresenceConfidence,
        minTrackingConfidence: cfg.minTrackingConfidence,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      })
      debugLog('Switched successfully to CPU detector')
    } catch (e) {
      debugLog('Fallback to CPU detector failed:', e)
    }
  }

  /** Optional warm-up; never opens the camera. */
  const preload = async () => {
    try {
      await loadDetector()
    } catch (err) {
      debugLog('preload failed', err)
    }
  }

  // --- Camera -----------------------------------------------------------

  const stopStreamTracks = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      stream = null
    }
    const video = videoRef.value
    if (video) {
      video.pause()
      video.srcObject = null
    }
  }

  const requestStream = async (): Promise<MediaStream> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Browser ini tidak mendukung akses kamera.')
    }
    // Prefer the front camera; fall back progressively so an unusual device
    // still gets a stream instead of an OverconstrainedError.
    const attempts: MediaStreamConstraints[] = isMobileDevice
      ? [
          { video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 640 } }, audio: false },
          { video: { facingMode: 'user' }, audio: false },
          { video: true, audio: false },
        ]
      : [
          { video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false },
          { video: { facingMode: 'user' }, audio: false },
          { video: true, audio: false },
        ]
    let lastError: unknown = null
    for (const constraints of attempts) {
      try {
        return await navigator.mediaDevices.getUserMedia(constraints)
      } catch (err) {
        lastError = err
        const name = (err as { name?: string }).name
        // Only relax constraints; permission/hardware failures are terminal.
        if (name !== 'OverconstrainedError' && name !== 'NotFoundError') throw err
      }
    }
    throw lastError
  }

  /** Resolves once the element really has decodable frames with real dimensions. */
  const waitForVideoReady = (video: HTMLVideoElement) =>
    new Promise<void>((resolve, reject) => {
      const ready = () =>
        video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0

      let settled = false
      let poll = 0
      let timer = 0

      const cleanup = () => {
        window.clearInterval(poll)
        window.clearTimeout(timer)
        video.removeEventListener('loadedmetadata', check)
        video.removeEventListener('canplay', check)
        video.removeEventListener('playing', check)
        video.removeEventListener('error', onError)
      }

      function check() {
        if (settled || !ready()) return
        settled = true
        cleanup()
        resolve()
      }

      function onError() {
        if (settled) return
        settled = true
        cleanup()
        reject(new Error('Kamera gagal menampilkan gambar.'))
      }

      video.addEventListener('loadedmetadata', check)
      video.addEventListener('canplay', check)
      video.addEventListener('playing', check)
      video.addEventListener('error', onError)
      // Safety net for browsers that fired the events before we subscribed.
      poll = window.setInterval(check, 80)
      timer = window.setTimeout(onError, cfg.videoReadyTimeoutMs)
      check()
    })

  // --- Detection loop ---------------------------------------------------

  const resetValidation = () => {
    resetFaceSession(session)
    stableMs.value = 0
    countdownValue.value = 0
    faceCount.value = 0
    movementScore.value = 0
    metrics.value = null
    lastVideoTime = -1
    lastInferenceAt = 0
    isProcessing = false
  }

  const stopLoop = () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
    isProcessing = false
  }

  /**
   * Fires at most once per session — the capture lock lives in `session` and is
   * set by `stepFaceSession` before this is ever reached.
   */
  const capture = () => {
    stopLoop()
    const video = videoRef.value
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      fail('Kamera berhenti sebelum foto diambil. Silakan coba lagi.')
      return
    }

    const now = performance.now()
    setState('CAPTURED', now)

    const vw = video.videoWidth
    const vh = video.videoHeight
    const scale = Math.min(1, CAPTURE_MAX_DIM / Math.max(vw, vh))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(vw * scale)
    canvas.height = Math.round(vh * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      fail('Gagal mengambil gambar. Silakan coba lagi.')
      return
    }
    // Drawn straight from the raw (unmirrored) video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Auto-convert to WebP
    let dataUri = canvas.toDataURL(CAPTURE_MIME, CAPTURE_QUALITY)
    if (!dataUri.startsWith('data:image/webp')) {
      dataUri = canvas.toDataURL('image/jpeg', CAPTURE_QUALITY)
    }

    // Validasi dan pastikan ukuran <= 2 MB (2 * 1024 * 1024 byte)
    const base64Len = dataUri.split(',')[1]?.length || 0
    let byteSize = Math.ceil(base64Len * 0.75)
    if (byteSize > 2 * 1024 * 1024) {
      // Jika ukuran entah bagaimana > 2MB, kompresi ulang dengan kualitas lebih efisien
      dataUri = canvas.toDataURL(CAPTURE_MIME, 0.6)
      const newLen = dataUri.split(',')[1]?.length || 0
      byteSize = Math.ceil(newLen * 0.75)
    }

    stopStreamTracks()
    countdownValue.value = 0
    setState('PREVIEW', performance.now())
    debugLog('captured (webp)', `${canvas.width}x${canvas.height}`, `${Math.round(byteSize / 1024)} KB`)
    options.onCapture(dataUri)
  }

  let consecutiveErrors = 0
  let isSwitchingDelegate = false

  const tick = () => {
    rafId = requestAnimationFrame(tick)

    const now = performance.now()
    if (now - lastInferenceAt < cfg.detectionIntervalMs) return
    // Never let inferences overlap or queue up.
    if (isProcessing || isSwitchingDelegate) return

    const video = videoRef.value
    const detector = landmarker
    if (!video || !detector) return

    // Pastikan video benar-benar siap dan sedang memutar frame
    if (video.readyState < 2 || video.paused || video.ended) return
    if (video.videoWidth <= 0 || video.videoHeight <= 0) return

    // Nothing new decoded yet — skip rather than re-running on the same frame.
    if (video.currentTime === lastVideoTime) return

    isProcessing = true
    try {
      lastInferenceAt = now
      lastVideoTime = video.currentTime
      // MediaPipe requires strictly increasing integer timestamps in VIDEO mode.
      const timestamp = Math.round(Math.max(now, lastTimestamp + 1))
      lastTimestamp = timestamp

      const result = detector.detectForVideo(video, timestamp)
      consecutiveErrors = 0 // Reset hitungan error jika frame sukses
      const faces = result.faceLandmarks ?? []
      faceCount.value = faces.length
      const onlyFace = faces.length === 1 ? faces[0] : undefined

      let nextMetrics: FaceMetrics | null = null
      if (onlyFace) {
        const region = computeVisibleRegion(
          video.videoWidth,
          video.videoHeight,
          video.clientWidth,
          video.clientHeight,
        )
        nextMetrics = computeFaceMetrics(onlyFace, video.videoWidth, video.videoHeight, region)
      }
      metrics.value = nextMetrics

      // The whole "is this face ready?" decision lives in one pure function.
      const step = stepFaceSession(
        session,
        { now, faceCount: faces.length, metrics: nextMetrics },
        cfg,
      )
      stableMs.value = session.stableMs
      movementScore.value = session.movementScore
      countdownValue.value = session.countdownValue

      if (step.shouldCapture) {
        capture()
        return
      }
      setState(step.state, now)
    } catch (err: any) {
      debugLog('detection error', err)
      consecutiveErrors++

      // Jangan langsung gagalkan jika hanya glitch 1-3 frame di HP
      if (consecutiveErrors < 4) {
        return
      }

      // Jika error berkelanjutan dan belum fallback ke CPU, alihkan ke CPU detector
      if (!isSwitchingDelegate) {
        isSwitchingDelegate = true
        debugLog('Attempting fallback to CPU detector...')
        switchToCpuDetector().finally(() => {
          isSwitchingDelegate = false
          consecutiveErrors = 0
        })
        return
      }

      stopLoop()
      fail('Sistem deteksi wajah berhenti bekerja. Silakan coba lagi.')
    } finally {
      isProcessing = false
    }
  }

  const startLoop = () => {
    stopLoop()
    rafId = requestAnimationFrame(tick)
  }

  // --- Public lifecycle -------------------------------------------------

  /** Opens the camera. Only ever called from a user gesture. */
  const start = async () => {
    stopCamera()
    const mySession = ++sessionId
    errorMessage.value = ''
    // Clears the capture lock, stability timer and countdown for a fresh run.
    resetValidation()
    setState('LOADING', performance.now())

    let detector: FaceLandmarker
    try {
      detector = await loadDetector()
    } catch (err) {
      debugLog('detector load failed', err)
      if (mySession !== sessionId) return
      fail(
        'Gagal memuat sistem deteksi wajah. Periksa koneksi internet, lalu coba lagi. ' +
          'Jika masalah berlanjut, gunakan browser versi terbaru (Chrome/Safari/Edge).',
      )
      return
    }
    if (mySession !== sessionId) return
    if (!detector) {
      fail('Sistem deteksi wajah tidak tersedia. Silakan coba lagi.')
      return
    }

    setState('CAMERA_STARTING', performance.now())
    try {
      const media = await requestStream()
      if (mySession !== sessionId) {
        media.getTracks().forEach((t) => t.stop())
        return
      }
      stream = media
    } catch (err) {
      debugLog('camera error', err)
      if (mySession !== sessionId) return
      fail(describeCameraError(err))
      return
    }

    const video = videoRef.value
    if (!video) {
      fail('Elemen kamera tidak tersedia. Silakan coba lagi.')
      return
    }

    video.srcObject = stream
    try {
      await video.play()
    } catch (playErr) {
      debugLog('play() rejected', playErr)
    }

    try {
      await waitForVideoReady(video)
    } catch (err) {
      debugLog('video never became ready', err)
      if (mySession !== sessionId) return
      fail('Kamera tidak menghasilkan gambar. Tutup aplikasi lain yang memakai kamera, lalu coba lagi.')
      return
    }
    if (mySession !== sessionId) return

    setState('CAMERA_READY', performance.now())
    startLoop()
  }

  /** Full teardown: loop, timers, stream, state. Idempotent. */
  const stopCamera = () => {
    sessionId++
    stopLoop()
    stopStreamTracks()
    resetValidation()
  }

  /** Closing the camera UI. */
  const close = () => {
    stopCamera()
    setState('IDLE', performance.now())
  }

  /** "Foto Ulang": clear the capture lock and run a brand new session. */
  const retake = async () => {
    stopCamera()
    errorMessage.value = ''
    await start()
  }

  const teardown = () => {
    stopCamera()
    if (landmarker) {
      try {
        landmarker.close()
      } catch (err) {
        debugLog('landmarker close failed', err)
      }
      landmarker = null
      loadPromise = null
    }
  }

  onUnmounted(teardown)

  /** Template binding: `:ref="setVideoEl"` on the <video> element. */
  const setVideoEl = (el: unknown) => {
    videoRef.value = (el as HTMLVideoElement | null) ?? null
  }

  return {
    // bindings
    videoRef,
    setVideoEl,
    // state
    state,
    displayState,
    errorMessage,
    countdownValue,
    stableMs,
    faceCount,
    movementScore,
    metrics,
    instruction: computed(() => instructionFor(displayState.value)),
    config: cfg,
    // actions
    preload,
    start,
    retake,
    captureManual: capture,
    close,
    teardown,
  }
}
