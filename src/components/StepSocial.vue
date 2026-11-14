<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import axios from 'axios';

const emit = defineEmits(['next']);

const FB_URL = import.meta.env.VITE_FB_URL || '';
const IG_URL = import.meta.env.VITE_IG_URL || '';

const WAIT_SECONDS = 5;

const fbOpened = ref(false);
const igOpened = ref(false);
const confirmed = ref(false);
const secondsLeft = ref(WAIT_SECONDS);
const isSubmitting = ref(false);
const error = ref('');

let countdownTimer: ReturnType<typeof setInterval> | null = null;

// State persistence (sessionStorage only — cleared when the tab closes).
// On Android, tapping Facebook/Instagram often hands the tab off to the native
// app or an in-app browser; when the user returns, the OS may have discarded
// and reloaded this tab, which would otherwise wipe fbOpened/igOpened/confirmed
// and make it look like the whole registration restarted.
const SOCIAL_STORAGE_KEY = 'x5-social-step';

const restoreSocialState = () => {
  try {
    const raw = sessionStorage.getItem(SOCIAL_STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved?.fbOpened === true) fbOpened.value = true;
    if (saved?.igOpened === true) igOpened.value = true;
    if (saved?.confirmed === true) confirmed.value = true;
  } catch {
    /* corrupt state — start fresh */
  }
};
restoreSocialState();

const persistSocialState = () => {
  try {
    sessionStorage.setItem(
      SOCIAL_STORAGE_KEY,
      JSON.stringify({ fbOpened: fbOpened.value, igOpened: igOpened.value, confirmed: confirmed.value })
    );
  } catch {
    /* private mode / quota — persistence is a nicety, not a requirement */
  }
};

// If both links were already opened before the tab got reloaded, the user has
// necessarily spent real-world time away on Facebook/Instagram — no need to
// make them sit through the wait again.
if (fbOpened.value && igOpened.value) secondsLeft.value = 0;

watch([fbOpened, igOpened, confirmed], persistSocialState);

const bothOpened = computed(() => fbOpened.value && igOpened.value);
const waitDone = computed(() => bothOpened.value && secondsLeft.value <= 0);
const canContinue = computed(() => waitDone.value && confirmed.value && !isSubmitting.value);

const startCountdown = () => {
  if (countdownTimer) return;
  secondsLeft.value = WAIT_SECONDS;
  countdownTimer = setInterval(() => {
    secondsLeft.value -= 1;
    if (secondsLeft.value <= 0 && countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000);
};

const markOpened = (platform: 'fb' | 'ig') => {
  if (platform === 'fb') fbOpened.value = true;
  else igOpened.value = true;

  // The five-second window only starts once both tabs have actually been opened.
  if (bothOpened.value) startCountdown();
};

const blockedReason = computed(() => {
  if (!fbOpened.value && !igOpened.value) return 'Buka kedua tautan di atas dulu';
  if (!fbOpened.value) return 'Buka tautan Facebook dulu';
  if (!igOpened.value) return 'Buka tautan Instagram dulu';
  if (secondsLeft.value > 0) return `Tunggu ${secondsLeft.value} detik lagi`;
  if (!confirmed.value) return 'Centang konfirmasi di atas dulu';
  return '';
});

const submit = async () => {
  if (!canContinue.value) return;
  isSubmitting.value = true;
  error.value = '';

  try {
    const resp = await axios.post('/.netlify/functions/verify-social', {
      facebookOpened: fbOpened.value,
      instagramOpened: igOpened.value,
      confirmed: confirmed.value,
    });

    if (resp.data?.success && resp.data?.token) {
      try {
        sessionStorage.removeItem(SOCIAL_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      emit('next', {
        socialToken: resp.data.token,
        socialConfirmed: true,
      });
    } else {
      error.value = resp.data?.message || 'Konfirmasi gagal. Silakan coba lagi.';
    }
  } catch (e: any) {
    if (e?.response?.status === 429) {
      error.value = 'Terlalu banyak percobaan. Mohon tunggu sebentar lalu coba lagi.';
    } else {
      error.value = e?.response?.data?.message || 'Gagal menghubungi server. Periksa koneksi kamu.';
    }
  } finally {
    isSubmitting.value = false;
  }
};

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer);
});
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="text-center space-y-2">
      <h2 class="text-2xl md:text-3xl font-bold glitch-text font-orbitron">FOLLOW MEDIA SOSIAL</h2>
      <p class="text-sm text-gray-400 max-w-md mx-auto">
        Biar nggak ketinggalan info gathering, event, dan pengumuman komunitas.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Facebook -->
      <a
        :href="FB_URL || undefined"
        target="_blank"
        rel="noopener noreferrer"
        @click="markOpened('fb')"
        class="group relative overflow-hidden rounded-2xl border p-5 flex flex-col items-center gap-3 transition-all duration-300"
        :class="fbOpened
          ? 'border-[#1877F2] bg-[#1877F2]/10 shadow-[0_0_20px_rgba(24,119,242,0.25)]'
          : 'border-gray-700 bg-black/40 hover:border-[#1877F2] hover:bg-[#1877F2]/5'"
      >
        <div
          class="absolute inset-x-0 -top-16 h-32 opacity-30 blur-2xl transition-opacity duration-300 group-hover:opacity-60"
          style="background-image: radial-gradient(circle, #1877F2 0%, transparent 70%);"
        ></div>

        <div class="relative w-14 h-14 rounded-full bg-[#1877F2] flex items-center justify-center shadow-lg">
          <svg viewBox="0 0 24 24" class="w-8 h-8" aria-hidden="true">
            <path
              fill="#FFFFFF"
              d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.412c0-3.026 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
            />
          </svg>
        </div>

        <div class="relative text-center">
          <div class="font-orbitron font-bold text-white text-sm tracking-wide">FACEBOOK</div>
          <div class="text-[11px] text-gray-400 mt-1">XFIVE Community</div>
        </div>

        <div
          class="relative text-[11px] font-semibold px-3 py-1 rounded-full border"
          :class="fbOpened
            ? 'border-green-500/60 text-green-400 bg-green-500/10'
            : 'border-gray-600 text-gray-400'"
        >
          {{ fbOpened ? '✓ SUDAH DIBUKA' : 'BUKA & FOLLOW' }}
        </div>
      </a>

      <!-- Instagram -->
      <a
        :href="IG_URL || undefined"
        target="_blank"
        rel="noopener noreferrer"
        @click="markOpened('ig')"
        class="group relative overflow-hidden rounded-2xl border p-5 flex flex-col items-center gap-3 transition-all duration-300"
        :class="igOpened
          ? 'border-[#E1306C] bg-[#E1306C]/10 shadow-[0_0_20px_rgba(225,48,108,0.25)]'
          : 'border-gray-700 bg-black/40 hover:border-[#E1306C] hover:bg-[#E1306C]/5'"
      >
        <div
          class="absolute inset-x-0 -top-16 h-32 opacity-30 blur-2xl transition-opacity duration-300 group-hover:opacity-60"
          style="background-image: radial-gradient(circle, #E1306C 0%, transparent 70%);"
        ></div>

        <div
          class="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          style="background-image: linear-gradient(45deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%);"
        >
          <svg viewBox="0 0 24 24" class="w-8 h-8" aria-hidden="true">
            <path
              fill="#FFFFFF"
              d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
            />
          </svg>
        </div>

        <div class="relative text-center">
          <div class="font-orbitron font-bold text-white text-sm tracking-wide">INSTAGRAM</div>
          <div class="text-[11px] text-gray-400 mt-1">@xfive.community</div>
        </div>

        <div
          class="relative text-[11px] font-semibold px-3 py-1 rounded-full border"
          :class="igOpened
            ? 'border-green-500/60 text-green-400 bg-green-500/10'
            : 'border-gray-600 text-gray-400'"
        >
          {{ igOpened ? '✓ SUDAH DIBUKA' : 'BUKA & FOLLOW' }}
        </div>
      </a>
    </div>

    <p v-if="!FB_URL || !IG_URL" class="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/40 rounded-lg p-3">
      Tautan media sosial belum dikonfigurasi di server (VITE_FB_URL / VITE_IG_URL).
      Hubungi admin jika tombol di atas tidak membuka halaman apa pun.
    </p>

    <!-- Countdown -->
    <div
      v-if="bothOpened && secondsLeft > 0"
      class="text-center text-sm text-neon-blue border border-neon-blue/30 bg-neon-blue/5 rounded-lg py-3"
    >
      Sebentar ya, sedang memberi waktu buat kamu follow… <strong>{{ secondsLeft }}s</strong>
    </div>

    <!-- Honest disclosure + confirmation -->
    <div class="border border-gray-800 bg-black/50 rounded-xl p-4 space-y-3">
      <p class="text-xs text-gray-400 leading-relaxed">
        <strong class="text-gray-200">Catatan jujur:</strong>
        Facebook dan Instagram tidak menyediakan API yang memungkinkan kami mengecek
        apakah kamu benar-benar sudah follow. Jadi langkah ini berbasis konfirmasi kamu sendiri —
        kami percaya kamu. Kalau ternyata belum follow, kamu bisa follow kapan saja setelah ini.
      </p>

      <label
        class="flex items-start gap-3 cursor-pointer select-none"
        :class="{ 'opacity-50 cursor-not-allowed': !waitDone }"
      >
        <input
          type="checkbox"
          v-model="confirmed"
          :disabled="!waitDone"
          class="mt-0.5 w-4 h-4 accent-neon-blue shrink-0 disabled:cursor-not-allowed"
        />
        <span class="text-sm text-gray-200">Saya sudah follow kedua akun</span>
      </label>
    </div>

    <p v-if="error" class="p-3 bg-red-900/40 border border-red-500/60 rounded-lg text-sm text-red-200">
      {{ error }}
    </p>

    <button
      type="button"
      @click="submit"
      :disabled="!canContinue"
      class="btn w-full"
    >
      {{ isSubmitting ? 'MEMPROSES...' : (canContinue ? 'LANJUTKAN >>' : blockedReason.toUpperCase()) }}
    </button>
  </div>
</template>
