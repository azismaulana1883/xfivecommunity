<template>
  <section id="search-filter-section" class="mb-8 bg-[#0d1117]/80 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-white/5 shadow-lg">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-3">
        <i class="fas fa-sliders-h text-cyan-400 text-lg"></i>
        <h3 class="text-lg md:text-xl font-orbitron text-white uppercase tracking-widest">Filter Database Member</h3>
      </div>
      <div class="text-xs font-bold text-gray-400 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/10 font-mono">
        Menampilkan <span class="text-cyan-400 font-bold">{{ filteredCount }}</span> dari {{ totalCount }} Anggota
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="relative w-full">
        <input
          :value="modelValueSearch"
          @input="$emit('update:modelValueSearch', $event.target.value)"
          type="text"
          placeholder="Cari nickname atau nama..."
          class="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0d1117] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 border border-gray-800 text-xs font-mono transition-all shadow-inner"
        />
        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
      </div>

      <div class="relative">
        <select
          :value="modelValueRole"
          @change="$emit('update:modelValueRole', $event.target.value)"
          class="w-full p-3 pl-10 rounded-xl bg-[#0d1117] text-white border border-gray-800 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 appearance-none cursor-pointer text-xs font-mono"
        >
          <option value="all">Semua Role</option>
          <option value="Owner Community">Owner</option>
          <option value="Leader Community">Leader</option>
          <option value="Staff Community">Staff</option>
          <option value="Member Community">Member</option>
        </select>
        <i class="fas fa-user-tag absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
        <i class="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-[10px] pointer-events-none"></i>
      </div>

      <div class="relative">
        <select
          :value="modelValueGender"
          @change="$emit('update:modelValueGender', $event.target.value)"
          class="w-full p-3 pl-10 rounded-xl bg-[#0d1117] text-white border border-gray-800 focus:outline-none focus:ring-1 focus:ring-pink-500 appearance-none cursor-pointer text-xs font-mono"
        >
          <option value="all">Semua Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <i class="fas fa-venus-mars absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
        <i class="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-[10px] pointer-events-none"></i>
      </div>

      <div class="relative">
        <input
          :value="modelValueDomisili"
          @input="$emit('update:modelValueDomisili', $event.target.value)"
          type="text"
          placeholder="Cari Domisili / Kota..."
          class="w-full p-3 pl-10 rounded-xl bg-[#0d1117] text-white border border-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500 text-xs font-mono shadow-inner"
        />
        <i class="fas fa-map-marker-alt absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  filteredCount: {
    type: Number,
    default: 0
  },
  totalCount: {
    type: Number,
    default: 0
  },
  modelValueSearch: {
    type: String,
    default: ''
  },
  modelValueRole: {
    type: String,
    default: 'all'
  },
  modelValueGender: {
    type: String,
    default: 'all'
  },
  modelValueDomisili: {
    type: String,
    default: ''
  }
});

defineEmits([
  'update:modelValueSearch',
  'update:modelValueRole',
  'update:modelValueGender',
  'update:modelValueDomisili'
]);
</script>
