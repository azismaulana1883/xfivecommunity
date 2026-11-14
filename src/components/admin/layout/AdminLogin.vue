<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import {
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-vue-next';
import { useAdminAuth } from '@/composables/admin/useAdminAuth';

const emit = defineEmits<{
  (e: 'success'): void;
}>();

const { login, loginLoading, loginError } = useAdminAuth();

const username = ref('');
const password = ref('');
const showPassword = ref(false);

const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAF27wdCgN61fGdoH';
const adminTurnstileToken = ref('');
const adminTurnstileWidgetId = ref<string | null>(null);
const adminTurnstileStatus = ref<'loading' | 'verified' | 'error'>('loading');
const adminTurnstileError = ref('');

const resetAdminTurnstile = () => {
  adminTurnstileToken.value = '';
  adminTurnstileStatus.value = 'loading';
  adminTurnstileError.value = '';
  const turnstile = (window as any).turnstile;
  if (adminTurnstileWidgetId.value !== null && turnstile) {
    try {
      turnstile.reset(adminTurnstileWidgetId.value);
    } catch {}
  }
};

const renderAdminTurnstile = () => {
  const turnstile = (window as any).turnstile;
  if (!turnstile) return;

  const container = document.getElementById('admin-turnstile-container');
  if (!container) return;
  if (adminTurnstileWidgetId.value !== null) return;

  try {
    adminTurnstileStatus.value = 'loading';
    adminTurnstileWidgetId.value = turnstile.render('#admin-turnstile-container', {
      sitekey: turnstileSiteKey,
      theme: 'dark',
      size: 'flexible',
      appearance: 'always',
      retry: 'auto',
      'retry-interval': 2000,
      'refresh-expired': 'auto',
      callback: (token: string) => {
        adminTurnstileToken.value = token;
        adminTurnstileStatus.value = 'verified';
        adminTurnstileError.value = '';
        loginError.value = '';
      },
      'error-callback': (code?: string) => {
        console.warn('Admin Turnstile error code:', code);
        adminTurnstileToken.value = '';
        adminTurnstileStatus.value = 'error';
        adminTurnstileError.value = code ? `Kode error: ${code}` : 'Verifikasi Cloudflare gagal';
        return true;
      },
      'expired-callback': () => {
        adminTurnstileToken.value = '';
        adminTurnstileStatus.value = 'loading';
        resetAdminTurnstile();
      },
      'timeout-callback': () => {
        adminTurnstileToken.value = '';
        adminTurnstileStatus.value = 'error';
        adminTurnstileError.value = 'Waktu verifikasi habis. Silakan coba lagi.';
      },
    });
  } catch (err: any) {
    console.error('Turnstile render exception:', err);
    adminTurnstileStatus.value = 'error';
    adminTurnstileError.value = err.message || 'Gagal memuat Turnstile widget';
  }
};

const ensureAdminTurnstile = () => {
  let retries = 0;
  const maxRetries = 50;

  const poll = () => {
    const container = document.getElementById('admin-turnstile-container');
    const turnstile = (window as any).turnstile;

    if (container && turnstile) {
      renderAdminTurnstile();
      return;
    }

    retries++;
    if (retries < maxRetries) {
      setTimeout(poll, 150);
    }
  };

  poll();
};

onMounted(() => {
  ensureAdminTurnstile();
});

const handleSubmit = async () => {
  if (turnstileSiteKey && !adminTurnstileToken.value) {
    loginError.value = 'Harap tunggu atau selesaikan verifikasi Cloudflare Turnstile di bawah.';
    return;
  }

  const success = await login(username.value, password.value, adminTurnstileToken.value);
  if (success) {
    emit('success');
  }
};
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-cover bg-center"
    style="background: radial-gradient(circle at center, rgba(14,24,45,0.85) 0%, rgba(7,9,14,0.98) 100%);"
  >
    <div class="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

    <div class="w-full max-w-md relative z-10">
      <div class="rounded-2xl border border-cyan-500/30 bg-[#0d131f]/90 backdrop-blur-xl p-8 shadow-[0_0_50px_rgba(0,255,255,0.1)]">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mb-3 text-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.2)]">
            <Shield class="w-7 h-7" />
          </div>
          <h1 class="text-3xl font-extrabold font-orbitron tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400">
            ADMIN XFIVE
          </h1>
          <p class="text-xs text-gray-400 mt-1 uppercase tracking-widest font-mono">Control Center v3.0</p>
        </div>

        <div v-if="loginError" class="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle class="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{{ loginError }}</span>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-xs font-orbitron uppercase tracking-wider text-cyan-300 mb-2">Username</label>
            <input
              v-model="username"
              type="text"
              placeholder="Masukkan username admin"
              autocomplete="username"
              required
              class="w-full px-4 py-3 rounded-xl bg-black/60 border border-cyan-500/20 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-sm outline-none transition"
            />
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-xs font-orbitron uppercase tracking-wider text-fuchsia-300">Password</label>
            </div>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan password admin"
                autocomplete="current-password"
                required
                class="w-full px-4 py-3 rounded-xl bg-black/60 border border-fuchsia-500/20 focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400 text-white text-sm outline-none transition pr-11"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="rounded-xl border border-cyan-500/30 bg-black/60 p-3.5 space-y-2">
            <div class="flex items-center justify-between text-xs font-orbitron">
              <span class="text-cyan-300 font-bold flex items-center gap-1.5 text-[11px]">
                <Shield class="w-3.5 h-3.5 text-cyan-400" />
                <span>Verifikasi Cloudflare Anti-Bot</span>
              </span>
              <span v-if="adminTurnstileToken" class="text-emerald-400 font-mono font-bold text-[10px] flex items-center gap-1">
                <CheckCircle class="w-3 h-3 text-emerald-400" /> TERVERIFIKASI
              </span>
              <span v-else-if="adminTurnstileStatus === 'error'" class="text-rose-400 font-mono font-bold text-[10px] flex items-center gap-1">
                <AlertTriangle class="w-3 h-3 text-rose-400" /> PERIKSA KONEKSI
              </span>
            </div>

            <div id="admin-turnstile-container" class="flex justify-center items-center min-h-[65px] my-1"></div>

            <div v-if="adminTurnstileStatus === 'error'" class="text-center space-y-1">
              <p class="text-[10px] text-rose-400 font-mono">
                {{ adminTurnstileError || 'Gagal memuat verifikasi Turnstile.' }}
              </p>
              <button
                type="button"
                @click="resetAdminTurnstile(); ensureAdminTurnstile()"
                class="text-[10px] text-cyan-400 hover:underline font-mono inline-flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw class="w-2.5 h-2.5" /> Muat Ulang Widget
              </button>
            </div>
            <p v-else-if="!adminTurnstileToken" class="text-[10px] text-gray-400 font-mono text-center flex items-center justify-center gap-1">
              <RefreshCw class="w-2.5 h-2.5 animate-spin text-cyan-400" />
              <span>Cloudflare sedang memverifikasi browser Anda...</span>
            </p>
          </div>

          <button
            type="submit"
            :disabled="loginLoading"
            class="w-full py-3.5 rounded-xl font-orbitron font-bold text-sm tracking-widest uppercase bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-[0_0_25px_rgba(0,255,255,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw v-if="loginLoading" class="w-4 h-4 animate-spin" />
            <span>{{ loginLoading ? 'Mengautentikasi...' : 'Masuk Control Panel' }}</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <router-link to="/" class="text-xs text-gray-500 hover:text-cyan-400 transition font-mono flex items-center justify-center gap-1">
            ← Kembali ke Beranda
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
