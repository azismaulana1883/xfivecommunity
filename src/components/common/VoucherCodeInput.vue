<template>
  <div class="space-y-4">
    <!-- Voucher Code: 3 Kotak Kecil @ 4 Digit -->
    <div>
      <label class="block text-xs font-orbitron uppercase text-gray-300 font-bold mb-1.5 flex items-center justify-between">
        <span class="flex items-center gap-1.5">
          <i class="fas fa-ticket text-cyan-400"></i>
          <span>Voucher Code (12 Digit)</span>
        </span>
        <span class="text-[10px] font-mono text-cyan-400/80">3 Kotak &bull; 4 Digit / Kotak</span>
      </label>

      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Kotak 1 -->
        <div class="flex-1 relative">
          <input
            ref="box1Ref"
            type="text"
            maxlength="4"
            v-model="part1"
            placeholder="XXXX"
            @input="handleInput(1, $event)"
            @keydown="handleKeyDown(1, $event)"
            @paste="handlePaste"
            class="w-full text-center tracking-[0.2em] font-mono font-bold text-sm sm:text-base uppercase bg-black/50 border border-white/10 focus:border-cyan-400 focus:bg-cyan-500/5 rounded-xl py-2.5 text-white transition-all outline-none"
          />
          <span class="absolute bottom-1 right-2 text-[9px] font-mono text-gray-500">{{ part1.length }}/4</span>
        </div>

        <span class="text-gray-500 font-bold text-lg select-none">-</span>

        <!-- Kotak 2 -->
        <div class="flex-1 relative">
          <input
            ref="box2Ref"
            type="text"
            maxlength="4"
            v-model="part2"
            placeholder="XXXX"
            @input="handleInput(2, $event)"
            @keydown="handleKeyDown(2, $event)"
            @paste="handlePaste"
            class="w-full text-center tracking-[0.2em] font-mono font-bold text-sm sm:text-base uppercase bg-black/50 border border-white/10 focus:border-cyan-400 focus:bg-cyan-500/5 rounded-xl py-2.5 text-white transition-all outline-none"
          />
          <span class="absolute bottom-1 right-2 text-[9px] font-mono text-gray-500">{{ part2.length }}/4</span>
        </div>

        <span class="text-gray-500 font-bold text-lg select-none">-</span>

        <!-- Kotak 3 -->
        <div class="flex-1 relative">
          <input
            ref="box3Ref"
            type="text"
            maxlength="4"
            v-model="part3"
            placeholder="XXXX"
            @input="handleInput(3, $event)"
            @keydown="handleKeyDown(3, $event)"
            @paste="handlePaste"
            class="w-full text-center tracking-[0.2em] font-mono font-bold text-sm sm:text-base uppercase bg-black/50 border border-white/10 focus:border-cyan-400 focus:bg-cyan-500/5 rounded-xl py-2.5 text-white transition-all outline-none"
          />
          <span class="absolute bottom-1 right-2 text-[9px] font-mono text-gray-500">{{ part3.length }}/4</span>
        </div>
      </div>
      <p class="text-[10px] text-gray-500 font-mono mt-1">
        *Kursor otomatis berpindah ke kotak berikutnya setelah 4 digit terisi.
      </p>
    </div>

    <!-- Voucher Password -->
    <div>
      <label class="block text-xs font-orbitron uppercase text-gray-300 font-bold mb-1.5 flex items-center justify-between">
        <span class="flex items-center gap-1.5">
          <i class="fas fa-key text-cyan-400"></i>
          <span>Password Voucher (varchar 100)</span>
        </span>
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          <span>{{ showPassword ? 'Sembunyikan' : 'Tampilkan' }}</span>
        </button>
      </label>

      <div class="relative">
        <input
          ref="passwordRef"
          :type="showPassword ? 'text' : 'password'"
          maxlength="100"
          v-model="voucherPassword"
          placeholder="Masukkan password voucher Mi-Cash..."
          class="w-full bg-black/50 border border-white/10 focus:border-cyan-400 focus:bg-cyan-500/5 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-gray-500 transition-all outline-none"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      code_part1: '',
      code_part2: '',
      code_part3: '',
      password: '',
    }),
  },
});

const emit = defineEmits(['update:modelValue', 'complete']);

const part1 = ref(props.modelValue.code_part1 || '');
const part2 = ref(props.modelValue.code_part2 || '');
const part3 = ref(props.modelValue.code_part3 || '');
const voucherPassword = ref(props.modelValue.password || '');
const showPassword = ref(false);

const box1Ref = ref(null);
const box2Ref = ref(null);
const box3Ref = ref(null);
const passwordRef = ref(null);

watch([part1, part2, part3, voucherPassword], () => {
  emit('update:modelValue', {
    code_part1: part1.value.trim().toUpperCase(),
    code_part2: part2.value.trim().toUpperCase(),
    code_part3: part3.value.trim().toUpperCase(),
    password: voucherPassword.value.trim(),
  });
});

const handleInput = (boxIndex, event) => {
  const input = event.target;
  let val = (input.value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (val.length > 4) val = val.slice(0, 4);

  if (boxIndex === 1) {
    part1.value = val;
    if (val.length === 4) {
      nextTick(() => box2Ref.value?.focus());
    }
  } else if (boxIndex === 2) {
    part2.value = val;
    if (val.length === 4) {
      nextTick(() => box3Ref.value?.focus());
    }
  } else if (boxIndex === 3) {
    part3.value = val;
    if (val.length === 4) {
      nextTick(() => passwordRef.value?.focus());
      emit('complete');
    }
  }
};

const handleKeyDown = (boxIndex, event) => {
  if (event.key === 'Backspace') {
    if (boxIndex === 2 && part2.value === '') {
      box1Ref.value?.focus();
    } else if (boxIndex === 3 && part3.value === '') {
      box2Ref.value?.focus();
    }
  }
};

const handlePaste = (event) => {
  event.preventDefault();
  const pasted = (event.clipboardData || window.clipboardData).getData('text');
  const clean = (pasted || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (clean.length >= 12) {
    part1.value = clean.slice(0, 4);
    part2.value = clean.slice(4, 8);
    part3.value = clean.slice(8, 12);
    nextTick(() => passwordRef.value?.focus());
  } else if (clean.length > 0) {
    part1.value = clean.slice(0, 4);
    if (clean.length > 4) part2.value = clean.slice(4, 8);
    if (clean.length > 8) part3.value = clean.slice(8, 12);
  }
};

const reset = () => {
  part1.value = '';
  part2.value = '';
  part3.value = '';
  voucherPassword.value = '';
};

defineExpose({
  reset,
  focus: () => box1Ref.value?.focus(),
});
</script>
