<template>
  <section v-if="certificates.length > 0" class="mt-10 bg-[#0d1117]/80 border border-white/10 rounded-xl p-6 md:p-8 shadow-lg">
    <div class="flex items-center gap-3 mb-6">
      <i class="fas fa-award text-cyan-400 text-2xl"></i>
      <h2 class="text-xl md:text-2xl font-bold font-orbitron text-white uppercase tracking-widest">Certificates</h2>
      <span class="text-xs bg-white/5 px-3 py-1 rounded-full border border-white/10 text-gray-400">{{ totalCount }} total</span>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <a
        v-for="(url, i) in certificates"
        :key="i"
        :href="url"
        target="_blank"
        rel="noopener noreferrer"
        class="certificate-card group block bg-[#0d1117] border border-white/10 hover:border-cyan-500/50 rounded-lg overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.15)]"
      >
        <div class="aspect-[4/3] overflow-hidden bg-black flex items-center justify-center">
          <img
            :src="url"
            :alt="'Certificate ' + (startIndex + i + 1)"
            loading="lazy"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onerror="this.onerror=null;this.src='https://via.placeholder.com/400x300/0d1117/00ffff?text=Certificate';"
          />
        </div>
        <div class="p-3 flex items-center justify-between">
          <span class="text-xs text-gray-400 uppercase tracking-wider font-bold">Cert #{{ startIndex + i + 1 }}</span>
          <i class="fas fa-external-link-alt text-cyan-400 text-xs opacity-60 group-hover:opacity-100 transition-opacity"></i>
        </div>
      </a>
    </div>

    <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-6 flex-wrap">
      <button
        @click="$emit('page-change', currentPage - 1)"
        :disabled="currentPage === 1"
        class="cert-page-btn min-w-[40px] h-10 px-3 rounded border border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-colors"
        :class="{ 'opacity-40 cursor-not-allowed': currentPage === 1 }"
      >
        <i class="fas fa-chevron-left"></i>
      </button>

      <button
        v-for="p in totalPages"
        :key="p"
        @click="$emit('page-change', p)"
        class="cert-page-btn min-w-[40px] h-10 px-3 rounded border font-bold transition-colors"
        :class="p === currentPage ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-transparent text-gray-400 border-gray-600 hover:text-cyan-400 hover:border-cyan-500'"
      >
        {{ p }}
      </button>

      <button
        @click="$emit('page-change', currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="cert-page-btn min-w-[40px] h-10 px-3 rounded border border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-colors"
        :class="{ 'opacity-40 cursor-not-allowed': currentPage === totalPages }"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  certificates: {
    type: Array,
    default: () => []
  },
  totalCount: {
    type: Number,
    default: 0
  },
  currentPage: {
    type: Number,
    default: 1
  },
  totalPages: {
    type: Number,
    default: 1
  },
  startIndex: {
    type: Number,
    default: 0
  }
});

defineEmits(['page-change']);
</script>
