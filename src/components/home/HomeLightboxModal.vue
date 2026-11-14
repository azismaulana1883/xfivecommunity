<template>
  <div
    v-if="photo"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
    @click="$emit('close')"
  >
    <div class="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center" @click.stop>
      <button
        @click="$emit('close')"
        class="absolute -top-10 right-0 text-white/80 hover:text-white text-xl cursor-pointer"
      >
        ✕ Tutup
      </button>
      <img
        :src="photo.image_url"
        :alt="photo.title"
        class="max-w-full max-h-[75vh] object-contain rounded-2xl border border-cyan-500/30 shadow-[0_0_50px_rgba(0,255,255,0.2)]"
      />
      <div class="mt-3 text-center text-xs font-mono text-gray-300">
        <p class="font-orbitron font-bold text-white text-sm">{{ photo.title }}</p>
        <p class="text-gray-400 mt-1">{{ photo.region }} &bull; {{ formatIndoDate(photo.event_date) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatIndoDate } from '../../utils/date';

defineProps({
  photo: {
    type: Object,
    default: null
  }
});

defineEmits(['close']);
</script>
