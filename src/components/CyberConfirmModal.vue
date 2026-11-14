<script setup lang="ts">
import { useConfirm } from '@/composables/useConfirm';
import { AlertTriangle, HelpCircle, X, ShieldAlert, Check } from 'lucide-vue-next';
import { nextTick, watch, ref } from 'vue';

const { state, handleConfirm, handleCancel } = useConfirm();
const inputRef = ref<HTMLInputElement | null>(null);

watch(
  () => state.value.isOpen,
  (open) => {
    if (open && state.value.isPrompt) {
      nextTick(() => {
        inputRef.value?.focus();
        inputRef.value?.select();
      });
    }
  }
);

const onKeyDown = (e: KeyboardEvent) => {
  if (!state.value.isOpen) return;
  if (e.key === 'Escape') {
    handleCancel();
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="state.isOpen"
        class="fixed inset-0 z-[99998] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        @keydown="onKeyDown"
        tabindex="-1"
      >
        <div
          class="rounded-2xl border bg-[#0d121c] p-6 w-full max-w-md shadow-2xl overflow-hidden relative animate-scale-up"
          :class="{
            'border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.25)]': state.variant === 'danger',
            'border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.25)]': state.variant === 'warning',
            'border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.25)]': state.variant === 'info' || state.variant === 'success',
          }"
        >
          <!-- Top Glow Accent Line -->
          <div
            class="absolute top-0 left-0 right-0 h-1"
            :class="{
              'bg-gradient-to-r from-transparent via-rose-500 to-transparent': state.variant === 'danger',
              'bg-gradient-to-r from-transparent via-amber-500 to-transparent': state.variant === 'warning',
              'bg-gradient-to-r from-transparent via-cyan-400 to-transparent': state.variant === 'info' || state.variant === 'success',
            }"
          />

          <!-- Header -->
          <div class="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
            <div class="flex items-center gap-2.5">
              <div
                class="w-7 h-7 rounded-lg flex items-center justify-center"
                :class="{
                  'bg-rose-500/10 text-rose-400 border border-rose-500/30': state.variant === 'danger',
                  'bg-amber-500/10 text-amber-400 border border-amber-500/30': state.variant === 'warning',
                  'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30': state.variant === 'info' || state.variant === 'success',
                }"
              >
                <ShieldAlert v-if="state.variant === 'danger'" class="w-4 h-4" />
                <AlertTriangle v-else-if="state.variant === 'warning'" class="w-4 h-4" />
                <HelpCircle v-else class="w-4 h-4" />
              </div>
              <h3 class="font-bold font-orbitron text-sm uppercase tracking-wider text-white">
                {{ state.title }}
              </h3>
            </div>
            <button
              @click="handleCancel"
              class="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Body Message -->
          <p class="text-xs text-gray-300 font-sans leading-relaxed whitespace-pre-line mb-4">
            {{ state.message }}
          </p>

          <!-- Input field for prompt -->
          <div v-if="state.isPrompt" class="mb-5 space-y-1.5">
            <label v-if="state.promptLabel" class="block text-[11px] font-orbitron uppercase tracking-wider text-cyan-300 font-bold">
              {{ state.promptLabel }}
            </label>
            <input
              ref="inputRef"
              v-model="state.inputValue"
              type="text"
              :placeholder="state.promptPlaceholder"
              @keyup.enter="handleConfirm"
              class="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-gray-700 focus:border-cyan-400 text-white text-xs outline-none font-mono transition"
            />
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              @click="handleCancel"
              class="px-4 py-2 rounded-xl border border-gray-700 hover:bg-white/5 text-gray-300 hover:text-white text-xs font-orbitron tracking-wider transition cursor-pointer"
            >
              {{ state.cancelText }}
            </button>
            <button
              type="button"
              @click="handleConfirm"
              class="px-5 py-2 rounded-xl text-xs font-orbitron font-bold tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-lg"
              :class="{
                'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]': state.variant === 'danger',
                'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]': state.variant === 'warning',
                'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]': state.variant === 'info' || state.variant === 'success',
              }"
            >
              <Check class="w-3.5 h-3.5" />
              <span>{{ state.confirmText }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-up {
  animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
