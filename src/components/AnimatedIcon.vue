<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  name: {
    type: Object, // Lucide component
    required: true
  },
  animation: {
    type: String,
    default: 'hover-shake', // hover-shake, breathe, float, spin
    validator: (val: string) => ['hover-shake', 'breathe', 'float', 'spin', 'none'].includes(val)
  },
  color: {
    type: String,
    default: 'text-neon-blue'
  },
  size: {
    type: String,
    default: 'w-8 h-8'
  }
});

const animationClass = computed(() => {
  switch (props.animation) {
    case 'breathe': return 'icon-breathe';
    case 'float': return 'icon-float';
    case 'spin': return 'animate-spin'; // Tailwind default
    case 'hover-shake': return 'hover-shake transition-transform duration-300';
    default: return '';
  }
});
</script>

<template>
  <div
    class="inline-flex items-center justify-center p-2 rounded-full transition-colors duration-300"
    :class="[animationClass, color]"
  >
    <component :is="name" :class="size" />
  </div>
</template>
