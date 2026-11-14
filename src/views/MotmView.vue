<template>
  <main class="container mx-auto px-4 md:px-6 pt-12 pb-24 relative z-10 min-h-screen">
    <div class="text-center mb-12">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-bold tracking-[0.2em] uppercase">
        <i class="fas fa-crown"></i> Hall of Fame
      </div>
      <h1 class="text-4xl md:text-5xl font-bold uppercase tracking-wide mb-3 font-serif">
        <span class="motm-shimmer">Member of the Month</span>
      </h1>
      <p class="text-gray-400 max-w-2xl mx-auto">
        Apresiasi tertinggi untuk anggota pilihan XFIVE Community yang menginspirasi setiap bulannya.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-10 text-center text-yellow-400/80 font-bold tracking-widest animate-pulse">
      Memuat data Member of the Month...
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-10 text-center text-red-500 font-bold border border-red-500/30 rounded-lg bg-red-500/10 max-w-4xl mx-auto">
      Gagal memuat data Member of the Month.
    </div>

    <!-- Empty State -->
    <div v-else-if="motmList.length === 0" class="p-10 text-center text-gray-400 bg-[#0d1117]/60 rounded-xl border border-white/5 max-w-4xl mx-auto">
      Belum ada Member of the Month yang dipublikasikan.
    </div>

    <!-- List -->
    <div v-else class="space-y-16 max-w-4xl mx-auto">
      <article
        v-for="(item, idx) in motmList"
        :key="idx"
        class="motm-frame relative rounded-2xl border border-yellow-500/40 overflow-hidden shadow-[0_10px_60px_rgba(0,0,0,0.6)]"
      >
        <!-- Corner Accents -->
        <span class="pointer-events-none absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-yellow-500/45 rounded-tl-2xl"></span>
        <span class="pointer-events-none absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-yellow-500/45 rounded-tr-2xl"></span>
        <span class="pointer-events-none absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-yellow-500/45 rounded-bl-2xl"></span>
        <span class="pointer-events-none absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-yellow-500/45 rounded-br-2xl"></span>

        <!-- Period Badge -->
        <div class="flex justify-center pt-6">
          <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-yellow-500/40 text-yellow-300 text-sm font-bold tracking-[0.25em] uppercase font-serif">
            <i class="fas fa-calendar-alt"></i> {{ getPeriode(item) }}
          </span>
        </div>

        <div class="p-6 md:p-10 flex flex-col md:flex-row items-center gap-8">
          <!-- Avatar + Stars -->
          <div class="shrink-0 flex flex-col items-center gap-4">
            <img
              v-if="item.foto && item.foto.trim()"
              :src="item.foto"
              :alt="item.nama || 'Member'"
              class="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover motm-photo-ring"
              loading="lazy"
              @error="e => e.target.style.display = 'none'"
            />
            <div
              v-else
              class="w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center bg-yellow-500/10 motm-photo-ring"
            >
              <i class="fas fa-user-astronaut text-5xl text-yellow-300"></i>
            </div>
            <div class="text-yellow-400 text-2xl tracking-widest">
              <i class="fas fa-star"></i>
              <i class="fas fa-star mx-1"></i>
              <i class="fas fa-star"></i>
            </div>
          </div>

          <!-- Info Details -->
          <div class="flex-1 w-full text-center md:text-left">
            <h2 class="text-3xl md:text-4xl font-bold text-white font-serif mb-1">{{ item.nama || '-' }}</h2>
            <p class="text-cyan-400 font-mono text-lg mb-6">{{ item.nick || '' }}</p>

            <div class="space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 border-b border-white/5 pb-3">
                <span class="w-32 shrink-0 text-xs font-bold uppercase tracking-widest text-yellow-400/70">Nama</span>
                <span class="text-gray-200">{{ item.nama || '-' }}</span>
              </div>
              <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 border-b border-white/5 pb-3">
                <span class="w-32 shrink-0 text-xs font-bold uppercase tracking-widest text-yellow-400/70">Nick</span>
                <span class="text-gray-200 font-mono">{{ item.nick || '-' }}</span>
              </div>
              <div class="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 border-b border-white/5 pb-3">
                <span class="w-32 shrink-0 text-xs font-bold uppercase tracking-widest text-yellow-400/70">Sosial Media</span>
                <span class="min-w-0">
                  <a
                    v-if="isUrl(item.sosmed)"
                    :href="item.sosmed"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-cyan-400 hover:text-cyan-300 break-all inline-flex items-center gap-2"
                  >
                    <i class="fas fa-link"></i> {{ cleanUrl(item.sosmed) }}
                  </a>
                  <span v-else-if="item.sosmed" class="text-cyan-300">{{ item.sosmed }}</span>
                  <span v-else class="text-gray-500">-</span>
                </span>
              </div>
              <div class="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                <span class="w-32 shrink-0 text-xs font-bold uppercase tracking-widest text-yellow-400/70">Cerita</span>
                <span class="text-gray-300 leading-relaxed italic">{{ item.cerita || '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const loading = ref(true);
const error = ref(false);
const motmList = ref([]);

function getPeriode(item) {
  const bulan = (item.bulan || '').trim();
  const tahun = (item.tahun || '').trim();
  return `${bulan} ${tahun}`.trim() || 'Periode';
}

function isUrl(str) {
  return /^https?:\/\//i.test(String(str || '').trim());
}

function cleanUrl(str) {
  return String(str || '').replace(/^https?:\/\//, '');
}

async function fetchMotm() {
  loading.value = true;
  error.value = false;
  try {
    const res = await fetch('/.netlify/functions/get-motm?limit=500');
    if (!res.ok) throw new Error('Failed to load');
    const result = await res.json();
    motmList.value = result.data || result || [];
  } catch (err) {
    console.error(err);
    error.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchMotm();
});
</script>

<style scoped>
.motm-frame {
  background:
    radial-gradient(circle at 50% 0%, rgba(234,179,8,0.10), transparent 60%),
    linear-gradient(160deg, #120f06 0%, #0a0e14 55%, #0a0e14 100%);
}

.motm-photo-ring {
  box-shadow: 0 0 0 2px rgba(234,179,8,0.6), 0 0 35px rgba(234,179,8,0.35);
}

@keyframes motm-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.motm-shimmer {
  background: linear-gradient(90deg, #b8860b 0%, #f5d77a 25%, #fff7d6 50%, #f5d77a 75%, #b8860b 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: motm-shimmer 6s linear infinite;
}
</style>

