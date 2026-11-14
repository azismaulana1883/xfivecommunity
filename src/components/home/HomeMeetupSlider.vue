<template>
  <section class="relative overflow-hidden rounded-3xl bg-[#0c121e]/80 border border-white/10 p-6 md:p-8 shadow-xl">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-white/5">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold tracking-widest uppercase font-orbitron mb-2">
          <i class="fas fa-camera text-[10px]"></i> Dokumentasi Komunitas
        </div>
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold font-orbitron text-white uppercase tracking-wider">
          Dokumentasi &amp; Foto Meetup
        </h2>
        <p class="text-xs text-gray-400 font-mono mt-1">
          Momen kebersamaan dan gathering regional XFIVE terbaru.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <RouterLink
          to="/gallery"
          class="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1.5"
        >
          <span>Lihat Semua Galeri</span>
          <i class="fas fa-arrow-right text-[10px]"></i>
        </RouterLink>

        <div v-if="photos.length > 1" class="flex items-center gap-1.5 ml-2">
          <button
            type="button"
            @click="prevMeetup"
            title="Foto Sebelumnya"
            class="w-8 h-8 rounded-lg bg-black/60 hover:bg-cyan-500 hover:text-black border border-white/10 hover:border-cyan-400 text-gray-300 text-xs flex items-center justify-center transition cursor-pointer"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <button
            type="button"
            @click="nextMeetup"
            title="Foto Selanjutnya"
            class="w-8 h-8 rounded-lg bg-black/60 hover:bg-cyan-500 hover:text-black border border-white/10 hover:border-cyan-400 text-gray-300 text-xs flex items-center justify-center transition cursor-pointer"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[38%_62%] gap-6 lg:gap-8 items-center">
      <div class="w-full flex justify-center">
        <div class="relative group max-w-sm lg:max-w-none">
          <img
            src="/img/xfive-team11.webp"
            alt="Member XFIVE Squad"
            class="w-full h-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:scale-102"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-[#0c121e]/80 via-transparent to-transparent pointer-events-none rounded-2xl"></div>
        </div>
      </div>

      <div class="w-full">
        <div v-if="loading" class="py-16 text-center text-cyan-400 font-mono text-xs animate-pulse">
          <i class="fas fa-circle-notch fa-spin text-2xl mb-2"></i>
          <p>Memuat foto dokumentasi terbaru...</p>
        </div>

        <div v-else-if="photos.length === 0" class="p-8 text-center rounded-2xl bg-black/40 border border-white/5">
          <i class="fas fa-camera text-3xl text-gray-600 mb-3"></i>
          <p class="text-sm font-orbitron text-gray-400">Belum ada foto dokumentasi meetup.</p>
        </div>

        <div v-else class="relative space-y-4">
          <div
            v-if="currentMeetup"
            class="rounded-2xl border border-white/10 hover:border-cyan-500/50 bg-black/50 overflow-hidden shadow-2xl transition-all duration-300 group cursor-pointer"
            @click="$emit('open-lightbox', currentMeetup)"
          >
            <div class="relative aspect-video w-full overflow-hidden bg-black/70">
              <img
                :src="currentMeetup.image_url"
                :alt="currentMeetup.title"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none"></div>

              <div class="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                <span class="px-2.5 py-1 rounded-md text-[10px] font-orbitron font-bold bg-cyan-500 text-black shadow-md">
                  {{ currentMeetup.region || 'NASIONAL' }}
                </span>
                <span v-if="currentMeetup.meetup_title" class="px-2 py-0.5 rounded-md text-[10px] font-mono bg-black/70 border border-white/10 text-cyan-300 backdrop-blur-sm">
                  {{ currentMeetup.meetup_title }}
                </span>
              </div>

              <div class="absolute top-3 right-3">
                <span class="px-2 py-1 rounded-lg bg-black/70 border border-white/10 text-gray-300 text-[10px] font-mono flex items-center gap-1 backdrop-blur-sm">
                  <span>{{ currentMeetupIndex + 1 }} / {{ photos.length }}</span>
                </span>
              </div>

              <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-gray-300 font-mono">
                <div class="flex items-center gap-1.5">
                  <i class="fas fa-calendar-alt text-cyan-400"></i>
                  <span>{{ formatIndoDate(currentMeetup.event_date) }}</span>
                </div>
                <div v-if="currentMeetup.location_name" class="flex items-center gap-1 text-gray-400 truncate max-w-[200px]">
                  <i class="fas fa-map-marker-alt text-cyan-400 text-[11px]"></i>
                  <span class="truncate">{{ currentMeetup.location_name }}</span>
                </div>
              </div>
            </div>

            <div class="p-4 sm:p-5 space-y-2">
              <h3 class="text-base sm:text-lg font-bold font-orbitron text-white group-hover:text-cyan-400 transition">
                {{ currentMeetup.title }}
              </h3>
              <p v-if="currentMeetup.description" class="text-xs text-gray-400 font-mono line-clamp-2 leading-relaxed">
                {{ currentMeetup.description }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-1">
            <button
              v-for="(photo, pIdx) in photos"
              :key="photo.id"
              type="button"
              @click="currentMeetupIndex = pIdx"
              class="relative aspect-video rounded-xl overflow-hidden border transition-all cursor-pointer"
              :class="currentMeetupIndex === pIdx ? 'border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.4)] scale-102' : 'border-white/10 opacity-60 hover:opacity-100'"
            >
              <img :src="photo.image_url" :alt="photo.title" class="w-full h-full object-cover" />
              <div v-if="currentMeetupIndex === pIdx" class="absolute inset-0 bg-cyan-500/10 pointer-events-none"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { formatIndoDate } from '../../utils/date';

const props = defineProps({
  photos: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['open-lightbox']);

const currentMeetupIndex = ref(0);

const currentMeetup = computed(() => {
  return props.photos[currentMeetupIndex.value] || null;
});

const nextMeetup = () => {
  if (props.photos.length === 0) return;
  currentMeetupIndex.value = (currentMeetupIndex.value + 1) % props.photos.length;
};

const prevMeetup = () => {
  if (props.photos.length === 0) return;
  currentMeetupIndex.value = (currentMeetupIndex.value - 1 + props.photos.length) % props.photos.length;
};
</script>
