<template>
  <main class="container mx-auto px-4 md:px-6 pt-12 pb-24 relative z-10 min-h-screen">
    <div class="text-center mb-10">
      <h1 class="text-3xl md:text-4xl font-bold font-orbitron text-white uppercase tracking-widest mb-2">
        Frequently Asked Questions
      </h1>
      <div class="w-20 h-1 bg-cyan-500 mx-auto rounded-full mb-4"></div>
      <p class="text-gray-400 max-w-xl mx-auto">
        Pertanyaan yang sering diajukan seputar komunitas XFIVE AyoDance.
      </p>
    </div>

    <!-- Search Input -->
    <div class="max-w-3xl mx-auto mb-8">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari pertanyaan..."
          class="w-full bg-[#0a0e14] border border-gray-700 text-white pl-11 pr-4 py-3 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
        />
        <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"></i>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-8 text-center text-cyan-400 font-bold tracking-widest animate-pulse max-w-3xl mx-auto">
      Memuat FAQ...
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-8 text-center text-red-500 font-bold border border-red-500/30 rounded-lg bg-red-500/10 max-w-3xl mx-auto">
      Gagal memuat FAQ.
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredFaq.length === 0" class="p-8 text-center text-gray-400 bg-[#161b22]/50 rounded-lg border border-white/5 max-w-3xl mx-auto">
      Tidak ada pertanyaan yang cocok.
    </div>

    <!-- Accordion List -->
    <div v-else class="max-w-3xl mx-auto space-y-4">
      <div
        v-for="(f, idx) in filteredFaq"
        :key="idx"
        class="bg-[#161b22]/80 backdrop-blur-sm border rounded-lg overflow-hidden transition-all duration-300"
        :class="openIndices.includes(idx) ? 'border-cyan-500/50 shadow-[0_4px_20px_rgba(0,255,255,0.1)]' : 'border-white/5 hover:border-cyan-500/30'"
      >
        <button
          @click="toggleAccordion(idx)"
          class="w-full flex justify-between items-center p-5 md:p-6 text-left text-white font-bold transition-colors focus:outline-none cursor-pointer"
        >
          <span class="text-base md:text-lg tracking-wide pr-4">{{ f.question }}</span>
          <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 ml-2">
            <i
              class="fas fa-chevron-down transition-transform duration-300 text-cyan-400 text-sm"
              :class="{ 'rotate-180': openIndices.includes(idx) }"
            ></i>
          </div>
        </button>

        <div
          v-show="openIndices.includes(idx)"
          class="transition-all duration-300 ease-in-out"
        >
          <div class="p-5 md:p-6 pt-0 text-gray-300 border-t border-white/5 mt-2 leading-relaxed text-sm md:text-base whitespace-pre-line">
            {{ f.answer }}
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAutoSync } from '../composables/useDataSync';

const loading = ref(true);
const error = ref(false);
const allFaq = ref([]);
const searchQuery = ref('');
const openIndices = ref([]);

function toggleAccordion(idx) {
  const i = openIndices.value.indexOf(idx);
  if (i > -1) {
    openIndices.value.splice(i, 1);
  } else {
    // Open only one or multiple? Standard accordion allows toggling
    openIndices.value.push(idx);
  }
}

const filteredFaq = computed(() => {
  if (!searchQuery.value.trim()) return allFaq.value;
  const q = searchQuery.value.trim().toLowerCase();
  return allFaq.value.filter(f => {
    return ((f.question || '') + ' ' + (f.answer || '')).toLowerCase().includes(q);
  });
});

async function fetchFaq() {
  loading.value = true;
  error.value = false;
  try {
    const res = await fetch('/.netlify/functions/get-faq?limit=500');
    if (!res.ok) throw new Error('Failed to load');
    const result = await res.json();
    allFaq.value = result.data || result || [];
  } catch (err) {
    console.error(err);
    error.value = true;
  } finally {
    loading.value = false;
  }
}

useAutoSync('faqs', fetchFaq);

onMounted(() => {
  fetchFaq();
});
</script>

