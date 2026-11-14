<template>
  <div class="container mx-auto px-4 py-8 relative z-10 min-h-screen">
    <!-- HEADER -->
    <div class="text-center mb-10">
      <div class="inline-block px-3 py-1 mb-3 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold tracking-widest uppercase">
        <i class="fas fa-ban mr-1.5"></i> Restricted List
      </div>
      <h1 class="text-3xl md:text-5xl font-bold font-orbitron text-white tracking-widest uppercase mb-3">
        BLACKLIST <span class="text-red-500">COMMUNITY</span>
      </h1>
      <p class="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
        Daftar orang-orang yang telah dikeluarkan dari XFIVE Community karena melanggar aturan dan norma komunitas.
      </p>
    </div>

    <!-- FILTER & SEARCH -->
    <div class="mb-8 bg-[#0d1117]/80 backdrop-blur-md p-6 rounded-xl border border-red-500/20 shadow-lg">
      <div class="flex flex-col md:flex-row gap-4 justify-between items-center">
        <!-- SEARCH -->
        <div class="relative w-full md:w-96">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nickname atau nama..."
            class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#161b22] text-white border border-gray-700 focus:outline-none focus:border-red-500 transition-colors placeholder-gray-500 text-sm"
          />
          <i class="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"></i>
        </div>

        <div class="flex items-center gap-4 w-full md:w-auto justify-end">
          <span class="text-xs uppercase tracking-wider text-gray-400 font-bold">
            Total: <span class="text-red-400">{{ filteredBlacklist.length }}</span> Entri
          </span>
        </div>
      </div>
    </div>

    <!-- TABLE / LIST -->
    <div class="bg-[#0d1117]/90 border border-red-500/20 rounded-xl overflow-hidden shadow-2xl">
      <div v-if="loading" class="text-center py-20 text-cyan-400 font-orbitron animate-pulse">
        <i class="fas fa-circle-notch fa-spin text-3xl mb-3"></i>
        <p>Scanning Blacklist Database...</p>
      </div>

      <div v-else-if="paginatedBlacklist.length === 0" class="text-center py-16 text-gray-400">
        <i class="fas fa-shield-halved text-5xl mb-3 text-gray-600"></i>
        <p class="font-orbitron">Tidak ada data blacklist yang cocok.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-[#12161f] border-b border-white/5 text-gray-400 font-orbitron text-xs uppercase tracking-wider">
            <tr>
              <th class="py-4 px-6">Nama / Nickname</th>
              <th class="py-4 px-6">Pelanggaran</th>
              <th class="py-4 px-6">Tanggal Keluar</th>
              <th class="py-4 px-6">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr
              v-for="(item, idx) in paginatedBlacklist"
              :key="idx"
              class="hover:bg-red-500/5 transition-colors"
            >
              <td class="py-4 px-6">
                <div class="font-bold text-white font-orbitron">{{ item.nickname || '-' }}</div>
                <div class="text-xs text-gray-400 mt-0.5">{{ item.nama || '-' }}</div>
              </td>
              <td class="py-4 px-6 max-w-md text-gray-300 leading-relaxed">
                {{ item.pelanggaran || '-' }}
              </td>
              <td class="py-4 px-6 text-gray-400 whitespace-nowrap">
                {{ item.outDate || '-' }}
              </td>
              <td class="py-4 px-6 whitespace-nowrap">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  {{ item.duration || 'Permanent' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- PAGINATION -->
    <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-8 mb-12 flex-wrap">
      <button
        @click="currentPage--"
        :disabled="currentPage === 1"
        class="px-3 py-1.5 rounded border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <i class="fas fa-chevron-left"></i>
      </button>

      <button
        v-for="p in totalPages"
        :key="p"
        @click="currentPage = p"
        class="px-3.5 py-1.5 rounded border text-sm font-orbitron transition-colors"
        :class="p === currentPage ? 'bg-red-500 text-white border-red-500 font-bold' : 'border-gray-700 text-gray-400 hover:border-red-500 hover:text-red-400'"
      >
        {{ p }}
      </button>

      <button
        @click="currentPage++"
        :disabled="currentPage === totalPages"
        class="px-3 py-1.5 rounded border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAutoSync } from '../composables/useDataSync';

const blacklist = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const currentPage = ref(1);
const rowsPerPage = 10;

async function fetchBlacklist() {
  loading.value = true;
  try {
    const res = await fetch('/.netlify/functions/get-blacklist?limit=500');
    if (!res.ok) throw new Error('Failed to load blacklist');
    const result = await res.json();
    blacklist.value = result.data || result || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

const filteredBlacklist = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return blacklist.value;
  return blacklist.value.filter(item =>
    (item.nama && item.nama.toLowerCase().includes(q)) ||
    (item.nickname && item.nickname.toLowerCase().includes(q)) ||
    (item.pelanggaran && item.pelanggaran.toLowerCase().includes(q))
  );
});

const totalPages = computed(() => Math.ceil(filteredBlacklist.value.length / rowsPerPage) || 1);

const paginatedBlacklist = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage;
  return filteredBlacklist.value.slice(start, start + rowsPerPage);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

useAutoSync('blacklist', fetchBlacklist);

onMounted(() => {
  fetchBlacklist();
});
</script>

