<script setup lang="ts">
import { computed, onMounted, nextTick, ref, watch } from 'vue';
import axios from 'axios';
import { useFaceScanner } from '../composables/useFaceScanner';

const emit = defineEmits(['next']);
const error = ref('');
const success = ref(false);

const isDev = import.meta.env.DEV;

// Privacy consent gate (shown before the camera is ever opened)
const consentGiven = ref(false);

// Ringkasan Kebijakan Privasi Verifikasi Biometrik (versi poin-poin).
const privacyPoints = [
  {
    icon: '🗄️',
    title: 'Kenapa harus simpan foto wajah?',
    content:
      'Karena kami pengen XFIVE tetap aman dan bebas akun siluman, faker, penipuan dan kejahatan siber lainnya. Face Scan digunakan untuk memastikan setiap member hanya punya satu akun. Jadi nggak ada cerita bikin akun siluman buat ngelabuhin sistem / tester.'
  },
  {
    icon: '🛡️',
    title: 'Data gue aman?',
    content:
      'Aman banget 👍. Data disimpan dengan sistem keamanan dan enkripsi berlapis. Member lain nggak bisa lihat data ini, dan aksesnya hanya owner dan leader untuk keperluan tertentu.'
  },
  {
    icon: '🎯',
    title: 'Data ini dipakai buat apa aja?',
    content:
      'Cuma buat verifikasi member, deteksi smurf, dan menjaga keamanan komunitas. Kami nggak jual data, nggak kasih ke pihak luar, dan nggak pakai datamu buat iklan. Privasi member tetap jadi prioritas utama.'
  }
];

// Face ID / Terminal States
const isTerminalOpen = ref(false);
const isCameraOpen = ref(false);
const terminalLogs = ref<string[]>([]);
const showContinueBtn = ref(false);
const tempSuccessData = ref<any>(null);

// Photo taken by the scanner, awaiting "Gunakan Foto" / "Foto Ulang".
const capturedImage = ref<string | null>(null);

// --- FACE SCANNER (MediaPipe Face Landmarker) ---
// A face merely being detected never triggers a capture: the scanner only fires
// after every condition (one face, distance, centering, head pose) has held
// still for the stability window and the countdown has finished.
const scanner = useFaceScanner({
  onCapture: (dataUri) => {
    capturedImage.value = dataUri;
  }
});

const {
  setVideoEl,
  state: scanState,
  instruction,
  countdownValue,
  stableMs,
  faceCount,
  movementScore,
  metrics,
  config: scanConfig
} = scanner;

// Progress of the "hold still" window, 0..1 — drives the ring under the guide.
const stabilityProgress = computed(() =>
  Math.min(1, stableMs.value / scanConfig.stableDurationMs)
);

const isCountingDown = computed(
  () => scanState.value === 'READY' || scanState.value === 'COUNTDOWN'
);

const toneClasses: Record<string, string> = {
  info: 'text-gray-300 border-gray-700 bg-gray-900/70',
  danger: 'text-red-300 border-red-800 bg-red-950/60',
  warn: 'text-yellow-200 border-yellow-700/70 bg-yellow-900/25',
  ok: 'text-green-300 border-green-600 bg-green-900/30'
};

const guideClasses: Record<string, string> = {
  info: 'border-gray-500/70',
  danger: 'border-red-500/80',
  warn: 'border-yellow-400/80',
  ok: 'border-green-400'
};

// A scanner-level failure (camera denied, MediaPipe unavailable, ...) falls back
// to the existing "AKSES DITOLAK / COBA LAGI" screen. It never captures.
watch(scanState, (value) => {
  if (value === 'ERROR') {
    error.value = scanner.errorMessage.value || 'Terjadi kesalahan pada kamera. Silakan coba lagi.';
    isCameraOpen.value = false;
    capturedImage.value = null;
  }
});

// --- BACKEND CALL ---
const requestBackendToken = async (method: 'fingerprint' | 'face') => {
    const resp = await axios.post('/.netlify/functions/verify-biometric', {
        method: method,
        autoVerified: true
    });
    return resp.data;
};

// --- CLIENT-SIDE VALIDATION ---
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

const validateImageClient = (dataUri: string): string | null => {
    if (!dataUri || !dataUri.startsWith('data:image/')) {
        return 'Format gambar tidak valid.';
    }
    const base64Part = dataUri.split(',')[1];
    if (!base64Part) return 'Data gambar kosong.';
    const sizeEstimate = Math.ceil(base64Part.length * 0.75);
    if (sizeEstimate < 1024) return 'Gambar terlalu kecil, coba lagi.';
    if (sizeEstimate > MAX_IMAGE_SIZE_BYTES) {
        return `Ukuran gambar terlalu besar (${(sizeEstimate / 1024 / 1024).toFixed(1)} MB, maks 2 MB).`;
    }
    return null;
};

// --- UPLOAD CALL (with auto-retry) ---
const UPLOAD_MAX_RETRIES = 3;
const UPLOAD_TIMEOUT_MS = 30000;

const uploadFaceImage = async (base64Image: string) => {
    const clientError = validateImageClient(base64Image);
    if (clientError) throw new Error(clientError);

    let lastError: any = null;
    for (let attempt = 0; attempt <= UPLOAD_MAX_RETRIES; attempt++) {
        if (attempt > 0) {
            const backoff = attempt * 1000;
            await new Promise(r => setTimeout(r, backoff));
        }
        try {
            const resp = await axios.post('/.netlify/functions/upload-biometric', {
                image: base64Image
            }, { timeout: UPLOAD_TIMEOUT_MS });
            return resp.data;
        } catch (err: any) {
            lastError = err;
            const status = err?.response?.status;
            if (status && status !== 500 && status !== 502 && status !== 503 && status !== 504) throw err;
            console.warn(`Upload attempt ${attempt + 1} failed (${status || err.message}), ${attempt < UPLOAD_MAX_RETRIES ? 'retrying...' : 'giving up'}`);
        }
    }
    throw lastError;
};

// --- FACE ID FLOW ---
const openCamera = async () => {
    if (success.value) return;
    if (error.value) error.value = '';

    capturedImage.value = null;
    isCameraOpen.value = true;
    // The <video> element must exist before the stream is attached.
    await nextTick();
    await scanner.start();
};

const closeCamera = () => {
    scanner.close();
    isCameraOpen.value = false;
    capturedImage.value = null;
};

// "Foto Ulang" — resets capture lock, state, stability timer and countdown.
const retakePhoto = async () => {
    capturedImage.value = null;
    await scanner.retake();
};

// "Gunakan Foto" — hands the photo to the existing upload flow untouched.
const usePhoto = () => {
    const image = capturedImage.value;
    if (!image) return;
    scanner.close();
    isCameraOpen.value = false;
    capturedImage.value = null;
    startTerminalSequence(image);
};

const startTerminalSequence = async (faceImage: string) => {
    isTerminalOpen.value = true;
    terminalLogs.value = [];

    terminalLogs.value.push('> SYSTEM_INIT: BIOMETRIC_MODULE...');
    terminalLogs.value.push('> UPLOADING_ENCRYPTED_DATA...');

    try {
        const uploadResp = await uploadFaceImage(faceImage);

        if (!uploadResp.success) throw new Error('Upload Failed');
        terminalLogs.value.push('> UPLOAD_COMPLETE.');

        const data = await requestBackendToken('face');

        if (data.verified) {
            terminalLogs.value.push('> IDENTITY_CONFIRMED.');
            terminalLogs.value.push('> ACCESS_GRANTED.');

            tempSuccessData.value = {
                biometricId: data.credentialId,
                biometricToken: data.token,
                verifiedAt: new Date().toISOString(),
                faceImageUrl: uploadResp.imageUrl,
                // Temporary blob key; submit-registration re-keys it to the
                // final "<nama>-<nickname>-<KODE>.jpg" name once the member
                // code exists.
                tempKey: uploadResp.tempKey || uploadResp.publicId
            };

            success.value = true;

            setTimeout(() => {
                isTerminalOpen.value = false;
                showContinueBtn.value = true;
            }, 1000);
        }
    } catch (e: any) {
        console.error(e);
        const status = e?.response?.status;
        const serverMsg = e?.response?.data?.error || e?.response?.data?.details;

        let userError = '';
        if (status === 429) {
            terminalLogs.value.push('> RATE_LIMIT_EXCEEDED.');
            userError = 'Terlalu banyak percobaan. Mohon tunggu 1 menit sebelum mencoba lagi.';
        } else if (status === 413) {
            terminalLogs.value.push('> FILE_TOO_LARGE.');
            userError = 'Ukuran file terlalu besar. Maks 2 MB.';
        } else if (e.code === 'ECONNABORTED' || e.message === 'Network Error') {
            terminalLogs.value.push('> NETWORK_ERROR.');
            userError = 'Koneksi internet terputus atau tidak stabil. Periksa koneksi Anda dan coba lagi.';
        } else {
            terminalLogs.value.push(`> ERROR: ${serverMsg || status || 'Unknown'}`);
            userError = 'Terjadi kesalahan. Silakan coba lagi.';
        }
        error.value = userError;
        setTimeout(() => {
            isTerminalOpen.value = false;
        }, 1500);
    }
};

const handleContinue = () => {
    if (tempSuccessData.value) emit('next', tempSuccessData.value);
};

// Called when the user accepts the Privacy Notice.
const acceptPrivacyAndStart = async () => {
    consentGiven.value = true;
    await openCamera();
};

onMounted(() => {
    // Warm up the MediaPipe WASM + model in the background while the user reads
    // the Privacy Notice. This does NOT touch the camera: permission is only
    // requested once the user presses the button below.
    scanner.preload();
});
</script>

<template>
  <div class="text-center space-y-8 py-8 animate-fade-in select-none min-h-[400px] flex flex-col justify-center relative">

    <!-- PRIVACY NOTICE (consent gate before the camera ever opens) -->
    <div v-if="!consentGiven && !error" class="space-y-6 animate-fade-in text-left">
        <div class="text-center space-y-2">
            <h2 class="text-2xl md:text-3xl font-bold glitch-text font-orbitron">🔒 Kebijakan Privasi Verifikasi Biometrik</h2>
            <p class="text-xs md:text-sm text-gray-400 max-w-md mx-auto">
                Sebelum scan wajah, kami mau jujur dulu soal data kamu. Baca bentar ya — singkat kok.
            </p>
        </div>

        <div class="space-y-4 border border-gray-800 p-5 rounded-xl bg-black/50 max-h-72 overflow-y-auto custom-scrollbar">
            <div v-for="(point, idx) in privacyPoints" :key="idx" class="flex gap-3">
                <span class="text-xl leading-none mt-0.5 shrink-0">{{ point.icon }}</span>
                <div class="space-y-1">
                    <h3 class="text-neon-blue font-semibold text-sm">{{ point.title }}</h3>
                    <p class="text-gray-300 text-xs md:text-sm leading-relaxed">{{ point.content }}</p>
                </div>
            </div>
        </div>

        <!-- Actionable consent text -->
        <div class="p-4 border border-neon-blue/40 bg-neon-blue/5 rounded-lg">
            <p class="text-gray-200 text-xs md:text-sm leading-relaxed text-center">
                Dengan menekan tombol di bawah, kamu setuju wajahmu disimpan &amp; dienkripsi di server XFIVE
                untuk validasi keanggotaan dan pencegahan smurf — sesuai poin di atas.
            </p>
        </div>

        <div class="flex justify-center">
            <button
                @click="acceptPrivacyAndStart"
                class="btn w-full md:w-auto text-neon-blue border-neon-blue hover:bg-neon-blue hover:text-black"
            >
                SAYA SETUJU &amp; MULAI SCAN &gt;&gt;
            </button>
        </div>
    </div>

    <!-- Header -->
    <div v-if="consentGiven && !isCameraOpen && !isTerminalOpen && !success && !error" class="space-y-2">
        <h2 class="text-3xl font-bold glitch-text font-orbitron">VERIFIKASI BIOMETRIK</h2>
        <p class="text-sm text-gray-400">Menyiapkan kamera...</p>
    </div>

    <!-- Error State (No Camera / Failed) -->
    <div v-if="error" class="relative z-[60] space-y-4 animate-fade-in">
         <div class="text-neon-pink text-xl font-bold font-orbitron">AKSES DITOLAK</div>
         <div class="text-sm text-gray-400 max-w-md mx-auto border border-red-900 bg-red-900/10 p-4 rounded">
            {{ error }}
         </div>
         <button type="button" @click="openCamera" class="btn border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black mt-4">
            COBA LAGI
         </button>
    </div>

    <!-- Success Header -->
    <div v-if="success" class="space-y-2 animate-fade-in">
        <h2 class="text-3xl font-bold text-green-500 font-orbitron">VERIFIKASI SUKSES</h2>
        <p class="text-sm text-gray-400">Identitas terkonfirmasi.</p>
    </div>

    <!-- CAMERA UI -->
    <div v-if="isCameraOpen" class="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div class="w-full max-w-sm flex items-center justify-between mb-2 sm:mb-3">
            <h3 class="text-neon-blue font-orbitron text-base sm:text-xl">
                {{ capturedImage ? 'PERIKSA FOTO' : 'SCAN WAJAH ANDA' }}
            </h3>
            <button
                @click="closeCamera"
                aria-label="Tutup kamera"
                class="text-gray-400 hover:text-neon-blue border border-gray-700 hover:border-neon-blue rounded w-8 h-8 flex items-center justify-center transition-colors"
            >
                ✕
            </button>
        </div>

        <div class="relative w-full max-w-sm aspect-[3/4] border-2 border-neon-blue rounded-lg overflow-hidden shadow-[0_0_50px_rgba(0,255,255,0.3)] bg-gray-900">
            <!-- LIVE CAMERA (hidden while the preview is up) -->
            <video
                v-show="!capturedImage"
                :ref="setVideoEl"
                autoplay
                playsinline
                muted
                class="w-full h-full object-cover relative z-10"
            ></video>

            <!-- PHOTO PREVIEW -->
            <img
                v-if="capturedImage"
                :src="capturedImage"
                alt="Pratinjau foto wajah"
                class="w-full h-full object-cover relative z-10"
            />

            <template v-if="!capturedImage">
                <!-- Face guide: keeps the user's face inside the validated area -->
                <div class="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                    <div
                        class="w-[46%] h-[48%] rounded-[50%] border-2 border-dashed transition-colors duration-300"
                        :class="guideClasses[instruction.tone]"
                    ></div>
                </div>

                <!-- Scan sweep (paused once the position is locked in) -->
                <div
                    v-if="!isCountingDown"
                    class="absolute inset-0 bg-[linear-gradient(transparent,rgba(0,255,255,0.2),transparent)] animate-scan-y pointer-events-none z-30"
                ></div>

                <!-- Countdown 3 / 2 / 1 -->
                <div
                    v-if="scanState === 'COUNTDOWN' && countdownValue > 0"
                    class="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
                >
                    <span class="font-orbitron font-bold text-7xl sm:text-8xl text-green-400 drop-shadow-[0_0_25px_rgba(57,255,20,0.8)] animate-pulse">
                        {{ countdownValue }}
                    </span>
                </div>

                <!-- Stability progress ("hold still" window) -->
                <div class="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60 z-40">
                    <div
                        class="h-full bg-green-400 transition-[width] duration-100 ease-linear"
                        :style="{ width: (stabilityProgress * 100) + '%' }"
                    ></div>
                </div>

                <!-- Corners -->
                <div class="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-neon-blue z-30"></div>
                <div class="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-neon-blue z-30"></div>
                <div class="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-neon-blue z-30"></div>
                <div class="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-neon-blue z-30"></div>

                <!-- DEV-only diagnostics; never rendered in production builds -->
                <div
                    v-if="isDev && metrics"
                    class="absolute top-3 left-3 z-40 text-[10px] leading-snug font-mono text-left text-neon-green bg-black/70 px-2 py-1 rounded pointer-events-none"
                >
                    <div>State: {{ scanState }}</div>
                    <div>Faces: {{ faceCount }}</div>
                    <div>Size: {{ metrics.heightRatio.toFixed(2) }}</div>
                    <div>Center: {{ metrics.centerX.toFixed(2) }} / {{ metrics.centerY.toFixed(2) }}</div>
                    <div>Yaw: {{ metrics.yawDeg.toFixed(0) }} Pitch: {{ metrics.pitchDeg.toFixed(0) }} Roll: {{ metrics.rollDeg.toFixed(0) }}</div>
                    <div>Move: {{ movementScore.toFixed(2) }}</div>
                    <div>Stable: {{ Math.round(stableMs) }}ms</div>
                </div>
            </template>
        </div>

        <!-- ONE real-time instruction at a time -->
        <div
            v-if="!capturedImage"
            class="w-full max-w-sm mt-3 border rounded-lg px-4 py-3 text-sm font-semibold transition-colors duration-300"
            :class="toneClasses[instruction.tone]"
            aria-live="polite"
        >
            {{ instruction.text }}
        </div>
        <p v-if="!capturedImage" class="mt-2 text-gray-400 text-xs max-w-sm text-center">
            Foto otomatis diambil setelah posisi wajah stabil, atau tekan tombol di bawah:
        </p>

        <!-- Optional Manual Shutter Button -->
        <button
            v-if="!capturedImage && isCameraOpen"
            type="button"
            @click="scanner.captureManual"
            class="w-full max-w-sm mt-2.5 py-2.5 px-4 rounded-xl border border-neon-blue/50 bg-black/60 hover:bg-neon-blue/20 text-neon-blue text-xs font-orbitron font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-[0_0_15px_rgba(0,255,255,0.2)]"
        >
            <span>📸 AMBIL FOTO MANUAL (WEBP)</span>
        </button>

        <!-- PREVIEW ACTIONS -->
        <div v-if="capturedImage" class="w-full max-w-sm mt-4 flex flex-col sm:flex-row gap-3">
            <button
                @click="usePhoto"
                class="btn flex-1 text-green-400 border-green-500 hover:bg-green-500 hover:text-black"
            >
                GUNAKAN FOTO
            </button>
            <button
                @click="retakePhoto"
                class="btn flex-1 text-neon-blue border-neon-blue hover:bg-neon-blue hover:text-black"
            >
                FOTO ULANG
            </button>
        </div>
    </div>

    <!-- Continue Button (Main UI) -->
    <div v-if="(showContinueBtn || success) && !isCameraOpen && !isTerminalOpen" class="mt-8 animate-fade-in">
        <div class="flex justify-center mb-6">
             <div class="w-24 h-24 rounded-full border-4 border-green-500 flex items-center justify-center animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
             </div>
        </div>
        <button @click="handleContinue" class="btn w-full max-w-xs text-green-400 border-green-500 hover:bg-green-500 hover:text-black">
            LANJUTKAN >>
        </button>
    </div>

    <!-- Initial Loading State -->
    <div v-if="consentGiven && !isCameraOpen && !success && !isTerminalOpen && !error" class="flex justify-center mt-10">
       <div class="w-8 h-8 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- HACKER TERMINAL OVERLAY -->
    <transition name="fade">
        <div v-if="isTerminalOpen" class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div class="w-full max-w-sm bg-black border-2 border-neon-blue rounded-lg p-1 overflow-hidden shadow-[0_0_30px_rgba(0,255,255,0.4)] animate-fade-in">
                <!-- Terminal Header -->
                <div class="bg-neon-blue text-black font-bold text-xs px-2 py-1 flex justify-between items-center font-mono">
                    <span>X5_TERMINAL_V2.0</span>
                    <span class="animate-pulse">● LIVE</span>
                </div>

                <!-- Terminal Body -->
                <div
                    id="hacker-terminal"
                    class="bg-black p-4 h-64 overflow-y-auto text-left font-mono text-xs sm:text-sm space-y-2 custom-scrollbar"
                >
                    <div v-for="(log, idx) in terminalLogs" :key="idx" class="typing-text text-green-500 break-words">
                        {{ log }}
                    </div>
                </div>
            </div>
        </div>
    </transition>

  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #00FFFF;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@keyframes scan-y {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
}
.animate-scan-y {
    animation: scan-y 3s linear infinite;
}
</style>
