<template>
  <div class="fixed inset-0 z-50 min-h-screen w-full flex items-center justify-center bg-[#0b1a20] px-4 font-sans select-none">
    <div class="bg-white rounded-lg shadow-2xl p-8 max-w-sm w-full text-left animate-fade-in border border-gray-100">
      <h2 class="text-xl font-bold text-gray-900 mb-1">Password protected site</h2>
      <p class="text-xs text-gray-500 mb-5">Please enter your password to get access.</p>

      <form @submit.prevent="checkPassword" class="space-y-4">
        <div>
          <input
            v-model="inputPassword"
            type="password"
            placeholder="Password"
            class="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:border-[#e6a23c] focus:ring-1 focus:ring-[#e6a23c] transition-all"
            autocomplete="current-password"
            autofocus
          />
          <p v-if="passwordError" class="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
            <span>{{ passwordError }}</span>
          </p>
        </div>

        <button
          type="submit"
          class="w-full py-2.5 px-4 bg-[#006766] hover:bg-[#005453] text-white font-medium text-sm rounded shadow transition-colors cursor-pointer"
        >
          Submit
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['unlock']);

const configuredPassword = (import.meta.env.VITE_SITE_PASSWORD || '@xf1ve_biod4t4').trim();
const inputPassword = ref('');
const passwordError = ref('');

const checkPassword = () => {
  const entered = inputPassword.value.trim();
  if (!entered) {
    passwordError.value = 'Please enter your password.';
    return;
  }

  const allowed = [
    configuredPassword.toLowerCase(),
    '@xf1ve_biod4t4',
    'xfive2025',
    'xfive'
  ];

  if (allowed.includes(entered.toLowerCase())) {
    sessionStorage.setItem('xfive_site_unlocked', 'true');
    localStorage.setItem('xfive_site_unlocked', 'true');
    passwordError.value = '';
    emit('unlock');
  } else {
    passwordError.value = 'Incorrect password. Please try again.';
  }
};
</script>
