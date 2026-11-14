<script setup lang="ts">
import { ref } from 'vue';
import NeonButton from './NeonButton.vue';

const isHovered = ref(false);

const emit = defineEmits(['click']);

const handleClick = () => {
  emit('click');
};
</script>

<template>
  <div
    class="relative w-full overflow-hidden bg-black/80 border-y border-neon-blue h-12 flex items-center z-50 backdrop-blur-md shadow-[0_0_15px_rgba(0,255,255,0.2)] rounded-sm"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Background Grid Effect (Subtle texture) -->
    <div class="absolute inset-0 bg-[url('/assets/grid.png')] opacity-10 pointer-events-none"></div>

    <!-- Scrolling Text Container -->
    <div class="flex-1 overflow-hidden relative h-full flex items-center mask-gradient pr-24">
      <div
        class="animate-marquee whitespace-nowrap text-neon-blue font-orbitron font-bold tracking-widest text-sm md:text-base flex items-center"
        :style="{ animationPlayState: isHovered ? 'paused' : 'running' }"
      >
        <span class="mr-12">📢 SELAMAT DATANG DI XFIVE COMMUNITY AYODANCE</span>
        <span class="mr-12 opacity-50">•</span>
        <span class="mr-12">📢 SELAMAT DATANG DI XFIVE COMMUNITY AYODANCE</span>
        <span class="mr-12 opacity-50">•</span>
        <span class="mr-12">📢 SELAMAT DATANG DI XFIVE COMMUNITY AYODANCE</span>
        <span class="mr-12 opacity-50">•</span>
        <span class="mr-12">📢 SELAMAT DATANG DI XFIVE COMMUNITY AYODANCE</span>
      </div>
    </div>

    <!-- Fixed Action Button -->
    <div class="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-8 pr-2 bg-gradient-to-l from-black via-black/90 to-transparent">
      <NeonButton
        @click="handleClick"
        variant="primary"
        class="!px-3 !py-1 !text-[10px] md:!text-xs !border-opacity-80 hover:!scale-105 active:!scale-95 whitespace-nowrap"
      >
        JOIN NOW
      </NeonButton>
    </div>
  </div>
</template>

<style scoped>
.mask-gradient {
  mask-image: linear-gradient(to right, transparent, black 2%, black 90%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 2%, black 90%, transparent);
}

/* Slower Marquee Speed */
.animate-marquee {
  display: inline-block;
  white-space: nowrap;
  animation: marquee 40s linear infinite;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
</style>
