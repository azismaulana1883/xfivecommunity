<template>
  <section class="relative pt-12 pb-8 overflow-hidden">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.06)_0%,transparent_70%)] pointer-events-none"></div>
    <div class="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

    <div class="container mx-auto px-4 relative z-10 text-center max-w-4xl">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-4">
        <i class="fas fa-map-marker-alt animate-bounce"></i>
        <span>XFIVE GATHERING &amp; REGIONAL SYSTEM</span>
      </div>

      <h1 class="text-3xl md:text-5xl font-black font-orbitron uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-300 to-pink-500 mb-3">
        MEET UP DATA &amp; POIN
      </h1>
      <p class="text-sm md:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
        Pusat informasi agenda meetup wilayah, absensi kehadiran berbasis verifikasi lokasi GPS &amp; Barcode, serta transparansi rekapitulasi poin komunitas.
      </p>

      <div class="flex flex-wrap justify-center gap-2 mt-8">
        <button
          @click="$emit('update:activeTab', 'events')"
          class="px-5 py-2.5 rounded-xl font-orbitron text-xs font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer"
          :class="activeTab === 'events' ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,255,255,0.4)]' : 'bg-black/60 border border-white/10 text-gray-400 hover:text-white'"
        >
          <i class="fas fa-calendar-alt"></i>
          <span>JADWAL MEETUP</span>
          <span v-if="activeMeetupCount > 0" class="ml-1 px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] text-white">
            {{ activeMeetupCount }} Aktif
          </span>
        </button>

        <button
          @click="$emit('update:activeTab', 'points')"
          class="px-5 py-2.5 rounded-xl font-orbitron text-xs font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer"
          :class="activeTab === 'points' ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,255,255,0.4)]' : 'bg-black/60 border border-white/10 text-gray-400 hover:text-white'"
        >
          <i class="fas fa-trophy"></i>
          <span>REKAP POIN KEHADIRAN</span>
          <span v-if="warningCount > 0" class="ml-1 px-1.5 py-0.2 rounded-full bg-red-500 text-[10px] text-white">
            {{ warningCount }} Teguran
          </span>
        </button>

        <button
          @click="$emit('update:activeTab', 'rules')"
          class="px-5 py-2.5 rounded-xl font-orbitron text-xs font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer"
          :class="activeTab === 'rules' ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,255,255,0.4)]' : 'bg-black/60 border border-white/10 text-gray-400 hover:text-white'"
        >
          <i class="fas fa-book-open"></i>
          <span>KETENTUAN &amp; RULES POIN</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  activeTab: {
    type: String,
    required: true
  },
  activeMeetupCount: {
    type: Number,
    default: 0
  },
  warningCount: {
    type: Number,
    default: 0
  }
});

defineEmits(['update:activeTab']);
</script>
