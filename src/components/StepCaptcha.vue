<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const emit = defineEmits(['next']);
const challengeSvg = ref('');
const userInput = ref('');
const error = ref('');
const isLoading = ref(false);
const token = ref('');

const loadCaptcha = async () => {
  error.value = '';
  try {
    const resp = await axios.get('/.netlify/functions/get-captcha');
    if (resp.data && resp.data.svg) {
      challengeSvg.value = resp.data.svg;
      token.value = resp.data.token;
    } else {
      throw new Error('Invalid Captcha Response');
    }
  } catch (e: any) {
    console.error('Captcha Load Error:', e);
    error.value = 'Gagal memuat Captcha. Pastikan koneksi internet lancar.';
  } finally {
    isLoading.value = false;
  }
};

const verifyCaptcha = async () => {
  if (!userInput.value.trim()) return;
  isLoading.value = true;
  error.value = '';

  try {
    const resp = await axios.post('/.netlify/functions/verify-captcha', {
      answer: userInput.value.trim(),
      token: token.value
    });

    if (resp.data && resp.data.valid) {
      emit('next', { captchaToken: resp.data.token });
    } else {
      error.value = resp.data?.message || 'Kode salah. Silakan coba lagi.';
      userInput.value = ''; // Kosongkan input text saat user salah
      loadCaptcha();
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Kode salah atau captcha kedaluwarsa. Silakan coba lagi.';
    userInput.value = ''; // Kosongkan input text saat error
    loadCaptcha();
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadCaptcha();
});
</script>

<template>
  <div class="space-y-6 text-center animate-fade-in">
    <h2 class="text-2xl font-bold glitch-text font-orbitron">KEAMANAN TAMBAHAN</h2>
    <p class="text-sm text-gray-400">Mohon verifikasi bahwa Anda bukan robot.</p>

    <!-- Captcha Container with Min Height to prevent layout shift -->
    <div class="bg-[#1a1a1a] border border-gray-700 rounded p-4 mx-auto max-w-[300px] min-h-[100px] flex items-center justify-center overflow-hidden relative shadow-inner">
      <div v-if="!challengeSvg && !error" class="absolute inset-0 flex items-center justify-center">
        <div class="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div v-if="challengeSvg" v-html="challengeSvg" class="w-full h-full [&>svg]:w-full [&>svg]:h-full"></div>
      <div v-if="error && !challengeSvg" class="text-red-400 text-xs">{{ error }}</div>
    </div>

    <!-- Reload Button -->
    <button @click="loadCaptcha" type="button" class="text-xs text-neon-blue hover:text-white underline cursor-pointer">
      Muat Ulang Captcha
    </button>

    <div class="max-w-xs mx-auto space-y-4">
      <!-- Input Text dengan background putih dan warna font HITAM pekat -->
      <input
        v-model="userInput"
        type="text"
        class="w-full bg-white text-black font-black text-center text-2xl tracking-widest uppercase border-2 border-cyan-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-300 transition-all shadow-[0_0_12px_rgba(0,255,255,0.25)] placeholder:text-gray-400"
        placeholder="MASUKKAN KODE"
        maxlength="6"
        autocomplete="off"
        autofocus
        @keyup.enter="verifyCaptcha"
      >

      <p v-if="error" class="text-neon-pink text-xs font-semibold">{{ error }}</p>

      <button @click="verifyCaptcha" class="btn w-full" :disabled="isLoading || !userInput">
        {{ isLoading ? 'MEMVERIFIKASI...' : 'KONFIRMASI' }}
      </button>
    </div>
  </div>
</template>
