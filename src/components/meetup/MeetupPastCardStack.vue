<template>
  <div class="lg:col-span-5 flex flex-col space-y-3">
    <div class="flex items-center justify-between gap-2 px-1">
      <div class="flex items-center gap-2">
        <i class="fas fa-history text-gray-400 text-sm"></i>
        <h3 class="text-base sm:text-lg font-black font-orbitron text-gray-200 tracking-wide uppercase flex items-center gap-2">
          <span>ACARA SEBELUMNYA</span>
          <span v-if="pastMeetups.length > 0" class="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">
            {{ pastMeetups.length }} Arsip
          </span>
        </h3>
      </div>

      <div v-if="totalPastPages > 1" class="flex items-center gap-1.5">
        <span class="text-[10px] font-mono text-gray-400 mr-1">
          {{ pageIndex + 1 }} / {{ totalPastPages }}
        </span>
        <button
          type="button"
          @click="$emit('prev-page')"
          class="w-7 h-7 rounded-lg bg-black/60 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs flex items-center justify-center transition cursor-pointer"
          title="Halaman Sebelumnya"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <button
          type="button"
          @click="$emit('next-page')"
          class="w-7 h-7 rounded-lg bg-black/60 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs flex items-center justify-center transition cursor-pointer"
          title="Halaman Berikutnya"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <div
      v-if="pastMeetups.length === 0"
      class="rounded-3xl border border-dashed border-gray-800 bg-[#0c1018]/80 p-8 text-center space-y-3"
    >
      <div class="w-14 h-14 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 text-2xl">
        <i class="fas fa-folder-open"></i>
      </div>
      <h4 class="text-base font-bold font-orbitron text-gray-400">Belum Ada Riwayat Acara</h4>
      <p class="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
        Meetup yang telah selesai diselenggarakan dan difinalisasi akan tersimpan otomatis di arsip riwayat ini.
      </p>
    </div>

    <div
      v-else
      class="space-y-4"
      @mouseenter="$emit('pause')"
      @mouseleave="$emit('resume')"
    >
      <div
        v-for="pm in displayedPastMeetups"
        :key="'past-' + pm.id"
        class="relative rounded-2xl border border-white/10 hover:border-cyan-500/30 bg-[#0c1018] p-4 sm:p-5 flex flex-col justify-between overflow-hidden group shadow-lg transition-all duration-300"
      >
        <div class="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-3 bg-black/80">
          <img
            :src="getBannerImage(pm)"
            :alt="pm.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>

          <div class="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-10">
            <div class="flex flex-wrap items-center gap-1 max-w-[70%]">
              <span
                v-for="r in (pm.region || '').split(',').map((s: string) => s.trim()).filter(Boolean)"
                :key="r"
                class="px-2 py-0.5 rounded-lg text-[10px] font-bold font-orbitron uppercase border backdrop-blur-md"
                :class="getRegionBadgeClass(r)"
              >
                📍 {{ r }}
              </span>
            </div>

            <span class="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase bg-black/70 border border-gray-700 text-gray-300 backdrop-blur-md shrink-0">
              COMPLETED
            </span>
          </div>
        </div>

        <div>
          <h4 class="text-sm sm:text-base font-bold font-orbitron text-white mb-2 leading-snug line-clamp-2 group-hover:text-cyan-300 transition-colors">
            {{ pm.title }}
          </h4>

          <div class="space-y-1.5 text-xs font-mono text-gray-400 border-t border-b border-white/5 py-2.5 mb-3">
            <div class="flex items-center gap-2 text-gray-300">
              <i class="fas fa-calendar-day text-cyan-400 w-3.5 text-center"></i>
              <span>{{ formatIndoDate(pm.meetup_date) }}</span>
            </div>
            <div class="flex items-center gap-2 text-gray-400">
              <i class="fas fa-clock text-fuchsia-400 w-3.5 text-center"></i>
              <span>{{ pm.start_time }} – {{ pm.end_time }} WIB</span>
            </div>
            <div class="flex items-center justify-between text-gray-300">
              <div class="flex items-center gap-2 truncate">
                <i class="fas fa-map-pin text-red-400 w-3.5 text-center flex-shrink-0"></i>
                <span class="truncate">{{ pm.location_name }}</span>
              </div>
              <a
                :href="getGoogleMapsUrl(pm)"
                target="_blank"
                rel="noopener noreferrer"
                class="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 ml-2 flex-shrink-0 cursor-pointer"
                title="Buka Maps"
              >
                <span>Maps</span>
                <i class="fas fa-external-link-alt text-[9px]"></i>
              </a>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 text-center text-[10px] font-mono mb-3">
            <div class="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-300">
              <div class="font-bold text-xs">{{ pm.total_hadir || 0 }}</div>
              <div class="text-[8px] text-gray-400 uppercase">Hadir</div>
            </div>
            <div class="p-1.5 rounded-lg bg-red-950/40 border border-red-500/20 text-red-300">
              <div class="font-bold text-xs">{{ pm.total_tidak_hadir || 0 }}</div>
              <div class="text-[8px] text-gray-400 uppercase">Mangkir</div>
            </div>
            <div class="p-1.5 rounded-lg bg-amber-950/40 border border-amber-500/20 text-amber-300">
              <div class="font-bold text-xs">{{ pm.total_izin || 0 }}</div>
              <div class="text-[8px] text-gray-400 uppercase">Izin</div>
            </div>
          </div>
        </div>

        <div class="pt-2 border-t border-white/5 flex items-center justify-between">
          <span class="text-[10px] font-mono text-gray-500 flex items-center gap-1">
            <i class="fas fa-check-circle text-emerald-400 text-xs"></i>
            <span>Telah Difinalisasi</span>
          </span>

          <a
            :href="getGoogleMapsUrl(pm)"
            target="_blank"
            rel="noopener noreferrer"
            class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-gray-300 hover:text-cyan-300 text-[10px] font-mono transition flex items-center gap-1 cursor-pointer"
          >
            <span>Lokasi Venue</span>
            <i class="fas fa-directions text-[9px]"></i>
          </a>
        </div>
      </div>

      <div v-if="totalPastPages > 1" class="pt-1 flex items-center justify-between px-1">
        <div class="flex items-center gap-1">
          <button
            v-for="pg in totalPastPages"
            :key="'past-dot-' + pg"
            @click="$emit('go-to-page', pg - 1)"
            class="h-1 rounded-full transition-all cursor-pointer"
            :class="pageIndex === pg - 1 ? 'w-4 bg-gray-300' : 'w-1.5 bg-gray-700 hover:bg-gray-500'"
            :title="'Halaman ' + pg"
          ></button>
        </div>
        <div class="text-[10px] font-mono text-gray-500 flex items-center gap-1.5">
          <span v-if="!isPaused" class="text-gray-400">Auto-slide aktif</span>
          <span v-else class="text-amber-500/70">Jeda (hover)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatIndoDate } from '../../utils/date';
import { getBannerImage, getRegionBadgeClass, getGoogleMapsUrl } from '../../utils/meetup';

const props = defineProps({
  pastMeetups: {
    type: Array,
    default: () => []
  },
  pageIndex: {
    type: Number,
    default: 0
  },
  pageSize: {
    type: Number,
    default: 2
  },
  isPaused: {
    type: Boolean,
    default: false
  }
});

defineEmits(['prev-page', 'next-page', 'go-to-page', 'pause', 'resume']);

const totalPastPages = computed(() => {
  return Math.ceil(props.pastMeetups.length / props.pageSize) || 1;
});

const displayedPastMeetups = computed(() => {
  const start = props.pageIndex * props.pageSize;
  return props.pastMeetups.slice(start, start + props.pageSize);
});
</script>
