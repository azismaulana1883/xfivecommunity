<template>
  <div class="lg:col-span-7 flex flex-col space-y-3">
    <div class="flex items-center justify-between gap-2 px-1">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
        <h3 class="text-base sm:text-lg font-black font-orbitron text-white tracking-wide uppercase flex items-center gap-2">
          <span>⚡ ACARA MENDATANG</span>
          <span v-if="upcomingMeetups.length > 0" class="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {{ upcomingMeetups.length }} Agenda
          </span>
        </h3>
      </div>

      <div v-if="upcomingMeetups.length > 1" class="flex items-center gap-1.5">
        <span class="text-[10px] font-mono text-gray-400 mr-1 hidden sm:inline">
          {{ currentIndex + 1 }} / {{ upcomingMeetups.length }}
        </span>
        <button
          type="button"
          @click="$emit('prev')"
          class="w-7 h-7 rounded-lg bg-black/60 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400 text-gray-300 hover:text-cyan-300 text-xs flex items-center justify-center transition cursor-pointer"
          title="Acara Sebelumnya"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <button
          type="button"
          @click="$emit('next')"
          class="w-7 h-7 rounded-lg bg-black/60 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400 text-gray-300 hover:text-cyan-300 text-xs flex items-center justify-center transition cursor-pointer"
          title="Acara Berikutnya"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <div
      v-if="upcomingMeetups.length === 0"
      class="rounded-3xl border border-dashed border-gray-800 bg-[#0c1018]/80 p-8 text-center space-y-3"
    >
      <div class="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-2xl">
        <i class="fas fa-calendar-plus"></i>
      </div>
      <h4 class="text-base font-bold font-orbitron text-gray-300">Belum Ada Agenda Mendatang</h4>
      <p class="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
        Agenda meetup baru untuk seluruh regional sedang dipersiapkan oleh Dewan Staff. Pantau pengumuman rutin di grup WhatsApp &amp; Discord komunitas!
      </p>
    </div>

    <div
      v-else-if="current"
      class="relative rounded-3xl border border-cyan-500/40 bg-[#0d1424] shadow-[0_0_35px_rgba(0,255,255,0.12)] overflow-hidden flex flex-col justify-between transition-all duration-300 group"
      @mouseenter="$emit('pause')"
      @mouseleave="$emit('resume')"
    >
      <div class="absolute -right-6 -bottom-6 text-8xl font-black font-orbitron text-white/[0.03] pointer-events-none select-none uppercase">
        {{ current.region }}
      </div>

      <div>
        <div class="relative w-full aspect-[16/9] overflow-hidden bg-black/80">
          <img
            :src="getBannerImage(current)"
            :alt="current.title"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-[#0d1424] via-[#0d1424]/40 to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent"></div>

          <div class="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-10">
            <div class="flex flex-wrap items-center gap-1.5 max-w-[70%]">
              <span
                v-for="r in (current.region || '').split(',').map((s: string) => s.trim()).filter(Boolean)"
                :key="r"
                class="px-2.5 py-1 rounded-xl text-xs font-bold font-orbitron uppercase border backdrop-blur-md shadow-md"
                :class="getRegionBadgeClass(r)"
              >
                📍 {{ r }}
              </span>
            </div>

            <span
              class="px-3 py-1 rounded-xl text-[11px] font-mono font-bold uppercase flex items-center gap-1.5 backdrop-blur-md shadow-md border shrink-0"
              :class="getStatusBadgeClass(current.status)"
            >
              <span v-if="current.status === 'ACTIVE'" class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{{ current.status }}</span>
            </span>
          </div>

          <div class="absolute bottom-3 left-4 right-4 z-10">
            <h3 class="text-xl sm:text-2xl md:text-3xl font-black font-orbitron text-white leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {{ current.title }}
            </h3>
          </div>
        </div>

        <div class="p-5 sm:p-6 space-y-4">
          <div
            v-if="current.description"
            class="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2 relative overflow-hidden"
          >
            <div class="text-[10px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
              <i class="fas fa-file-alt text-cyan-400"></i>
              <span>Keterangan Acara &amp; Ketentuan</span>
            </div>
            <div class="text-xs text-gray-200 leading-relaxed font-sans whitespace-pre-line selection:bg-cyan-500 selection:text-black">
              {{ current.description }}
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono py-2 border-t border-b border-white/5">
            <div class="flex items-center gap-2.5 text-gray-300">
              <div class="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
                <i class="fas fa-calendar-day"></i>
              </div>
              <div>
                <div class="text-[10px] text-gray-500 uppercase">Hari &amp; Tanggal</div>
                <div class="font-bold text-white">{{ formatIndoDate(current.meetup_date) }}</div>
              </div>
            </div>

            <div class="flex items-center gap-2.5 text-gray-300">
              <div class="w-7 h-7 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 flex-shrink-0">
                <i class="fas fa-clock"></i>
              </div>
              <div>
                <div class="text-[10px] text-gray-500 uppercase">Waktu Pelaksanaan</div>
                <div class="font-bold text-white">{{ current.start_time }} – {{ current.end_time }} WIB</div>
              </div>
            </div>

            <div class="flex items-center gap-2.5 text-gray-300 sm:col-span-2">
              <div class="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">
                <i class="fas fa-map-pin"></i>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-[10px] text-gray-500 uppercase">Lokasi / Venue</div>
                <div class="font-bold text-white truncate">{{ current.location_name }}</div>
              </div>
              <a
                :href="getGoogleMapsUrl(current)"
                target="_blank"
                rel="noopener noreferrer"
                class="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 transition flex-shrink-0 cursor-pointer"
                title="Buka rute navigasi di Google Maps"
              >
                <i class="fas fa-directions text-xs"></i>
                <span>Maps</span>
              </a>
            </div>

            <div class="flex items-center gap-2.5 text-gray-400 text-[11px] sm:col-span-2">
              <div class="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                <i class="fas fa-crosshairs"></i>
              </div>
              <div>
                <span class="text-gray-400">Radius Toleransi Verifikasi GPS: </span>
                <strong class="text-amber-300 font-bold font-mono">{{ current.radius_meters || 10 }} Meter</strong>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2.5 text-center text-[11px] font-mono">
            <div class="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-300">
              <div class="font-black text-base">{{ current.total_hadir || 0 }}</div>
              <div class="text-[9px] text-gray-400 uppercase tracking-wider font-orbitron">Hadir</div>
            </div>
            <div class="p-2.5 rounded-xl bg-red-950/40 border border-red-500/20 text-red-300">
              <div class="font-black text-base">{{ current.total_tidak_hadir || 0 }}</div>
              <div class="text-[9px] text-gray-400 uppercase tracking-wider font-orbitron">Mangkir (-1)</div>
            </div>
            <div class="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/20 text-amber-300">
              <div class="font-black text-base">{{ current.total_izin || 0 }}</div>
              <div class="text-[9px] text-gray-400 uppercase tracking-wider font-orbitron">Izin (0)</div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-5 sm:p-6 pt-0 space-y-3">
        <RouterLink
          v-if="current.status === 'ACTIVE'"
          :to="`/meetup/scan?token=${current.qr_token}`"
          class="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black font-orbitron font-black text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,255,255,0.35)] cursor-pointer"
        >
          <i class="fas fa-qrcode text-base"></i>
          <span>PRESENSI SEKARANG (SCAN &amp; GPS)</span>
        </RouterLink>

        <a
          :href="getGoogleMapsUrl(current)"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full py-2.5 px-4 rounded-xl bg-black/70 hover:bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white font-orbitron text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer group/maps shadow-sm"
        >
          <i class="fas fa-map-marked-alt text-red-400 group-hover/maps:scale-110 transition-transform"></i>
          <span>BUKA DI GOOGLE MAPS</span>
          <i class="fas fa-external-link-alt text-[10px] opacity-70"></i>
        </a>

        <div
          v-if="current.status === 'COMPLETED'"
          class="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/5 text-gray-400 text-center text-[11px] font-mono"
        >
          <i class="fas fa-check-circle text-emerald-400 mr-1.5"></i>
          Meetup telah selesai &amp; rekapan poin telah difinalisasi
        </div>

        <div
          v-else-if="current.status !== 'ACTIVE'"
          class="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/5 text-gray-400 text-center text-[11px] font-mono"
        >
          <i class="fas fa-hourglass-start text-cyan-400 mr-1.5"></i>
          Meetup akan dimulai sesuai jadwal
        </div>

        <div v-if="upcomingMeetups.length > 1" class="pt-2 flex items-center justify-between border-t border-white/5">
          <div class="flex items-center gap-1.5">
            <button
              v-for="(ev, idx) in upcomingMeetups"
              :key="'dot-' + ev.id"
              @click="$emit('go-to', idx)"
              class="h-1.5 rounded-full transition-all cursor-pointer"
              :class="currentIndex === idx ? 'w-6 bg-cyan-400' : 'w-2 bg-gray-700 hover:bg-gray-500'"
              :title="'Ke agenda ' + (idx + 1)"
            ></button>
          </div>

          <div class="flex items-center gap-2 text-[10px] font-mono text-gray-400">
            <span v-if="!isPaused" class="flex items-center gap-1 text-cyan-400/80">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Auto-slide</span>
            </span>
            <span v-else class="text-amber-400/80">
              <i class="fas fa-pause text-[9px] mr-1"></i>Jeda (hover)
            </span>
            <span>• {{ currentIndex + 1 }} / {{ upcomingMeetups.length }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { formatIndoDate } from '../../utils/date';
import { getBannerImage, getRegionBadgeClass, getStatusBadgeClass, getGoogleMapsUrl } from '../../utils/meetup';

const props = defineProps({
  upcomingMeetups: {
    type: Array,
    default: () => []
  },
  currentIndex: {
    type: Number,
    default: 0
  },
  isPaused: {
    type: Boolean,
    default: false
  }
});

defineEmits(['prev', 'next', 'go-to', 'pause', 'resume']);

const current = computed(() => {
  if (props.upcomingMeetups.length === 0) return null;
  const idx = Math.min(props.currentIndex, props.upcomingMeetups.length - 1);
  return props.upcomingMeetups[idx] || null;
});
</script>
