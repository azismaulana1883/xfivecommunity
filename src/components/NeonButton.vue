<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary', // primary (blue), secondary (purple), success (green)
    validator: (value: string) => ['primary', 'secondary', 'success'].includes(value)
  },
  icon: {
    type: Object, // Component
    default: null
  },
  showDefaultIcon: {
    type: Boolean,
    default: false // Set true jika ingin default icon Home selalu muncul saat icon tidak dipassing
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const isPressed = ref(false);
const showRipple = ref(false);
const rippleX = ref(0);
const rippleY = ref(0);

// Dynamic Classes based on Variant
const borderClass = computed(() => {
  if (props.disabled) return 'border-gray-600 text-gray-400 shadow-none';
  switch (props.variant) {
    case 'secondary': return 'border-neon-purple text-white shadow-[0_0_10px_rgba(138,43,226,0.3)] hover:bg-neon-purple hover:text-white hover:shadow-[0_0_25px_rgba(138,43,226,0.6)]';
    case 'success': return 'border-neon-green text-white shadow-[0_0_10px_rgba(57,255,20,0.3)] hover:bg-neon-green hover:text-black hover:shadow-[0_0_25px_rgba(57,255,20,0.6)]';
    default: return 'border-neon-blue text-white shadow-[0_0_10px_rgba(0,255,255,0.3)] hover:bg-neon-blue hover:text-black hover:shadow-[0_0_25px_rgba(0,255,255,0.6)]';
  }
});

const handleClick = (event: MouseEvent) => {
  if (props.disabled) return;

  // Ripple Logic
  const button = event.currentTarget as HTMLElement;
  const rect = button.getBoundingClientRect();
  rippleX.value = event.clientX - rect.left;
  rippleY.value = event.clientY - rect.top;

  showRipple.value = true;
  isPressed.value = true;

  setTimeout(() => { showRipple.value = false; }, 600);
  setTimeout(() => { isPressed.value = false; }, 150);
};
</script>

<template>
  <button
    class="relative group px-8 py-4 font-orbitron font-bold tracking-widest uppercase border-2 rounded transition-all duration-300 overflow-hidden select-none"
    :class="[
      borderClass,
      isPressed ? 'scale-95' : 'hover:scale-105',
      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
    ]"
    @click="handleClick"
    :disabled="disabled"
  >
    <!-- Background Glow (Subtle pulse) -->
    <div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

    <!-- Ripple Effect -->
    <span
      v-if="showRipple"
      class="ripple-effect"
      :style="{ left: `${rippleX}px`, top: `${rippleY}px` }"
    ></span>

    <!-- Content Wrapper -->
    <div class="relative z-10 flex items-center justify-center gap-3">
      <!-- Animated Icon Slot -->
      <span v-if="$slots.icon || icon || showDefaultIcon" class="group-hover:animate-[shake_0.5s_ease-in-out]">
        <slot name="icon">
          <!-- Pakai prop icon jika ada -->
          <component :is="icon" v-if="icon" class="w-6 h-6" />

          <!-- Fallback icon Home SVG bawaan -->
          <svg
            v-else-if="showDefaultIcon"
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </slot>
      </span>

      <!-- Text Slot -->
      <slot />
    </div>
  </button>
</template>

<style scoped>
/* Ripple Effect */
@keyframes ripple {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(4); opacity: 0; }
}

.ripple-effect {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transform: scale(0);
  animation: ripple 0.6s linear;
  pointer-events: none;
}
</style>