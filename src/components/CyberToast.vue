<script setup lang="ts">
import { useToast } from '@/composables/useToast';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X
} from 'lucide-vue-next';

const { toasts, remove } = useToast();
</script>

<template>
  <div
    class="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
    aria-live="polite"
  >
    <TransitionGroup name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto rounded-xl border backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300 relative group"
        :class="{
          'bg-[#08131d]/95 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.25)]': t.type === 'success',
          'bg-[#190a10]/95 border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.3)]': t.type === 'error',
          'bg-[#191307]/95 border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.25)]': t.type === 'warning',
          'bg-[#07131e]/95 border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.25)]': t.type === 'info',
        }"
      >
        <div class="p-3.5 flex items-start gap-3">
          <!-- Icon -->
          <div class="shrink-0 mt-0.5">
            <CheckCircle v-if="t.type === 'success'" class="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <XCircle v-else-if="t.type === 'error'" class="w-5 h-5 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            <AlertTriangle v-else-if="t.type === 'warning'" class="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <Info v-else class="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0 pr-1">
            <h4
              class="text-xs font-bold font-orbitron uppercase tracking-wider"
              :class="{
                'text-emerald-300': t.type === 'success',
                'text-rose-300': t.type === 'error',
                'text-amber-300': t.type === 'warning',
                'text-cyan-300': t.type === 'info',
              }"
            >
              {{ t.title }}
            </h4>
            <p class="text-xs text-gray-200 font-sans mt-0.5 leading-relaxed break-words">
              {{ t.message }}
            </p>
          </div>

          <!-- Close button -->
          <button
            @click="remove(t.id)"
            class="shrink-0 text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10 cursor-pointer"
            title="Tutup Notifikasi"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Animated Progress Timer Bar -->
        <div class="h-0.5 w-full bg-white/5 overflow-hidden">
          <div
            class="h-full toast-progress"
            :class="{
              'bg-emerald-400': t.type === 'success',
              'bg-rose-500': t.type === 'error',
              'bg-amber-400': t.type === 'warning',
              'bg-cyan-400': t.type === 'info',
            }"
            :style="{ animationDuration: `${t.duration}ms` }"
          />
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(60px) scale(0.92);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}

@keyframes toastTimer {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.toast-progress {
  animation-name: toastTimer;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
</style>
