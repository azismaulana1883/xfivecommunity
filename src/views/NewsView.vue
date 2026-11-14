<template>
  <main class="container mx-auto px-4 md:px-6 pt-12 pb-24 relative z-10 min-h-screen">
    <div class="text-center mb-10">
      <h1 class="text-3xl md:text-4xl font-bold font-orbitron text-white uppercase tracking-widest mb-2">
        <span class="text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]">News</span> Update
      </h1>
      <div class="w-24 h-1 bg-cyan-500 mx-auto rounded-full mb-4"></div>
      <p class="text-gray-400 max-w-2xl mx-auto">
        Riwayat pembaruan data member dan komunitas XFIVE: penambahan member, penghapusan member, penggantian nickname, perubahan TTL, dan perubahan lainnya.
      </p>
    </div>

    <!-- Controls -->
    <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-[#0d1117]/80 backdrop-blur-md p-4 rounded-xl border border-white/5">
      <div class="w-full md:w-1/3 relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari pembaruan..."
          class="w-full bg-[#0a0e14] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
        />
        <i class="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"></i>
      </div>
      <div class="flex flex-wrap gap-2 justify-center w-full md:w-auto">
        <button
          v-for="btn in filterOptions"
          :key="btn.key"
          @click="setFilter(btn.key)"
          class="px-4 py-2 bg-[#0a0e14] border rounded transition-all font-bold uppercase tracking-wider text-xs"
          :class="[
            currentFilter === btn.key
              ? 'border-cyan-500 text-cyan-400 border-b-2'
              : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
          ]"
        >
          {{ btn.label }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-8 text-center text-cyan-400 font-bold tracking-widest animate-pulse">
      Memuat riwayat...
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-8 text-center text-red-500 font-bold border border-red-500/30 rounded-lg bg-red-500/10">
      Gagal memuat riwayat pembaruan.
    </div>

    <!-- Empty State -->
    <div v-else-if="paginatedNews.length === 0" class="p-8 text-center text-gray-400 bg-[#161b22]/50 rounded-lg border border-white/5">
      Tidak ada riwayat yang cocok.
    </div>

    <!-- Timeline -->
    <div v-else class="pt-2 max-w-4xl mx-auto">
      <div
        v-for="(item, idx) in paginatedNews"
        :key="idx"
        class="relative pl-8 pb-6 border-l border-white/10 last:border-l-transparent group"
      >
        <!-- Timeline Dot -->
        <span
          class="absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-[#0a0e14]"
          :class="describeAction(item.action).color.dot"
          :style="{ boxShadow: '0 0 8px currentColor' }"
        ></span>

        <div
          class="bg-[#0d1117]/80 backdrop-blur-sm border rounded-lg p-4 transition-all group-hover:translate-x-1"
          :class="describeAction(item.action).color.border"
        >
          <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span
              class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
              :class="[
                describeAction(item.action).color.bg,
                describeAction(item.action).color.border,
                describeAction(item.action).color.text
              ]"
            >
              <i class="fas" :class="describeAction(item.action).icon"></i>
              {{ describeAction(item.action).label }}
            </span>
            <span class="text-xs text-gray-500 font-mono flex items-center gap-1">
              <i class="far fa-clock"></i> {{ item.timestamp }}
            </span>
          </div>
          <p class="text-gray-200 text-sm md:text-base leading-relaxed">
            {{ item.description }}
          </p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-1.5 mt-8 flex-wrap">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="min-w-8 h-8 px-2 flex items-center justify-center rounded border text-sm transition-colors"
          :class="currentPage === 1 ? 'border-gray-800 text-gray-700 cursor-not-allowed' : 'border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20'"
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <button
          v-for="p in visiblePages"
          :key="p"
          @click="goToPage(p)"
          class="min-w-8 h-8 px-2 flex items-center justify-center rounded border text-sm transition-colors"
          :class="currentPage === p ? 'bg-cyan-600 text-white border-cyan-600 font-bold' : 'border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20'"
        >
          {{ p }}
        </button>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="min-w-8 h-8 px-2 flex items-center justify-center rounded border text-sm transition-colors"
          :class="currentPage === totalPages ? 'border-gray-800 text-gray-700 cursor-not-allowed' : 'border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20'"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const loading = ref(true);
const error = ref(false);
const allNews = ref([]);
const searchQuery = ref('');
const currentFilter = ref('all');
const currentPage = ref(1);
const perPage = 15;

const filterOptions = [
  { key: 'all', label: 'Semua' },
  { key: 'ADD MEMBER', label: 'Member Baru' },
  { key: 'DELETE MEMBER', label: 'Member Keluar' },
  { key: 'EDIT MEMBER', label: 'Revisi Data' }
];

const colorMap = {
  green: { text: 'text-green-400', border: 'border-green-500/40', bg: 'bg-green-500/10', dot: 'bg-green-500 text-green-500' },
  red: { text: 'text-red-400', border: 'border-red-500/40', bg: 'bg-red-500/10', dot: 'bg-red-500 text-red-500' },
  yellow: { text: 'text-yellow-400', border: 'border-yellow-500/40', bg: 'bg-yellow-500/10', dot: 'bg-yellow-500 text-yellow-500' },
  cyan: { text: 'text-cyan-400', border: 'border-cyan-500/40', bg: 'bg-cyan-500/10', dot: 'bg-cyan-500 text-cyan-500' }
};

function describeAction(action) {
  const a = (action || '').toUpperCase();
  if (a.includes('ADD') && a.includes('MEMBER')) return { label: 'Member Baru', icon: 'fa-user-plus', color: colorMap.green };
  if (a.includes('DELETE') && a.includes('MEMBER')) return { label: 'Member Keluar', icon: 'fa-user-minus', color: colorMap.red };
  if (a.includes('EDIT') && a.includes('MEMBER')) return { label: 'Revisi Data Member', icon: 'fa-user-pen', color: colorMap.yellow };
  if (a.includes('ADD') && a.includes('BLACKLIST')) return { label: 'Blacklist Ditambah', icon: 'fa-ban', color: colorMap.red };
  if (a.includes('DELETE') && a.includes('BLACKLIST')) return { label: 'Blacklist Dihapus', icon: 'fa-circle-check', color: colorMap.green };
  if (a.includes('EDIT') && a.includes('BLACKLIST')) return { label: 'Revisi Blacklist', icon: 'fa-pen', color: colorMap.yellow };
  return { label: action || 'Update', icon: 'fa-circle-info', color: colorMap.cyan };
}

function setFilter(key) {
  currentFilter.value = key;
  currentPage.value = 1;
}

const filteredNews = computed(() => {
  return allNews.value.filter(item => {
    if (currentFilter.value !== 'all') {
      if (!(item.action || '').toUpperCase().includes(currentFilter.value.toUpperCase())) return false;
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      const hay = ((item.description || '') + ' ' + (item.action || '')).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
});

const totalPages = computed(() => {
  return Math.ceil(filteredNews.value.length / perPage) || 1;
});

const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredNews.value.slice(start, start + perPage);
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  let start = Math.max(1, currentPage.value - 2);
  let end = Math.min(total, start + 4);
  start = Math.max(1, end - 4);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

function goToPage(p) {
  if (p >= 1 && p <= totalPages.value) {
    currentPage.value = p;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

async function fetchNews() {
  loading.value = true;
  error.value = false;
  try {
    const res = await fetch('/.netlify/functions/get-news?limit=2000');
    if (!res.ok) throw new Error('Failed to load');
    const result = await res.json();
    allNews.value = result.data || result || [];
  } catch (err) {
    console.error(err);
    error.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchNews();
});
</script>

