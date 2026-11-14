<template>
  <section id="profile-grid">
    <div v-if="loading" class="col-span-full text-center py-20">
      <i class="fas fa-circle-notch fa-spin text-4xl text-cyan-500"></i>
      <p class="mt-4 text-gray-400 font-mono text-xs">Memuat database anggota XFIVE...</p>
    </div>

    <div v-else-if="members.length === 0" class="flex flex-col items-center justify-center py-20 opacity-60">
      <i class="fas fa-ghost text-6xl mb-4 text-gray-600"></i>
      <p class="text-center text-gray-400 text-lg font-orbitron">Tidak ada anggota yang ditemukan.</p>
      <p class="text-gray-500 text-xs font-mono mt-1">Coba gunakan kata kunci atau filter lain.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 pb-8">
      <MemberCard
        v-for="member in members"
        :key="member.name + member.nickname"
        :member="member"
      />
    </div>

    <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-8 mb-16 flex-wrap">
      <button
        @click="$emit('page-change', currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-1.5 rounded-lg border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      >
        <i class="fas fa-chevron-left text-xs"></i>
      </button>

      <button
        v-for="p in visiblePages"
        :key="p"
        @click="$emit('page-change', p)"
        class="px-3.5 py-1.5 rounded-lg border transition-colors font-orbitron text-xs cursor-pointer"
        :class="p === currentPage ? 'bg-cyan-500 text-black border-cyan-500 font-bold shadow-[0_0_10px_rgba(0,255,255,0.4)]' : 'border-gray-700 text-gray-400 hover:border-cyan-500 hover:text-cyan-400 bg-black/40'"
      >
        {{ p }}
      </button>

      <button
        @click="$emit('page-change', currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-3 py-1.5 rounded-lg border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      >
        <i class="fas fa-chevron-right text-xs"></i>
      </button>
    </div>
  </section>
</template>

<script setup>
import MemberCard from '../../MemberCard.vue';

defineProps({
  members: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  currentPage: {
    type: Number,
    default: 1
  },
  totalPages: {
    type: Number,
    default: 1
  },
  visiblePages: {
    type: Array,
    default: () => []
  }
});

defineEmits(['page-change']);
</script>
