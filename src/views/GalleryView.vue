<template>
  <div class="min-h-screen bg-[#070a10] text-gray-200 font-sans pb-24 selection:bg-cyan-500 selection:text-black">
    <!-- HERO HEADER -->
    <section class="relative pt-12 pb-8 overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.06)_0%,transparent_70%)] pointer-events-none"></div>
      <div class="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      <div class="container mx-auto px-4 relative z-10 text-center max-w-4xl">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-4">
          <i class="fas fa-camera-retro"></i>
          <span>XFIVE DOCUMENTATION ARCHIVE</span>
        </div>

        <h1 class="text-3xl md:text-5xl font-black font-orbitron uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-300 to-pink-500 mb-3">
          GALLERY MEET UP
        </h1>
        <p class="text-sm md:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Dokumentasi momen kebersamaan, gathering regional, serunya fun match, dan kenangan hangat silaturahmi offline seluruh squad XFIVE Community se-Indonesia.
        </p>

        <!-- Region Filter Pills -->
        <div class="flex flex-wrap justify-center gap-2 mt-8">
          <button
            v-for="r in ['SEMUA', 'BEKASI', 'TANGERANG', 'JAKARTA', 'BOGOR-DEPOK']"
            :key="r"
            @click="selectedRegion = r"
            class="px-4 py-2 rounded-xl font-orbitron text-xs font-bold tracking-wider transition-all cursor-pointer"
            :class="selectedRegion === r ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,255,255,0.4)]' : 'bg-black/60 border border-white/10 text-gray-400 hover:text-white'"
          >
            {{ r }}
          </button>
        </div>
      </div>
    </section>

    <!-- GALLERY GRID -->
    <main class="container mx-auto px-4 max-w-6xl mt-6">
      <div class="flex items-center justify-between pb-3 mb-6 border-b border-white/5">
        <div class="text-xs font-mono text-gray-400 flex items-center gap-2">
          <span>Menampilkan</span>
          <strong class="text-cyan-400">{{ filteredPhotos.length }}</strong>
          <span>Foto Dokumentasi</span>
        </div>

        <router-link
          to="/meetup"
          class="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
        >
          <i class="fas fa-calendar-alt"></i>
          <span>Lihat Jadwal Meetup &amp; Poin</span>
          <i class="fas fa-arrow-right text-[10px]"></i>
        </router-link>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="py-20 text-center font-mono text-cyan-400">
        <i class="fas fa-spinner fa-spin text-3xl mb-3"></i>
        <p class="text-xs text-gray-400">Memuat arsip foto dokumentasi...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredPhotos.length === 0" class="py-16 text-center rounded-3xl border border-dashed border-gray-800 bg-[#0c1018]/60 p-8 space-y-3">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-2xl">
          <i class="fas fa-camera"></i>
        </div>
        <h3 class="text-base font-bold font-orbitron text-gray-300">Belum Ada Foto Dokumentasi</h3>
        <p class="text-xs text-gray-500 max-w-md mx-auto">
          Belum ada foto yang diunggah untuk filter wilayah ini. Staf Meetup akan segera memperbarui arsip dokumentasi!
        </p>
      </div>

      <!-- Grid Cards -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="photo in filteredPhotos"
          :key="photo.id"
          @click="openLightbox(photo)"
          class="group relative rounded-2xl border border-white/10 hover:border-cyan-500/40 bg-[#0c1018] overflow-hidden shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <!-- Image Container (16:9 Aspect) -->
          <div class="relative w-full aspect-[16/9] overflow-hidden bg-black/60">
            <img
              :src="photo.image"
              :alt="photo.title"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-80 group-hover:opacity-60 transition-opacity"></div>

            <!-- Floating Region Badge -->
            <div class="absolute top-3 left-3 z-10">
              <span class="px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-orbitron uppercase bg-black/70 backdrop-blur-md border border-cyan-500/30 text-cyan-300">
                📍 {{ photo.region }}
              </span>
            </div>

            <!-- Hover Zoom Icon -->
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              <div class="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400 backdrop-blur-md flex items-center justify-center text-cyan-300">
                <i class="fas fa-magnifying-glass-plus text-sm"></i>
              </div>
            </div>
          </div>

          <!-- Caption & Info -->
          <div class="p-4 space-y-2">
            <h3 class="text-sm font-bold font-orbitron text-white group-hover:text-cyan-300 transition-colors leading-snug line-clamp-1">
              {{ photo.title }}
            </h3>
            <p v-if="photo.description" class="text-xs text-gray-400 line-clamp-2 leading-relaxed">
              {{ photo.description }}
            </p>
            <div class="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-500">
              <span class="flex items-center gap-1.5">
                <i class="fas fa-calendar-day text-cyan-400"></i>
                <span>{{ photo.date }}</span>
              </span>
              <span class="flex items-center gap-1.5">
                <i class="fas fa-map-pin text-red-400"></i>
                <span class="truncate max-w-[120px]">{{ photo.location }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- LIGHTBOX PREVIEW MODAL -->
    <div
      v-if="selectedPhoto"
      @click.self="selectedPhoto = null"
      class="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
    >
      <div class="relative max-w-4xl w-full bg-[#0d1424] border border-cyan-500/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,255,255,0.2)] animate-fade-in">
        <!-- Close button -->
        <button
          @click="selectedPhoto = null"
          class="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/80 hover:bg-red-500/20 border border-white/20 hover:border-red-500 text-white hover:text-red-300 flex items-center justify-center transition cursor-pointer"
        >
          <i class="fas fa-times text-sm"></i>
        </button>

        <!-- Big Image -->
        <div class="relative w-full max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
          <img
            :src="selectedPhoto.image"
            :alt="selectedPhoto.title"
            class="max-w-full max-h-[70vh] object-contain"
          />
        </div>

        <!-- Lightbox Caption -->
        <div class="p-5 sm:p-6 space-y-2 bg-[#0c121e]">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <span class="px-2.5 py-1 rounded-lg text-xs font-bold font-orbitron uppercase bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
              📍 Wilayah {{ selectedPhoto.region }}
            </span>
            <span class="text-xs font-mono text-gray-400">
              📅 {{ selectedPhoto.date }} • {{ selectedPhoto.location }}
            </span>
          </div>
          <h2 class="text-lg sm:text-xl font-bold font-orbitron text-white">
            {{ selectedPhoto.title }}
          </h2>
          <p class="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
            {{ selectedPhoto.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAutoSync } from '@/composables/useDataSync';

const selectedRegion = ref('SEMUA');
const selectedPhoto = ref<any | null>(null);
const loading = ref(false);
const error = ref('');

const openLightbox = (photo: any) => {
  selectedPhoto.value = photo;
};

const formatIndoDate = (dateStr: string) => {
  if (!dateStr) return '-';
  try {
    const cleanStr = String(dateStr).split('T')[0];
    const parts = cleanStr.split('-').map(Number);
    if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
      const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
      return dateObj.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return String(dateStr);
  }
};

const photos = ref<any[]>([]);

const fetchGallery = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await fetch('/api/v1/gallery');
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      photos.value = data.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        region: item.region,
        date: formatIndoDate(item.event_date),
        location: item.location_name || 'Venue Gathering',
        description: item.description || '',
        image: item.image_url,
        meetup_title: item.meetup_title,
        meetup_id: item.meetup_id,
        uploaded_by: item.uploaded_by,
      }));
    }
  } catch (err: any) {
    console.error('Failed to fetch gallery photos:', err);
    error.value = 'Gagal memuat arsip foto galeri.';
  } finally {
    loading.value = false;
  }
};

useAutoSync('gallery', fetchGallery);

onMounted(() => {
  fetchGallery();
});

const filteredPhotos = computed(() => {
  if (selectedRegion.value === 'SEMUA') {
    return photos.value;
  }
  return photos.value.filter(p => p.region === selectedRegion.value);
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
